"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  word_count?: number | null;
  mentions_brief?: boolean | null;
  expected_signals?: { max_words?: number } | null;
  reviewer_relevance?: number | null;
  reviewer_accuracy?: number | null;
  reviewer_reasoning?: string | null;
};

type BatchInfo = { run_batch: string };

function truncate(s: string | null, max = 150) {
  if (!s) return "—";
  return s.length > max ? s.slice(0, max).trim() + "…" : s;
}

function reviewerScoreColor(n: number | null | undefined): string {
  if (n == null) return "#9ca3af";
  if (n <= 2) return "#b91c1c";
  if (n === 3) return "#d97706";
  return "#059669";
}

export default function AdminEvalsPage() {
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [runs, setRuns] = useState<EvalRun[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedBatchA, setSelectedBatchA] = useState<string | null>(null);
  const [selectedBatchB, setSelectedBatchB] = useState<string | null>(null);
  const [runsA, setRunsA] = useState<EvalRun[] | null>(null);
  const [runsB, setRunsB] = useState<EvalRun[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [runEvalLoading, setRunEvalLoading] = useState(false);
  const [lastRunMessage, setLastRunMessage] = useState<string | null>(null);
  const [includeFrozen, setIncludeFrozen] = useState(false);
  const [frozenTestIds, setFrozenTestIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [runProgress, setRunProgress] = useState<{ batch: string; total: number | null } | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRuns = useCallback(async (batch?: string) => {
    const url = batch
      ? `/api/handbook/eval/runs?batch=${encodeURIComponent(batch)}`
      : "/api/handbook/eval/runs";
    // Only timeout when loading a specific batch (large payload). Initial load stays open.
    const controller = new AbortController();
    const timeoutId = batch ? setTimeout(() => controller.abort(), 15000) : null;
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (timeoutId) clearTimeout(timeoutId);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setBatches(data.batches ?? []);
      setRuns(data.runs ?? []);
      setFrozenTestIds(new Set((data.frozenTestIds as string[] | undefined) ?? []));
      if (data.selectedBatch && !batch) setSelectedBatch(data.selectedBatch);
      if (data.error) setError(data.error);
    } catch (e) {
      if (timeoutId) clearTimeout(timeoutId);
      if ((e as Error).name === "AbortError") {
        setError("Request timed out. Try selecting a batch again or run the eval suite.");
        // Don't clear batches so dropdowns stay usable
      } else {
        throw e;
      }
    }
  }, []);

  useEffect(() => {
    setError(null);
    setLoading(true);
    fetchRuns()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchRuns]);

  useEffect(() => {
    const a = selectedBatchA;
    const b = selectedBatchB;
    if (!a && !b) return;
    if (!batches.length) return;
    setLoading(true);
    setError(null);
    if (a && b) {
      fetch(
        `/api/handbook/eval/runs?batchA=${encodeURIComponent(a)}&batchB=${encodeURIComponent(b)}`
      )
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
        .then((data) => {
          setRunsA((data.runsA ?? []) as EvalRun[]);
          setRunsB((data.runsB ?? []) as EvalRun[]);
          setRuns([]);
          setSelectedBatch(null);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    } else {
      const batch = a || b || null;
      if (batch) {
        fetchRuns(batch)
          .then(() => {
            setSelectedBatch(batch);
            setRunsA(null);
            setRunsB(null);
          })
          .catch((e) => setError(e.message))
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, [selectedBatchA, selectedBatchB, fetchRuns, batches.length]);

  const onSelectBatch = (batch: string) => {
    setSelectedBatch(batch);
    setLoading(true);
    fetchRuns(batch).finally(() => setLoading(false));
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const runNewEval = async () => {
    if (runEvalLoading) return;
    const batchName = "prompt-v2";
    setRunEvalLoading(true);
    setError(null);
    setLastRunMessage(null);
    setRunProgress({ batch: batchName, total: null });
    setSelectedBatch(batchName);
    setRuns([]);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/handbook/eval/runs?batch=${encodeURIComponent(batchName)}`);
        if (!res.ok) return;
        const data = await res.json();
        setRuns(data.runs ?? []);
        setFrozenTestIds(new Set((data.frozenTestIds as string[] | undefined) ?? []));
      } catch {
        // ignore poll errors
      }
    }, 2500);
    try {
      const res = await fetch("/api/handbook/eval/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: batchName, include_frozen: includeFrozen }),
      });
      const data = await res.json();
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      const total = data.total_planned ?? data.total ?? null;
      if (total != null) setRunProgress((p) => (p ? { ...p, total } : null));
      if (!res.ok) throw new Error(data.error || "Run failed");
      if (data.batch) {
        setSelectedBatch(data.batch);
        await fetchRuns(data.batch);
      } else {
        await fetchRuns();
      }
      setLastRunMessage(data.total != null ? `Ran ${data.total} cases` : null);
      setRunProgress(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
      setRunProgress(null);
    } finally {
      setRunEvalLoading(false);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  };

  const runWeakEval = async () => {
    if (runEvalLoading) return;
    const batchName = "prompt-v2-weak";
    setRunEvalLoading(true);
    setError(null);
    setLastRunMessage(null);
    setRunProgress({ batch: batchName, total: null });
    setSelectedBatch(batchName);
    setRuns([]);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/handbook/eval/runs?batch=${encodeURIComponent(batchName)}`);
        if (!res.ok) return;
        const data = await res.json();
        setRuns(data.runs ?? []);
        setFrozenTestIds(new Set((data.frozenTestIds as string[] | undefined) ?? []));
      } catch {
        // ignore poll errors
      }
    }, 2500);
    try {
      const res = await fetch("/api/handbook/eval/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: batchName, weak_only: true, include_frozen: includeFrozen }),
      });
      const data = await res.json();
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      const total = data.total_planned ?? data.total ?? null;
      if (total != null) setRunProgress((p) => (p ? { ...p, total } : null));
      if (!res.ok) throw new Error(data.error || "Run failed");
      if (data.batch) {
        setSelectedBatch(data.batch);
        await fetchRuns(data.batch);
      } else {
        await fetchRuns();
      }
      if (data.weak_count != null && data.skipped != null) {
        setLastRunMessage(`Ran ${data.weak_count} weak cases (${data.skipped} skipped)`);
      } else if (data.total != null) {
        setLastRunMessage(`Ran ${data.total} cases`);
      }
      setRunProgress(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Run failed");
      setRunProgress(null);
    } finally {
      setRunEvalLoading(false);
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
  };

  const runsInBatch = runs as EvalRun[];
  const testGroups = [...new Set(runsInBatch.map((r) => r.test_group).filter(Boolean))] as string[];
  const testGroupsFiltered = testGroups.filter((g) => g !== "_");

  const abByGroup: Record<
    string,
    {
      A: { citations: number[]; ms: number[]; updates: number; admitted: number; relevance: number[]; accuracy: number[] };
      B: { citations: number[]; ms: number[]; updates: number; admitted: number; relevance: number[]; accuracy: number[] };
    }
  > = {};
  for (const r of runsInBatch) {
    const g = r.test_group ?? "_";
    if (!abByGroup[g]) {
      abByGroup[g] = {
        A: { citations: [], ms: [], updates: 0, admitted: 0, relevance: [], accuracy: [] },
        B: { citations: [], ms: [], updates: 0, admitted: 0, relevance: [], accuracy: [] },
      };
    }
    const bucket = r.variant === "B" ? abByGroup[g].B : abByGroup[g].A;
    bucket.citations.push(r.citation_count);
    bucket.ms.push(r.response_ms);
    if (r.proposed_update_fired) bucket.updates += 1;
    if (r.admitted_no_data) bucket.admitted += 1;
    if (r.reviewer_relevance != null) bucket.relevance.push(r.reviewer_relevance);
    if (r.reviewer_accuracy != null) bucket.accuracy.push(r.reviewer_accuracy);
  }

  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

  // Comparison view: merge runsA and runsB by test_id
  const compareMode = runsA != null && runsB != null;
  const runByA = new Map<string, EvalRun>();
  const runByB = new Map<string, EvalRun>();
  if (runsA) for (const r of runsA) runByA.set(r.test_id, r);
  if (runsB) for (const r of runsB) runByB.set(r.test_id, r);
  const allCompareTestIds = compareMode
    ? [...new Set([...(runsA ?? []).map((r) => r.test_id), ...(runsB ?? []).map((r) => r.test_id)])].sort()
    : [];
  let compareSummary: { avgRelA: number; avgAccA: number; avgRelB: number; avgAccB: number; improved: number; regressed: number; unchanged: number } | null = null;
  if (compareMode && allCompareTestIds.length > 0) {
    const relA: number[] = [];
    const accA: number[] = [];
    const relB: number[] = [];
    const accB: number[] = [];
    let improved = 0;
    let regressed = 0;
    let unchanged = 0;
    for (const tid of allCompareTestIds) {
      const ra = runByA.get(tid);
      const rb = runByB.get(tid);
      if (ra?.reviewer_relevance != null) relA.push(ra.reviewer_relevance);
      if (ra?.reviewer_accuracy != null) accA.push(ra.reviewer_accuracy);
      if (rb?.reviewer_relevance != null) relB.push(rb.reviewer_relevance);
      if (rb?.reviewer_accuracy != null) accB.push(rb.reviewer_accuracy);
      const avgA = ra && (ra.reviewer_relevance != null || ra.reviewer_accuracy != null)
        ? (([ra.reviewer_relevance, ra.reviewer_accuracy].filter((n) => n != null) as number[]).reduce((s, n) => s + n, 0) / ([ra.reviewer_relevance, ra.reviewer_accuracy].filter((n) => n != null) as number[]).length)
        : null;
      const avgB = rb && (rb.reviewer_relevance != null || rb.reviewer_accuracy != null)
        ? (([rb.reviewer_relevance, rb.reviewer_accuracy].filter((n) => n != null) as number[]).reduce((s, n) => s + n, 0) / ([rb.reviewer_relevance, rb.reviewer_accuracy].filter((n) => n != null) as number[]).length)
        : null;
      if (avgA != null && avgB != null) {
        if (avgB > avgA) improved++;
        else if (avgB < avgA) regressed++;
        else unchanged++;
      }
    }
    compareSummary = {
      avgRelA: avg(relA),
      avgAccA: avg(accA),
      avgRelB: avg(relB),
      avgAccB: avg(accB),
      improved,
      regressed,
      unchanged,
    };
  }

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
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <a href="/admin/sources" style={{ fontSize: 12, color: "#1d70b8", textDecoration: "none", fontWeight: 500 }}>Source candidates</a>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#374151", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={includeFrozen}
                  onChange={(e) => setIncludeFrozen(e.target.checked)}
                />
                Include frozen
              </label>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Batch A:</label>
              <select
                value={selectedBatchA ?? selectedBatch ?? ""}
                onChange={(e) => setSelectedBatchA(e.target.value || null)}
                disabled={loading}
                aria-label="Select batch A"
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 13,
                  color: "#111827",
                  minWidth: 160,
                }}
              >
                <option value="">—</option>
                {batches.map((b) => (
                  <option key={b.run_batch} value={b.run_batch}>{b.run_batch}</option>
                ))}
              </select>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Batch B:</label>
              <select
                value={selectedBatchB ?? ""}
                onChange={(e) => setSelectedBatchB(e.target.value || null)}
                disabled={loading}
                aria-label="Select batch B"
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  fontSize: 13,
                  color: "#111827",
                  minWidth: 160,
                }}
              >
                <option value="">—</option>
                {batches.map((b) => (
                  <option key={b.run_batch} value={b.run_batch}>{b.run_batch}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => runNewEval()}
                disabled={runEvalLoading}
                aria-label="Run full eval suite"
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
              <button
                type="button"
                onClick={() => runWeakEval()}
                disabled={runEvalLoading}
                aria-label="Run weak cases only"
                style={{
                  padding: "8px 16px",
                  borderRadius: 6,
                  border: "1px solid #1d70b8",
                  background: "#fff",
                  color: "#1d70b8",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: runEvalLoading ? "not-allowed" : "pointer",
                }}
              >
                Run weak cases
              </button>
            </div>
          </div>

          {runProgress && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: "#1d70b8", marginBottom: 6 }}>
                Running eval… {runs.length}{runProgress.total != null ? ` / ${runProgress.total}` : ""} cases
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "#e5e7eb",
                  overflow: "hidden",
                  maxWidth: 320,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: runProgress.total != null && runProgress.total > 0
                      ? `${Math.min(100, (runs.length / runProgress.total) * 100)}%`
                      : "30%",
                    background: "#1d70b8",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}

          {lastRunMessage && !runProgress && (
            <div style={{ fontSize: 13, color: "#059669", marginBottom: 12 }}>
              {lastRunMessage}
            </div>
          )}

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

          {loading && batches.length === 0 && (
            <div style={{ textAlign: "center", padding: "24px 0", color: "#6b7280", fontSize: 13 }}>
              Loading batches…
            </div>
          )}

          {!loading && batches.length === 0 && !error && (
            <div style={{ padding: "20px 24px", background: "#f0f9ff", borderRadius: 10, border: "1px solid #bae6fd", color: "#0c4a6e", fontSize: 13, marginBottom: 16 }}>
              No batches yet. Click <strong>Run eval suite</strong> to run the full eval and create the first batch (this may take several minutes).
            </div>
          )}

          {!loading && compareMode && allCompareTestIds.length > 0 && compareSummary && (
            <>
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  background: "#f0f9ff",
                  borderRadius: 10,
                  border: "1px solid #bae6fd",
                  fontSize: 13,
                  color: "#0c4a6e",
                }}
              >
                Batch A avg: rel {compareSummary.avgRelA.toFixed(1)}, acc {compareSummary.avgAccA.toFixed(1)} — Batch B avg: rel {compareSummary.avgRelB.toFixed(1)}, acc {compareSummary.avgAccB.toFixed(1)} — Improved: {compareSummary.improved} | Regressed: {compareSummary.regressed} | Unchanged: {compareSummary.unchanged}
              </div>
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
                      {["test_id", "page", "A: Rel", "A: Acc", "A: citations", "B: Rel", "B: Acc", "B: citations", "Delta"].map((h) => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280", whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allCompareTestIds.map((testId) => {
                      const ra = runByA.get(testId);
                      const rb = runByB.get(testId);
                      const relA = ra?.reviewer_relevance ?? null;
                      const accA = ra?.reviewer_accuracy ?? null;
                      const relB = rb?.reviewer_relevance ?? null;
                      const accB = rb?.reviewer_accuracy ?? null;
                      const avgA = relA != null && accA != null ? (relA + accA) / 2 : (relA ?? accA);
                      const avgB = relB != null && accB != null ? (relB + accB) / 2 : (relB ?? accB);
                      let delta: "up" | "down" | "same" = "same";
                      if (avgA != null && avgB != null) {
                        if (avgB > avgA) delta = "up";
                        else if (avgB < avgA) delta = "down";
                      }
                      const cellStyle = (aVal: number | null | undefined, bVal: number | null | undefined) => {
                        if (aVal == null || bVal == null) return {};
                        if (bVal > aVal) return { background: "#dcfce7" };
                        if (bVal < aVal) return { background: "#fee2e2" };
                        return {};
                      };
                      return (
                        <tr key={testId} style={{ borderBottom: "1px solid #f3f4f6" }}>
                          <td style={{ padding: "10px 14px", fontWeight: 600, color: "#111827" }}>{testId}</td>
                          <td style={{ padding: "10px 14px", color: "#374151" }}>{ra?.page ?? rb?.page ?? "—"}</td>
                          <td style={{ padding: "10px 14px", color: reviewerScoreColor(relA) }}>{relA != null ? relA : "—"}</td>
                          <td style={{ padding: "10px 14px", color: reviewerScoreColor(accA) }}>{accA != null ? accA : "—"}</td>
                          <td style={{ padding: "10px 14px" }}>{ra?.citation_count ?? "—"}</td>
                          <td style={{ padding: "10px 14px", ...cellStyle(relA ?? undefined, relB ?? undefined), color: reviewerScoreColor(relB) }}>{relB != null ? relB : "—"}</td>
                          <td style={{ padding: "10px 14px", ...cellStyle(accA ?? undefined, accB ?? undefined), color: reviewerScoreColor(accB) }}>{accB != null ? accB : "—"}</td>
                          <td style={{ padding: "10px 14px", ...cellStyle(ra?.citation_count, rb?.citation_count) }}>{rb?.citation_count ?? "—"}</td>
                          <td style={{ padding: "10px 14px", color: delta === "up" ? "#059669" : delta === "down" ? "#b91c1c" : "#6b7280", fontWeight: 600 }}>
                            {delta === "up" ? "↑" : delta === "down" ? "↓" : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!loading && !compareMode && runsInBatch.length > 0 && (
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
                      {["test_id", "page", "variant", "retrieval", "ms", "words", "citations", "update_fired", "admitted_no_data", "Rel", "Acc", "response"].map(
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
                    {runsInBatch.map((r, i) => {
                      const maxWords = r.expected_signals?.max_words;
                      const wordCount = r.word_count ?? (r.response_text?.trim().split(/\s+/).filter(Boolean).length ?? 0);
                      const exceedsMaxWords = typeof maxWords === "number" && wordCount > maxWords;
                      return (
                      <tr
                        key={r.eval_case_id + i}
                        style={{
                          borderBottom: "1px solid #f3f4f6",
                          ...(exceedsMaxWords ? { background: "#fef2f2" } : {}),
                        }}
                      >
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#111827" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            {r.test_id}
                            {frozenTestIds.has(r.test_id) && (
                              <span title="Passed 3+ consecutive runs — frozen" style={{ fontSize: 14, opacity: 0.8 }}>❄</span>
                            )}
                          </span>
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
                        <td
                          style={{
                            padding: "10px 14px",
                            color: exceedsMaxWords ? "#b91c1c" : "#374151",
                            fontWeight: exceedsMaxWords ? 600 : 400,
                          }}
                          title={typeof maxWords === "number" ? `max_words: ${maxWords}` : undefined}
                        >
                          {wordCount}
                        </td>
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
                          style={{ padding: "10px 14px", fontWeight: 600, color: reviewerScoreColor(r.reviewer_relevance) }}
                          title={r.reviewer_reasoning ?? undefined}
                        >
                          {r.reviewer_relevance != null ? r.reviewer_relevance : "—"}
                        </td>
                        <td
                          style={{ padding: "10px 14px", fontWeight: 600, color: reviewerScoreColor(r.reviewer_accuracy) }}
                          title={r.reviewer_reasoning ?? undefined}
                        >
                          {r.reviewer_accuracy != null ? r.reviewer_accuracy : "—"}
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
                    );
                    })}
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
                            <tr style={{ borderTop: "1px solid #e5e7eb" }}>
                              <td style={{ padding: "10px 14px", color: "#4b5563" }}>Avg relevance</td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                {a.relevance.length ? avg(a.relevance).toFixed(1) : "—"}
                              </td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                {b.relevance.length ? avg(b.relevance).toFixed(1) : "—"}
                              </td>
                            </tr>
                            <tr style={{ borderTop: "1px solid #e5e7eb" }}>
                              <td style={{ padding: "10px 14px", color: "#4b5563" }}>Avg accuracy</td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                {a.accuracy.length ? avg(a.accuracy).toFixed(1) : "—"}
                              </td>
                              <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                {b.accuracy.length ? avg(b.accuracy).toFixed(1) : "—"}
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
