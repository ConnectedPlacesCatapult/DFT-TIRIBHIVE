"use client";

import { useState, useEffect, useRef } from "react";
import type { CaseStudy } from "@/lib/hive/seed-data";
import { getCaseStudyPdfUrl } from "@/lib/hive/seed-data";
import { trackEvent } from "@/lib/analytics";

interface CaseBodyProps {
  cs: CaseStudy;
}

const CAUSE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  "Heavy rainfall":    { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  "High temperatures": { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  "Storms":            { bg: "#faf5ff", color: "#7e22ce", border: "#e9d5ff" },
  "Sea level rise":    { bg: "#f0fdfa", color: "#0f766e", border: "#99f6e4" },
  "Drought":           { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  "Freeze-thaw":       { bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
};

function HazardBadge({ hazard, type }: { hazard: string; type: "cause" | "effect" }) {
  const s = CAUSE_STYLE[hazard];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: 12,
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: 4,
        background: s?.bg ?? "#f9fafb",
        color: s?.color ?? "#374151",
        border: `1px solid ${s?.border ?? "#e5e7eb"}`,
      }}
    >
      {type === "effect" && <span style={{ opacity: 0.4 }}>→</span>}
      {hazard}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: 10,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#6b7280",
        marginBottom: 10,
        margin: 0,
      }}
    >
      {children}
    </h3>
  );
}

/** Strip numbered footnote markers like (7), (17), (24) left over from PDF extraction */
function cleanText(text: string): string {
  return text
    .replace(/\s*\(\d+\)/g, "")
    .replace(/\s*\[\d+\]/g, "")
    .trim();
}

/** Accordion section — click header to expand/collapse */
function AccordionSection({
  id,
  label,
  text,
  defaultOpen = false,
}: {
  id: string;
  label: string;
  text: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  const cleaned = cleanText(text);
  // Split on bullet points to render as a list when applicable
  const hasBullets = cleaned.includes("•") || cleaned.includes("\n-");
  const bulletItems = hasBullets
    ? cleaned
        .split(/\n?•\s+|\n-\s+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div
      id={id}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        overflow: "hidden",
        scrollMarginTop: 80,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          background: open ? "#f9fafb" : "#fff",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          gap: 12,
          transition: "background 0.15s",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0b0c0c" }}>
          {label}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6b7280"
          strokeWidth={2.5}
          style={{
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          ref={contentRef}
          style={{
            padding: "14px 18px 18px",
            borderTop: "1px solid #f3f4f6",
          }}
        >
          {bulletItems.length > 1 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {bulletItems.map((item, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontSize: 14,
                    color: "#374151",
                    lineHeight: 1.65,
                  }}
                >
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: "#1d70b8",
                      flexShrink: 0,
                      marginTop: 7,
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0, whiteSpace: "pre-line" }}>
              {cleaned}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Fade-in reveal on scroll using IntersectionObserver */
function RevealCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: `opacity 0.35s ease ${delay}ms, transform 0.35s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function CaseBody({ cs }: CaseBodyProps) {
  const pdfUrl = getCaseStudyPdfUrl(cs);
  const sectionsToShow = SECTION_ORDER.filter(([key]) => cs.sections?.[key]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Jump nav — On this page */}
      {sectionsToShow.length > 0 && (
        <RevealCard delay={0}>
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "14px 18px",
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", marginBottom: 10, margin: "0 0 10px" }}>
              On this page
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {sectionsToShow.map(([key, label]) => (
                <a
                  key={key}
                  href={`#section-${key}`}
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#1d70b8",
                    textDecoration: "none",
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "#fff",
                    border: "1px solid #b3d4ef",
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </RevealCard>
      )}

      {/* Key insight */}
      <RevealCard delay={50}>
        <div
          style={{
            background: "#e8f1fb",
            border: "1px solid #b3d4ef",
            borderRadius: 12,
            padding: "16px 18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
            <div style={{ width: 20, height: 20, borderRadius: 5, background: "#1d70b8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#1d70b8" }}>
              Key insight
            </span>
          </div>
          <p style={{ fontSize: 14, color: "#0b0c0c", lineHeight: 1.65, fontWeight: 500, margin: 0 }}>
            {cs.insight}
          </p>
        </div>
      </RevealCard>

      {/* View original PDF — prominent button */}
      {pdfUrl && (
        <RevealCard delay={80}>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("pdf_viewed", { case_id: cs.id })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              textDecoration: "none",
              padding: "9px 16px",
              borderRadius: 8,
              background: "#fff",
              border: "1px solid #d1d5db",
              width: "fit-content",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#1d70b8")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View original PDF
          </a>
        </RevealCard>
      )}

      {/* Summary */}
      <RevealCard delay={100}>
        <div style={{ background: "#f9fafb", borderRadius: 12, padding: "16px 18px" }}>
          <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>{cs.summary}</p>
        </div>
      </RevealCard>

      {/* Hazards grid */}
      <RevealCard delay={120}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <SectionLabel>Climate drivers</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {cs.hazards.cause.map((h) => <HazardBadge key={h} hazard={h} type="cause" />)}
            </div>
          </div>
          <div>
            <SectionLabel>Impacts</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {cs.hazards.effect.map((h) => <HazardBadge key={h} hazard={h} type="effect" />)}
            </div>
          </div>
        </div>
      </RevealCard>

      {/* Measures */}
      <RevealCard delay={140}>
        <div>
          <SectionLabel>Adaptation measures</SectionLabel>
          <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 0", display: "flex", flexDirection: "column", gap: 8 }}>
            {cs.measures.map((m) => (
              <li key={m} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: "#374151", lineHeight: 1.5 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1d70b8", flexShrink: 0, marginTop: 6 }} />
                {m}
              </li>
            ))}
          </ul>
        </div>
      </RevealCard>

      {/* Assets */}
      {cs.assets.length > 0 && (
        <RevealCard delay={150}>
          <div>
            <SectionLabel>Assets affected</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {cs.assets.map((a) => (
                <span key={a} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 4, background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }}>
                  {a}
                </span>
              ))}
            </div>
          </div>
        </RevealCard>
      )}

      {/* Investment + timeline */}
      <RevealCard delay={160}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <SectionLabel>Investment</SectionLabel>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0b0c0c", margin: "6px 0 3px" }}>{cs.cost}</p>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>Band: {cs.costBand}</p>
          </div>
          <div style={{ background: "#f9fafb", borderRadius: 10, padding: "14px 16px", border: "1px solid #f3f4f6" }}>
            <SectionLabel>Delivery period</SectionLabel>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#0b0c0c", margin: "6px 0 0" }}>{cs.year}</p>
          </div>
        </div>
      </RevealCard>

      {/* Accordion sections from document_chunks */}
      {sectionsToShow.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #e5e7eb", paddingTop: 20, marginTop: 4 }}>
          {sectionsToShow.map(([key, label], i) => (
            <RevealCard key={key} delay={160 + i * 30}>
              <AccordionSection
                id={`section-${key}`}
                label={label}
                text={cs.sections![key]}
                defaultOpen={i === 0}
              />
            </RevealCard>
          ))}
        </div>
      )}

      {/* Reference */}
      <p style={{ fontSize: 11, color: "#9ca3af", borderTop: "1px solid #f3f4f6", paddingTop: 12, margin: "4px 0 0" }}>
        Ref: {cs.id} · {cs.organisation} · Curated &amp; verified by HIVE
      </p>
    </div>
  );
}

const SECTION_ORDER: [string, string][] = [
  ["challenge", "The Challenge"],
  ["adaptation_measures", "Adaptation Measures"],
  ["applicability", "Applicability"],
  ["financials", "Financials"],
  ["resourcing", "Resourcing"],
  ["co_benefits", "Co-benefits"],
  ["evaluation", "Evaluation"],
  ["challenges", "Challenges"],
  ["lessons_learned", "Lessons Learned"],
  ["innovation_opportunities", "Innovation Opportunities"],
];
