"use client";
import { useEffect, useRef, useState } from "react";
import { CASE_STUDIES } from "@/lib/hive/seed-data";

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
export function useUnifiedSearch(query: string): UnifiedSearchResult {
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

    setResult((prev) => ({ ...prev, loading: true, error: null }));

    timerRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/handbook/unified-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: trimmed }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setResult((prev) => ({
            ...prev,
            loading: false,
            error: err.error ?? "Search failed",
          }));
          return;
        }

        const data = await res.json();

        // Map article_ids back to full CASE_STUDIES objects
        const matchedCases = (data.cases as UnifiedCase[])
          .map((r) => {
            const cs = CASE_STUDIES.find((c) => c.id === r.article_id);
            return cs ? { ...cs, _similarity: r.similarity, _section: r.section_key } : null;
          })
          .filter(Boolean) as typeof CASE_STUDIES;

        setResult({
          cases: matchedCases,
          rawCases: data.cases ?? [],
          synthesis: data.synthesis ?? "",
          chips: data.chips ?? [],
          chunks: (data.cases as UnifiedCase[]).map((c) => ({
            article_id: c.article_id,
            section_key: c.section_key,
            chunk_text: c.chunk_text,
          })),
          scenario: data.scenario ?? null,
          retrieval_mode: data.retrieval_mode ?? null,
          loading: false,
          error: null,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setResult((prev) => ({
          ...prev,
          loading: false,
          error: "Search unavailable — please try again",
        }));
      }
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [query]);

  return result;
}
