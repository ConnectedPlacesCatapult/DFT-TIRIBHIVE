"use client";
import { useEffect, useRef, useState } from "react";
import { CASE_STUDIES } from "@/lib/hive/seed-data";

// ---------------------------------------------------------------------------
// Quick-start pre-fetch cache
//
// Module-level — survives across React re-renders and client-side navigations.
// Pre-fetches the four quick-start queries in the background the moment the
// handbook page loads. When the user clicks one, the result is returned
// synchronously from memory (0 ms — no debounce, no API call, no cost).
// ---------------------------------------------------------------------------

/** Canonical quick-start queries, exactly as they appear in the UI. */
export const QUICK_START_QUERIES = [
  "flooding on a rail corridor",
  "heatwave on road bridges",
  "coastal port storm surge",
  "slope instability near a motorway",
] as const;

/** Normalise a query the same way the server does for cache-key matching. */
function normaliseForCache(q: string): string {
  return q
    .toLowerCase()
    .replace(/\b(i'm|i am|i've|we('re| are)|we've|dealing with|managing|struggling with|worried about|about|related to|regarding|what about|tell me about|show me|cases (about|for|on)|cases|for|on|the|a|an|our|my|some|any|examples of|example of|how (to|do|does|can)|what (is|are)|help (me |us )?(with|understand)?)\b/gi, " ")
    .replace(/['"?!.,;:]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Module-level in-memory store: normalised query → resolved UnifiedSearchResult.
 * Populated by prefetchQuickStarts(). Never expires within a browser session —
 * the quick-start responses are deterministic (temperature 0) so staleness is not
 * a concern until the underlying data or prompt changes.
 */
const prefetchCache = new Map<string, UnifiedSearchResult>();

/** Track in-flight pre-fetch promises so we never duplicate a request. */
const prefetchInFlight = new Set<string>();

async function fetchAndCache(query: string): Promise<void> {
  const key = normaliseForCache(query);
  if (prefetchCache.has(key) || prefetchInFlight.has(key)) return;
  prefetchInFlight.add(key);
  try {
    const res = await fetch("/api/handbook/unified-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: query }),
    });
    if (!res.ok) return;
    const data = await res.json();

    const rawCases: UnifiedCase[] = data.cases ?? [];
    let matchedCases = rawCases
      .map((r) => {
        const cs = CASE_STUDIES.find((c) => c.id === r.article_id);
        return cs ? { ...cs, _similarity: r.similarity, _section: r.section_key } : null;
      })
      .filter(Boolean) as typeof CASE_STUDIES;

    const chips: string[] = data.chips ?? [];
    if (matchedCases.length === 0 && chips.length > 0) {
      matchedCases = chips
        .map((id: string) => CASE_STUDIES.find((c) => c.id === id))
        .filter(Boolean) as typeof CASE_STUDIES;
    }

    prefetchCache.set(key, {
      cases: matchedCases,
      rawCases,
      synthesis: data.synthesis ?? "",
      chips,
      chunks: rawCases.length > 0
        ? rawCases.map((c) => ({ article_id: c.article_id, section_key: c.section_key, chunk_text: c.chunk_text }))
        : chips.map((id: string) => ({ article_id: id, section_key: "general", chunk_text: "" })),
      scenario: data.scenario ?? null,
      retrieval_mode: data.retrieval_mode ?? null,
      ai_unavailable: data.ai_unavailable === true,
      loading: false,
      error: null,
    });
  } catch {
    // Silent — pre-fetch failure never breaks the UI; the hook will fall back to a live request.
  } finally {
    prefetchInFlight.delete(key);
  }
}

/**
 * Fire-and-forget pre-fetch for all quick-start queries.
 * Call once on handbook page mount. Staggered 200 ms apart to stay within
 * Supabase and OpenAI rate limits, and to avoid competing with the user's
 * first real search request.
 */
export function prefetchQuickStarts(): void {
  QUICK_START_QUERIES.forEach((q, i) => {
    setTimeout(() => fetchAndCache(q), i * 200);
  });
}

export type UnifiedCase = {
  article_id: string;
  similarity: number;
  section_key: string;
  chunk_text: string;
};

export type UnifiedSearchResult = {
  /** Full case study objects matched to the unified API results (same order) */
  cases: typeof CASE_STUDIES;
  /** Raw retrieval results from pgvector */
  rawCases: UnifiedCase[];
  /** AI-generated synthesis text (markdown with [ID_xx] citations) */
  synthesis: string;
  /** Case IDs the AI cited in the synthesis */
  chips: string[];
  /** Chunks for passing to ChatPanel as pre-loaded context */
  chunks: { article_id: string; section_key: string; chunk_text: string }[];
  scenario: "A" | "B" | "C" | null;
  retrieval_mode: "rag" | "fallback" | null;
  ai_unavailable: boolean;
  loading: boolean;
  error: string | null;
};

const EMPTY: UnifiedSearchResult = {
  cases: [],
  rawCases: [],
  synthesis: "",
  chips: [],
  chunks: [],
  scenario: null,
  retrieval_mode: null,
  ai_unavailable: false,
  loading: false,
  error: null,
};

/**
 * Single-retrieval hook for /handbook/v2.
 *
 * Fires one POST /api/handbook/unified-search per debounced query.
 * Returns both case card data and AI synthesis from the same response —
 * no coordination layer, no timing gap, no count mismatch.
 */
export function useUnifiedSearch(
  query: string,
  includeGuidance = false,
  forceEvidenceMode = false
): UnifiedSearchResult {
  const [result, setResult] = useState<UnifiedSearchResult>(EMPTY);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();

    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 3) {
      setResult(EMPTY);
      return;
    }

    // ── Cache-first: return pre-fetched result immediately (0 ms, no API call) ──
    const cached = prefetchCache.get(normaliseForCache(trimmed));
    if (cached) {
      setResult(cached);
      return;
    }

    setResult((prev) => ({ ...prev, loading: true, error: null }));

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/handbook/unified-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: trimmed, includeGuidance, forceEvidenceMode }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setResult((prev) => ({
            ...prev,
            loading: false,
            error: err.error ?? "Search failed",
            ai_unavailable: false,
          }));
          return;
        }

        const data = await res.json();

        // Map article_ids back to full CASE_STUDIES objects
        const rawCases: UnifiedCase[] = data.cases ?? [];
        let matchedCases = rawCases
          .map((r) => {
            const cs = CASE_STUDIES.find((c) => c.id === r.article_id);
            return cs ? { ...cs, _similarity: r.similarity, _section: r.section_key } : null;
          })
          .filter(Boolean) as typeof CASE_STUDIES;

        // Fallback: pgvector returned no chunks (DB fallback mode) but LLM cited IDs via chips.
        // Use chips to show cards so the grid is never empty when synthesis has content.
        const chips: string[] = data.chips ?? [];
        if (matchedCases.length === 0 && chips.length > 0) {
          matchedCases = chips
            .map((id: string) => CASE_STUDIES.find((c) => c.id === id))
            .filter(Boolean) as typeof CASE_STUDIES;
        }

        setResult({
          cases: matchedCases,
          rawCases,
          synthesis: data.synthesis ?? "",
          chips,
          chunks: rawCases.length > 0
            ? rawCases.map((c) => ({
                article_id: c.article_id,
                section_key: c.section_key,
                chunk_text: c.chunk_text,
              }))
            : chips.map((id: string) => ({ article_id: id, section_key: "general", chunk_text: "" })),
          scenario: data.scenario ?? null,
          retrieval_mode: data.retrieval_mode ?? null,
          ai_unavailable: data.ai_unavailable === true,
          loading: false,
          error: null,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setResult((prev) => ({
          ...prev,
          loading: false,
          error: "Search unavailable — please try again",
          ai_unavailable: false,
        }));
      }
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query, includeGuidance, forceEvidenceMode]);

  return result;
}
