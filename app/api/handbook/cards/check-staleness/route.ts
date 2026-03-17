/**
 * GET /api/handbook/cards/check-staleness
 *
 * For each article with a card: recomputes MD5 of current chunks,
 * compares to stored content_hash. If different, marks is_stale = true.
 *
 * Returns { stale: [trib_article_ids] }
 */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabaseClient } from "@/lib/supabase/client";

function computeContentHash(chunks: { chunk_text: string }[]): string {
  const combined = chunks.map((c) => c.chunk_text).join("");
  return createHash("md5").update(combined).digest("hex");
}

export async function GET() {
  try {
    const sb = getSupabaseClient();

    const { data: cards, error: cardErr } = await sb
      .from("article_cards")
      .select("article_id, trib_article_id, content_hash");

    if (cardErr) {
      return NextResponse.json({ error: cardErr.message }, { status: 500 });
    }

    if (!cards || cards.length === 0) {
      return NextResponse.json({ stale: [] });
    }

    const stale: string[] = [];

    for (const card of cards) {
      const { data: chunks, error: chunkErr } = await sb
        .from("document_chunks")
        .select("chunk_text")
        .eq("article_id", card.article_id)
        .order("chunk_index");

      if (chunkErr || !chunks || chunks.length === 0) continue;

      const currentHash = computeContentHash(chunks);

      if (currentHash !== card.content_hash) {
        await sb
          .from("article_cards")
          .update({ is_stale: true })
          .eq("article_id", card.article_id);
        stale.push(card.trib_article_id);
      }
    }

    return NextResponse.json({ stale });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
