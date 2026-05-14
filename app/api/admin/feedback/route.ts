import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyHiveAdminSessionToken, HIVE_ADMIN_COOKIE } from "@/lib/admin-session";
import { getFeedbackPool, hasAzureFeedbackConfig, isPgUndefinedTable, type FeedbackRow } from "@/lib/feedback-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(HIVE_ADMIN_COOKIE)?.value;
  if (!verifyHiveAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAzureFeedbackConfig()) {
    return NextResponse.json(
      { error: "Azure PostgreSQL not configured", rows: [], total: 0, summary: { positive: 0, negative: 0, unscored: 0 } },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const daysParam = url.searchParams.get("days") ?? "30";
  const category = url.searchParams.get("category") ?? "all";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "25", 10) || 25));
  const offset = (page - 1) * limit;

  const pool = await getFeedbackPool();
  if (!pool) {
    return NextResponse.json(
      { error: "No database pool", rows: [], total: 0, summary: { positive: 0, negative: 0, unscored: 0 } },
      { status: 503 }
    );
  }

  const conditions: string[] = [];
  const params: unknown[] = [];
  let p = 1;

  if (daysParam === "7") {
    conditions.push(`created_at >= now() - interval '7 days'`);
  } else if (daysParam === "30") {
    conditions.push(`created_at >= now() - interval '30 days'`);
  } else if (daysParam !== "all") {
    conditions.push(`created_at >= now() - interval '30 days'`);
  }

  if (category && category !== "all" && ["bug", "wrong_answer", "suggestion", "other"].includes(category)) {
    conditions.push(`category = $${p++}`);
    params.push(category);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const countRes = await pool.query(`SELECT count(*)::int AS c FROM hive.feedback ${where}`, params);
    const total = countRes.rows[0]?.c ?? 0;

    const sumRes = await pool.query(
      `SELECT
        count(*) filter (where sentiment = 'positive')::int AS positive,
        count(*) filter (where sentiment = 'negative')::int AS negative,
        count(*) filter (where sentiment is null)::int AS unscored
       FROM hive.feedback ${where}`,
      params
    );
    const summary = sumRes.rows[0] as { positive: number; negative: number; unscored: number };

    const listParams = [...params, limit, offset];
    const limIdx = p++;
    const offIdx = p;
    const rowsRes = await pool.query(
      `SELECT id, created_at, sentiment, category, user_message, page_url, trigger_source, chat_context, user_id, app_version
       FROM hive.feedback ${where}
       ORDER BY created_at DESC
       LIMIT $${limIdx} OFFSET $${offIdx}`,
      listParams
    );

    const rows = rowsRes.rows as FeedbackRow[];
    return NextResponse.json({ rows, total, summary, page, limit });
  } catch (e) {
    console.error("[admin/feedback] query error:", e);
    if (isPgUndefinedTable(e)) {
      return NextResponse.json(
        {
          error: "feedback_table_missing",
          hint: "Run scripts/migrate-hive-feedback.sql on this Azure PostgreSQL server (schema hive).",
          rows: [],
          total: 0,
          summary: { positive: 0, negative: 0, unscored: 0 },
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "query_failed" }, { status: 500 });
  }
}
