"use client";

import Link from "next/link";
import { useChatContext } from "@/components/handbook/shared/ChatContext";
import { CASE_STUDIES } from "@/lib/hive/seed-data";

export function BriefTray() {
  const { briefIds, removeFromBrief, clearBrief, theme } = useChatContext();
  const T = theme;

  if (!briefIds || briefIds.length === 0) return null;

  const briefCases = CASE_STUDIES.filter((cs) => briefIds.includes(cs.id));
  const idsParam = briefCases.map((cs) => cs.id).join(",");

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 35,
        background: "#0b0c0c",
        borderRadius: 12,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
        maxWidth: "calc(100vw - 40px)",
        flexWrap: "wrap",
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            background: T.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>
          {briefCases.length} case{briefCases.length !== 1 ? "s" : ""} collected
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {briefCases.slice(0, 6).map((cs) => (
          <span
            key={cs.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.12)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.15)",
              maxWidth: 180,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={cs.title}
          >
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{cs.id}</span>
            <button
              type="button"
              onClick={() => removeFromBrief(cs.id)}
              aria-label={`Remove ${cs.title} from brief`}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
                fontSize: 14,
              }}
            >
              ×
            </button>
          </span>
        ))}
        {briefCases.length > 6 && (
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
            +{briefCases.length - 6} more
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
        <Link
          href={`/handbook/brief?from=tray&ids=${encodeURIComponent(idsParam)}`}
          style={{
            fontSize: 12,
            fontWeight: 800,
            padding: "6px 12px",
            borderRadius: 8,
            background: "#006853",
            color: "#fff",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          Build brief →
        </Link>
        <button
          type="button"
          onClick={clearBrief}
          aria-label="Clear brief"
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.6)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textDecoration: "underline",
            textUnderlineOffset: 2,
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

