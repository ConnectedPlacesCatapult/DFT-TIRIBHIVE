/**
 * POST /api/handbook/unified-search
 *
 * The "one brain" endpoint for /handbook/v2.
 * One pgvector call + one LLM call → returns both case cards and AI synthesis.
 *
 * This eliminates the coordination layer required when search bar and chat run
 * independent retrievals. The hook and page both read from one response object.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { semanticSearchChunks, getAIResponse } from "@/lib/handbook/chat-api";

export async function POST(req: NextRequest) {
  let body: { q?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const query = body.q?.trim();
  if (!query || query.length < 3) {
    return NextResponse.json(
      { error: "Query too short — minimum 3 characters" },
      { status: 400 }
    );
  }

  try {
    // ── Step 1: single pgvector retrieval ──────────────────────────────────
    const { chunks, mode } = await semanticSearchChunks(query, {
      limit: 12,
      threshold: 0.4,
    });

    // Deduplicate by article_id, keep highest-similarity chunk per article
    const articleMap = new Map<
      string,
      { article_id: string; similarity: number; section_key: string; chunk_text: string }
    >();
    for (const c of chunks) {
      const existing = articleMap.get(c.article_id);
      if (!existing || (c.similarity ?? 0) > existing.similarity) {
        articleMap.set(c.article_id, {
          article_id: c.article_id,
          similarity: c.similarity ?? 0,
          section_key: c.section_key ?? "general",
          chunk_text: c.chunk_text,
        });
      }
    }

    const cases = Array.from(articleMap.values()).sort(
      (a, b) => b.similarity - a.similarity
    );

    // Scenario classification (mirrors /api/handbook/semantic-search)
    const topSimilarity = cases[0]?.similarity ?? 0;
    let scenario: "A" | "B" | "C";
    if (topSimilarity >= 0.55) scenario = "A";
    else if (topSimilarity >= 0.4 && cases.length > 0) scenario = "B";
    else scenario = "C";

    // ── Step 2: LLM synthesis using the same chunks (no second pgvector call) ──
    const aiResult = await getAIResponse(
      [{ role: "user", text: query }],
      {
        mode: "explore",
        result_chunks: cases.map((c) => ({
          article_id: c.article_id,
          section_key: c.section_key,
          chunk_text: c.chunk_text,
        })),
        session_intent: query,
      }
    );

    return NextResponse.json({
      query,
      scenario,
      top_similarity: topSimilarity,
      cases,
      synthesis: aiResult.message ?? aiResult.text ?? "",
      chips: aiResult.chips ?? [],
      retrieval_mode: mode,
    });
  } catch (err) {
    console.error("[unified-search] Error:", err);
    return NextResponse.json(
      {
        error: "Search failed",
        query,
        scenario: "C",
        cases: [],
        synthesis: "",
        chips: [],
        retrieval_mode: "fallback",
      },
      { status: 500 }
    );
  }
}
