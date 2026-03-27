/**
 * POST /api/handbook/brief-generate
 *
 * RAG-backed brief generation from collected case study IDs.
 * - Retrieves document_chunks via pgvector for rich context
 * - Falls back to article metadata when chunks unavailable
 * - Calls OpenAI to generate structured brief sections with citations
 * - Every claim must cite a case ID [ID_xx]
 * - Persists session + sections in Supabase mode
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  getHiveArticleById,
  createSynthesisSession,
  getHiveDataProvider,
  getLinkedOptionsForBriefArticles,
  type BriefLinkedOption,
} from "@/lib/handbook/db";
import {
  formatArticleCardRowForBriefPrompt,
  type ArticleCardRow,
} from "@/lib/handbook/article-cards";
import { getSupabaseClient } from "@/lib/supabase/client";
import { HIVE_CORE_RULES } from "@/lib/handbook/chat-api";

/**
 * System prompt for brief generation. When options are linked to the brief's cases,
 * mandatory adaptation_approaches table rows are injected here (not the user message)
 * so the model treats them as primary instructions.
 */
function buildBriefSystemPrompt(linkedOptions: BriefLinkedOption[]): string {
  const optionsMandatory =
    linkedOptions.length > 0
      ? `

MANDATORY — DfT options framework rows for adaptation_approaches:
The adaptation_approaches markdown table MUST include the following rows. Add them even if the chunk text does not mention them explicitly — they are confirmed framework measures linked to these specific cases. Use the Case Studies column value exactly as given (include the brackets). Set Notes exactly to: Aligns with DfT options framework.

${linkedOptions
  .map(
    (o) =>
      `| ${o.adaptation_measure} | [${o.trib_article_id}] | Aligns with DfT options framework |`
  )
  .join("\n")}

Do not omit these rows. You may add further evidence-based rows beyond these as needed.
`
      : "";

  return `${HIVE_CORE_RULES}

You are an expert climate adaptation analyst for UK transport infrastructure. You produce structured intelligence briefs from case study evidence.

Evidence rules — absolute:
- Only use information from the provided case study text.
- Never invent details, costs, dates, outcomes, or statistics.
- Cite every substantive claim with a case ID in brackets, e.g. [ID_06], [ID_31].
- Do not merge or confuse two different case studies.
- If a section has insufficient data, state "Insufficient evidence for this section" rather than filling.

Structured intelligence (when present):
- Each case may begin with a structured intelligence summary (key insight, investment band/detail, co-benefits, key metrics, challenges, transferable contexts). Use this structured data preferentially for the costs_and_resourcing and uk_applicability (Transfer Intelligence) sections.
- Use the chunk text that follows each summary for evidence and for [ID_xx] citations.
- If a MANDATORY DfT options framework block appears below for adaptation_approaches, include those table rows exactly as specified — they override any tendency to omit measures not named in chunk text.

Generate a structured brief with these sections in order:

1. executive_summary — Write an executive summary that opens with ONE specific measurable finding from the evidence (a percentage, £ figure, or concrete outcome) that best represents the collective insight. Then in 2-3 sentences explain what the cases collectively demonstrate. Do NOT open with 'The case studies highlight...' or 'These cases demonstrate the importance of...'. Example opening: 'SuDS reduced river discharge by 87% in Sheffield — the strongest quantified outcome across these cases — and the approach has since been replicated at £80m scale in Mansfield.' Every claim must be cited [ID_xx].
2. climate_drivers — 2-3 sentences. The climate hazards and trends these cases respond to. Cite each case per hazard.
3. adaptation_approaches — Return a markdown table with three columns: Approach, Case Studies (comma-separated [ID_xx] citations), and Notes (one-line observation). Use pipe-delimited format: | Approach | Case Studies | Notes | with a separator row. Include 3-6 rows covering the key adaptation measures across the cases (if MANDATORY framework rows are listed immediately below, include all of them plus any additional evidence-based rows).${optionsMandatory}
4. costs_and_resourcing — 2-3 sentences. Cost ranges, funding models, and investment patterns. Use exact figures from cases and cite. If cost data is limited, say so.
5. uk_applicability — 2-3 sentences. For each case, identify the specific transfer conditions: what transfers directly, what needs adaptation, and what UK infrastructure contexts are most relevant. Be specific — name infrastructure types, not generic 'applicable to UK transport'. Display title: Transfer Intelligence.
6. key_insight — 2 sentences. The single most generalisable finding — the thing worth quoting. Cite all supporting cases.
7. sources — List of case IDs with titles.

For each section, assign a confidence level:
- "high" — strong evidence, 2+ cases agree
- "partial" — some evidence, requires interpretation
- "indicative" — limited or single-case evidence

Respond ONLY with valid JSON:
{
  "sections": [
    {
      "section_key": "executive_summary",
      "section_title": "Executive Summary",
      "content": "...",
      "confidence": "high"
    }
  ]
}`;
}

const SECTION_TITLES: Record<string, string> = {
  executive_summary: "Executive Summary",
  climate_drivers: "Climate Drivers & Hazards",
  adaptation_approaches: "Adaptation Approaches",
  costs_and_resourcing: "Costs & Resourcing",
  uk_applicability: "Transfer Intelligence",
  key_insight: "Key Cross-Case Insight",
  sources: "Source References",
};

type GeneratedSection = {
  section_key: string;
  section_title: string;
  content: string;
  confidence: "high" | "partial" | "indicative";
};

function generateMockBrief(
  articles: Array<{
    id: string;
    project_title: string;
    transport_sector?: string;
    hazard_cause?: string;
    measure_title?: string;
    case_study_text?: string;
  }>
): GeneratedSection[] {
  const sectors = [
    ...new Set(articles.map((a) => a.transport_sector).filter(Boolean)),
  ];
  const hazards = [
    ...new Set(
      articles
        .flatMap((a) =>
          (a.hazard_cause ?? "")
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean)
        )
    ),
  ].slice(0, 3);
  const measures = articles
    .map((a) => a.measure_title)
    .filter(Boolean)
    .slice(0, 5);
  const ids = articles.map((a) => `[${a.id}]`).join(", ");

  return [
    {
      section_key: "executive_summary",
      section_title: "Executive Summary",
      content: `This brief synthesises ${articles.length} case ${articles.length === 1 ? "study" : "studies"} across ${sectors.join(", ")} transport ${ids}. The cases collectively demonstrate that proactive adaptation integrated into planned maintenance cycles consistently delivers better value than reactive repair after climate events.`,
      confidence: "partial",
    },
    {
      section_key: "climate_drivers",
      section_title: "Climate Drivers & Hazards",
      content: `The primary climate hazards addressed include ${hazards.join(", ")} ${ids}. These hazards are projected to intensify under UK climate change scenarios, making this evidence base increasingly relevant to transport infrastructure planning.`,
      confidence: "partial",
    },
    {
      section_key: "adaptation_approaches",
      section_title: "Adaptation Approaches",
      content:
        measures.map((m) => `- ${m}`).join("\n") ||
        "- No specific measures identified in the provided cases.",
      confidence: "high",
    },
    {
      section_key: "costs_and_resourcing",
      section_title: "Costs & Resourcing",
      content: `Investment levels across cases range from targeted site-specific interventions to network-wide programmes ${ids}. Cases consistently show that bundling adaptation into existing maintenance programmes delivers significantly lower unit costs than standalone climate projects.`,
      confidence: "partial",
    },
    {
      section_key: "uk_applicability",
      section_title: "Transfer Intelligence",
      content: `The cases in this brief have been assessed for UK applicability ${ids}. ${articles.length > 1 ? "Multiple cases demonstrate direct transferability to UK transport contexts." : "This case has direct applicability to UK transport planning."} The strongest transfer potential is in ${sectors.slice(0, 2).join(" and ")} infrastructure.`,
      confidence: "partial",
    },
    {
      section_key: "key_insight",
      section_title: "Key Cross-Case Insight",
      content: `The strongest signal across this evidence base is that embedding climate resilience within planned asset renewal cycles reduces both cost and disruption while generating co-benefits that exceed the original design intent ${ids}.`,
      confidence: "indicative",
    },
    {
      section_key: "sources",
      section_title: "Source References",
      content: articles
        .map((a) => `- ${a.id}: ${a.project_title}`)
        .join("\n"),
      confidence: "high",
    },
  ];
}

/** document_chunks.article_id is the articles table UUID; brief requests use trib_article_id. */
async function retrieveChunksForTribArticleIds(
  tribArticleIds: string[]
): Promise<{ chunksByTrib: Map<string, string>; mode: "rag" | "fallback" }> {
  const empty = (): { chunksByTrib: Map<string, string>; mode: "rag" | "fallback" } => ({
    chunksByTrib: new Map(),
    mode: "fallback",
  });

  try {
    const sb = getSupabaseClient();

    const { data: articleRows, error: artErr } = await sb
      .from("articles")
      .select("id, trib_article_id")
      .in("trib_article_id", tribArticleIds);

    if (artErr || !articleRows?.length) throw new Error(artErr?.message ?? "No articles");

    const uuidToTrib = new Map<string, string>();
    for (const row of articleRows as { id: string; trib_article_id: string | null }[]) {
      if (row.id && row.trib_article_id) uuidToTrib.set(row.id, row.trib_article_id);
    }

    const uuids = [...uuidToTrib.keys()];
    if (!uuids.length) throw new Error("No UUID map for chunks");

    const { data, error } = await sb
      .from("document_chunks")
      .select("article_id, section_key, chunk_text")
      .in("article_id", uuids)
      .order("chunk_index", { ascending: true });

    if (error || !data?.length) throw new Error(error?.message ?? "No chunks");

    const partsByTrib = new Map<string, string[]>();
    for (const c of data as {
      article_id: string;
      section_key?: string | null;
      chunk_text: string;
    }[]) {
      const trib = uuidToTrib.get(c.article_id);
      if (!trib) continue;
      if (!partsByTrib.has(trib)) partsByTrib.set(trib, []);
      partsByTrib
        .get(trib)!
        .push(`[${trib}] (${c.section_key ?? "general"}):\n${c.chunk_text}`);
    }

    const chunksByTrib = new Map<string, string>();
    for (const [trib, parts] of partsByTrib) {
      chunksByTrib.set(trib, parts.join("\n\n---\n\n"));
    }

    return { chunksByTrib, mode: "rag" };
  } catch (err) {
    console.warn("[HIVE] Brief chunk retrieval failed, using article text:", err);
    return empty();
  }
}

async function retrieveArticleCardsForTribIds(
  tribArticleIds: string[]
): Promise<Map<string, ArticleCardRow>> {
  const map = new Map<string, ArticleCardRow>();
  try {
    const sb = getSupabaseClient();
    const { data, error } = await sb
      .from("article_cards")
      .select("*")
      .in("trib_article_id", tribArticleIds);

    if (error || !data?.length) return map;

    for (const row of data as ArticleCardRow[]) {
      if (row.trib_article_id) map.set(row.trib_article_id, row);
    }
  } catch (err) {
    console.warn("[HIVE] Brief article_cards fetch failed:", err);
  }
  return map;
}

function fallbackTextForArticle(a: {
  id: string;
  project_title: string;
  transport_sector?: string;
  hazard_cause?: string;
  hazard_effect?: string;
  measure_title?: string;
  case_study_text?: string;
  measure_description?: string;
}): string {
  return (
    `=== [${a.id}] ${a.project_title} (${a.transport_sector ?? ""}) ===\n` +
    `Hazard: ${a.hazard_cause}\nEffect: ${a.hazard_effect}\n` +
    `Measure: ${a.measure_title}\n${a.case_study_text ?? a.measure_description ?? ""}`
  );
}

/** Per requested id order: optional structured card + chunk or fallback text. */
function assembleBriefContext(
  orderedTribIds: string[],
  articles: Array<{
    id: string;
    project_title: string;
    transport_sector?: string;
    hazard_cause?: string;
    hazard_effect?: string;
    measure_title?: string;
    case_study_text?: string;
    measure_description?: string;
  }>,
  cardsByTrib: Map<string, ArticleCardRow>,
  chunksByTrib: Map<string, string>,
  chunkMode: "rag" | "fallback"
): string {
  const articleById = new Map(articles.map((a) => [a.id, a]));
  const blocks: string[] = [];

  for (const tribId of orderedTribIds) {
    const a = articleById.get(tribId);
    if (!a) continue;

    const card = cardsByTrib.get(tribId);
    const structured = card ? formatArticleCardRowForBriefPrompt(card) : "";

    let evidence: string;
    if (chunkMode === "rag" && chunksByTrib.get(tribId)?.trim()) {
      evidence = chunksByTrib.get(tribId)!;
    } else {
      evidence = fallbackTextForArticle(a);
    }

    blocks.push(structured ? `${structured}\n\n${evidence}` : evidence);
  }

  return blocks.join("\n\n---\n\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = (body.ids ?? []).slice(0, 8);
    const queryContext: string = body.queryContext ?? "";

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "No case study IDs provided" },
        { status: 400 }
      );
    }

    const articles = (
      await Promise.all(ids.map((id) => getHiveArticleById(id)))
    ).filter((a): a is NonNullable<typeof a> => a !== null);

    if (articles.length === 0) {
      return NextResponse.json(
        { error: "No articles found for provided IDs" },
        { status: 404 }
      );
    }

    let sections: GeneratedSection[];
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      sections = generateMockBrief(articles);
    } else {
      const provider = getHiveDataProvider();
      const chunkResult = await retrieveChunksForTribArticleIds(ids);

      const cardsByTrib =
        provider !== "json"
          ? await retrieveArticleCardsForTribIds(ids)
          : new Map<string, ArticleCardRow>();

      const linkedOptions =
        provider !== "json" ? await getLinkedOptionsForBriefArticles(ids) : [];

      const context = assembleBriefContext(
        ids,
        articles,
        cardsByTrib,
        chunkResult.chunksByTrib,
        chunkResult.mode
      );

      let userBody = `Generate a brief for the following ${articles.length} case ${articles.length === 1 ? "study" : "studies"}:\n\n${context}`;

      if (queryContext) {
        userBody += `\n\nAdditional context from the user: ${queryContext}`;
      }

      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey });

      const systemPrompt = buildBriefSystemPrompt(linkedOptions);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: userBody,
          },
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw) as { sections?: GeneratedSection[] };
      sections = parsed.sections ?? generateMockBrief(articles);

      sections = sections.map((s) => ({
        ...s,
        section_title:
          s.section_title ?? SECTION_TITLES[s.section_key] ?? s.section_key,
      }));
    }

    // Session persistence is best-effort — a DB write failure must never
    // prevent the user from seeing the generated brief.
    let sessionId = `session-${Date.now()}`;
    try {
      const session = await createSynthesisSession(
        ids,
        sections.map((s, i) => ({ ...s, sort_order: i, source_chunk_ids: [] })),
        queryContext
      );
      sessionId = session.id;
    } catch (sessionErr) {
      console.warn("[HIVE] brief-generate: session persistence failed (non-blocking):", sessionErr);
    }

    return NextResponse.json({
      sessionId,
      sections,
      label: `AI-generated from ${articles.length} case ${articles.length === 1 ? "study" : "studies"} — review before use`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
