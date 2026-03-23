-- Run in Supabase SQL editor (hive schema).
-- Adds consecutive_passes and frozen to eval_cases for freeze-passing-tests behaviour.

ALTER TABLE hive.eval_cases
  ADD COLUMN IF NOT EXISTS consecutive_passes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS frozen boolean DEFAULT false;
