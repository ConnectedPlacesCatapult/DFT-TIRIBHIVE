"use client";

import type { CaseStudy } from "@/lib/hive/seed-data";

type CaseStudyDetailProps = {
  cs: CaseStudy;
  onClose: () => void;
  onAddToBrief: (cs: CaseStudy) => void;
  inBrief: boolean;
};

export function CaseStudyDetail({ cs, onClose, onAddToBrief, inBrief }: CaseStudyDetailProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-labelledby="case-detail-title"
    >
      <div
        className="hive-modal w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{ background: "var(--surface)", color: "var(--text-primary)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 flex items-start justify-between border-b px-6 py-4 backdrop-blur rounded-t-3xl"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="min-w-0 flex-1 pr-4">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                {cs.sector}
              </span>
              <span style={{ color: "var(--text-muted)" }}>·</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {cs.location}
              </span>
            </div>
            <h2 id="case-detail-title" className="text-xl font-normal leading-tight" style={{ fontFamily: "'DM Serif Display', serif", color: "var(--text-primary)" }}>
              {cs.title}
            </h2>
            <p className="mt-1 text-sm font-semibold" style={{ color: "var(--accent)" }}>
              {cs.hook}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors"
            style={{ background: "var(--surface-alt)" }}
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-5 p-6">
          <div
            className="rounded-2xl border p-4"
            style={{ background: "var(--accent-bg)", borderColor: "var(--accent)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--accent)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                Key insight
              </span>
            </div>
            <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {cs.insight}
            </p>
          </div>
          <div className="rounded-2xl p-4" style={{ background: "var(--surface-alt)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {cs.summary}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Climate drivers
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {cs.hazards.cause.map((h) => (
                  <span
                    key={h}
                    className="flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                    {h}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Impacts
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {cs.hazards.effect.map((h) => (
                  <span
                    key={h}
                    className="flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium"
                    style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                  >
                    <span className="opacity-40">→</span> {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Adaptation measures
            </h4>
            <ul className="space-y-1.5">
              {cs.measures.map((m) => (
                <li key={m} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: "var(--accent)" }} />
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3" style={{ background: "var(--surface-alt)", borderColor: "var(--border)" }}>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Investment
              </h4>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {cs.cost}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                Band: {cs.costBand}
              </p>
            </div>
            <div className="rounded-xl border p-3" style={{ background: "var(--surface-alt)", borderColor: "var(--border)" }}>
              <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                Delivery period
              </h4>
              <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {cs.year}
              </p>
            </div>
          </div>
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--accent-bg)", borderColor: "var(--accent)" }}
          >
            <div className="mb-2">
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: cs.transferability === "High" ? "#4ade80" : "#fbbf24" }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: cs.transferability === "High" ? "#4ade80" : "#fbbf24" }}
                />
                {cs.transferability} UK transferability
              </span>
            </div>
            <p className="mb-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {cs.transferabilityNote}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cs.ukApplicability.map((a) => (
                <span
                  key={a}
                  className="rounded-full border px-2 py-0.5 text-xs font-medium"
                  style={{ background: "var(--surface)", borderColor: "var(--accent)", color: "var(--accent-text)" }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
          <p className="border-t pt-1 text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            Ref: {cs.id} · {cs.organisation} · Curated & verified by HIVE
          </p>
          <button
            type="button"
            onClick={() => {
              onAddToBrief(cs);
              onClose();
            }}
            className={`w-full rounded-2xl py-3 text-sm font-semibold transition-all ${
              inBrief ? "border" : ""
            }`}
            style={
              inBrief
                ? { background: "var(--surface-alt)", color: "var(--text-muted)", borderColor: "var(--border)" }
                : { background: "var(--accent)", color: "#fff" }
            }
          >
            {inBrief ? "✓ Already in your AI brief" : "＋ Add to AI brief"}
          </button>
        </div>
      </div>
    </div>
  );
}
