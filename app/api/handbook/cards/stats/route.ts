/**
 * GET /api/handbook/cards/stats
 *
 * Returns card generation statistics for the admin panel.
 */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";

export async function GET() {
  try {
    const sb = getSupabaseClient();

    const [
      { count: totalArticles },
      { data: cards },
    ] = await Promise.all([
      sb.from("articles").select("*", { count: "exact", head: true }),
      sb.from("article_cards").select("trib_article_id, project_title, generated_at, is_stale, evidence_quality"),
    ]);

    const cardList = (cards ?? []) as {
      trib_article_id: string;
      project_title: string | null;
      generated_at: string | null;
      is_stale: boolean;
      evidence_quality: string | null;
    }[];

    const staleCount = cardList.filter((c) => c.is_stale).length;

    return NextResponse.json({
      total_articles: totalArticles ?? 0,
      cards_generated: cardList.length,
      stale_count: staleCount,
      cards: cardList.map((c) => ({
        trib_id: c.trib_article_id,
        title: c.project_title ?? "—",
        generated_at: c.generated_at,
        stale: c.is_stale,
        quality: c.evidence_quality ?? "—",
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
