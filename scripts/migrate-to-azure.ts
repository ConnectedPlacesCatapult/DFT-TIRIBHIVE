#!/usr/bin/env npx tsx
/**
 * migrate-to-azure.ts
 * One-time migration: Supabase hive schema → Azure PostgreSQL Flexible Server
 *
 * Run: npx tsx scripts/migrate-to-azure.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";

// ── Azure connection ────────────────────────────────────────────────────────
const AZURE = {
  host: "hive.postgres.database.azure.com",
  port: 5432,
  database: "postgres",
  user: "hiveadmin",
  password: process.env.AZURE_POSTGRES_PASSWORD,
  ssl: { rejectUnauthorized: false } as const,
};

// ── Supabase client (anon key — same as production app) ─────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { db: { schema: "hive" } }
);

// ── Helpers ─────────────────────────────────────────────────────────────────
function log(msg: string) {
  process.stdout.write(`  ${msg}\n`);
}

async function count(db: Client, table: string): Promise<number> {
  const r = await db.query(`SELECT COUNT(*) FROM ${table}`);
  return parseInt(r.rows[0].count, 10);
}

// ── DDL ─────────────────────────────────────────────────────────────────────
async function setupExtensionsAndSchema(db: Client) {
  console.log("\n📦 Creating extensions and schema…");
  await db.query(`CREATE EXTENSION IF NOT EXISTS vector`);
  await db.query(`CREATE SCHEMA IF NOT EXISTS hive`);
  log("✓ vector extension, hive schema");
}

async function createTables(db: Client) {
  console.log("\n🏗  Creating tables…");

  await db.query(`
    CREATE TABLE IF NOT EXISTS hive.sources (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      trib_id varchar,
      title varchar NOT NULL,
      source_type varchar NOT NULL,
      original_url varchar,
      storage_path varchar,
      storage_url varchar,
      created_at timestamptz DEFAULT now(),
      scraped_at timestamptz,
      content_summary text,
      source_domain varchar,
      last_verified_at timestamptz
    )
  `);
  log("✓ hive.sources");

  await db.query(`
    CREATE TABLE IF NOT EXISTS hive.articles (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      source_id uuid REFERENCES hive.sources(id),
      transport_sector varchar,
      asset_type varchar,
      hazard_cause varchar,
      hazard_effect varchar,
      project_title varchar NOT NULL,
      measure_title varchar NOT NULL,
      measure_description text,
      case_study_text text,
      content_type varchar DEFAULT 'case_study',
      trib_ranking integer,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      trib_article_id varchar,
      measures jsonb DEFAULT '[]'::jsonb
    )
  `);
  log("✓ hive.articles");

  await db.query(`
    CREATE TABLE IF NOT EXISTS hive.document_chunks (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      source_id uuid REFERENCES hive.sources(id),
      article_id uuid REFERENCES hive.articles(id),
      chunk_index integer NOT NULL,
      chunk_text text NOT NULL,
      embedding vector(1536),
      metadata jsonb,
      created_at timestamptz DEFAULT now(),
      section_key varchar
    )
  `);
  log("✓ hive.document_chunks");

  await db.query(`
    CREATE TABLE IF NOT EXISTS hive.options (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      transport_subsector varchar NOT NULL,
      transport_assets varchar,
      climate_hazard_cause varchar,
      climate_hazard_effect varchar,
      climate_risk_to_assets text,
      adaptation_measure varchar NOT NULL,
      adaptation_measure_description text,
      response_and_recovery_measures text,
      identified_cobenefits text,
      created_at timestamptz DEFAULT now()
    )
  `);
  log("✓ hive.options");

  await db.query(`
    CREATE TABLE IF NOT EXISTS hive.option_case_links (
      option_id uuid REFERENCES hive.options(id),
      article_id uuid REFERENCES hive.articles(id),
      PRIMARY KEY (option_id, article_id)
    )
  `);
  log("✓ hive.option_case_links");

  await db.query(`
    CREATE TABLE IF NOT EXISTS hive.article_cards (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      article_id uuid UNIQUE REFERENCES hive.articles(id),
      trib_article_id text NOT NULL,
      key_insight text,
      key_takeaways jsonb,
      main_applications jsonb,
      co_benefits_summary jsonb,
      implementation_notes text,
      evidence_quality text,
      uk_transferability text,
      transferability_rationale text,
      transferability_contexts jsonb,
      investment_band text,
      investment_detail text,
      funding_sources jsonb,
      content_hash text,
      generated_at timestamptz DEFAULT now(),
      generation_model text DEFAULT 'gpt-4o',
      is_stale boolean DEFAULT false,
      challenges jsonb,
      lessons_learned jsonb,
      innovation_opportunity text,
      project_title text,
      organisation text,
      transport_sector text,
      year_range text,
      subtitle_stats text,
      key_metrics jsonb
    )
  `);
  log("✓ hive.article_cards");

  await db.query(`
    CREATE TABLE IF NOT EXISTS hive.source_candidates (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      url text NOT NULL,
      title text,
      suggested_by text NOT NULL DEFAULT 'user',
      suggested_at timestamptz NOT NULL DEFAULT now(),
      ai_assessment text,
      ai_category text,
      user_note text,
      status text NOT NULL DEFAULT 'pending',
      reviewed_by text,
      reviewed_at timestamptz,
      promoted_to_source_id uuid REFERENCES hive.sources(id)
    )
  `);
  log("✓ hive.source_candidates");

  await db.query(`
    CREATE TABLE IF NOT EXISTS hive.eval_cases (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      test_id text UNIQUE NOT NULL,
      mode text NOT NULL,
      description text NOT NULL,
      messages jsonb NOT NULL,
      context text,
      brief_case_ids text[],
      expected_signals jsonb,
      created_at timestamptz DEFAULT now(),
      page text NOT NULL DEFAULT 'chat',
      variant text NOT NULL DEFAULT 'A',
      variant_config jsonb,
      follow_on_messages jsonb,
      test_group text,
      consecutive_passes integer DEFAULT 0,
      frozen boolean DEFAULT false
    )
  `);
  log("✓ hive.eval_cases");

  await db.query(`
    CREATE TABLE IF NOT EXISTS hive.eval_runs (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      run_batch text NOT NULL,
      eval_case_id uuid REFERENCES hive.eval_cases(id),
      test_id text NOT NULL,
      mode text NOT NULL,
      messages_sent jsonb NOT NULL,
      response_text text,
      response_action jsonb,
      sources text[],
      retrieval_mode text,
      response_ms integer,
      ran_at timestamptz DEFAULT now(),
      score_citations boolean,
      score_no_hallucination boolean,
      score_relevant boolean,
      score_action_correct boolean,
      reviewer_notes text,
      reviewed_at timestamptz,
      variant text NOT NULL DEFAULT 'A',
      variant_config jsonb,
      test_group text,
      page text,
      citation_count integer,
      admitted_no_data boolean,
      hallucination_flag boolean,
      proposed_update_fired boolean,
      word_count integer,
      mentions_brief boolean DEFAULT false,
      expected_signals jsonb,
      reviewer_relevance integer,
      reviewer_accuracy integer,
      reviewer_reasoning text
    )
  `);
  log("✓ hive.eval_runs");

  await db.query(`
    CREATE TABLE IF NOT EXISTS hive.synthesis_sessions (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      article_ids uuid[] NOT NULL,
      query_context text,
      created_at timestamptz DEFAULT now()
    )
  `);
  log("✓ hive.synthesis_sessions");

  await db.query(`
    CREATE TABLE IF NOT EXISTS hive.report_sections (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      session_id uuid REFERENCES hive.synthesis_sessions(id),
      section_key varchar NOT NULL,
      section_title varchar NOT NULL,
      content text NOT NULL,
      confidence varchar,
      source_chunk_ids uuid[],
      sort_order integer DEFAULT 0,
      created_at timestamptz DEFAULT now()
    )
  `);
  log("✓ hive.report_sections");
}

// ── Data migration ───────────────────────────────────────────────────────────

async function migrateSources(db: Client) {
  console.log("\n📋 Migrating hive.sources…");
  const { data, error } = await supabase.from("sources").select("*");
  if (error) throw new Error(`Supabase sources: ${error.message}`);
  if (!data?.length) { log("0 rows — skipping"); return; }

  for (const r of data) {
    await db.query(
      `INSERT INTO hive.sources
         (id, trib_id, title, source_type, original_url, storage_path,
          storage_url, created_at, scraped_at, content_summary,
          source_domain, last_verified_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.trib_id, r.title, r.source_type, r.original_url,
       r.storage_path, r.storage_url, r.created_at, r.scraped_at,
       r.content_summary, r.source_domain, r.last_verified_at]
    );
  }
  const n = await count(db, "hive.sources");
  log(`✓ ${n} rows`);
}

async function migrateArticles(db: Client) {
  console.log("\n📋 Migrating hive.articles…");
  const { data, error } = await supabase.from("articles").select("*");
  if (error) throw new Error(`Supabase articles: ${error.message}`);
  if (!data?.length) { log("0 rows — skipping"); return; }

  for (const r of data) {
    await db.query(
      `INSERT INTO hive.articles
         (id, source_id, transport_sector, asset_type, hazard_cause,
          hazard_effect, project_title, measure_title, measure_description,
          case_study_text, content_type, trib_ranking, created_at, updated_at,
          trib_article_id, measures)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.source_id, r.transport_sector, r.asset_type, r.hazard_cause,
       r.hazard_effect, r.project_title, r.measure_title, r.measure_description,
       r.case_study_text, r.content_type, r.trib_ranking, r.created_at,
       r.updated_at, r.trib_article_id, JSON.stringify(r.measures ?? [])]
    );
  }
  const n = await count(db, "hive.articles");
  log(`✓ ${n} rows`);
}

async function migrateDocumentChunks(db: Client) {
  console.log("\n📋 Migrating hive.document_chunks (429 rows with vectors — slow)…");
  const BATCH = 50;
  let offset = 0;
  let total = 0;

  while (true) {
    const { data, error } = await supabase
      .from("document_chunks")
      .select("*")
      .range(offset, offset + BATCH - 1);

    if (error) throw new Error(`Supabase document_chunks: ${error.message}`);
    if (!data?.length) break;

    for (const r of data) {
      const embedding = r.embedding
        ? `${typeof r.embedding === "string" ? r.embedding : JSON.stringify(r.embedding)}`
        : null;

      await db.query(
        `INSERT INTO hive.document_chunks
           (id, source_id, article_id, chunk_index, chunk_text,
            embedding, metadata, created_at, section_key)
         VALUES ($1,$2,$3,$4,$5,$6::vector,$7,$8,$9)
         ON CONFLICT (id) DO NOTHING`,
        [r.id, r.source_id, r.article_id, r.chunk_index, r.chunk_text,
         embedding, r.metadata ? JSON.stringify(r.metadata) : null,
         r.created_at, r.section_key]
      );
    }
    total += data.length;
    log(`  …${total} chunks written`);
    offset += BATCH;
    if (data.length < BATCH) break;
  }

  const n = await count(db, "hive.document_chunks");
  log(`✓ ${n} rows`);
}

async function migrateOptions(db: Client) {
  console.log("\n📋 Migrating hive.options…");
  const { data, error } = await supabase.from("options").select("*");
  if (error) throw new Error(`Supabase options: ${error.message}`);
  if (!data?.length) { log("0 rows — skipping"); return; }

  for (const r of data) {
    await db.query(
      `INSERT INTO hive.options
         (id, transport_subsector, transport_assets, climate_hazard_cause,
          climate_hazard_effect, climate_risk_to_assets, adaptation_measure,
          adaptation_measure_description, response_and_recovery_measures,
          identified_cobenefits, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.transport_subsector, r.transport_assets, r.climate_hazard_cause,
       r.climate_hazard_effect, r.climate_risk_to_assets, r.adaptation_measure,
       r.adaptation_measure_description, r.response_and_recovery_measures,
       r.identified_cobenefits, r.created_at]
    );
  }
  const n = await count(db, "hive.options");
  log(`✓ ${n} rows`);
}

async function migrateOptionCaseLinks(db: Client) {
  console.log("\n📋 Migrating hive.option_case_links…");
  const { data, error } = await supabase.from("option_case_links").select("*");
  if (error) throw new Error(`Supabase option_case_links: ${error.message}`);
  if (!data?.length) { log("0 rows — skipping"); return; }

  for (const r of data) {
    await db.query(
      `INSERT INTO hive.option_case_links (option_id, article_id)
       VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [r.option_id, r.article_id]
    );
  }
  const n = await count(db, "hive.option_case_links");
  log(`✓ ${n} rows`);
}

async function migrateArticleCards(db: Client) {
  console.log("\n📋 Migrating hive.article_cards…");
  const { data, error } = await supabase.from("article_cards").select("*");
  if (error) throw new Error(`Supabase article_cards: ${error.message}`);
  if (!data?.length) { log("0 rows — skipping"); return; }

  for (const r of data) {
    await db.query(
      `INSERT INTO hive.article_cards
         (id, article_id, trib_article_id, key_insight, key_takeaways,
          main_applications, co_benefits_summary, implementation_notes,
          evidence_quality, uk_transferability, transferability_rationale,
          transferability_contexts, investment_band, investment_detail,
          funding_sources, content_hash, generated_at, generation_model,
          is_stale, challenges, lessons_learned, innovation_opportunity,
          project_title, organisation, transport_sector, year_range,
          subtitle_stats, key_metrics)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
               $17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.article_id, r.trib_article_id, r.key_insight,
       r.key_takeaways ? JSON.stringify(r.key_takeaways) : null,
       r.main_applications ? JSON.stringify(r.main_applications) : null,
       r.co_benefits_summary ? JSON.stringify(r.co_benefits_summary) : null,
       r.implementation_notes, r.evidence_quality, r.uk_transferability,
       r.transferability_rationale,
       r.transferability_contexts ? JSON.stringify(r.transferability_contexts) : null,
       r.investment_band, r.investment_detail,
       r.funding_sources ? JSON.stringify(r.funding_sources) : null,
       r.content_hash, r.generated_at, r.generation_model, r.is_stale,
       r.challenges ? JSON.stringify(r.challenges) : null,
       r.lessons_learned ? JSON.stringify(r.lessons_learned) : null,
       r.innovation_opportunity, r.project_title, r.organisation,
       r.transport_sector, r.year_range, r.subtitle_stats,
       r.key_metrics ? JSON.stringify(r.key_metrics) : null]
    );
  }
  const n = await count(db, "hive.article_cards");
  log(`✓ ${n} rows`);
}

async function migrateSourceCandidates(db: Client) {
  console.log("\n📋 Migrating hive.source_candidates…");
  const { data, error } = await supabase.from("source_candidates").select("*");
  if (error) throw new Error(`Supabase source_candidates: ${error.message}`);
  if (!data?.length) { log("0 rows — skipping"); return; }

  for (const r of data) {
    await db.query(
      `INSERT INTO hive.source_candidates
         (id, url, title, suggested_by, suggested_at, ai_assessment,
          ai_category, user_note, status, reviewed_by, reviewed_at,
          promoted_to_source_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.url, r.title, r.suggested_by, r.suggested_at,
       r.ai_assessment, r.ai_category, r.user_note, r.status,
       r.reviewed_by, r.reviewed_at, r.promoted_to_source_id]
    );
  }
  const n = await count(db, "hive.source_candidates");
  log(`✓ ${n} rows`);
}

async function migrateEvalCases(db: Client) {
  console.log("\n📋 Migrating hive.eval_cases…");
  const { data, error } = await supabase.from("eval_cases").select("*");
  if (error) throw new Error(`Supabase eval_cases: ${error.message}`);
  if (!data?.length) { log("0 rows — skipping"); return; }

  for (const r of data) {
    await db.query(
      `INSERT INTO hive.eval_cases
         (id, test_id, mode, description, messages, context, brief_case_ids,
          expected_signals, created_at, page, variant, variant_config,
          follow_on_messages, test_group, consecutive_passes, frozen)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.test_id, r.mode, r.description,
       JSON.stringify(r.messages), r.context,
       r.brief_case_ids ?? null,
       r.expected_signals ? JSON.stringify(r.expected_signals) : null,
       r.created_at, r.page, r.variant,
       r.variant_config ? JSON.stringify(r.variant_config) : null,
       r.follow_on_messages ? JSON.stringify(r.follow_on_messages) : null,
       r.test_group, r.consecutive_passes ?? 0, r.frozen ?? false]
    );
  }
  const n = await count(db, "hive.eval_cases");
  log(`✓ ${n} rows`);
}

async function migrateEvalRuns(db: Client) {
  console.log("\n📋 Migrating hive.eval_runs (648 rows — batched)…");
  const BATCH = 100;
  let offset = 0;
  let total = 0;

  while (true) {
    const { data, error } = await supabase
      .from("eval_runs")
      .select("*")
      .range(offset, offset + BATCH - 1);

    if (error) throw new Error(`Supabase eval_runs: ${error.message}`);
    if (!data?.length) break;

    for (const r of data) {
      await db.query(
        `INSERT INTO hive.eval_runs
           (id, run_batch, eval_case_id, test_id, mode, messages_sent,
            response_text, response_action, sources, retrieval_mode,
            response_ms, ran_at, score_citations, score_no_hallucination,
            score_relevant, score_action_correct, reviewer_notes, reviewed_at,
            variant, variant_config, test_group, page, citation_count,
            admitted_no_data, hallucination_flag, proposed_update_fired,
            word_count, mentions_brief, expected_signals, reviewer_relevance,
            reviewer_accuracy, reviewer_reasoning)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
                 $17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
                 $31,$32)
         ON CONFLICT (id) DO NOTHING`,
        [r.id, r.run_batch, r.eval_case_id, r.test_id, r.mode,
         JSON.stringify(r.messages_sent), r.response_text,
         r.response_action ? JSON.stringify(r.response_action) : null,
         r.sources ?? null, r.retrieval_mode, r.response_ms, r.ran_at,
         r.score_citations, r.score_no_hallucination, r.score_relevant,
         r.score_action_correct, r.reviewer_notes, r.reviewed_at,
         r.variant,
         r.variant_config ? JSON.stringify(r.variant_config) : null,
         r.test_group, r.page, r.citation_count, r.admitted_no_data,
         r.hallucination_flag, r.proposed_update_fired, r.word_count,
         r.mentions_brief ?? false,
         r.expected_signals ? JSON.stringify(r.expected_signals) : null,
         r.reviewer_relevance, r.reviewer_accuracy, r.reviewer_reasoning]
      );
    }
    total += data.length;
    log(`  …${total} eval_runs written`);
    offset += BATCH;
    if (data.length < BATCH) break;
  }

  const n = await count(db, "hive.eval_runs");
  log(`✓ ${n} rows`);
}

// ── RPC functions ─────────────────────────────────────────────────────────────
async function createFunctions(db: Client) {
  console.log("\n⚙️  Creating hive_match_chunks RPC functions…");

  // Overload 1: basic (query_embedding, threshold, count)
  await db.query(`
    CREATE OR REPLACE FUNCTION public.hive_match_chunks(
      query_embedding vector,
      match_threshold double precision DEFAULT 0.7,
      match_count integer DEFAULT 10
    )
    RETURNS TABLE(id uuid, article_id uuid, chunk_index integer,
                  chunk_text text, metadata jsonb, similarity double precision)
    LANGUAGE plpgsql AS $$
    BEGIN
      RETURN QUERY
      SELECT dc.id, dc.article_id, dc.chunk_index, dc.chunk_text, dc.metadata,
             1 - (dc.embedding <=> query_embedding) AS similarity
      FROM hive.document_chunks dc
      WHERE dc.embedding IS NOT NULL
        AND 1 - (dc.embedding <=> query_embedding) > match_threshold
      ORDER BY dc.embedding <=> query_embedding
      LIMIT match_count;
    END;
    $$
  `);

  // Overload 2: with filter_section
  await db.query(`
    CREATE OR REPLACE FUNCTION public.hive_match_chunks(
      query_embedding vector,
      match_threshold double precision DEFAULT 0.7,
      match_count integer DEFAULT 10,
      filter_section character varying DEFAULT NULL::character varying
    )
    RETURNS TABLE(id uuid, article_id uuid, chunk_index integer,
                  section_key character varying, chunk_text text,
                  metadata jsonb, similarity double precision)
    LANGUAGE plpgsql AS $$
    BEGIN
      RETURN QUERY
      SELECT dc.id, dc.article_id, dc.chunk_index, dc.section_key,
             dc.chunk_text, dc.metadata,
             1 - (dc.embedding <=> query_embedding) AS similarity
      FROM hive.document_chunks dc
      WHERE dc.embedding IS NOT NULL
        AND 1 - (dc.embedding <=> query_embedding) > match_threshold
        AND (filter_section IS NULL OR dc.section_key = filter_section)
      ORDER BY dc.embedding <=> query_embedding
      LIMIT match_count;
    END;
    $$
  `);

  // Overload 3: with article_ids filter
  await db.query(`
    CREATE OR REPLACE FUNCTION public.hive_match_chunks(
      query_embedding vector,
      match_threshold double precision,
      match_count integer,
      article_ids uuid[] DEFAULT NULL::uuid[]
    )
    RETURNS TABLE(id uuid, article_id uuid, chunk_text text,
                  section_key text, metadata jsonb, similarity double precision)
    LANGUAGE plpgsql AS $$
    BEGIN
      RETURN QUERY
      SELECT dc.id, dc.article_id, dc.chunk_text, dc.section_key::text,
             dc.metadata,
             1 - (dc.embedding <=> query_embedding) AS similarity
      FROM hive.document_chunks dc
      WHERE (article_ids IS NULL OR dc.article_id = ANY(article_ids))
        AND 1 - (dc.embedding <=> query_embedding) > match_threshold
      ORDER BY dc.embedding <=> query_embedding
      LIMIT match_count;
    END;
    $$
  `);

  log("✓ all 3 hive_match_chunks overloads created");
}

// ── Entry point ───────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 HIVE: Supabase → Azure PostgreSQL migration");
  console.log(`   Target: ${AZURE.host}`);

  if (!AZURE.password) {
    console.error("❌ AZURE_POSTGRES_PASSWORD env var is not set");
    process.exit(1);
  }

  const db = new Client(AZURE);
  await db.connect();
  console.log("✓ Connected to Azure PostgreSQL\n");

  try {
    await setupExtensionsAndSchema(db);
    await createTables(db);

    // Migrate in foreign-key order
    await migrateSources(db);
    await migrateArticles(db);
    await migrateDocumentChunks(db);
    await migrateOptions(db);
    await migrateOptionCaseLinks(db);
    await migrateArticleCards(db);
    await migrateSourceCandidates(db);
    await migrateEvalCases(db);
    await migrateEvalRuns(db);

    await createFunctions(db);

    console.log("\n✅ Migration complete! All hive data is now in Azure.\n");
  } catch (err) {
    console.error("\n❌ Migration failed:", err);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
