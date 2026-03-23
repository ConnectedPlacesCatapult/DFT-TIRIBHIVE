"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useChatContext } from "@/components/handbook/shared/ChatContext";
import { HeatmapPanel } from "@/components/handbook/shared/HeatmapPanel";
import {
  HEATMAP_SECTORS,
  HEATMAP_HAZARDS,
  HEATMAP_MATRIX,
  matchSectors,
  type HeatmapSector,
  matchHazardIds,
} from "@/lib/handbook/heatmap-data";

// ── Types ─────────────────────────────────────────────────────────────────────

type BriefCaseLike = {
  id: string;
  title: string;
  sector: string;
  hazards?: string[];
};

type CoveredMeasure = {
  trib_article_id: string;
  adaptation_measure: string;
  transport_subsector?: string | null;
  climate_hazard_cause?: string | null;
};

type CoveragePayload = {
  mode: "json" | "supabase";
  covered: CoveredMeasure[];
  uncovered: { id: string }[];
  total: number;
  sectors: string[];
};

// ── Theme tokens (matches brief page palette) ─────────────────────────────────

const T = {
  surface: "#ffffff",
  surfaceAlt: "#f3f1ec",
  border: "#e4e0d8",
  text: "#1a1814",
  textSec: "#5a5650",
  textMuted: "#9a948a",
  accent: "#1d70b8",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function uniqueSectors(cases: BriefCaseLike[]): string[] {
  return [
    ...new Set(
      cases.map((c) => c.sector?.trim()).filter(Boolean) as string[]
    ),
  ];
}

/**
 * Build a sector × hazard count matrix from covered measures.
 * Cells represent how many framework options your brief cases cover.
 */
function buildCoverageMatrix(
  covered: CoveredMeasure[]
): Record<string, Record<string, number>> {
  const matrix: Record<string, Record<string, number>> = {};
  for (const sector of HEATMAP_SECTORS) {
    matrix[sector] = {};
    for (const hazard of HEATMAP_HAZARDS) {
      matrix[sector][hazard.id] = 0;
    }
  }
  for (const measure of covered) {
    const sector = measure.transport_subsector?.trim();
    if (!sector || !HEATMAP_SECTORS.includes(sector as HeatmapSector)) continue;
    const hazardIds = matchHazardIds([measure.climate_hazard_cause ?? ""]);
    for (const hazardId of hazardIds) {
      (matrix[sector as HeatmapSector] as Record<string, number>)[hazardId]++;
    }
  }
  return matrix;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function BriefOptionsCoverage({
  caseIds,
  briefCases,
}: {
  caseIds: string[];
  briefCases: BriefCaseLike[];
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Data state
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CoveragePayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Expand/collapse + auto-open state
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [userToggled, setUserToggled] = useState(false);

  // View mode toggle: covered measures vs full framework
  const [viewMode, setViewMode] = useState<"coverage" | "framework">("coverage");

  const { setPendingBriefMessage, openChat } = useChatContext();

  const sectors = useMemo(() => uniqueSectors(briefCases), [briefCases]);

  const briefHazards = useMemo(
    () => [...new Set(briefCases.flatMap((c) => c.hazards ?? []))],
    [briefCases]
  );

  // Normalise brief sectors to HeatmapPanel sector labels (Highways → Roads, etc.)
  const activeSectorsForHeatmap = useMemo(
    () => matchSectors(sectors),
    [sectors]
  );

  // Build brief-specific coverage matrix from API covered data
  const coverageMatrix = useMemo(
    () => (data ? buildCoverageMatrix(data.covered) : null),
    [data]
  );

  // Unique covered adaptation_measure count for the N of M line
  const coveredUniqueMeasures = useMemo(
    () => new Set(data?.covered.map((c) => c.adaptation_measure) ?? []).size,
    [data]
  );

  const totalCount = data?.total ?? 0;
  const showJsonFallback = data?.mode === "json";

  // ── Fetch coverage data ──────────────────────────────────────────────────
  useEffect(() => {
    if (caseIds.length === 0) return;
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          ids: caseIds.join(","),
          sectors: sectors.join(","),
        });
        const res = await fetch(
          `/api/handbook/options-coverage?${params.toString()}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`Options coverage failed (${res.status})`);
        setData((await res.json()) as CoveragePayload);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Unable to load options coverage"
        );
      } finally {
        setLoading(false);
      }
    };
    run();
    return () => controller.abort();
  }, [caseIds, sectors]);

  // ── Auto-open on first scroll into view ──────────────────────────────────
  useEffect(() => {
    const el = rootRef.current;
    if (!el || hasAutoOpened || userToggled) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            setIsExpanded(true);
            setHasAutoOpened(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: [0.4] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasAutoOpened, userToggled]);

  // ── Cell click → open chat with context ──────────────────────────────────
  const handleCellClick = (sector: string, hazardId: string) => {
    const hazardLabel =
      HEATMAP_HAZARDS.find((h) => h.id === hazardId)?.label ?? hazardId;
    setPendingBriefMessage(
      `Show me case studies for ${sector} infrastructure and ${hazardLabel} risk`
    );
    openChat("browse");
  };

  // Active matrix: brief coverage counts (supabase) OR full framework counts (always available)
  const activeMatrix =
    viewMode === "coverage" && coverageMatrix && !showJsonFallback
      ? coverageMatrix
      : HEATMAP_MATRIX;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={rootRef} style={{ padding: "28px 0", borderBottom: `1px solid ${T.border}` }}>
      {/* Always-visible header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: isExpanded ? 14 : 0,
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
            Adaptation Measures — Framework Coverage
          </h2>
          <span style={{ fontSize: 11, color: T.textMuted }}>
            {data && !showJsonFallback
              ? `Your brief covers ${coveredUniqueMeasures} of ${totalCount} measures in the DfT options framework`
              : "DfT options framework — your brief sectors highlighted"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setUserToggled(true);
            setIsExpanded((prev) => !prev);
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontWeight: 700,
            color: T.accent,
            border: `1px solid ${T.border}`,
            borderRadius: 999,
            background: T.surface,
            padding: "6px 10px",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? "Hide options coverage details"
              : "Show options coverage details"
          }
        >
          {isExpanded ? "Hide" : "Show details"}
          <span aria-hidden="true">{isExpanded ? "▴" : "▾"}</span>
        </button>
      </div>

      {/* Expandable body */}
      {isExpanded && (
        <>
          {/* View toggle — only when Supabase coverage data is loaded */}
          {!showJsonFallback && data && !loading && !error && (
            <div
              role="group"
              aria-label="Heatmap view mode"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                borderRadius: 8,
                padding: 2,
                border: `1px solid ${T.border}`,
                background: T.surfaceAlt,
                marginBottom: 12,
              }}
            >
              {(["coverage", "framework"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  aria-pressed={viewMode === mode}
                  style={{
                    fontSize: 11,
                    padding: "4px 12px",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    background: viewMode === mode ? T.accent : "transparent",
                    color: viewMode === mode ? "#fff" : T.textMuted,
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                >
                  {mode === "coverage" ? "Your coverage" : "Full framework"}
                </button>
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div
              style={{
                height: 200,
                borderRadius: 10,
                border: `1px solid ${T.border}`,
                background: T.surfaceAlt,
                opacity: 0.6,
              }}
            />
          )}

          {/* Error state */}
          {!loading && error && (
            <div
              style={{
                padding: "12px 14px",
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.surfaceAlt,
              }}
            >
              <p style={{ fontSize: 12, color: T.textSec, marginBottom: 8 }}>
                Unable to load options coverage. You can still browse the full
                framework.
              </p>
              <Link
                href="/handbook/options"
                style={{ color: T.accent, fontSize: 12, fontWeight: 600 }}
              >
                Browse full framework →
              </Link>
            </div>
          )}

          {/* Heatmap — shown for both JSON and Supabase modes */}
          {!loading && !error && (data || !loading) && (
            <HeatmapPanel
              variant="filter"
              subtitle="— click any cell to explore related case studies with AI"
              matrix={activeMatrix}
              activeSectors={activeSectorsForHeatmap}
              activeHazards={briefHazards}
              onCellClick={handleCellClick}
            />
          )}

          {/* Footer */}
          {!loading && !error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: -8,
              }}
            >
              {showJsonFallback && (
                <span style={{ fontSize: 11, color: T.textMuted }}>
                  Connect to HIVE database to unlock brief-specific coverage
                </span>
              )}
              <Link
                href="/handbook/options"
                style={{
                  color: T.accent,
                  fontSize: 12,
                  fontWeight: 600,
                  marginLeft: "auto",
                }}
              >
                Browse full framework →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
