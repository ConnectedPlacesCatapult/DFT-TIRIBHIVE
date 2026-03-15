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
    const sb = getSupabaseClient();
    const batchParam = req.nextUrl.searchParams.get("batch");

    const { data: batchRows } = await sb
      .from("eval_runs")
      .select("run_batch")
      .order("run_batch", { ascending: false });

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

    let runs: unknown[] = [];
    const selectedBatch = batchParam ?? batches[0]?.run_batch;
    if (selectedBatch) {
      const { data: runRows, error } = await sb
        .from("eval_runs")
        .select("*")
        .eq("run_batch", selectedBatch)
        .order("test_id");
      if (!error) runs = runRows ?? [];
    }

    return NextResponse.json({
      batches,
      runs,
      selectedBatch: selectedBatch ?? null,
    });
  } catch (err) {
    console.error("[HIVE] Eval runs fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch eval runs" },
      { status: 500 }
    );
  }
}
