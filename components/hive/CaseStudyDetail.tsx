"use client";

import { useEffect, useState } from "react";
import type { CaseStudy } from "@/lib/hive/seed-data";
import { getCaseStudyPdfUrl } from "@/lib/hive/seed-data";
import type { ArticleCardRow } from "@/lib/handbook/article-cards";

type CaseStudyDetailProps = {
  cs: CaseStudy;
  onClose: () => void;
  onAddToBrief: (cs: CaseStudy) => void;
  inBrief: boolean;
};

// ---------------------------------------------------------------------------
// Transferability badge colours (matches gold standard HTML)
// ---------------------------------------------------------------------------

const TRANSFER_STYLES: Record<string, { bg: string; color: string }> = {
  high:   { bg: "#E1F5EE", color: "#085041" },
  medium: { bg: "#FAEEDA", color: "#633806" },
  low:    { bg: "#FCEBEB", color: "#791F1F" },
};

const EVIDENCE_STYLES: Record<string, { bg: string; color: string }> = {
  strong:   { bg: "#E6F1FB", color: "#0C447C" },
  moderate: { bg: "#FAEEDA", color: "#633806" },
  limited:  { bg: "#F1EFE8", color: "#444441" },
};

// ---------------------------------------------------------------------------
// Rich card body — rendered when article_card data is available
// ---------------------------------------------------------------------------

function RichCardBody({ card, cs, onClose, onAddToBrief, inBrief }: {
  card: ArticleCardRow;
  cs: CaseStudy;
  onClose: () => void;
  onAddToBrief: (cs: CaseStudy) => void;
  inBrief: boolean;
}) {
  const ts = TRANSFER_STYLES[card.uk_transferability ?? "medium"];
  const ev = EVIDENCE_STYLES[card.evidence_quality ?? "limited"];
  const pdfUrl = getCaseStudyPdfUrl(cs);

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 4, background: "#FAEEDA", color: "#633806" }}>
            {card.transport_sector ?? cs.sector}
          </span>
          <span style={{ fontSize: 12, color: "#888" }}>
            {card.organisation ?? cs.organisation} · {card.trib_article_id} · {card.year_range ?? cs.year}
          </span>
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 500, marginBottom: 4, color: "#1a1a1a" }}>
          {card.project_title ?? cs.title}
        </h2>
        {card.subtitle_stats && (
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{card.subtitle_stats}</p>
        )}
      </div>

      {/* Key metrics 2x2 grid */}
      {card.key_metrics && card.key_metrics.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "16px 0" }}>
          {card.key_metrics.map((m, i) => (
            <div key={i} style={{ background: "#f7f5f0", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 20, fontWeight: 500, color: "#1a1a1a", lineHeight: 1.2 }}>{m.value}</div>
              <div style={{ fontSize: 12, color: "#666", marginTop: 2, lineHeight: 1.4 }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Key insight */}
      {card.key_insight && (
        <div style={{ background: "#E1F5EE", borderRadius: 8, padding: "12px 16px", borderLeft: "3px solid #1D9E75", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#0F6E56", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Key insight</div>
          <p style={{ fontSize: 14, color: "#085041", lineHeight: 1.6, margin: 0 }}>{card.key_insight}</p>
        </div>
      )}

      {pdfUrl && (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#1D9E75", textDecoration: "none", fontWeight: 500, marginBottom: 16 }}
        >
          ↗ View full case study
        </a>
      )}
      <div style={{ marginBottom: 16 }}>
        <LinkButton href="/handbook/guidance" label="Browse additional guidance →" />
      </div>

      <hr style={{ border: "none", borderTop: "0.5px solid rgba(0,0,0,0.1)", margin: "16px 0" }} />

      {/* Main applications */}
      {card.main_applications && card.main_applications.length > 0 && (
        <>
          <SectionLabel>Main applications</SectionLabel>
          <BulletList items={card.main_applications} />
          <hr style={{ border: "none", borderTop: "0.5px solid rgba(0,0,0,0.1)", margin: "16px 0" }} />
        </>
      )}

      {/* Key takeaways */}
      {card.key_takeaways && card.key_takeaways.length > 0 && (
        <>
          <SectionLabel>Key takeaways</SectionLabel>
          <BulletList items={card.key_takeaways} />
          <hr style={{ border: "none", borderTop: "0.5px solid rgba(0,0,0,0.1)", margin: "16px 0" }} />
        </>
      )}

      {/* Co-benefits 2x2 grid */}
      {card.co_benefits_summary && (
        <>
          <SectionLabel>Co-benefits</SectionLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {(["community", "environmental", "economic", "carbon"] as const).map((key) => {
              const val = card.co_benefits_summary?.[key];
              if (!val) return null;
              return (
                <div key={key} style={{ background: "#f7f5f0", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#666", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {key}
                  </div>
                  <div style={{ fontSize: 12, color: "#1a1a1a", lineHeight: 1.5 }}>{val}</div>
                </div>
              );
            })}
          </div>
          <hr style={{ border: "none", borderTop: "0.5px solid rgba(0,0,0,0.1)", margin: "16px 0" }} />
        </>
      )}

      {/* Transferability */}
      <SectionLabel>Transferability</SectionLabel>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 4, background: ts.bg, color: ts.color }}>
          {capitalize(card.uk_transferability ?? "medium")} UK transferability
        </span>
        <span style={{ fontSize: 12, color: "#666" }}>
          {capitalize(card.evidence_quality ?? "limited")} evidence
        </span>
      </div>
      {card.transferability_rationale && (
        <p style={{ fontSize: 13, color: "#1a1a1a", lineHeight: 1.6, marginBottom: 8 }}>{card.transferability_rationale}</p>
      )}
      {card.transferability_contexts && card.transferability_contexts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {card.transferability_contexts.map((ctx) => (
            <span key={ctx} style={{ display: "inline-block", fontSize: 11, padding: "3px 8px", borderRadius: 10, border: "0.5px solid rgba(0,0,0,0.2)", color: "#555", margin: 2 }}>
              {ctx}
            </span>
          ))}
        </div>
      )}

      <hr style={{ border: "none", borderTop: "0.5px solid rgba(0,0,0,0.1)", margin: "16px 0" }} />

      {/* Costs & funding */}
      {(card.investment_detail || card.investment_band) && (
        <>
          <SectionLabel>Costs & funding</SectionLabel>
          {card.investment_detail && (
            <p style={{ fontSize: 13, color: "#1a1a1a", lineHeight: 1.6, marginBottom: 8 }}>{card.investment_detail}</p>
          )}
          {card.funding_sources && card.funding_sources.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {card.funding_sources.map((f) => (
                <span key={f} style={{ display: "inline-block", fontSize: 11, padding: "3px 8px", background: "#f7f5f0", borderRadius: 10, color: "#555", margin: 2, border: "0.5px solid rgba(0,0,0,0.1)" }}>
                  {f}
                </span>
              ))}
            </div>
          )}
          <hr style={{ border: "none", borderTop: "0.5px solid rgba(0,0,0,0.1)", margin: "16px 0" }} />
        </>
      )}

      {/* Implementation notes */}
      {card.implementation_notes && (
        <>
          <SectionLabel>Implementation notes</SectionLabel>
          <p style={{ fontSize: 13, color: "#1a1a1a", lineHeight: 1.65, marginBottom: 16 }}>{card.implementation_notes}</p>
        </>
      )}

      {/* Challenges */}
      {card.challenges && card.challenges.length > 0 && (
        <>
          <SectionLabel>Implementation challenges</SectionLabel>
          <BulletList items={card.challenges} />
        </>
      )}

      {/* Lessons learned */}
      {card.lessons_learned && card.lessons_learned.length > 0 && (
        <>
          <SectionLabel>Lessons learned</SectionLabel>
          <BulletList items={card.lessons_learned} />
        </>
      )}

      {/* Innovation opportunity */}
      {card.innovation_opportunity && (
        <>
          <SectionLabel>Innovation opportunity</SectionLabel>
          <p style={{ fontSize: 13, color: "#1a1a1a", lineHeight: 1.65, marginBottom: 16 }}>{card.innovation_opportunity}</p>
        </>
      )}

      {/* Action row */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "0.5px solid rgba(0,0,0,0.1)", flexWrap: "wrap" }}>
        <button
          onClick={() => { onAddToBrief(cs); onClose(); }}
          style={{ background: inBrief ? "transparent" : "#1D9E75", color: inBrief ? "#1a1a1a" : "white", border: inBrief ? "0.5px solid rgba(0,0,0,0.25)" : "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >
          {inBrief ? "✓ In Build Brief" : "+ Add to Build Brief"}
        </button>
      </div>

      {/* Footer */}
      <p style={{ fontSize: 11, color: "#aaa", marginTop: 12 }}>
        Ref: {card.trib_article_id} · {card.project_title ?? cs.title} · Curated & verified by HIVE · Evidence quality: {card.evidence_quality ?? "—"} · Generated from document_chunks
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Fallback body — when no card is available, render from CaseStudy seed data
// ---------------------------------------------------------------------------

function FallbackBody({ cs, onClose, onAddToBrief, inBrief }: {
  cs: CaseStudy;
  onClose: () => void;
  onAddToBrief: (cs: CaseStudy) => void;
  inBrief: boolean;
}) {
  return (
    <>
      <div style={{ background: "#E1F5EE", borderRadius: 8, padding: "12px 16px", borderLeft: "3px solid #1D9E75", marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "#0F6E56", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Key insight</div>
        <p style={{ fontSize: 14, color: "#085041", lineHeight: 1.6, margin: 0 }}>{cs.insight}</p>
      </div>

      {getCaseStudyPdfUrl(cs) && (
        <a
          href={getCaseStudyPdfUrl(cs)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#1D9E75", textDecoration: "none", fontWeight: 500, marginBottom: 16 }}
        >
          ↗ View full case study
        </a>
      )}
      <div style={{ marginBottom: 16 }}>
        <LinkButton href="/handbook/guidance" label="Browse additional guidance →" />
      </div>

      <div style={{ background: "#f7f5f0", borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "#444", lineHeight: 1.65, margin: 0 }}>{cs.summary}</p>
      </div>

      {/* Climate drivers / impacts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div>
          <SectionLabel>Climate drivers</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {cs.hazards.cause.map((h) => (
              <span key={h} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, border: "0.5px solid rgba(0,0,0,0.15)", color: "#555" }}>{h}</span>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel>Impacts</SectionLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {cs.hazards.effect.map((h) => (
              <span key={h} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, border: "0.5px solid rgba(0,0,0,0.15)", color: "#555" }}>→ {h}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Measures */}
      <SectionLabel>Adaptation measures</SectionLabel>
      <BulletList items={cs.measures} />

      {/* Cost / period */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "#f7f5f0", borderRadius: 8, padding: "10px 12px", border: "0.5px solid rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Investment</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{cs.cost}</div>
          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Band: {cs.costBand}</div>
        </div>
        <div style={{ background: "#f7f5f0", borderRadius: 8, padding: "10px 12px", border: "0.5px solid rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Delivery period</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a1a" }}>{cs.year}</div>
        </div>
      </div>

      {/* Transferability */}
      <div style={{ border: "0.5px solid rgba(0,0,0,0.12)", borderRadius: 8, padding: 16, background: "#E1F5EE", marginBottom: 16 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 8px", borderRadius: 4, background: cs.transferability === "High" ? "#E1F5EE" : "#FAEEDA", color: cs.transferability === "High" ? "#085041" : "#633806" }}>
            {cs.transferability} UK transferability
          </span>
        </div>
        <p style={{ fontSize: 13, color: "#444", lineHeight: 1.6, marginBottom: 8 }}>{cs.transferabilityNote}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {cs.ukApplicability.map((a) => (
            <span key={a} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 10, border: "0.5px solid rgba(0,0,0,0.2)", color: "#555" }}>{a}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 16, paddingTop: 16, borderTop: "0.5px solid rgba(0,0,0,0.1)", flexWrap: "wrap" }}>
        <button
          onClick={() => { onAddToBrief(cs); onClose(); }}
          style={{ background: inBrief ? "transparent" : "#1D9E75", color: inBrief ? "#1a1a1a" : "white", border: inBrief ? "0.5px solid rgba(0,0,0,0.25)" : "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
        >
          {inBrief ? "✓ In Build Brief" : "+ Add to Build Brief"}
        </button>
      </div>

      <p style={{ fontSize: 11, color: "#aaa", marginTop: 12 }}>
        Ref: {cs.id} · {cs.organisation} · Curated & verified by HIVE
      </p>
    </>
  );
}

// ---------------------------------------------------------------------------
// Shared atoms
// ---------------------------------------------------------------------------

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: 16, marginBottom: 16 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 13, color: "#1a1a1a", lineHeight: 1.65, marginBottom: 5 }}>{item}</li>
      ))}
    </ul>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: "#1D9E75",
        textDecoration: "none",
        fontWeight: 600,
      }}
    >
      {label}
    </a>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CaseStudyDetail({ cs, onClose, onAddToBrief, inBrief }: CaseStudyDetailProps) {
  const [card, setCard] = useState<ArticleCardRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchCard() {
      try {
        const res = await fetch(`/api/handbook/cards/${encodeURIComponent(cs.id)}`);
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (!cancelled && data.card && !data.card.is_stale) {
          setCard(data.card);
        } else if (!cancelled && (!data.card || data.card.is_stale)) {
          // Trigger background regeneration silently
          fetch("/api/handbook/cards/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ article_ids: [cs.id] }),
          }).catch(() => {});
        }
      } catch {
        // Card unavailable — fallback will render
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCard();
    return () => { cancelled = true; };
  }, [cs.id]);

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-labelledby="case-detail-title"
    >
      <div
        style={{ background: "#ffffff", borderRadius: 12, border: "0.5px solid rgba(0,0,0,0.12)", maxWidth: 720, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#1a1a1a" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: "50%", background: "#f7f5f0", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Close"
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#888" }}>Loading case study...</div>
          </div>
        ) : card ? (
          <RichCardBody card={card} cs={cs} onClose={onClose} onAddToBrief={onAddToBrief} inBrief={inBrief} />
        ) : (
          <FallbackBody cs={cs} onClose={onClose} onAddToBrief={onAddToBrief} inBrief={inBrief} />
        )}
      </div>
    </div>
  );
}
