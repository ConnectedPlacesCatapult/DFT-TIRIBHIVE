"use client";
import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { CASE_STUDIES } from "@/lib/hive/seed-data";
import { useChatContext } from "@/components/handbook/shared/ChatContext";
import { ChatPanel } from "@/components/handbook/shared/ChatPanel";
import { HandbookNav } from "@/components/handbook/shared/HandbookNav";
import { BriefOptionsCoverage } from "@/components/handbook/brief/BriefOptionsCoverage";

// ── Theme ─────────────────────────────────────────────────────────────────────
const T = {
  bg: "#f8f7f4", surface: "#ffffff", surfaceAlt: "#f3f1ec",
  border: "#e4e0d8", text: "#1a1814", textSec: "#5a5650", textMuted: "#6b6560",
  accent: "#1d70b8", accentLight: "#e8f1fb", accentMid: "#b3d4ef",
  green: "#006853", greenLight: "#e6f4f1", greenMid: "#a7d8d0",
  amber: "#b45309", amberLight: "#fef3c7",
  red: "#b91c1c", redLight: "#fee2e2",
  navBg: "rgba(248,247,244,0.97)",
};

const FONT = `
  * { box-sizing:border-box; margin:0; padding:0; }
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:#e4e0d8;border-radius:2px}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.25}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:-200px 0}100%{background-position:200px 0}}
  @keyframes dotBounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}
  .appear{animation:fadeUp 0.32s ease forwards}
  .sec-btn{background:none;border:none;cursor:pointer;padding:6px 10px;border-radius:6px;font-size:12px;font-weight:500;text-align:left;width:100%;transition:all 0.15s;color:#5a5650}
  .sec-btn:hover{background:#f3f1ec}
  .sec-btn.active{background:#e8f1fb;color:#1d70b8;font-weight:700}
  .loading-bar{height:3px;border-radius:2px;background:linear-gradient(90deg,#e8f1fb 25%,#1d70b8 50%,#e8f1fb 75%);background-size:400px 100%;animation:shimmer 1.4s infinite}
`;

// ── Section order (matches API section_key values) ────────────────────────────
const SECTION_NAV = [
  { key: "executive_summary", label: "Executive Summary" },
  { key: "climate_drivers", label: "Climate Drivers" },
  { key: "adaptation_approaches", label: "Adaptation Approaches" },
  { key: "costs_and_resourcing", label: "Costs & Resourcing" },
  { key: "uk_applicability", label: "Transfer Intelligence" },
  { key: "key_insight", label: "Key Insight" },
  { key: "sources", label: "Source References" },
];

// ── Accent palette for case tiles (cycles for any number of cases) ────────────
const ACCENT_PALETTE = [
  { base: "#166534", light: "#dcfce7", mid: "#86efac", text: "#14532d" },
  { base: "#1e40af", light: "#dbeafe", mid: "#93c5fd", text: "#1e3a8a" },
  { base: "#9a3412", light: "#ffedd5", mid: "#fdba74", text: "#7c2d12" },
  { base: "#7c3aed", light: "#ede9fe", mid: "#c4b5fd", text: "#5b21b6" },
  { base: "#be185d", light: "#fce7f3", mid: "#f9a8d4", text: "#9d174d" },
  { base: "#0e7490", light: "#ecfeff", mid: "#67e8f9", text: "#155e75" },
];

function getCaseAccent(id: string, allIds: string[]) {
  const idx = allIds.indexOf(id);
  return ACCENT_PALETTE[(idx >= 0 ? idx : 0) % ACCENT_PALETTE.length];
}

// ── Types ─────────────────────────────────────────────────────────────────────
type BriefCase = {
  id: string; title: string; org: string; sector: string;
  location: string; year: string; cost: string; transfer: string;
  hazards: string[]; hook: string;
  /** When available: key_insight from hive.article_cards, else case_study_text/summary from articles */
  tileContent?: string;
};

type BriefSection = {
  section_key: string;
  section_title: string;
  content: string;
  confidence?: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function normaliseCaseForBrief(cs: { id: string; title: string; organisation?: string; org?: string; sector?: string; location?: string; year?: string; cost?: string; transferability?: string; transfer?: string; hazards?: { cause?: string[]; effect?: string[] } | string[]; hook?: string; articleCard?: { key_insight?: string }; summary?: string; case_study_text?: string }) {
  const cause = cs.hazards && !Array.isArray(cs.hazards) ? (cs.hazards.cause ?? []) : [];
  const effect = cs.hazards && !Array.isArray(cs.hazards) ? (cs.hazards.effect ?? []) : [];
  const hazardList = Array.isArray(cs.hazards) ? cs.hazards : [...cause, ...effect];
  const hook = cs.hook ?? "";
  const tileContent = cs.articleCard?.key_insight?.trim() || (cs.case_study_text ?? cs.summary)?.trim() || hook;
  return {
    id: cs.id, title: cs.title,
    org: (cs as { organisation?: string }).organisation ?? (cs as { org?: string }).org ?? "",
    sector: cs.sector ?? "", location: cs.location ?? "", year: cs.year ?? "",
    cost: cs.cost ?? "",
    transfer: (cs as { transferability?: string }).transferability ?? (cs as { transfer?: string }).transfer ?? "Medium",
    hazards: hazardList, hook, tileContent: tileContent || undefined,
  };
}

function searchCases(query: string, excludeIds: string[] = []) {
  const q = query.toLowerCase();
  return CASE_STUDIES
    .filter(cs => !excludeIds.includes(cs.id))
    .filter(cs => {
      const hazardList = [...(cs.hazards?.cause ?? []), ...(cs.hazards?.effect ?? [])];
      return (
        cs.title.toLowerCase().includes(q) ||
        (cs.sector?.toLowerCase().includes(q)) ||
        hazardList.some(h => h.toLowerCase().includes(q)) ||
        cs.hook?.toLowerCase().includes(q)
      );
    })
    .map(cs => normaliseCaseForBrief(cs))
    .slice(0, 6);
}

// ── Small components ──────────────────────────────────────────────────────────
function SLabel({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: 10 }}>{children}</div>;
}

function CaseChip({ id, activeCase, onClick, allIds }: { id: string; activeCase: string | null; onClick?: (id: string) => void; allIds: string[] }) {
  const a = getCaseAccent(id, allIds);
  const isActive = activeCase === id;
  const isOther = activeCase != null && activeCase !== id;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      <button onClick={() => onClick?.(id)} style={{
        display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700,
        padding: "2px 8px", borderRadius: 4, cursor: "pointer", border: "none",
        background: isOther ? T.surfaceAlt : isActive ? a.base : a.light,
        color: isOther ? T.textMuted : isActive ? "#fff" : a.text,
        transition: "all 0.2s", transform: isActive ? "scale(1.05)" : "scale(1)",
        opacity: isOther ? 0.4 : 1,
      }}>
        {id}
      </button>
      <Link
        href={`/handbook/${id}`}
        title="View full case study"
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 20, height: 20, borderRadius: 4, color: isOther ? T.textMuted : (isActive ? "rgba(255,255,255,0.9)" : T.accent),
          opacity: isOther ? 0.5 : 1, textDecoration: "none", fontSize: 11,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </Link>
    </span>
  );
}

function InlineCaseChip({ id }: { id: string }) {
  return (
    <Link
      href={`/handbook/${id}`}
      title="View full case study"
      style={{
        display: "inline", fontSize: 11, fontWeight: 700, padding: "1px 6px",
        borderRadius: 3, background: T.accentLight, color: T.accent, whiteSpace: "nowrap",
        textDecoration: "none", borderBottom: "1px solid transparent", transition: "border-color 0.15s",
      }}
      className="inline-case-chip"
      onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = T.accent; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = "transparent"; }}
    >
      {id}
    </Link>
  );
}

function ConfidenceBadge({ level }: { level?: string }) {
  const config: Record<string, { label: string; bg: string; color: string; border: string }> = {
    high: { label: "HIGH", bg: T.greenLight, color: T.green, border: T.greenMid },
    partial: { label: "PARTIAL", bg: T.amberLight, color: T.amber, border: "#fcd34d" },
    indicative: { label: "LOW", bg: T.redLight, color: T.red, border: "#fca5a5" },
  };
  const c = config[level ?? "partial"] ?? config.partial;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 3,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`, textTransform: "uppercase",
    }}>
      {c.label}
    </span>
  );
}

function SearchResultCard({ cs, onAdd, alreadyInBrief }: { cs: BriefCase; onAdd: (c: BriefCase) => void; alreadyInBrief: boolean }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", marginTop: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 3 }}>
        {cs.id} · {cs.sector}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>{cs.title}</div>
      <div style={{ fontSize: 11, color: T.textSec, marginBottom: 8 }}>{cs.hook}</div>
      <button
        onClick={() => onAdd(cs)} disabled={alreadyInBrief}
        style={{ fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 5, border: "none", cursor: alreadyInBrief ? "default" : "pointer", background: alreadyInBrief ? T.surfaceAlt : T.accent, color: alreadyInBrief ? T.textMuted : "#fff" }}>
        {alreadyInBrief ? "Already in brief" : "+ Add to brief"}
      </button>
    </div>
  );
}

// ── Content rendering (citations + bullet lists) ──────────────────────────────
function renderCitations(text: string): ReactNode[] {
  return text.split(/(\[ID_[\w]+\])/).map((part, i) => {
    if (/^\[ID_[\w]+\]$/.test(part)) {
      return <InlineCaseChip key={i} id={part.replace(/[[\]]/g, "")} />;
    }
    return <span key={i}>{part}</span>;
  });
}

function parseMarkdownTable(lines: string[]): { headers: string[]; rows: string[][] } | null {
  const pipeLines = lines.filter(l => l.trim().startsWith("|") && l.trim().endsWith("|"));
  if (pipeLines.length < 2) return null;
  const splitRow = (row: string) =>
    row.split("|").slice(1, -1).map(c => c.trim());
  const headers = splitRow(pipeLines[0]);
  if (headers.length === 0) return null;
  const isSep = (l: string) => /^\|[\s\-:|]+\|$/.test(l.trim());
  const dataRows = pipeLines.slice(1).filter(l => !isSep(l)).map(splitRow);
  return { headers, rows: dataRows };
}

function MarkdownTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, margin: "8px 0" }}>
      <thead>
        <tr style={{ borderBottom: `2px solid ${T.accent}` }}>
          {headers.map((h, i) => (
            <th key={i} style={{ textAlign: "left", padding: "10px 12px", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, background: T.surfaceAlt }}>{renderCitations(h)}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ borderBottom: `1px solid ${T.border}`, background: ri % 2 ? T.surfaceAlt : "transparent" }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{ padding: "10px 12px", fontSize: 13, lineHeight: 1.6, color: T.text }}>{renderCitations(cell)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BriefContent({ content }: { content: string }) {
  if (!content) return null;
  const paragraphs = content.split(/\n\n+/);
  return (
    <>
      {paragraphs.map((para, pi) => {
        const lines = para.split("\n").filter(l => l.trim());

        const table = parseMarkdownTable(lines);
        if (table) return <MarkdownTable key={pi} headers={table.headers} rows={table.rows} />;

        const isBullets = lines.length > 0 && lines.every(l => l.trim().startsWith("- "));
        if (isBullets) {
          return (
            <ul key={pi} style={{ paddingLeft: 20, margin: "8px 0", listStyle: "disc" }}>
              {lines.map((line, li) => (
                <li key={li} style={{ fontSize: 14, lineHeight: 1.8, color: T.text, marginBottom: 4 }}>
                  {renderCitations(line.replace(/^-\s*/, ""))}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={pi} style={{ fontSize: 14, lineHeight: 1.8, color: T.text, marginBottom: 8 }}>
            {renderCitations(para)}
          </p>
        );
      })}
    </>
  );
}

function isInsufficient(content?: string): boolean {
  return !content || content.toLowerCase().includes("insufficient evidence");
}

const HIVE_BRIEF_CACHE_KEY = "hiveBriefCache";

function getBriefCache(): { ids: string[]; sections: BriefSection[]; label: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(HIVE_BRIEF_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ids: string[]; sections: BriefSection[]; label: string };
    return Array.isArray(parsed.ids) && Array.isArray(parsed.sections) ? parsed : null;
  } catch {
    return null;
  }
}

function setBriefCache(ids: string[], sections: BriefSection[], label: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(HIVE_BRIEF_CACHE_KEY, JSON.stringify({ ids, sections, label }));
  } catch {
    // ignore
  }
}

function briefCacheMatches(cache: { ids: string[] }, ids: string[]): boolean {
  if (cache.ids.length !== ids.length) return false;
  const a = [...cache.ids].sort();
  const b = [...ids].sort();
  return a.every((id, i) => id === b[i]);
}

// Default example case IDs when user opens brief with no cases — acts as template + user guide
const EXAMPLE_BRIEF_IDS = ["ID_40", "ID_32", "ID_19"];

// ── Guided tour steps ─────────────────────────────────────────────────────────
const TOUR_STEPS = [
  {
    key: "welcome",
    title: "Welcome to Build Brief",
    body: "This is a live example of a HIVE Cross-Case Intelligence Brief. It synthesises evidence from multiple case studies into a structured analytical document. Step through this tour to understand each section before building your own.",
    anchor: null,
  },
  {
    key: "evidence_base",
    title: "Evidence Base",
    body: "The tiles at the top show the case studies this brief draws from. Click any tile to highlight its evidence throughout the document — useful for checking that specific citations are well-supported. The badge in the corner shows UK transferability (High / Medium / Low).",
    anchor: null,
  },
  {
    key: "executive_summary",
    title: "Executive Summary",
    body: "Opens with one specific measurable finding — a percentage, £ figure, or concrete outcome. The brief is designed to open with the strongest quantified result, not a generic scene-setter. Every claim carries an [ID_xx] citation you can trace back to the source case.",
    anchor: "executive_summary",
  },
  {
    key: "adaptation_approaches",
    title: "Adaptation Approaches table",
    body: "Structured as a markdown table: Approach / Case Studies / Notes. Where your cases are linked to the DfT Options Framework, those measures appear here with a 'Aligns with DfT options framework' note. This section is best for comparing interventions side-by-side.",
    anchor: "adaptation_approaches",
  },
  {
    key: "costs_and_resourcing",
    title: "Costs & Resourcing",
    body: "Pulls investment figures directly from the article_cards structured data — not from raw text paragraphs. Where investment_band and investment_detail are populated (from the AI card generation step), they appear here as specific figures rather than ranges.",
    anchor: "costs_and_resourcing",
  },
  {
    key: "uk_applicability",
    title: "Transfer Intelligence",
    body: "This section names specific transfer conditions for each case: what transfers directly to UK infrastructure, what needs adapting, and which UK infrastructure types are most relevant. It avoids generic conclusions like 'applicable to UK transport' in favour of named asset types and locations.",
    anchor: "uk_applicability",
  },
  {
    key: "confidence",
    title: "Confidence levels",
    body: "Every section carries a confidence badge: High (2+ cases agree), Partial (some evidence, interpretation required), or Indicative (single-case or reasoned inference). Use these to decide how to characterise the evidence in any formal document you produce from this brief.",
    anchor: null,
  },
];
const TOUR_LS_KEY = "hiveBriefTourDone";

const FOCUS_LENSES: { id: "all" | "Rail" | "Highways" | "Aviation" | "Maritime" | "Costs" | "Policy context"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "Rail", label: "Rail" },
  { id: "Highways", label: "Highways" },
  { id: "Aviation", label: "Aviation" },
  { id: "Maritime", label: "Maritime" },
  { id: "Costs", label: "Costs" },
  { id: "Policy context", label: "Policy context" },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function HIVEBriefWithChat() {
  const [initialized, setInitialized] = useState(false);
  const [briefCases, setBriefCases] = useState<BriefCase[]>([]);
  const [sections, setSections] = useState<BriefSection[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLabel, setAiLabel] = useState<string | null>(null);
  const [isExampleMode, setIsExampleMode] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Spotlight the referenced section element — lift it above the dim backdrop
  useEffect(() => {
    if (!tourOpen) return;
    const anchor = TOUR_STEPS[tourStep]?.anchor;
    const el = anchor ? sectionRefs.current[anchor] : null;
    if (el) {
      el.style.position = "relative";
      el.style.zIndex = "1001";
      el.style.borderRadius = "10px";
      el.style.outline = `3px solid ${T.accent}`;
      el.style.outlineOffset = "6px";
      el.style.background = T.surface;
    }
    return () => {
      if (el) {
        el.style.position = "";
        el.style.zIndex = "";
        el.style.borderRadius = "";
        el.style.outline = "";
        el.style.outlineOffset = "";
        el.style.background = "";
      }
    };
  }, [tourOpen, tourStep]);
  const [activeCase, setActiveCase] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("executive_summary");
  const [editingSectionKey, setEditingSectionKey] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [savedTheme, setSavedTheme] = useState("light");
  const [emptySearchQuery, setEmptySearchQuery] = useState("");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    chatOpen, openChat, closeChat,
    setChatContext: setSharedChatContext,
    setBriefSections: setCtxBriefSections,
    setOnBriefSectionUpdate: setCtxOnBriefSectionUpdate,
    setPendingBriefMessage,
    themeKey,
  } = useChatContext();
  const [focusLens, setFocusLens] = useState<"all" | "Rail" | "Highways" | "Aviation" | "Maritime" | "Costs" | "Policy context">("all");

  const caseIds = briefCases.map(c => c.id);

  const handleFocusLens = useCallback((lens: typeof focusLens) => {
    const next = focusLens === lens ? "all" : lens;
    setFocusLens(next);
    if (next !== "all" && setPendingBriefMessage) {
      const messages: Record<string, string> = {
        Rail: "Reframe this brief for a Rail audience — emphasise cases and findings most relevant to Rail infrastructure",
        Highways: "Reframe this brief for a Highways audience — emphasise cases and findings most relevant to Highways infrastructure",
        Aviation: "Reframe this brief for an Aviation audience — emphasise cases and findings most relevant to Aviation infrastructure",
        Maritime: "Reframe this brief for a Maritime audience — emphasise cases and findings most relevant to Maritime infrastructure",
        Costs: "Reframe the brief to prioritise cost evidence — highlight investment figures, funding sources and value for money across the cases",
        "Policy context": "Reframe the brief to emphasise policy drivers, regulatory context and strategic alignment for a DfT policy audience",
      };
      setPendingBriefMessage(messages[next] ?? "");
      openChat();
    }
  }, [focusLens, setPendingBriefMessage, openChat]);

  // ── Generate brief from API ───────────────────────────────────────────────
  const generateBrief = useCallback(async (ids: string[]) => {
    setLoading(true);
    setError(null);
    setSections(null);
    try {
      const res = await fetch("/api/handbook/brief-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Generation failed (${res.status})`);
      }
      const data = await res.json();
      const newSections = data.sections ?? [];
      const newLabel = data.label ?? `AI-generated from ${ids.length} case studies — review before use`;
      setSections(newSections);
      setAiLabel(newLabel);
      setBriefCache(ids, newSections, newLabel);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate brief");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load case IDs on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const theme = window.sessionStorage.getItem("hiveBriefTheme") || "light";
    setSavedTheme(theme);

    const urlIds = params.get("ids")?.split(",").filter(Boolean) ?? [];
    const stored = window.sessionStorage.getItem("hiveBriefCases");
    const storedIds: string[] = stored ? (() => { try { return JSON.parse(stored); } catch { return []; } })() : [];
    const ids = urlIds.length > 0 ? urlIds : storedIds;

    if (ids.length > 0) {
      const resolved = ids
        .map(id => CASE_STUDIES.find(c => c.id === id))
        .filter((cs): cs is (typeof CASE_STUDIES)[number] => cs != null);
      setBriefCases(resolved.map(cs => normaliseCaseForBrief(cs)));
      setIsExampleMode(false);

      const cache = getBriefCache();
      if (cache && briefCacheMatches(cache, ids)) {
        setSections(cache.sections);
        setAiLabel(cache.label);
      } else {
        generateBrief(ids);
      }
    } else {
      // No cases: load static prebuilt example brief instantly — no OpenAI call
      const resolved = EXAMPLE_BRIEF_IDS
        .map(id => CASE_STUDIES.find(c => c.id === id))
        .filter((cs): cs is (typeof CASE_STUDIES)[number] => cs != null);
      if (resolved.length > 0) {
        setBriefCases(resolved.map(cs => normaliseCaseForBrief(cs)));
        setIsExampleMode(true);
        // Import the prebuilt static brief — sync, no API call
        import("@/data/example-brief.json").then(mod => {
          const { sections: exSections, label: exLabel } = mod.default as {
            sections: BriefSection[];
            label: string;
          };
          setSections(exSections);
          setAiLabel(exLabel);
        }).catch(() => {
          // Fallback: generate if static file missing
          generateBrief(EXAMPLE_BRIEF_IDS);
        });
        // Open tour on first ever visit
        if (!window.localStorage.getItem(TOUR_LS_KEY)) {
          setTourOpen(true);
          setTourStep(0);
        }
      }
    }
    setInitialized(true);
  }, [generateBrief]);

  // ── Sync chat context when cases change ───────────────────────────────────
  useEffect(() => {
    const ids = briefCases.map(c => c.id).filter(Boolean);
    if (ids.length > 0) setSharedChatContext(`brief:${ids.join(",")}`);
  }, [briefCases, setSharedChatContext]);

  // ── Sync sections to ChatContext for Connection 2 ─────────────────────────
  useEffect(() => {
    if (!setCtxBriefSections) return;
    if (sections) {
      setCtxBriefSections(sections.map(s => ({ section_key: s.section_key, content: s.content })));
    } else {
      setCtxBriefSections(null);
    }
  }, [sections, setCtxBriefSections]);

  // Keep cache in sync when sections change (e.g. after edit or chat update) so Back restores latest
  useEffect(() => {
    if (caseIds.length > 0 && sections?.length) {
      setBriefCache(caseIds, sections, aiLabel ?? `AI-generated from ${caseIds.length} case studies — review before use`);
    }
  }, [caseIds, sections, aiLabel]);

  useEffect(() => {
    if (!setCtxOnBriefSectionUpdate) return;
    setCtxOnBriefSectionUpdate(() => (key: string, content: string) => {
      setSections(prev => prev?.map(s => s.section_key === key ? { ...s, content } : s) ?? null);
    });
    return () => setCtxOnBriefSectionUpdate(null);
  }, [setCtxOnBriefSectionUpdate]);

  // ── Export PDF ────────────────────────────────────────────────────────────
  const handleExportPDF = useCallback(async () => {
    if (!sections?.length) return;
    try {
      const res = await fetch("/api/handbook/brief/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: caseIds, sections }),
      });
      if (!res.ok) throw new Error("Export failed");
      const html = await res.text();
      const win = window.open("", "_blank");
      if (win) { win.document.write(html); win.document.close(); }
    } catch {
      alert("PDF export encountered an error. You can also use Ctrl/Cmd+P to print this page.");
    }
  }, [caseIds, sections]);

  // ── Inline editing ────────────────────────────────────────────────────────
  const startEdit = (key: string, content: string) => {
    setEditingSectionKey(key);
    setEditingContent(content);
  };
  const saveEdit = (key: string) => {
    setSections(prev => prev?.map(s => s.section_key === key ? { ...s, content: editingContent } : s) ?? null);
    setEditingSectionKey(null);
  };
  const cancelEdit = () => setEditingSectionKey(null);

  // ── Computed ──────────────────────────────────────────────────────────────
  const isEmptyState = initialized && briefCases.length === 0 && !loading;
  const emptySearchResults = emptySearchQuery.trim() ? searchCases(emptySearchQuery, caseIds) : [];
  const toggleCase = (id: string) => setActiveCase(p => p === id ? null : id);
  const scrollTo = (id: string) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearBrief = () => {
    setBriefCases([]);
    setSections(null);
    setAiLabel(null);
    setIsExampleMode(false);
    try {
      window.sessionStorage.removeItem(HIVE_BRIEF_CACHE_KEY);
    } catch {
      // ignore
    }
  };

  const briefTitle = (() => {
    const hazards = [...new Set(briefCases.flatMap(c => c.hazards))].slice(0, 2);
    const sectors = [...new Set(briefCases.map(c => c.sector).filter(Boolean))].slice(0, 2);
    return {
      main: hazards.length > 0 ? hazards.join(" & ") : "Climate Adaptation",
      sub: sectors.length > 0 ? `in UK ${sectors.join(" & ")} Infrastructure` : "in UK Transport Infrastructure",
    };
  })();

  const sidebarStats = (() => {
    const sectors = [...new Set(briefCases.map(c => c.sector).filter(Boolean))];
    const hazards = [...new Set(briefCases.flatMap(c => c.hazards))];
    const transfers = [...new Set(briefCases.map(c => c.transfer).filter(Boolean))];
    return [
      { label: "Cases", value: String(briefCases.length) },
      { label: "Sectors", value: sectors.join(", ") || "\u2014" },
      { label: "Hazards", value: hazards.slice(0, 3).join(", ") || "\u2014" },
      { label: "Transferability", value: transfers.join(" / ") || "\u2014" },
    ];
  })();

  const getSectionByKey = (key: string) => sections?.find(s => s.section_key === key);

  // ── Section renderer ──────────────────────────────────────────────────────
  const renderSection = (section: BriefSection) => {
    const editing = editingSectionKey === section.section_key;
    const insufficient = isInsufficient(section.content);

    if (section.section_key === "sources") {
      return (
        <div ref={el => { sectionRefs.current[section.section_key] = el; }} className="appear" style={{ padding: "28px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{section.section_title}</h2>
            <ConfidenceBadge level={section.confidence} />
          </div>
          {briefCases.map(c => {
            const meta = [c.sector, c.location, c.year].filter(Boolean).join(" · ");
            return (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "0 16px", padding: "12px 0", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
                <CaseChip id={c.id} activeCase={activeCase} onClick={toggleCase} allIds={caseIds} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2 }}>{c.title}</div>
                  {meta && <div style={{ fontSize: 12, color: T.textSec }}>{meta}</div>}
                </div>
                <Link
                  href={`/handbook/${c.id}`}
                  title="View full case study"
                  style={{ fontSize: 11, fontWeight: 600, color: T.accent, textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  View original &rarr;
                </Link>
              </div>
            );
          })}
        </div>
      );
    }

    if (editing) {
      return (
        <div ref={el => { sectionRefs.current[section.section_key] = el; }} className="appear" style={{ padding: "28px 0", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{section.section_title}</h2>
              <ConfidenceBadge level={section.confidence} />
            </div>
          </div>
          <textarea
            value={editingContent}
            onChange={e => setEditingContent(e.target.value)}
            style={{
              width: "100%", minHeight: 180, padding: "14px 16px", fontSize: 14, lineHeight: 1.8,
              border: `2px solid ${T.accent}`, borderRadius: 8, fontFamily: "'DM Sans', sans-serif",
              color: T.text, outline: "none", resize: "vertical", background: "#fff",
            }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => saveEdit(section.section_key)} style={{ padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", background: T.accent, color: "#fff" }}>Save</button>
            <button onClick={cancelEdit} style={{ padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${T.border}`, background: T.surface, color: T.textSec }}>Cancel</button>
          </div>
        </div>
      );
    }

    const isKeyInsight = section.section_key === "key_insight";
    const isExecSummary = section.section_key === "executive_summary";

    const contentWrapperStyle = isKeyInsight
      ? { padding: "22px 24px", background: T.greenLight, borderRadius: 10, border: `1px solid ${T.greenMid}` }
      : isExecSummary
        ? { padding: "18px 20px", background: T.accentLight, borderRadius: 8, borderLeft: `3px solid ${T.accent}` }
        : {};

    return (
      <div ref={el => { sectionRefs.current[section.section_key] = el; }} className="appear" style={{ padding: "28px 0", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{section.section_title}</h2>
            <ConfidenceBadge level={section.confidence} />
          </div>
          <button
            onClick={() => startEdit(section.section_key, section.content)}
            title="Edit this section"
            style={{
              background: "none", border: `1px solid ${T.border}`, borderRadius: 5,
              padding: "4px 8px", cursor: "pointer", color: T.textMuted, fontSize: 12,
              display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s",
            }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>

        {insufficient ? (
          <div style={{ padding: "18px 20px", background: T.surfaceAlt, borderRadius: 8, border: `1px dashed ${T.border}`, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: T.textMuted, fontStyle: "italic", marginBottom: 4 }}>Insufficient evidence for this section</p>
            <p style={{ fontSize: 11, color: T.textMuted }}>Add more cases or edit manually to fill this section.</p>
          </div>
        ) : (
          <div style={contentWrapperStyle}>
            {isKeyInsight ? (
              <p style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, lineHeight: 1.8, color: T.text, fontWeight: 400 }}>
                {renderCitations(section.content)}
              </p>
            ) : (
              <BriefContent content={section.content} />
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,300&display=swap" />
      <style>{FONT}</style>
      <HandbookNav />
      <div style={{ borderBottom: `1px solid ${T.border}`, background: T.surface, position: "sticky", top: 56, zIndex: 30 }}>
        {loading && <div className="loading-bar" />}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: T.textSec, display: "flex", alignItems: "center", gap: 10 }}>
            {isExampleMode && !loading && sections ? (
              <>
                <span style={{ fontWeight: 600, color: T.text }}>Example brief</span>
                <span aria-hidden style={{ color: T.textMuted }}>-</span>
                <span>This shows what a HIVE brief looks like.</span>
              </>
            ) : (
              <span style={{ fontWeight: 600, color: T.text }}>Build Brief workspace</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {loading && (
              <span style={{ fontSize: 12, color: T.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, display: "inline-block", animation: "pulse 1s infinite" }} />
                Generating&hellip;
              </span>
            )}
            {isExampleMode && !loading && sections && (
              <button
                type="button"
                onClick={() => { setTourStep(0); setTourOpen(true); }}
                style={{ fontSize: 12, fontWeight: 700, padding: "6px 12px", borderRadius: 20, border: `1px solid ${T.accent}`, background: T.surface, color: T.accent, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                ▶ Start walkthrough
              </button>
            )}
            {briefCases.length > 0 && !loading && (
              <button type="button" onClick={clearBrief} style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textSec, cursor: "pointer" }}>Clear</button>
            )}
            <button type="button" onClick={handleExportPDF} disabled={loading || !sections?.length} style={{ fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: loading || !sections?.length ? T.textMuted : T.textSec, cursor: loading || !sections?.length ? "not-allowed" : "pointer", opacity: loading || !sections?.length ? 0.6 : 1 }}>
              &darr; PDF
            </button>
          </div>
        </div>
      </div>

      {/* ── AI-generated warning banner (real briefs only, not the prebuilt example) */}
      {aiLabel && !isExampleMode && !loading && sections && (
        <div style={{ background: T.amberLight, borderBottom: "1px solid #fcd34d", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={T.amber} strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#92400e" }}>{aiLabel}</span>
        </div>
      )}

      {/* ── Full-page loading ───────────────────────────────────────────── */}
      {loading && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "120px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, display: "inline-block", animation: `dotBounce 1.2s ease ${i * 0.2}s infinite` }} />
              ))}
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, color: T.text, marginBottom: 8 }}>
              Generating brief from {briefCases.length} case {briefCases.length === 1 ? "study" : "studies"}&hellip;
            </h2>
            <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>
              Retrieving evidence, synthesising findings, and assessing confidence levels.
            </p>
          </div>
          <div className="loading-bar" style={{ width: "100%", maxWidth: 300 }} />
        </div>
      )}

      {/* ── Error state ─────────────────────────────────────────────────── */}
      {error && !loading && !sections && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "120px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, color: T.text, marginBottom: 8 }}>Brief generation failed</h2>
          <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6, marginBottom: 20 }}>{error}</p>
          <button onClick={() => generateBrief(caseIds)} style={{ padding: "10px 20px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", background: T.accent, color: "#fff" }}>Try again</button>
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {isEmptyState && !error && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px" }}>
          <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, fontWeight: 400, color: T.text, marginBottom: 8 }}>Your brief is empty</h2>
          <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, maxWidth: 560, marginBottom: 20 }}>
            Search for case studies to add, or browse the handbook to find relevant cases.
          </p>
          <div style={{ position: "relative", maxWidth: 400, marginBottom: 16 }}>
            <input
              value={emptySearchQuery} onChange={e => setEmptySearchQuery(e.target.value)}
              placeholder="Search cases..."
              style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: `1.5px solid ${T.border}`, borderRadius: 8, outline: "none", fontFamily: "'DM Sans', sans-serif", color: T.text }}
            />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
            <a href="/handbook/cases" style={{ padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: "none", background: T.accent, color: "#fff" }}>Browse all case studies</a>
          </div>
          {emptySearchResults.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <SLabel>Search results</SLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {emptySearchResults.map(cs => (
                  <SearchResultCard key={cs.id} cs={cs} onAdd={c => { setBriefCases(prev => [...prev, c]); setEmptySearchQuery(""); }} alreadyInBrief={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Main grid layout (cases loaded, not in loading/error state) ── */}
      {briefCases.length > 0 && !loading && !(!sections && error) && (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px", display: "grid", gridTemplateColumns: "190px 1fr 200px", gap: "0 32px", transition: "padding-right 0.25s", paddingRight: chatOpen ? "calc(24px + 420px)" : "24px" }}>

          {/* Left nav */}
          <div style={{ position: "sticky", top: 72, height: "fit-content" }}>
            <SLabel>Sections</SLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 20 }}>
              {SECTION_NAV.map(s => (
                <button key={s.key} className={`sec-btn ${activeSection === s.key ? "active" : ""}`} onClick={() => scrollTo(s.key)}>{s.label}</button>
              ))}
            </div>
            <div style={{ padding: "12px", background: T.surfaceAlt, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <SLabel>Evidence filter</SLabel>
              <p style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>Click a case tile to highlight its evidence throughout this report.</p>
              {activeCase && (
                <button onClick={() => setActiveCase(null)} style={{ marginTop: 8, background: "none", border: `1px solid ${T.border}`, cursor: "pointer", padding: "4px 10px", borderRadius: 5, fontSize: 11, color: T.textSec, width: "100%" }}>Clear highlight</button>
              )}
            </div>
          </div>

          {/* Main content */}
          <div>
            {/* Report header */}
            <div style={{ paddingBottom: 28, marginBottom: 28, borderBottom: `2px solid ${T.text}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.textMuted, marginBottom: 10 }}>
                {isExampleMode
                  ? <>Example Brief &middot; HIVE &middot; Prebuilt illustration</>
                  : <>Cross-Case Intelligence Brief &middot; HIVE &middot; {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</>}
              </div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 30, fontWeight: 400, color: T.text, lineHeight: 1.2, marginBottom: 10 }}>
                {briefTitle.main}<br /><em>{briefTitle.sub}</em>
              </h1>
              {isExampleMode && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.accentLight, border: `1px solid ${T.accentMid}`, borderRadius: 6, padding: "5px 10px", marginBottom: 10 }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke={T.accent} strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.accent }}>Prebuilt example — not AI-generated on this load</span>
                </div>
              )}
              <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6, maxWidth: 560, marginBottom: 14 }}>
                {sections
                  ? isExampleMode
                    ? <>Curated example across {briefCases.length} case {briefCases.length === 1 ? "study" : "studies"} — illustrating what a HIVE brief looks like. Click any source chip to highlight that case, or browse case studies to build your own.</>
                    : <>AI-generated synthesis across {briefCases.length} curated case {briefCases.length === 1 ? "study" : "studies"}. Click any source chip to highlight that case. Use <strong>Ask about this brief</strong> to interrogate, reframe, or extend this report.</>
                  : <>{briefCases.length} case {briefCases.length === 1 ? "study" : "studies"} selected. Click <strong>Generate Brief</strong> to synthesise.</>}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {briefCases.map(c => <CaseChip key={c.id} id={c.id} activeCase={activeCase} onClick={toggleCase} allIds={caseIds} />)}
              </div>
            </div>

            {/* Case tiles */}
            <div style={{ marginBottom: 24 }}>
              <SLabel>Evidence base &mdash; click to highlight throughout</SLabel>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(briefCases.length, 3)}, 1fr)`, gap: 10 }}>
                {(focusLens === "all" || focusLens === "Costs" || focusLens === "Policy context" ? briefCases : briefCases.filter(c => c.sector === focusLens)).map(c => {
                  const a = getCaseAccent(c.id, caseIds);
                  const isActive = activeCase === c.id;
                  const isOther = activeCase != null && activeCase !== c.id;
                  return (
                    <div key={c.id} role="button" tabIndex={0} aria-pressed={activeCase === c.id} aria-label={c.title} onClick={() => toggleCase(c.id)} onKeyDown={e => (e.key === "Enter" || e.key === " ") && toggleCase(c.id)} style={{
                      background: isActive ? a.light : isOther ? T.surfaceAlt : T.surface,
                      border: `1.5px solid ${isActive ? a.mid : T.border}`,
                      borderTop: `3px solid ${isActive ? a.base : "transparent"}`,
                      borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s",
                      opacity: isOther ? 0.45 : 1, transform: isActive ? "translateY(-2px)" : "none",
                      boxShadow: isActive ? `0 4px 14px ${a.light}` : "none",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", color: isActive ? a.base : T.textMuted }}>{c.id} &middot; {c.sector}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: c.transfer === "High" ? T.greenLight : T.amberLight, color: c.transfer === "High" ? T.green : T.amber }}>{c.transfer} UK fit</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: T.textSec, marginBottom: 6 }}>{c.location}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: isActive ? a.base : T.green, lineHeight: 1.4, marginBottom: 10 }}>{c.tileContent ?? c.hook}</div>
                      <Link
                        href={`/handbook/${c.id}`}
                        title="View full case study"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          fontSize: 11, fontWeight: 600, color: T.accent, textDecoration: "none",
                          display: "inline-flex", alignItems: "center", gap: 4,
                        }}
                      >
                        View full case
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Focus lens bar */}
            <div style={{ marginBottom: 28 }}>
              <SLabel>Focus this brief on:</SLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {FOCUS_LENSES.map(({ id, label }) => {
                  const active = focusLens === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleFocusLens(id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 9999,
                        border: `1.5px solid ${active ? T.accent : T.border}`,
                        background: active ? T.accentLight : T.surface,
                        color: active ? T.accent : T.textSec,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr style={{ border: "none", borderTop: `1px solid ${T.border}`, marginBottom: 28 }} />

            {/* Sections or Generate button */}
            {!sections ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontSize: 14, color: T.textSec, marginBottom: 16 }}>
                  {briefCases.length} case {briefCases.length === 1 ? "study" : "studies"} selected. Ready to generate your brief.
                </p>
                <button onClick={() => generateBrief(caseIds)} style={{ padding: "12px 28px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none", background: T.accent, color: "#fff" }}>Generate Brief</button>
              </div>
            ) : (
              <>
                {SECTION_NAV.map(nav => {
                  const section = getSectionByKey(nav.key);
                  if (!section) {
                    return (
                      <div key={nav.key} ref={el => { sectionRefs.current[nav.key] = el; }} className="appear" style={{ padding: "28px 0", borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                          <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{nav.label}</h2>
                        </div>
                        <div style={{ padding: "18px 20px", background: T.surfaceAlt, borderRadius: 8, border: `1px dashed ${T.border}`, textAlign: "center" }}>
                          <p style={{ fontSize: 13, color: T.textMuted, fontStyle: "italic" }}>Section not generated &mdash; try regenerating the brief.</p>
                        </div>
                      </div>
                    );
                  }
                  return <div key={nav.key}>{renderSection(section)}</div>;
                })}

                <BriefOptionsCoverage caseIds={caseIds} briefCases={briefCases} />

                {/* Disclaimer */}
                <div style={{ marginTop: 14, padding: "12px 14px", background: T.surfaceAlt, borderRadius: 8, border: `1px solid ${T.border}` }}>
                  <p style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.6 }}>
                    AI-generated synthesis &middot; HIVE &middot; Connected Places Catapult &middot; {new Date().toLocaleDateString("en-GB")} &middot; Review original source records before citing in formal documents.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Right sidebar */}
          <div style={{ position: "sticky", top: 72, height: "fit-content" }}>
            <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: "16px", marginBottom: 12 }}>
              <SLabel>Brief summary</SLabel>
              {sidebarStats.map(row => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, borderBottom: `1px solid ${T.border}`, paddingBottom: 7, marginBottom: 7 }}>
                  <span style={{ color: T.textMuted }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: T.text, textAlign: "right", maxWidth: "60%" }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: T.surface, borderRadius: 10, border: `1px solid ${T.border}`, padding: "16px" }}>
              <SLabel>Confidence key</SLabel>
              {[
                { level: "High", desc: "2+ cases directly support", color: T.green, bg: T.greenLight },
                { level: "Partial", desc: "1 case or indirect evidence", color: T.amber, bg: T.amberLight },
                { level: "Indicative", desc: "Limited evidence, reasoned inference", color: T.red, bg: T.redLight },
              ].map(c => (
                <div key={c.level} style={{ padding: "7px 10px", background: c.bg, borderRadius: 5, marginBottom: 5 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: c.color, marginBottom: 1 }}>{c.level}</div>
                  <div style={{ fontSize: 11, color: T.textSec }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Guided tour overlay ──────────────────────────────────────────── */}
      {tourOpen && (() => {
        const step = TOUR_STEPS[tourStep];
        const isLast = tourStep === TOUR_STEPS.length - 1;
        const closeTour = () => {
          setTourOpen(false);
          try { window.localStorage.setItem(TOUR_LS_KEY, "1"); } catch { /* ignore */ }
          if (step.anchor) {
            sectionRefs.current[step.anchor]?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        };
        const next = () => {
          if (isLast) { closeTour(); return; }
          const nextStep = TOUR_STEPS[tourStep + 1];
          setTourStep(tourStep + 1);
          if (nextStep.anchor) {
            setTimeout(() => sectionRefs.current[nextStep.anchor!]?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
          }
        };
        const prev = () => { if (tourStep > 0) setTourStep(tourStep - 1); };
        return (
          <>
            {/* Backdrop — dim only, no blur so spotlighted section stays readable */}
            <div
              onClick={closeTour}
              style={{ position: "fixed", inset: 0, background: "rgba(26,24,20,0.55)", zIndex: 999 }}
            />
            {/* Card */}
            <div style={{
              position: "fixed", bottom: 36, left: "50%", transform: "translateX(-50%)",
              zIndex: 1000, background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 14, boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
              padding: "28px 32px", maxWidth: 520, width: "calc(100% - 48px)",
            }}>
              {/* Step indicator */}
              <div style={{ display: "flex", gap: 5, marginBottom: 18 }}>
                {TOUR_STEPS.map((_, i) => (
                  <div key={i} style={{
                    height: 3, flex: 1, borderRadius: 2,
                    background: i <= tourStep ? T.accent : T.border,
                    transition: "background 0.25s",
                  }} />
                ))}
              </div>
              {/* Content */}
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: 8 }}>
                Step {tourStep + 1} of {TOUR_STEPS.length}
              </div>
              <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, fontWeight: 400, color: T.text, marginBottom: 10 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7, marginBottom: 24 }}>
                {step.body}
              </p>
              {/* Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {tourStep > 0 && (
                  <button type="button" onClick={prev} style={{ fontSize: 12, fontWeight: 600, padding: "7px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textSec, cursor: "pointer" }}>
                    ← Back
                  </button>
                )}
                <div style={{ flex: 1 }} />
                <button type="button" onClick={closeTour} style={{ fontSize: 12, fontWeight: 500, padding: "7px 12px", borderRadius: 8, border: "none", background: "transparent", color: T.textMuted, cursor: "pointer" }}>
                  Skip tour
                </button>
                <button type="button" onClick={next} style={{ fontSize: 12, fontWeight: 700, padding: "7px 20px", borderRadius: 8, border: "none", background: T.accent, color: "#fff", cursor: "pointer" }}>
                  {isLast ? "Done" : "Next →"}
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* Chat panel */}
      <ChatPanel
        context={`brief:${caseIds.join(",")}`}
        open={chatOpen}
        onClose={closeChat}
      />
    </div>
  );
}
