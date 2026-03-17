/**
 * GET /api/handbook/cards/[trib_article_id]
 *
 * Returns the article_card row for the given trib_article_id.
 * If missing, returns { card: null }.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ trib_article_id: string }> }
) {
  try {
    const { trib_article_id } = await params;
    const sb = getSupabaseClient();

    const { data, error } = await sb
      .from("article_cards")
      .select("*")
      .eq("trib_article_id", trib_article_id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ card: data ?? null });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
