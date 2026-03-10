"use client";

import { useState } from "react";
import type { MarqueeEntry } from "@/lib/hive/seed-data";

type MarqueeScrollProps = {
  entries: MarqueeEntry[];
  onCardClick: (entry: MarqueeEntry) => void;
  matchingSectors: string[];
  matchingHazards: string[];
  hasFilters: boolean;
  gradFade?: string;
  variant?: "2d" | "3d";
};

function MarqueeCard({
  c,
  onClick,
  dimmed,
  highlighted,
}: {
  c: MarqueeEntry;
  onClick: () => void;
  dimmed: boolean;
  highlighted: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="flex-shrink-0 cursor-pointer rounded-2xl border p-4 transition-all duration-300"
      style={{
        width: "280px",
        opacity: dimmed ? 0.25 : 1,
        boxShadow: highlighted ? "0 2px 12px rgba(0,0,0,0.10)" : hovered ? "0 8px 24px rgba(0,0,0,0.12)" : "none",
        transform: highlighted ? "translateY(-2px)" : hovered ? "translateY(-3px) scale(1.03)" : "none",
        borderColor: hovered && !highlighted ? "var(--border-strong)" : highlighted ? "var(--accent)" : "var(--border)",
        background: highlighted ? "var(--accent-bg)" : "var(--surface)",
      }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)", flex: 1 }}>
          {c.title}
        </h4>
        <span
          className="flex-shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium"
          style={{
            background: "var(--surface-alt)",
            borderColor: "var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          {c.sector}
        </span>
      </div>
      <p
        className="mb-2 text-xs"
        style={{ color: "var(--text-muted)" }}
      >
        {c.measure}
      </p>
      <p className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
        {c.hook}
      </p>
    </div>
  );
}

export function MarqueeScroll({
  entries,
  onCardClick,
  matchingSectors,
  matchingHazards,
  hasFilters,
  gradFade = "var(--grad-fade)",
  variant = "2d",
}: MarqueeScrollProps) {
  const isHighlighted = (c: MarqueeEntry) => {
    if (!hasFilters) return false;
    const sectorMatch = matchingSectors.length === 0 || matchingSectors.includes(c.sector);
    const hazardMatch =
      matchingHazards.length === 0 ||
      c.hazards.some((h) => matchingHazards.some((mh) => h.toLowerCase().includes(mh.toLowerCase())));
    return sectorMatch && hazardMatch;
  };
  const isDimmed = (c: MarqueeEntry) => hasFilters && !isHighlighted(c);

  if (variant === "3d") {
    const cols: MarqueeEntry[][] = [[], [], [], [], [], []];
    entries.forEach((c, i) => cols[i % 6].push(c));
    return (
      <div className="relative overflow-hidden" style={{ height: "500px" }}>
        <style>{`
          @keyframes scrollY { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        `}</style>
        <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "900px" }}>
          <div
            className="flex gap-4"
            style={{ transform: "translateX(-60px) translateZ(-100px) rotateX(14deg) rotateY(-6deg) rotateZ(8deg)" }}
          >
            {cols.map((colCases, colIdx) => (
              <div
                key={colIdx}
                className="flex-shrink-0 overflow-hidden"
                style={{ width: "224px", height: "440px" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget.querySelector(".marquee-col-inner") as HTMLElement;
                  if (el) el.style.animationPlayState = "paused";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget.querySelector(".marquee-col-inner") as HTMLElement;
                  if (el) el.style.animationPlayState = "running";
                }}
              >
                <div
                  className="marquee-col-inner flex flex-col gap-3 p-2"
                  style={{
                    animation: `scrollY ${colIdx % 2 === 0 ? 30 : 38}s linear infinite ${colIdx % 2 === 1 ? "reverse" : ""}`,
                  }}
                >
                  {[...colCases, ...colCases].map((c, i) => (
                    <MarqueeCard
                      key={`col${colIdx}-${i}`}
                      c={c}
                      onClick={() => onCardClick(c)}
                      dimmed={isDimmed(c)}
                      highlighted={isHighlighted(c)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{ background: `linear-gradient(180deg, ${gradFade} 0%, transparent 100%)` }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{ background: `linear-gradient(0deg, ${gradFade} 0%, transparent 100%)` }}
        />
      </div>
    );
  }

  const half = Math.ceil(entries.length / 2);
  const rowA = entries.slice(0, half);
  const rowB = entries.slice(half);

  return (
    <div className="relative py-6" style={{ overflow: "visible" }}>
      <style>{`
        @keyframes scrollX { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
      <div
        className="overflow-hidden py-3"
        style={{ paddingBottom: "12px", marginBottom: "4px" }}
        onMouseEnter={(e) => {
          const el = e.currentTarget.querySelector(".track-a") as HTMLElement;
          if (el) el.style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget.querySelector(".track-a") as HTMLElement;
          if (el) el.style.animationPlayState = "running";
        }}
      >
        <div
          className="track-a flex gap-3"
          style={{ width: "max-content", animation: "scrollX 130s linear infinite" }}
        >
          {[...rowA, ...rowA].map((c, i) => (
            <MarqueeCard
              key={`a-${i}`}
              c={c}
              onClick={() => onCardClick(c)}
              dimmed={isDimmed(c)}
              highlighted={isHighlighted(c)}
            />
          ))}
        </div>
      </div>
      <div
        className="overflow-hidden py-3"
        onMouseEnter={(e) => {
          const el = e.currentTarget.querySelector(".track-b") as HTMLElement;
          if (el) el.style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget.querySelector(".track-b") as HTMLElement;
          if (el) el.style.animationPlayState = "running";
        }}
      >
        <div
          className="track-b flex gap-3"
          style={{ width: "max-content", animation: "scrollX 155s linear infinite reverse" }}
        >
          {[...rowB, ...rowB].map((c, i) => (
            <MarqueeCard
              key={`b-${i}`}
              c={c}
              onClick={() => onCardClick(c)}
              dimmed={isDimmed(c)}
              highlighted={isHighlighted(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
