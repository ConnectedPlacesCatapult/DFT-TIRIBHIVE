/**
 * GET /api/handbook/eval/diagnostic-retrieval?query=...
 *
 * Runs the heat-stress (explore_02) retrieval diagnostic: same query against
 * hive_match_chunks at threshold 0.4 vs 0.35. Returns chunk counts and
 * top chunks with article_id + similarity for comparison.
 *
 * Default query: "Heat stress adaptation in highways and rail"
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { semanticSearchChunks, getEmbeddingQueryForRetrieval, HEAT_QUERY_REGEX } from "@/lib/handbook/chat-api";

const DEFAULT_QUERY = "Heat stress adaptation in highways and rail";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query")?.trim() || DEFAULT_QUERY;
  const heatExpansion = HEAT_QUERY_REGEX.test(query);
  const embeddingQuery = getEmbeddingQueryForRetrieval(query);

  try {
    const [at04, at035] = await Promise.all([
      semanticSearchChunks(query, { limit: 12, threshold: 0.4 }),
      semanticSearchChunks(query, { limit: 12, threshold: 0.35 }),
    ]);

    const toSummary = (chunks: { article_id: string; similarity?: number; section_key?: string }[]) => {
      const byArticle = new Map<string, number>();
      for (const c of chunks) {
        const s = c.similarity ?? 0;
        const cur = byArticle.get(c.article_id);
        if (cur === undefined || s > cur) byArticle.set(c.article_id, s);
      }
      return {
        count: chunks.length,
        article_ids: Array.from(byArticle.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([id, sim]) => ({ article_id: id, similarity: Math.round(sim * 1000) / 1000 })),
      };
    };

    return NextResponse.json({
      query,
      heat_expansion_applied: heatExpansion,
      embedding_query_used: heatExpansion ? embeddingQuery : query,
      at_threshold_0_4: toSummary(at04.chunks),
      at_threshold_0_35: toSummary(at035.chunks),
      message:
        at04.chunks.length === 0 && at035.chunks.length > 0
          ? "At 0.4 no chunks returned; at 0.35 some chunks returned — lower threshold helps this query."
          : at04.chunks.length > 0
            ? "Both thresholds return chunks; compare article_ids and similarity scores above."
            : "No chunks at either threshold; check embeddings and hive_match_chunks.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message, query },
      { status: 500 }
    );
  }
}
