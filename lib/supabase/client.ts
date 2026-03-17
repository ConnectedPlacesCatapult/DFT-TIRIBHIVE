/**
 * Shared Supabase client for HIVE.
 * All HIVE data lives in the Postgres schema "hive" — the client must request it
 * explicitly or queries to document_chunks, articles, etc. return 0 rows.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const url =
    process.env.HIVE_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.HIVE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase URL and anon key are required (HIVE_SUPABASE_* or NEXT_PUBLIC_SUPABASE_*)");
  }

  _client = createClient(url, key, {
    db: { schema: "hive" },
  }) as unknown as SupabaseClient;

  if (
    process.env.NODE_ENV !== "production" ||
    process.env.HIVE_VERBOSE_STARTUP === "true"
  ) {
    console.log("[HIVE] ─────────────────────────────────");
    console.log(
      "[HIVE] Data provider:",
      process.env.DATA_PROVIDER ?? "json (default — no Supabase)"
    );
    console.log(
      "[HIVE] Supabase URL:",
      process.env.HIVE_SUPABASE_URL ? "✓ set" : "✗ MISSING"
    );
    console.log(
      "[HIVE] OpenAI key:",
      process.env.OPENAI_API_KEY ? "✓ set" : "✗ MISSING — chat will use mock responses"
    );
    console.log("[HIVE] ─────────────────────────────────");
  }

  return _client;
}
