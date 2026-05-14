/**
 * Runs the atlas schema migration against Supabase.
 * Uses pg directly since DDL cannot be run via PostgREST.
 *
 * Run with: npx tsx scripts/run-atlas-migration.ts
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  console.log("Connecting to:", url);

  const supabase = createClient(url, key);

  // Test connectivity by reading from a known public view
  const { error: pingError } = await supabase
    .schema("public")
    .rpc("version");

  if (pingError && pingError.code !== "PGRST202") {
    console.error("Connectivity check failed:", pingError.message);
    console.log("\nNote: DDL must be run via the Supabase SQL editor.");
    console.log("Please paste the contents of scripts/migrate-atlas-schema.sql");
    console.log("into the SQL editor at: https://supabase.com/dashboard/project/afysgjiczzptubonbuxs/sql");
    process.exit(1);
  }

  console.log("Connected. Attempting schema creation via exec...");

  // Try running DDL via a raw query RPC if available
  const ddl = `
    CREATE SCHEMA IF NOT EXISTS atlas;

    CREATE TABLE IF NOT EXISTS atlas.projects (
      id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      gtr_id                    TEXT UNIQUE NOT NULL,
      grant_reference           TEXT,
      title                     TEXT NOT NULL,
      abstract                  TEXT,
      tech_abstract             TEXT,
      potential_impact          TEXT,
      status                    TEXT,
      grant_category            TEXT,
      lead_funder               TEXT,
      lead_org_name             TEXT,
      lead_org_department       TEXT,
      start_date                DATE,
      end_date                  DATE,
      funding_amount            NUMERIC,
      research_subjects         TEXT[],
      research_topics           TEXT[],
      cpc_modes                 TEXT[],
      cpc_themes                TEXT[],
      transport_relevance_score NUMERIC DEFAULT 0,
      embedding                 VECTOR(1536),
      raw_json                  JSONB,
      ingested_at               TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS atlas.project_outcomes (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id   UUID REFERENCES atlas.projects(id) ON DELETE CASCADE,
      gtr_id       TEXT UNIQUE NOT NULL,
      outcome_type TEXT NOT NULL,
      title        TEXT,
      description  TEXT,
      year         INT,
      sector       TEXT,
      embedding    VECTOR(1536),
      raw_json     JSONB,
      ingested_at  TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS atlas.organisations (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      gtr_id      TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      role        TEXT,
      region      TEXT,
      ingested_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS atlas.passport_assets (
      id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title               TEXT NOT NULL,
      problem_statement   TEXT,
      proven_capabilities TEXT[],
      trl_level           INT,
      sectors_origin      TEXT[],
      evidence_quality    TEXT,
      embedding           VECTOR(1536),
      created_at          TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS atlas.matches (
      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_id     UUID REFERENCES atlas.passport_assets(id),
      project_id   UUID REFERENCES atlas.projects(id),
      match_score  NUMERIC,
      evidence_map JSONB,
      gaps         JSONB,
      created_at   TIMESTAMPTZ DEFAULT now()
    );
  `;

  const { error } = await supabase.schema("public").rpc("exec_sql", { sql: ddl });

  if (error) {
    console.error("\nCould not run DDL via RPC:", error.message);
    console.log("\n─────────────────────────────────────────────────");
    console.log("ACTION REQUIRED: Run the migration manually.");
    console.log("1. Open: https://supabase.com/dashboard/project/afysgjiczzptubonbuxs/sql");
    console.log("2. Paste the contents of: scripts/migrate-atlas-schema.sql");
    console.log("3. Click Run");
    console.log("─────────────────────────────────────────────────");
    process.exit(1);
  }

  console.log("Migration applied successfully.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
