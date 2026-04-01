-- Atlas schema migration
-- Project: Sparkworks / Innovation Atlas — GtR data layer
-- Supabase project: afysgjiczzptubonbuxs (eu-west-1)
--
-- IMPORTANT: Do NOT touch the hive schema or any public.* tables.
-- All objects are created in the atlas schema only.
--
-- Run this before executing the ingestion script.
-- pgvector (vector 0.8.0) is already installed on this project.

CREATE SCHEMA IF NOT EXISTS atlas;

-- Core projects table
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

-- Outcomes table
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

-- Organisations
CREATE TABLE IF NOT EXISTS atlas.organisations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gtr_id      TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  role        TEXT,
  region      TEXT,
  ingested_at TIMESTAMPTZ DEFAULT now()
);

-- Evidence profiles (Innovation Passport inputs)
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

-- Match results
CREATE TABLE IF NOT EXISTS atlas.matches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id     UUID REFERENCES atlas.passport_assets(id),
  project_id   UUID REFERENCES atlas.projects(id),
  match_score  NUMERIC,
  evidence_map JSONB,
  gaps         JSONB,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- pgvector indexes — create AFTER ingestion completes, not before
-- They slow down bulk inserts significantly.
--
-- CREATE INDEX ON atlas.projects USING hnsw (embedding vector_cosine_ops);
-- CREATE INDEX ON atlas.project_outcomes USING hnsw (embedding vector_cosine_ops);
