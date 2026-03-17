"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { THEMES, type ThemeKey, type Theme } from "@/lib/hive/themes";

export type ChatActionPayload = {
  type: "update_filters" | "add_to_brief" | "update_brief_section" | "suggest_cases";
  payload: Record<string, unknown>;
};

export type ChatMessage = {
  role: "user" | "ai";
  text: string;
  chips?: string[];
  gap?: string | null;
  actions?: Array<{ label: string; primary?: boolean; demo?: boolean }>;
  sources?: string[];
  retrieval_mode?: "rag" | "fallback";
  /** Structured action from API — requires explicit Apply before any state change */
  action?: ChatActionPayload;
  actionDismissed?: boolean;
};

type HandbookContextType = {
  chatOpen: boolean;
  chatContext: string;
  messages: ChatMessage[];
  setChatOpen: (open: boolean) => void;
  setChatContext: (ctx: string) => void;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  openChat: (context?: string) => void;
  closeChat: () => void;
  briefIds: string[];
  addToBrief: (id: string) => void;
  removeFromBrief: (id: string) => void;
  clearBrief: () => void;
  themeKey: ThemeKey;
  setThemeKey: (key: ThemeKey) => void;
  theme: Theme;
  sessionIntent: string;
  setSessionIntent: (intent: string) => void;
  retrievalMode: "rag" | "fallback" | null;
  setRetrievalMode: (mode: "rag" | "fallback" | null) => void;
  /** For suggest_cases Apply: pages can highlight/filter to these IDs */
  suggestedCaseIds: string[];
  setSuggestedCaseIds: (ids: string[]) => void;
  /** For update_filters Apply: pages can apply these filter values */
  pendingFilterUpdate: Record<string, unknown> | null;
  setPendingFilterUpdate: (payload: Record<string, unknown> | null) => void;
  /** Brief sections for synthesis mode — set by brief page, read by ChatPanel */
  briefSections: Array<{ section_key: string; content: string }> | null;
  setBriefSections: (sections: Array<{ section_key: string; content: string }> | null) => void;
  /** Callback to update a single brief section — set by brief page, called by ChatPanel on Apply */
  onBriefSectionUpdate: ((key: string, content: string) => void) | null;
  setOnBriefSectionUpdate: (fn: ((key: string, content: string) => void) | null) => void;
  /** True while a request is in flight (e.g. routeQueryToChat from landing) — panel shows thinking indicator */
  isThinking: boolean;
  setThinking: (value: boolean) => void;
  /** Brief page focus lens: set then open chat to auto-send this message (e.g. reframe for Rail) */
  pendingBriefMessage: string | null;
  setPendingBriefMessage: (msg: string | null) => void;
  /** Demo options (for client demos; may be removed in final) — landing marquee view mode */
  viewMode: "cases" | "measures";
  setViewMode: (v: "cases" | "measures") => void;
  marqueeView: "marquee" | "velocity";
  setMarqueeView: (v: "marquee" | "velocity") => void;
  demoCaseCount: number;
  demoMeasureCount: number;
  setDemoCounts: (counts: { cases: number; measures: number }) => void;
  /** Background effect for landing hero (demo only); persisted in localStorage 'hiveBackgroundEffect' */
  backgroundEffect: "none" | "particles" | "aurora" | "hero";
  setBackgroundEffect: (v: "none" | "particles" | "aurora" | "hero") => void;
  /** Hero text readability when background is Hero: gradient (steep) | scrim | backplate; persisted */
  heroTextTreatment: "gradient" | "scrim" | "backplate";
  setHeroTextTreatment: (v: "gradient" | "scrim" | "backplate") => void;
  /** Extent: gradient = steepness (%), scrim = blur px, backplate = radius px; 8–120; persisted */
  heroTextTreatmentExtent: number;
  setHeroTextTreatmentExtent: (v: number) => void;
};

const HandbookContext = createContext<HandbookContextType | null>(null);

const SESSION_INTENT_KEY = "hiveSessionIntent";
const BACKGROUND_EFFECT_KEY = "hiveBackgroundEffect";
const HERO_TEXT_TREATMENT_KEY = "hiveHeroTextTreatment";
const HERO_TEXT_EXTENT_KEY = "hiveHeroTextExtent";

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatContext, setChatContext] = useState("browse");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [briefIds, setBriefIds] = useState<string[]>([]);
  const [themeKey, setThemeKey] = useState<ThemeKey>("light");
  const [sessionIntent, setSessionIntentState] = useState("");
  const [retrievalMode, setRetrievalMode] = useState<
    "rag" | "fallback" | null
  >(null);
  const [suggestedCaseIds, setSuggestedCaseIds] = useState<string[]>([]);
  const [pendingFilterUpdate, setPendingFilterUpdate] = useState<
    Record<string, unknown> | null
  >(null);
  const [briefSections, setBriefSections] = useState<
    Array<{ section_key: string; content: string }> | null
  >(null);
  const [onBriefSectionUpdate, setOnBriefSectionUpdateRaw] = useState<
    ((key: string, content: string) => void) | null
  >(null);
  const [isThinking, setThinking] = useState(false);
  const [pendingBriefMessage, setPendingBriefMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cases" | "measures">("cases");
  const [marqueeView, setMarqueeView] = useState<"marquee" | "velocity">("marquee");
  const [demoCounts, setDemoCountsState] = useState({ cases: 0, measures: 0 });
  const setDemoCounts = useCallback((counts: { cases: number; measures: number }) => {
    setDemoCountsState(counts);
  }, []);

  const [backgroundEffect, setBackgroundEffectState] = useState<
    "none" | "particles" | "aurora" | "hero"
  >(() => {
    if (typeof window === "undefined") return "none";
    const stored = localStorage.getItem(BACKGROUND_EFFECT_KEY);
    return stored === "particles" || stored === "aurora" || stored === "hero" ? stored : "none";
  });
  const setBackgroundEffect = useCallback((v: "none" | "particles" | "aurora" | "hero") => {
    setBackgroundEffectState(v);
    if (typeof window !== "undefined") {
      localStorage.setItem(BACKGROUND_EFFECT_KEY, v);
    }
  }, []);

  const [heroTextTreatment, setHeroTextTreatmentState] = useState<
    "gradient" | "scrim" | "backplate"
  >(() => {
    if (typeof window === "undefined") return "gradient";
    const stored = localStorage.getItem(HERO_TEXT_TREATMENT_KEY);
    return stored === "scrim" || stored === "backplate" ? stored : "gradient";
  });
  const setHeroTextTreatment = useCallback((v: "gradient" | "scrim" | "backplate") => {
    setHeroTextTreatmentState(v);
    if (typeof window !== "undefined") {
      localStorage.setItem(HERO_TEXT_TREATMENT_KEY, v);
    }
  }, []);

  const [heroTextTreatmentExtent, setHeroTextTreatmentExtentState] = useState<number>(() => {
    if (typeof window === "undefined") return 24;
    const stored = localStorage.getItem(HERO_TEXT_EXTENT_KEY);
    const n = stored ? parseInt(stored, 10) : 24;
    return Number.isFinite(n) && n >= 8 && n <= 120 ? n : 24;
  });
  const setHeroTextTreatmentExtent = useCallback((v: number) => {
    const clamped = Math.round(Math.max(8, Math.min(120, v)));
    setHeroTextTreatmentExtentState(clamped);
    if (typeof window !== "undefined") {
      localStorage.setItem(HERO_TEXT_EXTENT_KEY, String(clamped));
    }
  }, []);

  const setOnBriefSectionUpdate = useCallback(
    (fn: ((key: string, content: string) => void) | null) => {
      setOnBriefSectionUpdateRaw(() => fn);
    },
    []
  );
  const theme = THEMES[themeKey];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(SESSION_INTENT_KEY);
    if (stored) setSessionIntentState(stored);
  }, []);

  const setSessionIntent = useCallback((intent: string) => {
    setSessionIntentState(intent);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_INTENT_KEY, intent);
    }
  }, []);

  const openChat = useCallback(
    (context?: string) => {
      if (context) setChatContext(context);
      setChatOpen(true);
    },
    []
  );

  const closeChat = useCallback(() => setChatOpen(false), []);

  const addToBrief = useCallback((id: string) => {
    setBriefIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const removeFromBrief = useCallback((id: string) => {
    setBriefIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clearBrief = useCallback(() => setBriefIds([]), []);

  return (
    <HandbookContext.Provider
      value={{
        chatOpen,
        chatContext,
        messages,
        setChatOpen,
        setChatContext,
        setMessages,
        openChat,
        closeChat,
        briefIds,
        addToBrief,
        removeFromBrief,
        clearBrief,
        themeKey,
        setThemeKey,
        theme,
        sessionIntent,
        setSessionIntent,
        retrievalMode,
        setRetrievalMode,
        suggestedCaseIds,
        setSuggestedCaseIds,
        pendingFilterUpdate,
        setPendingFilterUpdate,
        briefSections,
        setBriefSections,
        onBriefSectionUpdate,
        setOnBriefSectionUpdate,
        isThinking,
        setThinking,
        pendingBriefMessage,
        setPendingBriefMessage,
        viewMode,
        setViewMode,
        marqueeView,
        setMarqueeView,
        demoCaseCount: demoCounts.cases,
        demoMeasureCount: demoCounts.measures,
        setDemoCounts,
        backgroundEffect,
        setBackgroundEffect,
        heroTextTreatment,
        setHeroTextTreatment,
        heroTextTreatmentExtent,
        setHeroTextTreatmentExtent,
      }}
    >
      {children}
    </HandbookContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(HandbookContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}
