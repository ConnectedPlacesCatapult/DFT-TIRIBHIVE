/**
 * GET /api/handbook/semantic-search?q=...
 *
 * Semantic search over HIVE case study chunks via pgvector.
 * Returns matched article IDs with similarity scores and chunk_text.
 * Used by the landing page search bar to implement scenarios A/B/C.
 *
 * Results are cached in-memory (module scope, survives across requests in the
 * same serverless instance) with a 5-minute TTL and max 150 entries.
 * Common queries like "flooding" / "heat" / "rail" become near-instant on
 * repeat since they skip the OpenAI embed call + pgvector round-trip.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { hybridSearchChunks, getDynamicThreshold } from "@/lib/handbook/chat-api";

// ---------------------------------------------------------------------------
// In-memory LRU-style cache (max 150 entries, 5-minute TTL)
// ---------------------------------------------------------------------------

type CacheEntry = {
  value: ReturnType<typeof buildResponse>;
  expiresAt: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX = 150;
const cache = new Map<string, CacheEntry>();

function cacheGet(key: string): CacheEntry["value"] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function cacheSet(key: string, value: CacheEntry["value"]): void {
  if (cache.size >= CACHE_MAX) {
    // Evict oldest entry (Maps preserve insertion order)
    cache.delete(cache.keys().next().value!);
  }
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function buildResponse(
  query: string,
  results: { article_id: string; similarity: number; section_key: string; chunk_text: string }[],
  mode: "rag" | "fallback"
) {
  const topSimilarity = Math.max(...results.map((r) => r.similarity), 0);
  let scenario: "A" | "B" | "C";
  if (topSimilarity >= 0.55) {
    scenario = "A";
  } else if (results.length > 0) {
    scenario = "B";
  } else {
    scenario = "C";
  }
  return { query, scenario, top_similarity: topSimilarity, results, retrieval_mode: mode };
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter 'q'" },
      { status: 400 }
    );
  }

  // Normalise cache key: lowercase, trim, collapse whitespace
  const cacheKey = query.toLowerCase().replace(/\s+/g, " ").trim();

  const cached = cacheGet(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "X-Cache": "HIT" },
    });
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

    const response = buildResponse(query, results, mode);

    // Only cache RAG results (fallback results may vary once DB recovers)
    if (mode === "rag") {
      cacheSet(cacheKey, response);
    }

    return NextResponse.json(response, {
      headers: { "X-Cache": "MISS" },
    });
  } catch (err) {
    console.error("Semantic search error:", err);
    return NextResponse.json(
      { error: "Search failed", scenario: "C", results: [], retrieval_mode: "fallback" },
      { status: 500 }
    );
  }
}
