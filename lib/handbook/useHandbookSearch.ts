// @ts-nocheck
"use client";
import { useEffect, useRef, useState } from "react";
import { useChatContext } from "@/components/handbook/shared/ChatContext";

export type SemanticResult = {
  article_id: string;
  similarity: number;
  section_key: string;
};

const CONVERSATIONAL_RE =
  /^(h(i|ello|ey)|how are you|how do(es)? (you|this|hive|it) work|what (can|do) you do|help me|what is hive|tell me about|who are you|good (morning|afternoon|evening)|thanks|thank you|help$)/i;

export function isConversationalQuery(q: string): boolean {
  return CONVERSATIONAL_RE.test(q.trim());
}

/**
 * Shared hook providing:
 *  - Debounced semantic search (600ms, min 5 chars)
 *  - Session intent debounce (400ms, 5+ chars)
 *  - routeQueryToChat (sends query + resultSet to /api/handbook/chat, opens panel)
 *
 * Reads from ChatContext internally; caller supplies `query` and `resultSet`.
 */
export function useHandbookSearch(query: string) {
  const {
    setSessionIntent,
    openChat,
    setMessages,
    setThinking,
    setRetrievalMode,
    resultSet,
    semanticChunks,
    setSemanticChunks,
  } = useChatContext();

  const [semanticResults, setSemanticResults] = useState<SemanticResult[]>([]);
  const [semanticScenario, setSemanticScenario] = useState<string | null>(null);
  const [semanticPrompt, setSemanticPrompt] = useState<string | null>(null);

  // ── Semantic search debounce ──────────────────────────────────────────────
  const semanticTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (semanticTimerRef.current) clearTimeout(semanticTimerRef.current);
    if (!query.trim() || query.trim().length < 3) {
      setSemanticPrompt(null);
      setSemanticScenario(null);
      setSemanticResults([]);
      setSemanticChunks([]);
      return;
    }
    semanticTimerRef.current = setTimeout(async () => {
      const trimmed = query.trim();
      if (isConversationalQuery(trimmed)) {
        setSemanticPrompt(null);
        setSemanticScenario(null);
        return;
      }
      if (trimmed.length < 5) return;
      try {
        const res = await fetch(
          `/api/handbook/semantic-search?q=${encodeURIComponent(trimmed)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        setSemanticScenario(data.scenario);
        setSemanticResults(data.results ?? []);
        // Store chunks so the chat panel can reuse the same retrieval (one search, two interfaces)
        const chunks = (data.results ?? [])
          .filter((r: SemanticResult & { chunk_text?: string }) => r.chunk_text)
          .map((r: SemanticResult & { chunk_text: string }) => ({
            article_id: r.article_id,
            section_key: r.section_key,
            chunk_text: r.chunk_text,
          }));
        setSemanticChunks(chunks);
        if (data.scenario === "B" && data.results?.length > 0) {
          const topIds = (data.results as SemanticResult[]).slice(0, 3).map((r) => r.article_id);
          setSemanticPrompt(
            `Found ${topIds.length} relevant cases — want me to explain how they apply? [Ask HIVE →]`
          );
        } else {
          setSemanticPrompt(null);
        }
      } catch {
        setSemanticResults([]);
        setSemanticChunks([]);
      }
    }, 600);
    return () => {
      if (semanticTimerRef.current) clearTimeout(semanticTimerRef.current);
    };
  }, [query]);

  // ── Session intent debounce ───────────────────────────────────────────────
  const intentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (intentTimerRef.current) clearTimeout(intentTimerRef.current);
    if (query.trim().length < 5) return;
    intentTimerRef.current = setTimeout(() => {
      setSessionIntent(query.trim());
    }, 400);
    return () => {
      if (intentTimerRef.current) clearTimeout(intentTimerRef.current);
    };
  }, [query, setSessionIntent]);

  // ── Route query to chat panel ─────────────────────────────────────────────
  const chatRoutingRef = useRef(false);
  async function routeQueryToChat(q: string) {
    if (chatRoutingRef.current) return;
    chatRoutingRef.current = true;
    openChat("browse");
    const userMsg = { role: "user" as const, text: q };
    const placeholder = { role: "ai" as const, text: "" };
    setMessages([userMsg, placeholder]);
    setThinking(true);
    try {
      const res = await fetch("/api/handbook/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", text: q }],
          context: "browse",
          session_intent: q,
          result_set: resultSet.length > 0 ? resultSet : undefined,
          result_chunks: semanticChunks.length > 0 ? semanticChunks : undefined,
        }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      setThinking(false); // hide spinner once stream starts

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.token !== undefined) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "ai") {
                  updated[updated.length - 1] = { ...last, text: last.text + data.token };
                }
                return updated;
              });
            } else if (data.done) {
              if (data.retrieval_mode) setRetrievalMode(data.retrieval_mode);
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "ai") {
                  updated[updated.length - 1] = {
                    role: "ai",
                    text: data.text ?? last.text,
                    chips: data.chips,
                    gap: data.gap,
                    actions: data.actions,
                    sources: data.sources,
                    retrieval_mode: data.retrieval_mode,
                    action: data.action,
                    actionDismissed: false,
                  };
                }
                return updated;
              });
            }
          } catch { /* skip malformed SSE line */ }
        }
      }
    } catch {
      setMessages([userMsg, { role: "ai" as const, text: "Something went wrong. Please try again." }]);
    } finally {
      setThinking(false);
      chatRoutingRef.current = false;
    }
  }

  return {
    semanticResults,
    semanticScenario,
    semanticPrompt,
    routeQueryToChat,
  };
}
