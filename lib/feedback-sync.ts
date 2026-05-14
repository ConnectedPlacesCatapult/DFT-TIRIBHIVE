/**
 * Idempotent copy of hive.feedback from Azure PostgreSQL → Supabase (hive schema).
 * Requires HIVE_SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY) for upserts.
 */

import { getFeedbackPool, hasAzureFeedbackConfig } from "@/lib/feedback-db";

type FeedbackSyncRow = {
  id: string;
  created_at: string;
  sentiment: string | null;
  category: string | null;
  user_message: string | null;
  page_url: string;
  trigger_source: string | null;
  chat_context: unknown;
  user_id: string | null;
  app_version: string | null;
};

export type SyncFeedbackResult = {
  ok: boolean;
  upserted: number;
  error?: string;
};

export async function syncFeedbackAzureToSupabase(): Promise<SyncFeedbackResult> {
  if (!hasAzureFeedbackConfig()) {
    return { ok: false, upserted: 0, error: "Azure PostgreSQL is not configured" };
  }

  const supabaseUrl =
    process.env.HIVE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.HIVE_SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "";

  if (!supabaseUrl || !serviceKey) {
    return {
      ok: false,
      upserted: 0,
      error: "HIVE_SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY) is required for feedback sync",
    };
  }

  const pool = await getFeedbackPool();
  if (!pool) {
    return { ok: false, upserted: 0, error: "Could not connect to Azure PostgreSQL" };
  }

  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(supabaseUrl, serviceKey, { db: { schema: "hive" } });

  let upserted = 0;
  try {
    const { rows: rawRows } = await pool.query(
      `SELECT id, created_at, sentiment, category, user_message, page_url, trigger_source, chat_context, user_id, app_version
       FROM hive.feedback
       ORDER BY created_at ASC`
    );
    const rows = rawRows as FeedbackSyncRow[];

    const chunk = 80;
    for (let i = 0; i < rows.length; i += chunk) {
      const slice = rows.slice(i, i + chunk).map((r: FeedbackSyncRow) => ({
        id: r.id,
        created_at: r.created_at,
        sentiment: r.sentiment,
        category: r.category,
        user_message: r.user_message,
        page_url: r.page_url,
        trigger_source: r.trigger_source,
        chat_context: r.chat_context,
        user_id: r.user_id,
        app_version: r.app_version,
      }));
      const { error } = await sb.from("feedback").upsert(slice, { onConflict: "id" });
      if (error) {
        return { ok: false, upserted, error: error.message };
      }
      upserted += slice.length;
    }

    return { ok: true, upserted };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "sync_failed";
    return { ok: false, upserted, error: msg };
  }
}
