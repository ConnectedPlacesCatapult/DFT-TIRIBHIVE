import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyHiveAdminSessionToken, HIVE_ADMIN_COOKIE } from "@/lib/admin-session";
import { getFeedbackPool, hasAzureFeedbackConfig } from "@/lib/feedback-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FEEDBACK_DDL = `
CREATE TABLE IF NOT EXISTS hive.feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  sentiment       TEXT CHECK (sentiment IN ('positive', 'negative')),
  category        TEXT CHECK (category IN ('bug', 'wrong_answer', 'suggestion', 'other')),
  user_message    TEXT,
  CONSTRAINT feedback_user_message_len
    CHECK (user_message IS NULL OR char_length(user_message) <= 1000),
  page_url        TEXT NOT NULL,
  trigger_source  TEXT CHECK (trigger_source IN ('nav', 'chat_message')),
  chat_context    JSONB,
  user_id         TEXT,
  app_version     TEXT
);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON hive.feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_sentiment_idx  ON hive.feedback (sentiment);
CREATE INDEX IF NOT EXISTS feedback_category_idx   ON hive.feedback (category);
`;

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(HIVE_ADMIN_COOKIE)?.value;
  if (!verifyHiveAdminSessionToken(token)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!hasAzureFeedbackConfig()) {
    return NextResponse.json({ success: false, error: "Azure PostgreSQL is not configured (AZURE_POSTGRES_* env vars missing)" }, { status: 503 });
  }

  const pool = await getFeedbackPool();
  if (!pool) {
    return NextResponse.json({ success: false, error: "Could not connect to Azure PostgreSQL" }, { status: 503 });
  }

  try {
    await pool.query(FEEDBACK_DDL);
    const check = await pool.query(`SELECT to_regclass('hive.feedback') AS tbl`);
    const exists = !!check.rows[0]?.tbl;
    return NextResponse.json({ success: true, table_exists: exists });
  } catch (e) {
    console.error("[run-migration] error:", e);
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "unknown" }, { status: 500 });
  }
}
