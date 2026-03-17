-- Migration: Create hive.article_cards table
-- Run in Supabase SQL editor if the table does not already exist.
-- The table uses individual columns rather than a single JSONB card_data column.

CREATE TABLE IF NOT EXISTS hive.article_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES hive.articles(id) UNIQUE NOT NULL,
  trib_article_id TEXT NOT NULL,
  project_title TEXT,
  organisation TEXT,
  transport_sector TEXT,
  year_range TEXT,
  subtitle_stats TEXT,
  key_metrics JSONB,
  key_insight TEXT,
  main_applications JSONB,
  key_takeaways JSONB,
  co_benefits_summary JSONB,
  implementation_notes TEXT,
  evidence_quality TEXT,
  uk_transferability TEXT,
  transferability_rationale TEXT,
  transferability_contexts JSONB,
  investment_band TEXT,
  investment_detail TEXT,
  funding_sources JSONB,
  challenges JSONB,
  lessons_learned JSONB,
  innovation_opportunity TEXT,
  content_hash TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generation_model TEXT DEFAULT 'gpt-4o',
  is_stale BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_article_cards_trib_id
  ON hive.article_cards(trib_article_id);

CREATE INDEX IF NOT EXISTS idx_article_cards_stale
  ON hive.article_cards(is_stale) WHERE is_stale = true;

ALTER TABLE hive.article_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON hive.article_cards FOR SELECT USING (true);
