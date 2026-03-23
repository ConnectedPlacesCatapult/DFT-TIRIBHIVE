/**
 * POST /api/handbook/prewarm
 *
 * Pre-warms the unified-search query cache for the 25 most likely DfT queries.
 * Called silently in the background when the handbook page loads — users never wait.
 *
 * - Checks which queries are already cached before computing
 * - Fires queries sequentially to avoid OpenAI rate limits
 * - Returns { warmed, skipped, total, queries } for observability
 *
 * Can also be triggered manually or from a post-deploy script.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

/** The 25 canonical queries to precompute, ordered by expected traffic */
const PREWARM_QUERIES = [
  // Tier 1 — highest traffic, broadest KB coverage
  "flood",
  "flooding",
  "heat",
  "storm",
  "drainage",
  "coastal",
  "rail flooding",
  "slope stability",
  "pavement",
  "sea level rise",
  // Tier 2 — sector-specific high value
  "rail heat",
  "highway flooding",
  "airport flooding",
  "drought",
  "landslide",
  "SuDS",
  "storm surge",
  "vegetation management",
  // Tier 3 — scenario-level queries
  "climate adaptation rail",
  "nature-based solutions",
  "sensor monitoring",
  "surface water flooding",
  "rockfall",
  "port flooding",
  "wind damage",
];

function normaliseQuery(q: string): string {
  return q.toLowerCase().replace(/\s+/g, " ").trim();
}

function hashQuery(q: string): string {
  return createHash("sha256").update(normaliseQuery(q)).digest("hex");
}

const CACHE_TTL_HOURS = 24;

async function getAlreadyCachedHashes(): Promise<Set<string>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return new Set();
  try {
    const sb = createClient(supabaseUrl, supabaseKey);
    const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
    const { data } = await sb
      .from("query_cache")
      .select("query_hash")
      .gte("created_at", cutoff);
    return new Set((data ?? []).map((r: { query_hash: string }) => r.query_hash));
  } catch {
    return new Set();
  }
}

export async function POST(req: NextRequest) {
  // Optional: pass { force: true } to re-warm even cached queries
  let body: { force?: boolean } = {};
  try { body = await req.json(); } catch { /* empty body is fine */ }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cachedHashes = body.force ? new Set<string>() : await getAlreadyCachedHashes();

  const results: { query: string; status: "warmed" | "skipped" | "error" }[] = [];

  for (const query of PREWARM_QUERIES) {
    const hash = hashQuery(query);

    if (cachedHashes.has(hash)) {
      results.push({ query, status: "skipped" });
      continue;
    }

    try {
      const res = await fetch(`${appUrl}/api/handbook/unified-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: query, skipCache: true }),
      });
      if (res.ok) {
        results.push({ query, status: "warmed" });
      } else {
        results.push({ query, status: "error" });
      }
    } catch {
      results.push({ query, status: "error" });
    }
  }

  const warmed = results.filter((r) => r.status === "warmed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const errors = results.filter((r) => r.status === "error").length;

  console.log(`[prewarm] Done — warmed: ${warmed}, skipped: ${skipped}, errors: ${errors}`);

  return NextResponse.json({
    total: PREWARM_QUERIES.length,
    warmed,
    skipped,
    errors,
    queries: results,
  });
}
