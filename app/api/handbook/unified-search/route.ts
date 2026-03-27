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

/**
 * Normalise a query for cache keying.
 * Strips conversational filler so "I'm dealing with flooding" and "flooding"
 * hash to the same key and share a cache entry.
 */
const FILLER_WORDS =
  /\b(i'm|i am|i've|we('re| are)|we've|dealing with|managing|struggling with|worried about|about|related to|regarding|what about|tell me about|show me|cases (about|for|on)|cases|for|on|the|a|an|our|my|some|any|examples of|example of|how (to|do|does|can)|what (is|are)|help (me |us )?(with|understand)?)\b/gi;

function normaliseQuery(q: string): string {
  return q
    .toLowerCase()
    .replace(FILLER_WORDS, " ")
    .replace(/['"?!.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

async function fetchGuidanceChunks(query: string): Promise<{ article_id: string; section_key: string; chunk_text: string }[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return [];
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(supabaseUrl, supabaseKey, { db: { schema: "hive" } });
    // Keyword match on guidance chunks — pragmatic for demo mode (no extra embedding call needed)
    const keywords = query
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 4);
    if (keywords.length === 0) return [];
    // Build OR filter: chunk_text ILIKE any keyword
    const filter = keywords.map((k) => `chunk_text.ilike.%${k}%`).join(",");
    const { data } = await sb
      .from("document_chunks")
      .select("chunk_text, section_key, metadata")
      .or(filter)
      .limit(4);
    return (data ?? []).map((r) => ({
      article_id: "",
      section_key: r.section_key ?? "guidance",
      chunk_text: r.chunk_text as string,
    }));
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  let body: { q?: string; skipCache?: boolean; includeGuidance?: boolean };
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

  const includeGuidance = body.includeGuidance === true;
  const hash = hashQuery(query);

  // ── Cache check (skip when explicitly requested or guidance mode changes the response) ──
  if (!body.skipCache && !includeGuidance) {
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

    // ── Step 1b: guidance chunk retrieval (only when toggled on in demo) ────
    const guidanceChunks = includeGuidance ? await fetchGuidanceChunks(query) : [];

    // ── Step 2: LLM synthesis ────────────────────────────────────────────────
    const aiResult = await getAIResponse(
      [{ role: "user", text: query }],
      {
        mode: "explore",
        result_chunks: [
          ...cases.map((c) => ({
            article_id: c.article_id ?? "",
            section_key: c.section_key,
            chunk_text: c.chunk_text,
          })),
          ...guidanceChunks,
        ],
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

    // ── Write to cache (non-blocking, only for standard queries without guidance) ──
    if (!includeGuidance) setCachedResponse(hash, query, response);

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
