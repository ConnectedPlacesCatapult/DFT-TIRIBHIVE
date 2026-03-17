/**
 * POST /api/handbook/cards/generate
 *
 * Generates structured article cards from document_chunks using GPT-4o.
 * Accepts { article_ids?: string[] } — if omitted, processes all articles
 * where no card exists or is_stale = true.
 *
 * One article at a time, 500ms delay between calls for rate safety.
 */
export const runtime = "nodejs";
export const maxDuration = 300;

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  type ArticleCardData,
  validateCardData,
  normalizeCardData,
  getGoldStandardJson,
} from "@/lib/handbook/article-cards";

const GENERATION_MODEL = "gpt-4o";

function buildSystemPrompt(): string {
  const goldStandard = getGoldStandardJson();

  return `You are extracting structured intelligence from a transport climate adaptation case study.
Return ONLY valid JSON. No markdown, no preamble, no explanation. Match this exact structure:
${goldStandard}

Rules:
- key_insight MUST include a specific measurable outcome (percentage, £ figure, volume, count) if one exists in the source content
- main_applications must name specific infrastructure contexts — never generic statements like 'applicable to all transport'
- transferability_contexts must be specific named contexts like in the gold standard, not generic
- If a field has no evidence in the source: null
- Never invent figures not present in source content
- uk_transferability: 'high' | 'medium' | 'low' only
- evidence_quality: 'strong' | 'moderate' | 'limited' only
- key_metrics must have exactly 4 items with value and label — pick the 4 most important quantified outcomes
- co_benefits_summary must have exactly 4 keys: community, environmental, economic, carbon
- funding_sources should list named organisations, not generic categories`;
}

function buildUserMessage(
  projectTitle: string,
  sector: string | null,
  chunks: { section_key: string | null; chunk_text: string }[]
): string {
  const chunkSections = chunks
    .map((c) => `=== ${c.section_key ?? "content"} ===\n${c.chunk_text}`)
    .join("\n\n");

  return `Case study: ${projectTitle}
Sector: ${sector ?? "Unknown"}

${chunkSections}`;
}

function computeContentHash(chunks: { chunk_text: string }[]): string {
  const combined = chunks.map((c) => c.chunk_text).join("");
  return createHash("md5").update(combined).digest("hex");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedIds: string[] | undefined = body.article_ids;

    const sb = getSupabaseClient();

    // Determine which articles to process
    let articles: { id: string; trib_article_id: string; project_title: string; transport_sector: string | null }[];

    if (requestedIds && requestedIds.length > 0) {
      const { data, error } = await sb
        .from("articles")
        .select("id, trib_article_id, project_title, transport_sector")
        .in("trib_article_id", requestedIds);
      if (error) throw new Error(`Failed to fetch articles: ${error.message}`);
      articles = data ?? [];
    } else {
      // All articles where no card exists or card is stale
      const { data: allArticles, error: artErr } = await sb
        .from("articles")
        .select("id, trib_article_id, project_title, transport_sector");
      if (artErr) throw new Error(`Failed to fetch articles: ${artErr.message}`);

      const { data: existingCards } = await sb
        .from("article_cards")
        .select("article_id, is_stale");

      const cardMap = new Map(
        (existingCards ?? []).map((c: { article_id: string; is_stale: boolean }) => [c.article_id, c.is_stale])
      );

      articles = (allArticles ?? []).filter(
        (a: { id: string }) => !cardMap.has(a.id) || cardMap.get(a.id) === true
      );
    }

    const results = { generated: 0, skipped: 0, errors: [] as { id: string; reason: string }[] };

    for (const article of articles) {
      try {
        // Step 1 — Load chunks
        const { data: chunks, error: chunkErr } = await sb
          .from("document_chunks")
          .select("chunk_index, section_key, chunk_text")
          .eq("article_id", article.id)
          .order("chunk_index");

        if (chunkErr) {
          results.errors.push({ id: article.trib_article_id, reason: `Chunk load failed: ${chunkErr.message}` });
          continue;
        }

        if (!chunks || chunks.length === 0) {
          results.errors.push({ id: article.trib_article_id, reason: "No chunks found" });
          continue;
        }

        // Step 2 — Compute content hash and check staleness
        const contentHash = computeContentHash(chunks);

        const { data: existingCard } = await sb
          .from("article_cards")
          .select("content_hash")
          .eq("article_id", article.id)
          .maybeSingle();

        if (existingCard && existingCard.content_hash === contentHash) {
          // Content unchanged — mark not stale and skip
          await sb
            .from("article_cards")
            .update({ is_stale: false })
            .eq("article_id", article.id);
          results.skipped++;
          continue;
        }

        // Step 3 — Build prompt and call GPT-4o
        const systemPrompt = buildSystemPrompt();
        const userMessage = buildUserMessage(
          article.project_title,
          article.transport_sector,
          chunks
        );

        const OpenAI = (await import("openai")).default;
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await openai.chat.completions.create({
          model: GENERATION_MODEL,
          temperature: 0.2,
          max_tokens: 4000,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        });

        const rawResponse = completion.choices[0]?.message?.content?.trim();
        if (!rawResponse) {
          results.errors.push({ id: article.trib_article_id, reason: "Empty GPT response" });
          await sleep(500);
          continue;
        }

        // Step 4 — Parse, validate, normalize
        let parsed: Record<string, unknown>;
        try {
          const cleaned = rawResponse.replace(/^```json?\s*/i, "").replace(/```\s*$/, "");
          parsed = JSON.parse(cleaned);
        } catch {
          results.errors.push({
            id: article.trib_article_id,
            reason: `JSON parse failed: ${rawResponse.slice(0, 100)}...`,
          });
          await sleep(500);
          continue;
        }

        const validation = validateCardData(parsed);
        if (!validation.valid) {
          results.errors.push({
            id: article.trib_article_id,
            reason: `Validation failed: ${validation.errors.join("; ")}`,
          });
          await sleep(500);
          continue;
        }

        const cardData: ArticleCardData = normalizeCardData(parsed);

        cardData.trib_article_id = article.trib_article_id;
        cardData.project_title = cardData.project_title || article.project_title;
        cardData.transport_sector = cardData.transport_sector || article.transport_sector;

        // Step 5 — Upsert to article_cards (individual columns)
        const { error: upsertErr } = await sb
          .from("article_cards")
          .upsert(
            {
              article_id: article.id,
              trib_article_id: article.trib_article_id,
              project_title: cardData.project_title,
              organisation: cardData.organisation,
              transport_sector: cardData.transport_sector,
              year_range: cardData.year_range,
              subtitle_stats: cardData.subtitle_stats,
              key_metrics: cardData.key_metrics,
              key_insight: cardData.key_insight,
              main_applications: cardData.main_applications,
              key_takeaways: cardData.key_takeaways,
              co_benefits_summary: cardData.co_benefits_summary,
              uk_transferability: cardData.uk_transferability,
              evidence_quality: cardData.evidence_quality,
              transferability_rationale: cardData.transferability_rationale,
              transferability_contexts: cardData.transferability_contexts,
              investment_band: cardData.investment_band,
              investment_detail: cardData.investment_detail,
              funding_sources: cardData.funding_sources,
              implementation_notes: cardData.implementation_notes,
              challenges: cardData.challenges,
              lessons_learned: cardData.lessons_learned,
              innovation_opportunity: cardData.innovation_opportunity,
              content_hash: contentHash,
              is_stale: false,
              generated_at: new Date().toISOString(),
              generation_model: GENERATION_MODEL,
            },
            { onConflict: "article_id" }
          );

        if (upsertErr) {
          results.errors.push({ id: article.trib_article_id, reason: `Upsert failed: ${upsertErr.message}` });
        } else {
          results.generated++;
        }
      } catch (err) {
        results.errors.push({
          id: article.trib_article_id,
          reason: err instanceof Error ? err.message : "Unknown error",
        });
      }

      await sleep(500);
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("[cards/generate] Fatal error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
