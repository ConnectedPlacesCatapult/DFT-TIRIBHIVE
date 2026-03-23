-- Run in Supabase SQL editor (hive schema).
-- Adds reviewer_relevance, reviewer_accuracy, reviewer_reasoning for semantic reviewer scoring.

ALTER TABLE hive.eval_runs
  ADD COLUMN IF NOT EXISTS reviewer_relevance integer,
  ADD COLUMN IF NOT EXISTS reviewer_accuracy integer,
  ADD COLUMN IF NOT EXISTS reviewer_reasoning text;
