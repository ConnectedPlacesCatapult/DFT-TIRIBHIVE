"use client";

import { useState } from "react";
import { useChatContext } from "./ChatContext";

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = "applied" | "done" | "quick-win" | "discussing" | "deferred" | "in-progress";

type ToggleValue = "current" | "proposed";

interface ToggleRowProps {
  label: string;
  current: string;
  proposed: string;
  value: ToggleValue;
  onChange: (v: ToggleValue) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<Status, { bg: string; color: string; label: string }> = {
  applied:      { bg: "#dcfce7", color: "#166534", label: "Applied ✓" },
  done:         { bg: "#dcfce7", color: "#166534", label: "Done ✓" },
  "quick-win":  { bg: "#fef3c7", color: "#92400e", label: "Quick win" },
  discussing:   { bg: "#dbeafe", color: "#1e40af", label: "Discussing" },
  deferred:     { bg: "#f3f4f6", color: "#374151", label: "Deferred" },
  "in-progress":{ bg: "#ccfbf1", color: "#115e59", label: "In progress" },
};

function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        padding: "2px 8px",
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

function ToggleRow({ label, current, proposed, value, onChange }: ToggleRowProps) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
        <div style={{ display: "flex", gap: 3 }}>
          {(["current", "proposed"] as ToggleValue[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              style={{
                fontSize: 10,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 4,
                border: "none",
                cursor: "pointer",
                background: value === v ? "#1d70b8" : "#e5e7eb",
                color: value === v ? "#fff" : "#6b7280",
                transition: "all 0.15s",
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <p
        style={{
          fontSize: 11,
          color: "#374151",
          lineHeight: 1.5,
          margin: 0,
          padding: "6px 8px",
          borderRadius: 6,
          background: value === "proposed" ? "#eff6ff" : "#f9fafb",
          borderLeft: `3px solid ${value === "proposed" ? "#1d70b8" : "#d1d5db"}`,
          fontStyle: value === "proposed" ? "italic" : "normal",
          transition: "all 0.2s",
        }}
      >
        {value === "current" ? current : proposed}
      </p>
    </div>
  );
}

function NotesBlock({ notes }: { notes: string | string[] }) {
  const lines = Array.isArray(notes) ? notes : [notes];
  return (
    <div
      style={{
        marginTop: 8,
        padding: "10px 12px",
        borderRadius: 6,
        background: "#f9fafb",
        borderLeft: "3px solid #d1d5db",
      }}
    >
      {lines.map((line, i) => (
        <p key={i} style={{ fontSize: 11, color: "#4b5563", lineHeight: 1.6, margin: i > 0 ? "4px 0 0" : 0 }}>
          {line}
        </p>
      ))}
    </div>
  );
}

interface ItemCardProps {
  num: number;
  title: string;
  status: Status;
  notes: string | string[];
  children?: React.ReactNode;
}

function ItemCard({ num, title, status, notes, children }: ItemCardProps) {
  const [notesOpen, setNotesOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px solid #f3f4f6",
        paddingBottom: 14,
        paddingTop: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
        <span
          style={{
            flexShrink: 0,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "#e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            color: "#374151",
          }}
        >
          {num}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "#111827", margin: "0 0 4px", lineHeight: 1.3 }}>
            {title}
          </p>
          <StatusBadge status={status} />
        </div>
      </div>

      {children}

      <button
        type="button"
        onClick={() => setNotesOpen((o) => !o)}
        style={{
          marginTop: 8,
          fontSize: 11,
          fontWeight: 600,
          color: "#6b7280",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        Notes
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          style={{ transform: notesOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {notesOpen && <NotesBlock notes={notes} />}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function FeedbackReviewPanel() {
  const { setReviewMode, reviewOverrides, setReviewOverride } = useChatContext();

  const handleToggleAll = () => {
    setReviewOverride("titleCopy", "proposed");
    setReviewOverride("subtitleCopy", "proposed");
  };

  const handleResetAll = () => {
    setReviewOverride("titleCopy", "current");
    setReviewOverride("subtitleCopy", "current");
    setReviewMode(false);
  };

  return (
    <div
      role="complementary"
      aria-label="Feedback review panel"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 320,
        height: "100vh",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        borderLeft: "1px solid #e5e7eb",
        boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 16px 10px",
          borderBottom: "1px solid #e5e7eb",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#111827", margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              HIVE — Feedback Review
            </p>
            <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>
              Meeting walkthrough · 24 Mar 2026
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReviewMode(false)}
            aria-label="Close review panel"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              padding: 2,
              lineHeight: 1,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Global controls */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={handleToggleAll}
            style={{
              flex: 1,
              fontSize: 10,
              fontWeight: 700,
              padding: "5px 8px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              background: "#1d70b8",
              color: "#fff",
            }}
          >
            Toggle all proposed ↕
          </button>
          <button
            type="button"
            onClick={handleResetAll}
            style={{
              flex: 1,
              fontSize: 10,
              fontWeight: 700,
              padding: "5px 8px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              cursor: "pointer",
              background: "#f9fafb",
              color: "#374151",
            }}
          >
            Reset all ×
          </button>
        </div>
      </div>

      {/* Items — scrollable */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>

        <ItemCard
          num={0}
          title="Flooding filter chip"
          status="applied"
          notes="Confirmed bug — filter pill arrays were missing 'Flooding' despite the heatmap/options data including it. Fixed in HAZARDS_CAUSE (handbook page), HAZARD_OPTIONS (FilterRow), and both hazard arrays on /hive. Colour token added (blue, distinct from Heavy Rainfall)."
        />

        <ItemCard
          num={1}
          title="Homepage title & search copy"
          status="discussing"
          notes={[
            "Heather/Olivia suggestion: 'What climate hazards are you managing?' and 'Describe your transport infrastructure weather challenges...'",
            "Question to confirm: is 'weather challenges' the right framing vs 'climate risks'? Both are valid — weather challenges is more operational, climate risks more strategic.",
            "Toggle the heading and subtitle below while on the live page to show both options.",
          ]}
        >
          <ToggleRow
            label="Heading"
            current="What risk are you managing?"
            proposed="What climate hazards are you managing?"
            value={reviewOverrides.titleCopy}
            onChange={(v) => setReviewOverride("titleCopy", v)}
          />
          <ToggleRow
            label="Subtitle"
            current="Search by infrastructure challenge to find proven adaptations, comparable cases, and evidence."
            proposed="Describe your transport infrastructure weather challenges to find proven adaptations, comparable cases, and evidence."
            value={reviewOverrides.subtitleCopy}
            onChange={(v) => setReviewOverride("subtitleCopy", v)}
          />
        </ItemCard>

        <ItemCard
          num={2}
          title="View original PDF position"
          status="applied"
          notes="Previously at the bottom of case study detail after all sections. Moved to immediately below the key insight callout, above the summary. One-line change in CaseBody.tsx."
        />

        <ItemCard
          num={3}
          title="Case study content structure"
          status="discussing"
          notes={[
            "Client wants: 'The Challenge' and 'Adaptation Measures' content pulled to the top of case summaries, then top-level bullets on Applicability, Financials, and Co-benefits.",
            "Current: Key insight → Summary → Hazards → Measures → structured sections in SECTION_ORDER.",
            "Medium effort — needs fallback for cases without document_chunks (older case studies without ingested PDFs still show cs.summary + cs.measures).",
            "Recommend: agree exact structure before building. Defer to post-meeting confirmation.",
          ]}
        />

        <ItemCard
          num={4}
          title="Build Brief placement"
          status="discussing"
          notes={[
            "Heather and Olivia have split opinions: should Build Brief summary be the homepage default with the full case library as a tab, or current approach (case library first)?",
            "Our recommendation: keep current architecture — users need to find relevant cases before a brief makes sense. Instead, make the synthesis panel more prominent on the homepage when results are present.",
            "No rebuild needed at this stage. Revisit after user testing data.",
          ]}
        />

        <ItemCard
          num={5}
          title="Background visuals / particles"
          status="applied"
          notes={[
            "Particles: agreed not to use. Default background effect changed from 'hero' (cycling images) to 'none' — clean white on first load.",
            "Both particles and hero images remain accessible in the demo options menu for presentation use.",
            "Side-image layout: deferred until client provides approved Shutterstock images. Images from case studies require Mott permissions check — may take too long.",
          ]}
        />

        <ItemCard
          num={6}
          title="Options table (adaptation options library)"
          status="done"
          notes="Already implemented as Heather described — users with minimal climate risk knowledge get a bigger-picture view of risks and potential adaptations. Heatmap panel + expandable OptionRow accordion at /handbook/options. No action needed beyond confirming Supabase hive.options data is complete."
        />

        <ItemCard
          num={7}
          title="New document sources (13 links)"
          status="in-progress"
          notes={[
            "13 URLs provided by Heather. Ingestion pipeline exists at scripts/ingest-hive-pdfs.ts.",
            "Prioritise (open access): GOV.UK climate adaptation strategy, Met Office portal, DARe, HS2 Learning Legacy, CIHT resilience page.",
            "Verify PIARC access before ingesting — several links are order/catalogue pages that may require registration or purchase.",
            "This is a data task, not a UI task. No UI changes needed.",
          ]}
        />

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
