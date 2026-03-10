"use client";

import type { CaseStudy } from "@/lib/hive/seed-data";

type BriefCollectorProps = {
  open: boolean;
  onClose: () => void;
  pinned: CaseStudy[];
  onRemove: (cs: CaseStudy) => void;
};

export function BriefCollector({ open, onClose, pinned, onRemove }: BriefCollectorProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end bg-black/30 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-labelledby="brief-panel-title"
    >
      <div
        className="flex max-h-[88vh] w-full max-w-md flex-col overflow-y-auto rounded-3xl shadow-2xl"
        style={{ background: "var(--surface)", fontFamily: "'DM Sans', sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 flex items-center justify-between rounded-t-3xl border-b px-6 py-4"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div>
            <div className="mb-0.5 flex items-center gap-2">
              <div
                className="flex h-5 w-5 items-center justify-center rounded-md"
                style={{ background: "var(--accent)" }}
              >
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span id="brief-panel-title" className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                AI Brief
              </span>
              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: "var(--accent-bg)", color: "var(--accent-text)" }}
              >
                {pinned.length} cases
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Cases collected for synthesis
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
            style={{ background: "var(--surface-alt)" }}
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-6">
          {pinned.length === 0 ? (
            <div className="py-12 text-center">
              <div
                className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ background: "var(--surface-alt)" }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--text-muted)" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="mb-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                No cases added yet
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Add cases from search results using "+ Add to brief"
              </p>
            </div>
          ) : (
            <div className="mb-6 space-y-3">
              {pinned.map((cs) => (
                <div
                  key={cs.id}
                  className="flex items-start gap-3 rounded-xl border p-3"
                  style={{ borderColor: "var(--border)", background: "var(--surface-alt)" }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-1.5">
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                        {cs.sector}
                      </span>
                    </div>
                    <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
                      {cs.title}
                    </p>
                    <p className="mt-0.5 text-xs font-medium" style={{ color: "var(--accent)" }}>
                      {cs.hook}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(cs)}
                    className="mt-0.5 flex-shrink-0 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    aria-label={`Remove ${cs.title} from brief`}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {pinned.length >= 2 && (
            <div className="border-t pt-4" style={{ borderColor: "var(--border)" }}>
              <div
                className="mb-4 rounded-2xl border p-4"
                style={{ background: "var(--accent-bg)", borderColor: "var(--accent)" }}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent-text)" }}>
                  Pattern across {pinned.length} cases
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {pinned.filter((c) => c.transferability === "High").length} of {pinned.length} cases have high UK
                  transferability. Common sectors: {[...new Set(pinned.map((c) => c.sector))].join(", ")}. These cases
                  collectively demonstrate that proactive climate adaptation — integrated into planned maintenance —
                  delivers better value than reactive repair.
                </p>
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-white transition-colors"
                style={{ background: "var(--accent)" }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate full AI brief
                <span className="text-xs font-normal opacity-70">— coming in full platform</span>
              </button>
            </div>
          )}

          {pinned.length === 1 && (
            <p className="mt-2 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              Add one more case to enable cross-case analysis
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
