"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChatContext } from "./ChatContext";
import { ChatTrigger } from "./ChatTrigger";
import { THEMES, type ThemeKey } from "@/lib/hive/themes";

const DEMO_UNLOCK_KEY = "hiveDemoUnlocked";
const DEMO_PASSWORD = "1234";

const NAV_LINKS: { href: string; label: string; title: string }[] = [
  {
    href: "/handbook/cases",
    label: "Case Studies",
    title: "Browse curated climate adaptation case studies with filters",
  },
  {
    href: "/handbook/brief",
    label: "Build Brief",
    title: "Collect case studies and generate a cross-case AI synthesis report",
  },
  {
    href: "/handbook/options",
    label: "Options Library",
    title: "Explore adaptation options and measures from the library",
  },
  {
    href: "/handbook/guidance",
    label: "Additional Resources",
    title: "External guidance and reference links",
  },
];

export function HandbookNav() {
  const pathname = usePathname();
  const {
    chatOpen,
    openChat,
    closeChat,
    messages,
    briefIds,
    themeKey,
    setThemeKey,
    viewMode,
    setViewMode,
    marqueeView,
    setMarqueeView,
    demoCaseCount,
    demoMeasureCount,
    backgroundEffect,
    setBackgroundEffect,
    heroTextTreatment,
    setHeroTextTreatment,
    heroTextTreatmentExtent,
    setHeroTextTreatmentExtent,
    searchMode,
    setSearchMode,
    includeGuidance,
    setIncludeGuidance,
    reviewMode,
    setReviewMode,
  } = useChatContext();

  const [demoOpen, setDemoOpen] = useState(false);
  const [demoUnlockOpen, setDemoUnlockOpen] = useState(false);
  const [demoUnlocked, setDemoUnlocked] = useState(false);
  const [demoPassword, setDemoPassword] = useState("");
  const [demoError, setDemoError] = useState("");
  const demoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!demoOpen && !demoUnlockOpen) return;
    const close = (e: MouseEvent) => {
      if (demoRef.current && !demoRef.current.contains(e.target as Node)) {
        setDemoOpen(false);
        setDemoUnlockOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [demoOpen, demoUnlockOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDemoUnlocked(sessionStorage.getItem(DEMO_UNLOCK_KEY) === "1");
  }, []);

  const T = THEMES[themeKey];
  const hasMessages = messages.length > 1;
  const briefCount = briefIds.length;

  const handleChatToggle = () => {
    if (chatOpen) closeChat();
    else openChat();
  };

  const chatLabel = chatOpen
    ? "Close chat"
    : pathname?.startsWith("/handbook/brief")
      ? "Ask about this brief"
      : pathname?.match(/^\/handbook\/ID_/)
        ? "Ask about this case"
        : "Ask HIVE";

  const chatTitle = chatOpen
    ? "Close the assistant panel"
    : pathname?.startsWith("/handbook/brief")
      ? "Discuss this brief, request section edits, or explore evidence"
      : pathname?.match(/^\/handbook\/ID_/)
        ? "Ask about this case study in context"
        : "Open HIVE assistant — answers use the page you are on";

  const handleDemoButton = () => {
    if (demoUnlocked) {
      setDemoUnlockOpen(false);
      setDemoOpen((o) => !o);
      return;
    }
    setDemoOpen(false);
    setDemoUnlockOpen((o) => !o);
    setDemoError("");
  };

  const handleDemoUnlock = () => {
    if (demoPassword.trim() !== DEMO_PASSWORD) {
      setDemoError("Incorrect password");
      return;
    }
    setDemoUnlocked(true);
    setDemoUnlockOpen(false);
    setDemoOpen(true);
    setDemoPassword("");
    setDemoError("");
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DEMO_UNLOCK_KEY, "1");
    }
  };

  return (
    <>
      {/* DfT green 5px stripe — DfT theme only, per GOV.UK / DfT branding */}
      {themeKey === "dft" && (
        <div aria-hidden="true" style={{ height: 5, background: "#006853" }} />
      )}

      {/* Nav bar */}
      <nav
        aria-label="HIVE handbook navigation"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: T.navBg,
          borderBottom: `1px solid ${T.border}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          {/* Logo + links */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Link
              href="/handbook"
              title="HIVE handbook home — search and explore"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  background: T.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="11"
                  height="11"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#fff"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064"
                  />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: T.textPrimary,
                  fontFamily: "var(--font-dm-sans), Arial, sans-serif",
                }}
              >
                HIVE
              </span>
            </Link>

            <span
              className="hive-show-sm"
              style={{
                fontSize: 12,
                color: T.textSecondary,
                fontFamily: "var(--font-dm-sans), Arial, sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              Transport Climate Adaptation Intelligence
            </span>

            <div
              style={{ display: "flex", alignItems: "center", gap: 4 }}
              role="list"
            >
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/handbook/cases"
                    ? pathname === "/handbook/cases" || pathname?.startsWith("/handbook/cases/")
                    : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    role="listitem"
                    data-onboard={link.href === "/handbook/brief" ? "brief-nav" : undefined}
                    title={link.title}
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? T.accent : T.textSecondary,
                      textDecoration: "none",
                      padding: "4px 10px",
                      borderRadius: 5,
                      borderBottom: isActive
                        ? `2px solid ${T.accent}`
                        : "2px solid transparent",
                      transition: "all 0.15s",
                    }}
                  >
                    {link.label}
                    {link.href === "/handbook/brief" && briefCount > 0 && (
                      <span
                        aria-label={`${briefCount} cases in brief`}
                        style={{
                          marginLeft: 5,
                          fontSize: 10,
                          fontWeight: 700,
                          background: T.accent,
                          color: "#fff",
                          padding: "1px 5px",
                          borderRadius: 10,
                        }}
                      >
                        {briefCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Demo options menu, DfT Partner, Ask HIVE */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div ref={demoRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={handleDemoButton}
                aria-expanded={demoUnlocked ? demoOpen : demoUnlockOpen}
                aria-haspopup="true"
                aria-label="Demo options"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  background: T.surfaceAlt,
                  color: T.textSecondary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {!demoUnlocked ? "🔒 " : ""}Demo options
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ transform: demoOpen ? "rotate(180deg)" : "none" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {demoUnlockOpen && !demoUnlocked && (
                <div
                  role="dialog"
                  aria-label="Unlock demo options"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 4,
                    minWidth: 220,
                    padding: 10,
                    borderRadius: 12,
                    border: `1px solid ${T.border}`,
                    background: T.surface,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                    zIndex: 50,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.textSecondary, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    Demo options locked
                  </div>
                  <input
                    type="password"
                    value={demoPassword}
                    onChange={(e) => setDemoPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleDemoUnlock();
                      }
                    }}
                    placeholder="Enter password"
                    style={{
                      fontSize: 12,
                      padding: "7px 9px",
                      borderRadius: 8,
                      border: `1px solid ${T.border}`,
                      background: T.surfaceAlt,
                      color: T.textPrimary,
                      outline: "none",
                    }}
                  />
                  {demoError && (
                    <div style={{ fontSize: 11, color: "#b91c1c" }}>{demoError}</div>
                  )}
                  <button
                    type="button"
                    onClick={handleDemoUnlock}
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "7px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: T.accent,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Unlock
                  </button>
                </div>
              )}
              {demoOpen && (
                <div
                  role="menu"
                  aria-label="Demo options"
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 4,
                    minWidth: 280,
                    maxHeight: "min(70vh, 420px)",
                    overflowY: "auto",
                    padding: 12,
                    borderRadius: 12,
                    border: `1px solid ${T.border}`,
                    background: T.surface,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                    zIndex: 50,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 6 }}>Themes</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(Object.keys(THEMES) as ThemeKey[]).map((key) => (
                        <button
                          key={key}
                          type="button"
                          role="menuitemradio"
                          aria-checked={themeKey === key}
                          onClick={() => setThemeKey(key)}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "none",
                            cursor: "pointer",
                            background: themeKey === key ? T.accent : T.surfaceAlt,
                            color: themeKey === key ? "#fff" : T.textSecondary,
                          }}
                        >
                          {THEMES[key].label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 6 }}>View</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {[
                        { id: "cases" as const, label: `Cases (${demoCaseCount})` },
                        { id: "measures" as const, label: `Measures (${demoMeasureCount})` },
                      ].map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={viewMode === v.id}
                          onClick={() => setViewMode(v.id)}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "none",
                            cursor: "pointer",
                            background: viewMode === v.id ? T.accent : T.surfaceAlt,
                            color: viewMode === v.id ? "#fff" : T.textSecondary,
                          }}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 6 }}>Search</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {([
                        { id: "unified" as const, label: "Unified ✦" },
                        { id: "classic" as const, label: "Classic" },
                      ]).map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={searchMode === v.id}
                          onClick={() => setSearchMode(v.id)}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "none",
                            cursor: "pointer",
                            background: searchMode === v.id ? T.accent : T.surfaceAlt,
                            color: searchMode === v.id ? "#fff" : T.textSecondary,
                          }}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 6 }}>Animation</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {[
                        { id: "marquee" as const, label: "Marquee" },
                        { id: "velocity" as const, label: "Scroll velocity" },
                      ].map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={marqueeView === v.id}
                          onClick={() => setMarqueeView(v.id)}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "none",
                            cursor: "pointer",
                            background: marqueeView === v.id ? T.accent : T.surfaceAlt,
                            color: marqueeView === v.id ? "#fff" : T.textSecondary,
                          }}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 6 }}>Background (demo)</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {[
                        { id: "none" as const, label: "None" },
                        { id: "particles" as const, label: "Particles" },
                        { id: "hero" as const, label: "Hero" },
                      ].map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          role="menuitemradio"
                          aria-checked={backgroundEffect === v.id}
                          onClick={() => setBackgroundEffect(v.id)}
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "none",
                            cursor: "pointer",
                            background: backgroundEffect === v.id ? T.accent : T.surfaceAlt,
                            color: backgroundEffect === v.id ? "#fff" : T.textSecondary,
                          }}
                        >
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 6 }}>Meeting tools</div>
                    <button
                      type="button"
                      onClick={() => { setReviewMode(!reviewMode); setDemoOpen(false); }}
                      style={{
                        width: "100%",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        background: reviewMode ? "#dcfce7" : T.accent,
                        color: reviewMode ? "#166534" : "#fff",
                        textAlign: "left",
                      }}
                    >
                      {reviewMode ? "✓ Review mode active" : "Feedback review →"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIncludeGuidance(!includeGuidance)}
                      style={{
                        width: "100%",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        background: includeGuidance ? "#fef9c3" : T.surfaceAlt,
                        color: includeGuidance ? "#713f12" : T.textSecondary,
                        textAlign: "left",
                        marginTop: 4,
                      }}
                    >
                      {includeGuidance ? "✓ Guidance in answers" : "Include guidance in AI →"}
                    </button>
                  </div>

                  <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 6 }}>System</div>
                    <a
                      href="/admin/status"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        width: "100%",
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "6px 10px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        background: T.surfaceAlt,
                        color: T.textSecondary,
                        textDecoration: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      <span style={{ fontSize: 14 }}>🟦</span> System status →
                    </a>
                  </div>

                  {backgroundEffect === "hero" && (
                    <>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 6 }}>Hero text</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {[
                            { id: "gradient" as const, label: "Gradient" },
                            { id: "scrim" as const, label: "Scrim" },
                            { id: "backplate" as const, label: "Backplate" },
                          ].map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              role="menuitemradio"
                              aria-checked={heroTextTreatment === v.id}
                              onClick={() => setHeroTextTreatment(v.id)}
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                padding: "4px 10px",
                                borderRadius: 6,
                                border: "none",
                                cursor: "pointer",
                                background: heroTextTreatment === v.id ? T.accent : T.surfaceAlt,
                                color: heroTextTreatment === v.id ? "#fff" : T.textSecondary,
                              }}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 6 }}>Extent</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <input
                            type="range"
                            min={0}
                            max={120}
                            value={heroTextTreatmentExtent}
                            onChange={(e) => setHeroTextTreatmentExtent(Number(e.target.value))}
                            style={{ width: 100, accentColor: T.accent }}
                          />
                          <span style={{ fontSize: 11, color: T.textSecondary, minWidth: 28 }}>{heroTextTreatmentExtent}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            <ChatTrigger
              onClick={handleChatToggle}
              hasMessages={hasMessages}
              label={chatLabel}
              title={chatTitle}
              data-onboard="chat-trigger"
            />
          </div>
        </div>
      </nav>
    </>
  );
}
