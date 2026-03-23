/**
 * POST /api/handbook/unified-search
 *
 * The "one brain" endpoint for /handbook/v2 and the Unified toggle on /handbook.
 * One pgvector call + one LLM call → returns both case cards and AI synthesis.
 *
 * Responses are cached in the public.query_cache Supabase table for 24 hours.
 * Cache hits return in ~20ms instead of ~2.5s. Pre-warm via /api/handbook/prewarm.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { hybridSearchChunks, getDynamicThreshold, getAIResponse } from "@/lib/handbook/chat-api";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

/** Normalise a query for cache keying — lowercase, collapse whitespace */
function normaliseQuery(q: string): string {
  return q.toLowerCase().replace(/\s+/g, " ").trim();
}

/** SHA-256 hash of the normalised query — used as the primary key */
function hashQuery(q: string): string {
  return createHash("sha256").update(normaliseQuery(q)).digest("hex");
}

const CACHE_TTL_HOURS = 24;

async function getCachedResponse(hash: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const sb = createClient(supabaseUrl, supabaseKey);
    const cutoff = new Date(Date.now() - CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();
    const { data } = await sb
      .from("query_cache")
      .select("response_json")
      .eq("query_hash", hash)
      .gte("created_at", cutoff)
      .maybeSingle();
    return data?.response_json ?? null;
  } catch {
    return null;
  }
}

async function setCachedResponse(hash: string, queryText: string, response: object) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return;
  try {
    const sb = createClient(supabaseUrl, supabaseKey);
    await sb.from("query_cache").upsert(
      { query_hash: hash, query_text: queryText, response_json: response },
      { onConflict: "query_hash" }
    );
  } catch (err) {
    // Non-blocking — cache write failure must never break the response
    console.warn("[unified-search] Cache write failed (non-blocking):", err);
  }
}

export async function POST(req: NextRequest) {
  let body: { q?: string; skipCache?: boolean };
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

  const hash = hashQuery(query);

  // ── Cache check (skip only when explicitly requested, e.g. prewarm refresh) ──
  if (!body.skipCache) {
    const cached = await getCachedResponse(hash);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }
  }

  try {
    // ── Step 1: hybrid retrieval (pgvector + keyword RRF) ──────────────────
    const { chunks, mode } = await hybridSearchChunks(query, {
      limit: 12,
      threshold: getDynamicThreshold(query),
    });

    const cases = chunks.map((c) => ({
      article_id: c.article_id,
      similarity: c.similarity ?? 0,
      section_key: c.section_key ?? "general",
      chunk_text: c.chunk_text,
    }));

    const topSimilarity = Math.max(...cases.map((c) => c.similarity), 0);
    let scenario: "A" | "B" | "C";
    if (topSimilarity >= 0.55) scenario = "A";
    else if (cases.length > 0) scenario = "B";
    else scenario = "C";

    // ── Step 2: LLM synthesis ────────────────────────────────────────────────
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

    const response = {
      query,
      scenario,
      top_similarity: topSimilarity,
      cases,
      synthesis: aiResult.message ?? aiResult.text ?? "",
      chips: aiResult.chips ?? [],
      retrieval_mode: mode,
    };

    // ── Write to cache (non-blocking) ────────────────────────────────────────
    setCachedResponse(hash, query, response);

    return NextResponse.json(response);
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
