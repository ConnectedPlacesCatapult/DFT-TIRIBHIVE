/**
 * GET /api/handbook/eval/diagnostic-chunks?ids=ID_06,ID_11,ID_16
 *
 * Returns chunk previews for given trib_article_ids (e.g. heat-stress-relevant cases).
 * Use to verify that ID_06, ID_11, ID_16 have chunk content and embeddings before
 * debugging explore_02 retrieval. Default: ID_06, ID_11, ID_16.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";

const DEFAULT_IDS = ["ID_06", "ID_11", "ID_16"];

export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids")?.trim();
  const ids = idsParam ? idsParam.split(",").map((s) => s.trim()).filter(Boolean) : DEFAULT_IDS;

  if (ids.length === 0) {
    return NextResponse.json({ error: "No ids provided" }, { status: 400 });
  }

  try {
    const sb = getSupabaseClient();

    const { data: articles, error: artErr } = await sb
      .from("articles")
      .select("id, trib_article_id, project_title")
      .in("trib_article_id", ids);

    if (artErr || !articles?.length) {
      return NextResponse.json({
        error: artErr?.message ?? "No articles found",
        requested: ids,
      }, { status: 200 });
    }

    const uuidList = articles.map((a) => a.id);
    const tribByUuid = new Map(articles.map((a) => [a.id, { trib_article_id: a.trib_article_id, project_title: a.project_title ?? "" }]));

    const { data: chunks, error: chunkErr } = await sb
      .from("document_chunks")
      .select("article_id, section_key, chunk_index, chunk_text")
      .in("article_id", uuidList)
      .order("article_id")
      .order("chunk_index", { ascending: true });

    if (chunkErr) {
      return NextResponse.json({ error: chunkErr.message, requested: ids }, { status: 500 });
    }

    const previewLen = 220;
    const rows = (chunks ?? []).map((c) => {
      const meta = tribByUuid.get(c.article_id);
      return {
        trib_article_id: meta?.trib_article_id ?? c.article_id,
        project_title: meta?.project_title ?? "",
        chunk_index: (c as { chunk_index?: number }).chunk_index ?? null,
        section_key: c.section_key ?? "general",
        content_preview: (c.chunk_text ?? "").slice(0, previewLen) + ((c.chunk_text?.length ?? 0) > previewLen ? "…" : ""),
      };
    });

    return NextResponse.json({
      requested_ids: ids,
      articles_found: articles.length,
      chunks_found: rows.length,
      chunks: rows,
      message: rows.length === 0
        ? "No document_chunks for these articles. Run ingestion/backfill for ID_06, ID_11, ID_16."
        : "Use these previews to confirm heat/temperature content exists; then check diagnostic-retrieval for similarity scores.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message, requested: ids }, { status: 500 });
  }
}
