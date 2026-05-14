"use client";

import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  created_at: string;
  sentiment: string | null;
  category: string | null;
  user_message: string | null;
  page_url: string;
  trigger_source: string | null;
  chat_context: unknown;
  app_version: string | null;
};

type ApiResponse = {
  rows: Row[];
  total: number;
  summary: { positive: number; negative: number; unscored: number };
  page: number;
  limit: number;
};

function pathTail(url: string) {
  try {
    const u = new URL(url);
    const p = u.pathname;
    const parts = p.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : p;
  } catch {
    return url.slice(0, 40);
  }
}

export default function AdminFeedbackPage() {
  const [days, setDays] = useState<"7" | "30" | "all">("30");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({
        days,
        category,
        page: String(page),
        limit: "25",
      });
      const res = await fetch(`/api/admin/feedback?${q}`);
      if (res.status === 401) {
        window.location.href = `/admin/login?next=${encodeURIComponent("/admin/feedback")}`;
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [days, category, page]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 25;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <a href="/admin/status" style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>
          ← System status
        </a>
        <div style={{ width: 1, height: 16, background: "#e5e7eb" }} />
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Feedback</h1>
        <span style={{ fontSize: 12, color: "#6b7280" }}>{total} total</span>
        <form action="/api/admin/logout?redirect=/admin/login" method="post" style={{ marginLeft: "auto" }}>
          <button
            type="submit"
            style={{
              fontSize: 12,
              fontWeight: 600,
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Log out
          </button>
        </form>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16, alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>Period</span>
          {(["7", "30", "all"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setPage(1);
                setDays(d);
              }}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 8,
                border: days === d ? "2px solid #1d70b8" : "1px solid #e5e7eb",
                background: days === d ? "#eff6ff" : "#fff",
                cursor: "pointer",
              }}
            >
              {d === "all" ? "All time" : `Last ${d} days`}
            </button>
          ))}
        </div>

        {data && (
          <div
            style={{
              display: "flex",
              gap: 16,
              marginBottom: 16,
              fontSize: 13,
              flexWrap: "wrap",
            }}
          >
            <span>
              <strong>{total}</strong> submissions
            </span>
            <span style={{ color: "#059669" }}>👍 {data.summary.positive}</span>
            <span style={{ color: "#b91c1c" }}>👎 {data.summary.negative}</span>
            <span style={{ color: "#6b7280" }}>— {data.summary.unscored}</span>
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {["all", "bug", "wrong_answer", "suggestion", "other"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setPage(1);
                setCategory(c);
              }}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 9999,
                border: category === c ? "2px solid #1d70b8" : "1px solid #e5e7eb",
                background: category === c ? "#eff6ff" : "#fff",
                cursor: "pointer",
                textTransform: c === "all" ? "none" : "capitalize",
              }}
            >
              {c === "all" ? "All" : c.replace("_", " ")}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding: 12, background: "#fef2f2", color: "#991b1b", borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {loading && !data ? (
          <div style={{ color: "#9ca3af" }}>Loading…</div>
        ) : (
          <div style={{ overflowX: "auto", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                  <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>When</th>
                  <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Sentiment</th>
                  <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Category</th>
                  <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Message</th>
                  <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Page</th>
                  <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Trigger</th>
                  <th style={{ padding: 10, borderBottom: "1px solid #e5e7eb" }}>Context</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const msgShort = (r.user_message ?? "—").slice(0, 120);
                  const exp = expanded[r.id];
                  return (
                    <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: 10, whiteSpace: "nowrap", verticalAlign: "top" }}>
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: 10, verticalAlign: "top" }}>
                        {r.sentiment === "positive" ? "👍" : r.sentiment === "negative" ? "👎" : "—"}
                      </td>
                      <td style={{ padding: 10, verticalAlign: "top" }}>{r.category ?? "—"}</td>
                      <td style={{ padding: 10, verticalAlign: "top", maxWidth: 220 }}>
                        <button
                          type="button"
                          onClick={() => setExpanded((s) => ({ ...s, [r.id]: !exp }))}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            textAlign: "left",
                            color: "#1d70b8",
                            fontSize: 12,
                          }}
                        >
                          {exp ? r.user_message ?? "—" : `${msgShort}${(r.user_message?.length ?? 0) > 120 ? "…" : ""}`}
                        </button>
                      </td>
                      <td style={{ padding: 10, verticalAlign: "top" }} title={r.page_url}>
                        {pathTail(r.page_url)}
                      </td>
                      <td style={{ padding: 10, verticalAlign: "top" }}>
                        {r.trigger_source === "nav" ? "Nav" : r.trigger_source === "chat_message" ? "Chat" : "—"}
                      </td>
                      <td style={{ padding: 10, verticalAlign: "top", fontSize: 11, color: "#4b5563" }}>
                        {r.chat_context ? (
                          <pre style={{ margin: 0, whiteSpace: "pre-wrap", maxWidth: 280 }}>
                            {JSON.stringify(r.chat_context, null, 0).slice(0, exp ? 4000 : 200)}
                            {!exp && JSON.stringify(r.chat_context).length > 200 ? "…" : ""}
                          </pre>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center" }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff" }}
            >
              Previous
            </button>
            <span style={{ fontSize: 13 }}>
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff" }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
