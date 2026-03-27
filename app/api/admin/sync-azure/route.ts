import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/admin/sync-azure
 * Syncs new rows from Supabase → Azure.
 * Uses ON CONFLICT (id) DO NOTHING — safe to run repeatedly.
 */
export async function POST() {
  const azureHost = process.env.AZURE_POSTGRES_HOST;
  const azureUser = process.env.AZURE_POSTGRES_USER;
  const azurePassword = process.env.AZURE_POSTGRES_PASSWORD;
  const azureDb = process.env.AZURE_POSTGRES_DB ?? "postgres";
  const supabaseUrl = process.env.HIVE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.HIVE_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!azureHost || !azureUser || !azurePassword) {
    return NextResponse.json({ message: "Azure env vars not configured" }, { status: 500 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ message: "Supabase env vars not configured" }, { status: 500 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Client } = require("pg");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require("@supabase/supabase-js");

    const db = new Client({
      host: azureHost, port: 5432, database: azureDb,
      user: azureUser, password: azurePassword,
      ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000,
    });
    await db.connect();

    const sb = createClient(supabaseUrl, supabaseKey, { db: { schema: "hive" } });

    let newRows = 0;

    // Sync sources
    const { data: sources } = await sb.from("sources").select("*");
    for (const r of sources ?? []) {
      const res = await db.query(
        `INSERT INTO hive.sources (id,trib_id,title,source_type,original_url,storage_path,storage_url,created_at,scraped_at,content_summary,source_domain,last_verified_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT (id) DO NOTHING`,
        [r.id,r.trib_id,r.title,r.source_type,r.original_url,r.storage_path,r.storage_url,r.created_at,r.scraped_at,r.content_summary,r.source_domain,r.last_verified_at]
      );
      newRows += res.rowCount ?? 0;
    }

    // Sync articles
    const { data: articles } = await sb.from("articles").select("*");
    for (const r of articles ?? []) {
      const res = await db.query(
        `INSERT INTO hive.articles (id,source_id,transport_sector,asset_type,hazard_cause,hazard_effect,project_title,measure_title,measure_description,case_study_text,content_type,trib_ranking,created_at,updated_at,trib_article_id,measures)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT (id) DO NOTHING`,
        [r.id,r.source_id,r.transport_sector,r.asset_type,r.hazard_cause,r.hazard_effect,r.project_title,r.measure_title,r.measure_description,r.case_study_text,r.content_type,r.trib_ranking,r.created_at,r.updated_at,r.trib_article_id,JSON.stringify(r.measures??[])]
      );
      newRows += res.rowCount ?? 0;
    }

    // Sync document_chunks (batched — vectors are large)
    const BATCH = 50;
    let offset = 0;
    while (true) {
      const { data: chunks } = await sb.from("document_chunks").select("*").range(offset, offset + BATCH - 1);
      if (!chunks?.length) break;
      for (const r of chunks) {
        const embedding = r.embedding ? `${typeof r.embedding === "string" ? r.embedding : JSON.stringify(r.embedding)}` : null;
        const res = await db.query(
          `INSERT INTO hive.document_chunks (id,source_id,article_id,chunk_index,chunk_text,embedding,metadata,created_at,section_key)
           VALUES ($1,$2,$3,$4,$5,$6::vector,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
          [r.id,r.source_id,r.article_id,r.chunk_index,r.chunk_text,embedding,r.metadata?JSON.stringify(r.metadata):null,r.created_at,r.section_key]
        );
        newRows += res.rowCount ?? 0;
      }
      offset += BATCH;
      if (chunks.length < BATCH) break;
    }

    // Sync article_cards
    const { data: cards } = await sb.from("article_cards").select("*");
    for (const r of cards ?? []) {
      const res = await db.query(
        `INSERT INTO hive.article_cards (id,article_id,trib_article_id,key_insight,key_takeaways,main_applications,co_benefits_summary,implementation_notes,evidence_quality,uk_transferability,transferability_rationale,transferability_contexts,investment_band,investment_detail,funding_sources,content_hash,generated_at,generation_model,is_stale,challenges,lessons_learned,innovation_opportunity,project_title,organisation,transport_sector,year_range,subtitle_stats,key_metrics)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28) ON CONFLICT (id) DO NOTHING`,
        [r.id,r.article_id,r.trib_article_id,r.key_insight,r.key_takeaways?JSON.stringify(r.key_takeaways):null,r.main_applications?JSON.stringify(r.main_applications):null,r.co_benefits_summary?JSON.stringify(r.co_benefits_summary):null,r.implementation_notes,r.evidence_quality,r.uk_transferability,r.transferability_rationale,r.transferability_contexts?JSON.stringify(r.transferability_contexts):null,r.investment_band,r.investment_detail,r.funding_sources?JSON.stringify(r.funding_sources):null,r.content_hash,r.generated_at,r.generation_model,r.is_stale,r.challenges?JSON.stringify(r.challenges):null,r.lessons_learned?JSON.stringify(r.lessons_learned):null,r.innovation_opportunity,r.project_title,r.organisation,r.transport_sector,r.year_range,r.subtitle_stats,r.key_metrics?JSON.stringify(r.key_metrics):null]
      );
      newRows += res.rowCount ?? 0;
    }

    await db.end();

    // Final counts
    const db2 = new Client({ host: azureHost, port: 5432, database: azureDb, user: azureUser, password: azurePassword, ssl: { rejectUnauthorized: false } });
    await db2.connect();
    const counts = await db2.query(`SELECT (SELECT COUNT(*) FROM hive.articles)::int AS articles, (SELECT COUNT(*) FROM hive.document_chunks)::int AS chunks`);
    await db2.end();

    return NextResponse.json({
      ok: true,
      newRows,
      message: `Sync complete — ${newRows} new rows added. Azure now has ${counts.rows[0].articles} articles, ${counts.rows[0].chunks} chunks.`,
    });
  } catch (err) {
    console.error("[sync-azure]", err);
    return NextResponse.json({
      ok: false,
      message: `Sync failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    }, { status: 500 });
  }
}
