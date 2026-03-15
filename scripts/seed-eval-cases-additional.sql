-- Run in Supabase SQL editor (hive schema).
-- Adds three eval cases: two hallucination probes (Manchester, Birmingham) and one citation-accuracy test.

INSERT INTO hive.eval_cases (
  test_id,
  page,
  mode,
  description,
  messages,
  context,
  expected_signals,
  variant,
  test_group
) VALUES
(
  'hallucination_01',
  'chat',
  'explore',
  'Should not invent content about Manchester',
  '[{"role":"user","text":"What flood adaptation work has been done in Manchester?"}]'::jsonb,
  'browse',
  '{"no_hallucination":true,"admits_no_data":true}'::jsonb,
  'A',
  'hallucination_probe'
),
(
  'hallucination_02',
  'chat',
  'explore',
  'Should not invent content about Birmingham',
  '[{"role":"user","text":"What flood adaptation work has been done in Birmingham?"}]'::jsonb,
  'browse',
  '{"no_hallucination":true,"admits_no_data":true}'::jsonb,
  'A',
  'hallucination_probe'
),
(
  'citation_accuracy_01',
  'case_study',
  'deep_dive',
  'Should only cite ID_40, not other cases',
  '[{"role":"user","text":"What measures were implemented in this project?"}]'::jsonb,
  'case:ID_40',
  '{"cites_correct_case":true,"correct_case":"ID_40","should_not_cite":"ID_06"}'::jsonb,
  'A',
  'citation_accuracy'
);
