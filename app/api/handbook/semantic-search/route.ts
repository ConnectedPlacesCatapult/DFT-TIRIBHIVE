/**
 * GET /api/handbook/semantic-search?q=...
 *
 * Semantic search over HIVE case study chunks via pgvector.
 * Returns matched article IDs with similarity scores.
 * Used by the landing page search bar to implement scenarios A/B/C.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { hybridSearchChunks, getDynamicThreshold } from "@/lib/handbook/chat-api";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter 'q'" },
      { status: 400 }
    );
  }

  try {
    const { chunks, mode } = await hybridSearchChunks(query, {
      limit: 12,
      threshold: getDynamicThreshold(query),
    });

    // hybridSearchChunks already deduplicates (one chunk per article, RRF-ordered)
    const results = chunks.map((c) => ({
      article_id: c.article_id,
      similarity: c.similarity ?? 0,
      section_key: c.section_key ?? "general",
      chunk_text: c.chunk_text,
    }));

    // Scenario based on top semantic similarity (keyword-only matches have similarity 0)
    const topSimilarity = Math.max(...results.map((r) => r.similarity), 0);
    let scenario: "A" | "B" | "C";
    if (topSimilarity >= 0.55) {
      scenario = "A";
    } else if (results.length > 0) {
      scenario = "B";
    } else {
      scenario = "C";
    }

    return NextResponse.json({
      query,
      scenario,
      top_similarity: topSimilarity,
      results,
      retrieval_mode: mode,
    });
  } catch (err) {
    console.error("Semantic search error:", err);
    return NextResponse.json(
      { error: "Search failed", scenario: "C", results: [], retrieval_mode: "fallback" },
      { status: 500 }
    );
  }
}
