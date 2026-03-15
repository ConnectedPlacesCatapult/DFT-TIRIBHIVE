/**
 * GET /api/handbook/diagnostic/chunks
 *
 * Self-diagnostic: confirms the Supabase client is using schema "hive"
 * and that document_chunks returns rows. Open in browser or curl to verify Fix 1.
 *
 * Success: { ok: true, schema: "hive", chunks_returned: N, sample_article_ids: [...] }
 * Failure: { ok: false, error: "..." }
 */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";

export async function GET() {
  try {
    const sb = getSupabaseClient();

    const { data, error } = await sb
      .from("document_chunks")
      .select("article_id")
      .limit(500);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          schema: "hive",
          error: error.message,
          hint: "Check that document_chunks exists in the hive schema and Supabase env vars are set.",
        },
        { status: 200 }
      );
    }

    const count = data?.length ?? 0;
    const sampleIds = [...new Set((data ?? []).map((r) => r.article_id).filter(Boolean))].slice(0, 10);

    return NextResponse.json({
      ok: true,
      schema: "hive",
      chunks_returned: count,
      sample_article_ids: sampleIds,
      message:
        count > 0
          ? `Fix 1 confirmed: ${count} chunk(s) found. Brief generation will use real chunk data.`
          : "No chunks in document_chunks (hive schema). Brief generation will fall back to article metadata.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint: "Ensure HIVE_SUPABASE_URL and HIVE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_*) are set in .env",
      },
      { status: 200 }
    );
  }
}
