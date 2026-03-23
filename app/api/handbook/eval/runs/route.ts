/**
 * GET /api/handbook/eval/runs
 * Query: ?batch=xxx (optional) — when provided, returns runs for that batch.
 * Always returns recent run_batch list for the dropdown.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";

export async function GET(req: NextRequest) {
  try {
    let sb;
    try {
      sb = getSupabaseClient();
    } catch (sbErr) {
      console.error("[HIVE] Eval runs: Supabase client init failed", sbErr);
      return NextResponse.json({
        batches: [],
        runs: [],
        selectedBatch: null,
        frozenTestIds: [],
        error: "Database not configured",
      });
    }

    const batchParam = req.nextUrl.searchParams.get("batch");
    const batchA = req.nextUrl.searchParams.get("batchA");
    const batchB = req.nextUrl.searchParams.get("batchB");
    const compareMode = batchA && batchB;

    const { data: batchRows, error: batchError } = await sb
      .from("eval_runs")
      .select("run_batch")
      .order("run_batch", { ascending: false });

    if (batchError) {
      console.error("[HIVE] Eval runs: batch list failed", batchError);
      return NextResponse.json({
        batches: [],
        runs: [],
        selectedBatch: null,
        frozenTestIds: [],
      });
    }

    const seen = new Set<string>();
    const batches: { run_batch: string; count?: number }[] = [];
    for (const row of batchRows ?? []) {
      const b = row.run_batch;
      if (b && !seen.has(b)) {
        seen.add(b);
        batches.push({ run_batch: b });
      }
      if (batches.length >= 5) break;
    }

    if (compareMode) {
      const [{ data: runsARows, error: errA }, { data: runsBRows, error: errB }] = await Promise.all([
        sb.from("eval_runs").select("*").eq("run_batch", batchA).order("test_id"),
        sb.from("eval_runs").select("*").eq("run_batch", batchB).order("test_id"),
      ]);
      const runsA = (errA ? [] : runsARows ?? []) as unknown[];
      const runsB = (errB ? [] : runsBRows ?? []) as unknown[];
      return NextResponse.json({
        batches,
        runsA,
        runsB,
        selectedBatch: batchA,
        frozenTestIds: [],
      });
    }

    let runs: unknown[] = [];
    let frozenTestIds: string[] = [];
    // Keep initial payload lightweight: only load full runs when a batch is explicitly requested.
    const selectedBatch = batchParam ?? null;
    if (selectedBatch) {
      const { data: runRows, error } = await sb
        .from("eval_runs")
        .select("*")
        .eq("run_batch", selectedBatch)
        .order("test_id");
      if (!error) runs = runRows ?? [];
      if (runs.length > 0) {
        const testIds = [...new Set((runs as { test_id: string }[]).map((r) => r.test_id))];
        const { data: frozenRows } = await sb
          .from("eval_cases")
          .select("test_id")
          .in("test_id", testIds)
          .eq("frozen", true);
        frozenTestIds = (frozenRows ?? []).map((r) => (r as { test_id: string }).test_id);
      }
    }

    return NextResponse.json({
      batches,
      runs,
      selectedBatch: selectedBatch ?? null,
      frozenTestIds,
    });
  } catch (err) {
    console.error("[HIVE] Eval runs fetch error:", err);
    return NextResponse.json({
      batches: [],
      runs: [],
      selectedBatch: null,
      frozenTestIds: [],
      error: err instanceof Error ? err.message : "Failed to fetch eval runs",
    });
  }
}
