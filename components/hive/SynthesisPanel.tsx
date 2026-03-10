"use client";

import type { Synthesis } from "@/lib/hive/search";

type SynthesisPanelProps = {
  synthesis: Synthesis;
  onGenerateBrief?: () => void;
};

export function SynthesisPanel({ synthesis, onGenerateBrief }: SynthesisPanelProps) {
  return (
    <div
      className="mb-5 rounded-2xl border p-5"
      style={{
        borderColor: "var(--accent)",
        background: "linear-gradient(to bottom right, var(--accent-bg), transparent)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--accent)" }}
          >
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent-text)" }}>
            Cross-case analysis
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {synthesis.count} case {synthesis.count === 1 ? "study" : "studies"}
          </span>
        </div>
        <span className="hidden italic sm:block text-xs" style={{ color: "var(--text-muted)" }}>
          Indicative — review sources directly
        </span>
      </div>
      <p className="mb-4 text-sm font-medium leading-relaxed" style={{ color: "var(--text-primary)" }}>
        {synthesis.insightSentence}
      </p>
      <div className="mb-3 grid grid-cols-2 gap-3">
        {synthesis.allCause && synthesis.allCause.length > 0 && (
          <div>
            <span className="mb-1.5 block text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Climate drivers
            </span>
            <div className="flex flex-wrap gap-1">
              {synthesis.allCause.map((h) => (
                <span
                  key={h}
                  className="flex items-center gap-1 rounded border px-1.5 py-0.5 text-xs font-medium"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}
        {synthesis.commonMeasures && synthesis.commonMeasures.length > 0 && (
          <div>
            <span className="mb-1.5 block text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Common measures
            </span>
            <div className="flex flex-wrap gap-1">
              {synthesis.commonMeasures.slice(0, 3).map((m) => (
                <span
                  key={m}
                  className="rounded border px-1.5 py-0.5 text-xs"
                  style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text-secondary)" }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {synthesis.sectors.map((s) => (
          <span
            key={s}
            className="rounded-full border px-2.5 py-1 text-xs font-medium"
            style={{
              background: "var(--surface)",
              borderColor: "var(--accent)",
              color: "var(--accent-text)",
            }}
          >
            {s}
          </span>
        ))}
        <span className="ml-1 text-xs" style={{ color: "var(--text-muted)" }}>
          {synthesis.highTransferCount} of {synthesis.count} with high UK transferability
        </span>
      </div>
      {onGenerateBrief && (
        <button
          type="button"
          onClick={onGenerateBrief}
          className="mt-4 rounded-lg border px-4 py-2 text-xs font-semibold transition-colors"
          style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
        >
          Generate structured brief →
        </button>
      )}
    </div>
  );
}
