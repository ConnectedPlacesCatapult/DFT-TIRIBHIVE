"use client";

import { useCallback, useEffect, useState } from "react";

type EvalRun = {
  id?: string;
  run_batch: string;
  eval_case_id: string;
  test_id: string;
  test_group?: string | null;
  mode: string;
  page: string;
  variant: string | null;
  response_text: string;
  retrieval_mode: string;
  response_ms: number;
  citation_count: number;
  admitted_no_data: boolean;
  proposed_update_fired: boolean;
};

type BatchInfo = { run_batch: string };

function truncate(s: string | null, max = 150) {
  if (!s) return "—";
  return s.length > max ? s.slice(0, max).trim() + "…" : s;
}

export default function AdminEvalsPage() {
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [runs, setRuns] = useState<EvalRun[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [runEvalLoading, setRunEvalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async (batch?: string) => {
    const url = batch
      ? `/api/handbook/eval/runs?batch=${encodeURIComponent(batch)}`
      : "/api/handbook/eval/runs";
    const res = await fetch(url);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || `HTTP ${res.status}`);
    }
    const data = await res.json();
    setBatches(data.batches ?? []);
    setRuns(data.runs ?? []);
    if (data.selectedBatch && !batch) setSelectedBatch(data.selectedBatch);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchRuns()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchRuns]);

  const onSelectBatch = (batch: string) => {
    setSelectedBatch(batch);
    setLoading(true);
    fetchRuns(batch).finally(() => setLoading(false));
  };

  const runNewEval = async () => {
    if (runEvalLoading) return;
    setRunEvalLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/handbook/eval/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Run failed");
      if (data.batch) {
        setSelectedBatch(data.batch);
        await fetchRuns(data.batch);
      } else {
        await fetchRuns();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
    } finally {
      setRunEvalLoading(false);
    }
  };

  const runsInBatch = runs as EvalRun[];
  const testGroups = [...new Set(runsInBatch.map((r) => r.test_group).filter(Boolean))] as string[];
  const testGroupsFiltered = testGroups.filter((g) => g !== "_");

  const abByGroup: Record<
    string,
    { A: { citations: number[]; ms: number[]; updates: number; admitted: number }; B: { citations: number[]; ms: number[]; updates: number; admitted: number } }
  > = {};
  for (const r of runsInBatch) {
    const g = r.test_group ?? "_";
    if (!abByGroup[g]) {
      abByGroup[g] = {
        A: { citations: [], ms: [], updates: 0, admitted: 0 },
        B: { citations: [], ms: [], updates: 0, admitted: 0 },
      };
    }
    const bucket = r.variant === "B" ? abByGroup[g].B : abByGroup[g].A;
    bucket.citations.push(r.citation_count);
    bucket.ms.push(r.response_ms);
    if (r.proposed_update_fired) bucket.updates += 1;
    if (r.admitted_no_data) bucket.admitted += 1;
  }

  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
      />
      <div
        style={{
          minHeight: "100vh",
          background: "#f9fafb",
          fontFamily: "'DM Sans', sans-serif",
          padding: "32px 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              marginBottom: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
                Eval runs
              </h1>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
                Auto-scored runs from hive.eval_runs. Select a batch or run the eval suite.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <a href="/admin/sources" style={{ fontSize: 12, color: "#1d70b8", textDecoration: "none", fontWeight: 500 }}>Source candidates</a>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>
                Batch:
              </label>
              <select
                value={selectedBatch ?? ""}
                onChange={(e) => onSelectBatch(e.target.value)}
                disabled={loading || batches.length === 0}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 13,
                  color: "#111827",
                  minWidth: 180,
                }}
              >
                {batches.length === 0 && (
                  <option value="">No batches yet</option>
                )}
                {batches.map((b) => (
                  <option key={b.run_batch} value={b.run_batch}>
                    {b.run_batch}
                  </option>
                ))}
              </select>
              <button
                onClick={runNewEval}
                disabled={runEvalLoading}
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "none",
                  background: runEvalLoading ? "#9ca3af" : "#1d70b8",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: runEvalLoading ? "not-allowed" : "pointer",
                }}
              >
                {runEvalLoading ? "Running…" : "Run eval suite"}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "16px 20px",
                borderRadius: 10,
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 14 }}>
              Loading…
            </div>
          )}

          {!loading && runsInBatch.length > 0 && (
            <>
              <div
                style={{
                  overflowX: "auto",
                  borderRadius: 12,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  marginBottom: 24,
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      {["test_id", "page", "variant", "retrieval", "ms", "citations", "update_fired", "admitted_no_data", "response"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "10px 14px",
                              textAlign: "left",
                              fontSize: 10,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              color: "#6b7280",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {runsInBatch.map((r, i) => (
                      <tr key={r.eval_case_id + i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#111827" }}>
                          {r.test_id}
                        </td>
                        <td style={{ padding: "10px 14px", color: "#374151" }}>{r.page}</td>
                        <td style={{ padding: "10px 14px", color: "#374151" }}>
                          {r.variant ?? "—"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 12,
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: r.retrieval_mode === "rag" ? "#059669" : "#d97706",
                              }}
                            />
                            {r.retrieval_mode}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", color: "#374151" }}>{r.response_ms}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span
                            style={{
                              fontWeight: 600,
                              color: r.citation_count > 0 ? "#059669" : "#b91c1c",
                            }}
                          >
                            {r.citation_count}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          {r.proposed_update_fired ? (
                            <span style={{ color: "#059669", fontWeight: 600 }}>✓</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          {r.admitted_no_data ? (
                            <span style={{ color: "#1d4ed8", fontSize: 12 }}>yes</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td
                          style={{
                            padding: "10px 14px",
                            fontSize: 12,
                            color: "#4b5563",
                            maxWidth: 320,
                            lineHeight: 1.4,
                          }}
                        >
                          {truncate(r.response_text, 150)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {testGroupsFiltered.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
                    A/B comparison
                  </h2>
                  {testGroupsFiltered.map((groupName) => {
                    const group = abByGroup[groupName];
                    if (!group) return null;
                    const a = group.A;
                    const b = group.B;
                    const aCount = a.citations.length;
                    const bCount = b.citations.length;
                    return (
                      <div
                        key={groupName}
                        style={{
                          background: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: 10,
                          overflow: "hidden",
                          marginBottom: 16,
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 14px",
                            background: "#f9fafb",
                            borderBottom: "1px solid #e5e7eb",
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#374151",
                          }}
                        >
                          GROUP: {groupName}
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead>
                            <tr style={{ background: "#f3f4f6" }}>
                              <th style={{ padding: "10px 14px", textAlign: "left", width: "33%" }}>
                                Metric
                              </th>
                              <th style={{ padding: "10px 14px", textAlign: "left", width: "33%" }}>
                                Variant A
                                {aCount > 0 && (
                                  <span style={{ fontWeight: 400, color: "#6b7280" }}>
                                    {" "}
                                    (n={aCount})
                                  </span>
                                )}
                              </th>
                              <th style={{ padding: "10px 14px", textAlign: "left", width: "33%" }}>
                                Variant B
                                {bCount > 0 && (
                                  <span style={{ fontWeight: 400, color: "#6b7280" }}>
                                    {" "}
                                    (n={bCount})
                                  </span>
                                )}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr style={{ borderTop: "1px solid #e5e7eb" }}>
                              <td style={{ padding: "10px 14px", color: "#4b5563" }}>Avg citations</td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                {aCount ? avg(a.citations).toFixed(1) : "—"}
                              </td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                {bCount ? avg(b.citations).toFixed(1) : "—"}
                              </td>
                            </tr>
                            <tr style={{ borderTop: "1px solid #e5e7eb" }}>
                              <td style={{ padding: "10px 14px", color: "#4b5563" }}>Avg latency (ms)</td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                {aCount ? Math.round(avg(a.ms)) : "—"}
                              </td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                {bCount ? Math.round(avg(b.ms)) : "—"}
                              </td>
                            </tr>
                            <tr style={{ borderTop: "1px solid #e5e7eb" }}>
                              <td style={{ padding: "10px 14px", color: "#4b5563" }}>Updates fired</td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                {aCount ? `${a.updates}/${aCount}` : "—"}
                              </td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                {bCount ? `${b.updates}/${bCount}` : "—"}
                              </td>
                            </tr>
                            <tr style={{ borderTop: "1px solid #e5e7eb" }}>
                              <td style={{ padding: "10px 14px", color: "#4b5563" }}>
                                Admitted no data
                              </td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                {aCount ? `${a.admitted}/${aCount}` : "—"}
                              </td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                {bCount ? `${b.admitted}/${bCount}` : "—"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {!loading && batches.length === 0 && !error && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", fontSize: 14 }}>
              No eval batches yet. Click &quot;Run new eval&quot; to run all 26 tests.
            </div>
          )}

          {!loading && batches.length > 0 && runsInBatch.length === 0 && selectedBatch && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280", fontSize: 13 }}>
              No runs in this batch.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
