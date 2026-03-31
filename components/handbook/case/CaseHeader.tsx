"use client";

import Link from "next/link";
import type { CaseStudy } from "@/lib/hive/seed-data";

interface CaseHeaderProps {
  cs: CaseStudy;
  inBrief: boolean;
  pdfUrl?: string | null;
  onAddToBrief: () => void;
  onAskAboutCase: () => void;
  hideBrief?: boolean;
}

const SECTOR_STYLE: Record<string, { color: string }> = {
  Rail:                 { color: "#1d4ed8" },
  Aviation:             { color: "#0369a1" },
  Maritime:             { color: "#0f766e" },
  Highways:             { color: "#b45309" },
  "Critical Infrastructure": { color: "#7e22ce" },
  Energy:               { color: "#7e22ce" },
  Multiple:             { color: "#374151" },
};

export function CaseHeader({ cs, inBrief, pdfUrl, onAddToBrief, onAskAboutCase, hideBrief = false }: CaseHeaderProps) {
  const accentColor = SECTOR_STYLE[cs.sector]?.color ?? "#1d70b8";
  const transferabilityLabel =
    cs.transferability === "High"
      ? "High"
      : cs.transferability === "Medium"
        ? "Medium"
        : cs.transferability === "Low"
          ? "Low"
          : cs.transferability || "—";
  const transferabilityNoteShort = (cs.transferabilityNote || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[•\-\u2022]+\s*/, "")
    .split(/(?<=[.!?])\s+/)[0]
    ?.slice(0, 160);

  return (
    <div
      style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "24px 24px 20px",
      }}
    >
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
          <Link
            href="/handbook"
            style={{
              fontSize: 12,
              color: "#6b7280",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg
              width="12"
              height="12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Case studies
          </Link>
          <span style={{ fontSize: 11, color: "#d1d5db" }}>›</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{cs.id}</span>
        </div>

        {/* Meta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              color: accentColor,
            }}
          >
            {cs.sector}
          </span>
          <span style={{ color: "#d1d5db", fontSize: 11 }}>·</span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>{cs.location}</span>
          <span style={{ color: "#d1d5db", fontSize: 11 }}>·</span>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>{cs.year}</span>
          <span style={{ color: "#d1d5db", fontSize: 11 }}>·</span>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            {cs.organisation}
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: "#0b0c0c",
            fontFamily: "var(--hive-font-display)",
            margin: "0 0 6px",
            lineHeight: 1.2,
          }}
        >
          {cs.title}
        </h1>
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: accentColor,
            margin: "0 0 16px",
          }}
        >
          {cs.hook}
        </p>

        {/* Hero: primary actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          {!hideBrief && (
          <button
            onClick={onAddToBrief}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 8,
              border: `1.5px solid ${inBrief ? "#1d70b8" : "#d1d5db"}`,
              background: inBrief ? "#1d70b8" : "#fff",
              color: inBrief ? "#fff" : "#374151",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {inBrief ? "✓ In Build Brief" : "+ Add to Build Brief"}
          </button>
          )}
          <button
            onClick={onAskAboutCase}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 18px",
              borderRadius: 8,
              border: "none",
              background: "#1d70b8",
              color: "#fff",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg
              width="13"
              height="13"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            Ask about this case
          </button>

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                fontWeight: 600,
                padding: "8px 14px",
                borderRadius: 8,
                border: "1.5px solid #d1d5db",
                background: "#fff",
                color: "#374151",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                textDecoration: "none",
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
          )}
        </div>

        {/* Hero: key insight */}
        <div
          style={{
            background: "#e8f1fb",
            border: "1px solid #b3d4ef",
            borderRadius: 12,
            padding: "14px 16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: "#1d70b8", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="9" height="9" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "#1d70b8" }}>
              Key insight
            </span>
          </div>
          <p style={{ fontSize: 14, color: "#0b0c0c", lineHeight: 1.65, fontWeight: 500, margin: 0 }}>
            {cs.insight}
          </p>

          <div
            style={{
              marginTop: 10,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11,
                fontWeight: 700,
                color: "#0b0c0c",
                padding: "4px 10px",
                borderRadius: 9999,
                background: "#fff",
                border: "1px solid #b3d4ef",
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: cs.transferability === "High" ? "#10b981" : cs.transferability === "Medium" ? "#f59e0b" : "#ef4444" }} />
              Transferability to UK: {transferabilityLabel}
            </span>

            {transferabilityNoteShort && transferabilityNoteShort !== "—" && (
              <span style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>
                {transferabilityNoteShort}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
