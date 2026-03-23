// @ts-nocheck
"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useUnifiedSearch } from "@/lib/handbook/useUnifiedSearch";
import { useChatContext } from "@/components/handbook/shared/ChatContext";
import { CaseStudyCard } from "@/components/handbook/landing/CaseStudyCard";

// ── Inline markdown renderer (bold + [ID_xx] citation chips) ─────────────────
function SynthesisText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|\bID_[\w]+\b)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^\*\*(.*)\*\*$/.test(part)) {
          return <strong key={i}>{part.replace(/\*\*/g, "")}</strong>;
        }
        if (/^ID_[\w]+$/.test(part)) {
          return (
            <Link
              key={i}
              href={`/handbook/${part}`}
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: 4,
                background: "#e8f1fb",
                color: "#1d70b8",
                border: "1px solid #b3d4ef",
                textDecoration: "none",
                whiteSpace: "nowrap",
                margin: "0 1px",
              }}
            >
              {part} ↗
            </Link>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Skeleton loader for synthesis while fetching ──────────────────────────────
function SynthesisSkeleton() {
  return (
    <div style={{ padding: "16px 0" }}>
      {[90, 75, 55].map((w, i) => (
        <div
          key={i}
          style={{
            height: 14,
            borderRadius: 6,
            background: "linear-gradient(90deg, #f0f4f8 25%, #e2e8f0 50%, #f0f4f8 75%)",
            backgroundSize: "200% 100%",
            animation: "skeleton-shimmer 1.4s ease infinite",
            marginBottom: 10,
            width: `${w}%`,
          }}
        />
      ))}
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HandbookV2Page() {
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [brief, setBrief] = useState<string[]>([]);
  const {
    openChat,
    setSemanticChunks,
    setSessionIntent,
    setResultSet,
    setMessages,
    setThinking,
    setRetrievalMode,
  } = useChatContext();

  const { cases, synthesis, chips, chunks, loading, scenario, retrieval_mode } = useUnifiedSearch(query);

  const hasSynthesis = synthesis.length > 0;
  const hasCases = cases.length > 0;
  const hasResults = hasSynthesis || hasCases;

  // Wire unified search results into ChatContext so the chat panel knows what the grid is showing
  useEffect(() => {
    if (chunks.length > 0) setSemanticChunks(chunks);
    setResultSet(
      cases.slice(0, 12).map((c) => ({ id: c.id, title: c.title, sector: c.sector }))
    );
    if (retrieval_mode) setRetrievalMode(retrieval_mode);
  }, [cases, chunks, retrieval_mode, setSemanticChunks, setResultSet, setRetrievalMode]);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (!trimmed) return;
      setQuery(trimmed);
      setSessionIntent(trimmed);
    },
    [inputValue, setSessionIntent]
  );

  // Open chat with the initial query pre-sent so the conversation starts from context
  const handleFollowUp = useCallback(async () => {
    if (chunks.length > 0) setSemanticChunks(chunks);
    const userMsg = { role: "user" as const, text: query };
    setMessages([userMsg]);
    openChat("browse");
    setThinking(true);
    try {
      const res = await fetch("/api/handbook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", text: query }],
          context: "browse",
          session_intent: query,
          result_set: cases.slice(0, 12).map((c) => ({ id: c.id, title: c.title, sector: c.sector })),
          result_chunks: chunks.length > 0 ? chunks : undefined,
        }),
      });
      const data = await res.json();
      if (data.retrieval_mode) setRetrievalMode(data.retrieval_mode);
      setMessages([
        userMsg,
        {
          role: "ai" as const,
          text: data.message ?? data.text ?? "",
          chips: data.chips,
          gap: data.gap,
          actions: data.actions,
          sources: data.sources,
          retrieval_mode: data.retrieval_mode,
          action: data.action,
          actionDismissed: false,
        },
      ]);
    } catch {
      setMessages([userMsg, { role: "ai" as const, text: "Something went wrong. Please try again." }]);
    } finally {
      setThinking(false);
    }
  }, [query, cases, chunks, setSemanticChunks, setMessages, openChat, setThinking, setRetrievalMode]);

  const toggleBrief = useCallback((id: string) => {
    setBrief((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  return (
    <div
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "48px 24px 80px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Page header ── */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#1d70b8",
              background: "#e8f1fb",
              padding: "3px 8px",
              borderRadius: 4,
              border: "1px solid #b3d4ef",
            }}
          >
            v2 preview
          </span>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>One input · One search · Two views</span>
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#0f172a",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          What risk are you managing?
        </h1>
        <p style={{ fontSize: 15, color: "#64748b", marginTop: 8 }}>
          Describe your infrastructure challenge. HIVE surfaces relevant case studies and explains why they apply — all from one search.
        </p>
      </div>

      {/* ── Search input ── */}
      <form onSubmit={handleSearch} style={{ marginBottom: 0 }}>
        <div style={{ position: "relative" }}>
          <svg
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              width: 18,
              height: 18,
              color: "#94a3b8",
              pointerEvents: "none",
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. flooding on rail corridors, pavement heat resilience, coastal erosion…"
            autoFocus
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 48px 14px 44px",
              fontSize: 16,
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              outline: "none",
              color: "#0f172a",
              fontFamily: "inherit",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#1d70b8")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue("");
                setQuery("");
              }}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#94a3b8",
                padding: 4,
                lineHeight: 1,
              }}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        <button type="submit" style={{ display: "none" }} />
      </form>

      {/* ── Synthesis panel — auto-renders inline, no click required ── */}
      {query && (
        <div
          style={{
            marginTop: 24,
            padding: "20px 24px",
            borderRadius: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          {loading && !hasSynthesis ? (
            <SynthesisSkeleton />
          ) : hasSynthesis ? (
            <>
              {/* Result count header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#1d70b8",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1d70b8" }}>
                    {cases.length} case {cases.length === 1 ? "study" : "studies"} matched
                  </span>
                  {scenario === "A" && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "#059669",
                        background: "#d1fae5",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      Strong match
                    </span>
                  )}
                </div>
                {loading && (
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>Updating…</span>
                )}
              </div>

              {/* AI synthesis text */}
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "#374151",
                  margin: 0,
                  marginBottom: chips.length > 0 ? 12 : 0,
                }}
              >
                <SynthesisText text={synthesis} />
              </p>

              {/* Cited chips */}
              {chips.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 14,
                  }}
                >
                  {chips.map((id) => (
                    <Link
                      key={id}
                      href={`/handbook/${id}`}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 4,
                        background: "#e8f1fb",
                        color: "#1d70b8",
                        border: "1px solid #b3d4ef",
                        textDecoration: "none",
                      }}
                    >
                      {id} ↗
                    </Link>
                  ))}
                </div>
              )}

              {/* Action row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: 12,
                  marginTop: 4,
                }}
              >
                {brief.length > 0 && (
                  <Link
                    href={`/handbook/brief?ids=${brief.join(",")}`}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "6px 14px",
                      borderRadius: 6,
                      background: "#1d70b8",
                      color: "#fff",
                      textDecoration: "none",
                      border: "none",
                    }}
                  >
                    Build brief from {brief.length} case{brief.length === 1 ? "" : "s"} ↗
                  </Link>
                )}
                {chips.length > 0 && brief.length === 0 && (
                  <Link
                    href={`/handbook/brief?ids=${chips.join(",")}`}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "6px 14px",
                      borderRadius: 6,
                      background: "#1d70b8",
                      color: "#fff",
                      textDecoration: "none",
                      border: "none",
                    }}
                  >
                    Build brief from these ↗
                  </Link>
                )}
                {/* Ask follow-up — only appears once synthesis is present */}
                <button
                  onClick={handleFollowUp}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "6px 14px",
                    borderRadius: 6,
                    background: "transparent",
                    color: "#1d70b8",
                    border: "1px solid #b3d4ef",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Ask a follow-up →
                </button>
                <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: "auto" }}>
                  Curated &amp; verified by HIVE
                </span>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, color: "#94a3b8", margin: 0 }}>
              No cases found for &ldquo;{query}&rdquo;. Try broader terms or a different hazard.
            </p>
          )}
        </div>
      )}

      {/* ── Case cards ── */}
      {hasCases && (
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {cases.map((cs, i) => (
            <div key={cs.id} style={{ animation: `hive-fade-up 0.3s ease forwards`, animationDelay: `${i * 0.04}s`, opacity: 0 }}>
              <CaseStudyCard
                cs={cs}
                inBrief={brief.includes(cs.id)}
                onAddToBrief={(c) => toggleBrief(c.id)}
                index={i}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty state before any query ── */}
      {!query && (
        <div style={{ marginTop: 48, textAlign: "center", color: "#94a3b8" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <svg
              style={{ width: 26, height: 26, color: "#94a3b8" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <p style={{ fontSize: 14, margin: 0 }}>
            Type a query above and press Enter to search 109 curated case studies
          </p>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {[
              "Flooding on rail corridors",
              "Urban heat island highways",
              "Coastal erosion sea defence",
              "Pavement heat resilience",
              "SuDS surface water",
            ].map((starter) => (
              <button
                key={starter}
                onClick={() => {
                  setInputValue(starter);
                  setQuery(starter);
                  setSessionIntent(starter);
                }}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes hive-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
