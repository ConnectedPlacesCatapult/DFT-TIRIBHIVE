"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { FeedbackTriggerSource } from "./FeedbackTrigger";

const MAX_MSG = 1000;

export function FeedbackPanel({
  isOpen,
  onClose,
  triggerSource,
  initialSentiment,
  chatContext,
}: {
  isOpen: boolean;
  onClose: () => void;
  triggerSource: FeedbackTriggerSource;
  initialSentiment?: "positive" | "negative";
  chatContext?: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const pathname = usePathname();
  const backdropRef = useRef<HTMLDivElement>(null);
  const [sentiment, setSentiment] = useState<"positive" | "negative" | null>(null);
  const [category, setCategory] = useState<
    "bug" | "wrong_answer" | "suggestion" | "other" | ""
  >("");
  const [userMessage, setUserMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSentiment(initialSentiment ?? null);
    setCategory("");
    setUserMessage("");
    setToast(null);
  }, [isOpen, initialSentiment]);

  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (!isOpen) {
      prevPathRef.current = pathname;
      return;
    }
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      onClose();
    }
  }, [pathname, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      if (backdropRef.current && e.target === backdropRef.current) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen, onClose]);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const page_url =
      typeof window !== "undefined" ? window.location.href.slice(0, 4000) : "";
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentiment: sentiment ?? undefined,
          category: category || undefined,
          user_message: userMessage.trim() || undefined,
          page_url,
          trigger_source: triggerSource,
          chat_context: chatContext,
        }),
      });
      const data = (await res.json()) as { success?: boolean };
      if (data.success) {
        setToast("Thanks — feedback recorded.");
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch {
      /* silent */
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 620,
        background: "rgba(15,23,42,0.35)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: 24,
      }}
    >
      <div
        role="dialog"
        aria-labelledby="feedback-panel-title"
        style={{
          width: "min(420px, 100%)",
          maxHeight: "85vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
          border: "1px solid #e5e7eb",
          padding: "18px 18px 16px",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2
          id="feedback-panel-title"
          style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "#111827" }}
        >
          Share feedback
        </h2>
        <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: "#6b7280" }}>
          Help us improve HIVE — report errors, flag wrong answers, or share what worked. We
          review all feedback to refine the system.
        </p>

        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setSentiment((s) => (s === "positive" ? null : "positive"))}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 8,
              border: sentiment === "positive" ? "2px solid #059669" : "1px solid #d1d5db",
              background: sentiment === "positive" ? "#ecfdf5" : "#fff",
              cursor: "pointer",
            }}
          >
            👍 Helpful
          </button>
          <button
            type="button"
            onClick={() => setSentiment((s) => (s === "negative" ? null : "negative"))}
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 8,
              border: sentiment === "negative" ? "2px solid #b91c1c" : "1px solid #d1d5db",
              background: sentiment === "negative" ? "#fef2f2" : "#fff",
              cursor: "pointer",
            }}
          >
            👎 Not helpful
          </button>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>
          Category
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {(
            [
              ["bug", "Bug"],
              ["wrong_answer", "Wrong answer"],
              ["suggestion", "Suggestion"],
              ["other", "Other"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory((c) => (c === key ? "" : key))}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "5px 10px",
                borderRadius: 9999,
                border: category === key ? "2px solid #1d70b8" : "1px solid #e5e7eb",
                background: category === key ? "#eff6ff" : "#f9fafb",
                cursor: "pointer",
                color: "#374151",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>
          Details (optional)
        </label>
        <textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value.slice(0, MAX_MSG))}
          placeholder="Describe what happened or what you'd like to see..."
          rows={4}
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontSize: 13,
            padding: "8px 10px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            resize: "vertical",
            marginBottom: 4,
          }}
        />
        <div style={{ fontSize: 10, color: "#9ca3af", textAlign: "right", marginBottom: 12 }}>
          {userMessage.length}/{MAX_MSG}
        </div>

        {toast && (
          <div
            role="status"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#065f46",
              background: "#ecfdf5",
              border: "1px solid #bbf7d0",
              padding: "8px 10px",
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            {toast}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: submitting ? "#9ca3af" : "#1d70b8",
              color: "#fff",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Sending…" : "Send feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}
