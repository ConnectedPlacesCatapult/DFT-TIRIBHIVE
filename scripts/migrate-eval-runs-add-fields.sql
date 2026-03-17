-- Run in Supabase SQL editor (hive schema).
-- Adds word_count, mentions_brief, and expected_signals to eval_runs for the extended auto-scorer.

ALTER TABLE hive.eval_runs
  ADD COLUMN IF NOT EXISTS word_count integer,
  ADD COLUMN IF NOT EXISTS mentions_brief boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS expected_signals jsonb;
