"use client";

import type { CaseStudy } from "@/lib/hive/seed-data";
import { SECTOR_BORDER } from "@/lib/hive/themes";

type CaseStudyCardProps = {
  cs: CaseStudy;
  onClick: (cs: CaseStudy) => void;
  onAddToBrief: (cs: CaseStudy) => void;
  inBrief: boolean;
  matchReasons?: string[];
};

const bodyColor = "#A8BFCF";
const metaColor = "#637D96";
const hazardTextColor = "#8FB4CC";

export function CaseStudyCard({ cs, onClick, onAddToBrief, inBrief, matchReasons }: CaseStudyCardProps) {
  const borderCol = SECTOR_BORDER[cs.sector] ?? "#C5A24A";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(cs)}
      onKeyDown={(e) => e.key === "Enter" && onClick(cs)}
      className="flex cursor-pointer flex-col rounded-2xl border p-5 transition-all duration-200 hover:shadow-lg"
      style={{
        background: "var(--surface)",
        borderLeft: `3px solid ${borderCol}`,
        borderColor: "var(--border)",
      }}
    >
      <div className="mb-1 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest"
              style={{ color: borderCol }}
            >
              <span
                className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ background: borderCol }}
              />
              {cs.sector}
            </span>
            <span style={{ color: metaColor }}>·</span>
            <span className="text-xs" style={{ color: metaColor }}>
              {cs.location}
            </span>
            <span style={{ color: metaColor }}>·</span>
            <span className="text-xs" style={{ color: metaColor }}>
              {cs.year?.split("–")[0]}
            </span>
          </div>
          <h3 className="text-base font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
            {cs.title}
          </h3>
        </div>
      </div>
      <p className="mb-2 text-xs font-semibold" style={{ color: "var(--accent)" }}>
        {cs.hook}
      </p>
      <p
        className="mb-3 line-clamp-2 flex-1 text-sm leading-relaxed"
        style={{ color: bodyColor }}
      >
        {cs.summary}
      </p>
      {matchReasons && matchReasons.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs" style={{ color: metaColor }}>
            Matched on:
          </span>
          {matchReasons.map((r) => (
            <span
              key={r}
              className="rounded border px-1.5 py-0.5 text-xs font-medium"
              style={{ borderColor: "var(--accent)", background: "var(--accent-bg)", color: "var(--accent-text)" }}
            >
              {r}
            </span>
          ))}
        </div>
      )}
      <div className="mb-3 flex flex-wrap gap-2">
        {cs.hazards.cause.slice(0, 2).map((haz) => (
          <span
            key={haz}
            className="flex items-center gap-1.5 text-xs"
            style={{ color: hazardTextColor }}
          >
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{ background: hazardTextColor }}
            />
            {haz}
          </span>
        ))}
      </div>
      <div
        className="mb-3 rounded-xl border-l-2 px-3 py-2"
        style={{
          background: "var(--accent-bg)",
          borderColor: "var(--accent)",
          opacity: 0.85,
        }}
      >
        <div className="mb-1 flex items-center gap-1.5">
          <svg
            className="h-3 w-3 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: "var(--accent)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
          </svg>
          <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
            UK applicability
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: bodyColor }}>
          {cs.transferabilityNote?.slice(0, 100)}…
        </p>
      </div>
      <div
        className="flex items-center justify-between border-t pt-1"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-xs font-semibold"
            style={{
              color: cs.transferability === "High" ? "#4ade80" : "#fbbf24",
            }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: cs.transferability === "High" ? "#4ade80" : "#fbbf24",
              }}
            />
            {cs.transferability} UK transferability
          </span>
          <span className="text-xs" style={{ color: metaColor }}>
            {cs.costBand}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddToBrief(cs);
            }}
            className="rounded-full border px-2.5 py-1 text-xs font-medium transition-all"
            style={
              inBrief
                ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" }
                : { borderColor: "var(--border)", color: "var(--text-secondary)" }
            }
          >
            {inBrief ? "✓ In brief" : "+ Add to brief"}
          </button>
          <span
            className="flex items-center gap-1 text-xs font-medium transition-all"
            style={{ color: "var(--accent)" }}
          >
            Full case
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
