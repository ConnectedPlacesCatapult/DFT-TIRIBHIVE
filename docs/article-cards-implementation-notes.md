# Article cards implementation — schema correction (read first)

**IMPORTANT — READ BEFORE STARTING:**

The `hive.article_cards` table **already exists** with this exact schema (individual named columns, **NOT** `card_data JSONB`):

```
  id                    uuid PRIMARY KEY
  article_id            uuid (FK to hive.articles)
  trib_article_id       text
  key_insight           text
  key_takeaways         jsonb  -- string array
  main_applications     jsonb  -- string array
  co_benefits_summary   jsonb  -- {community, environmental, economic, carbon}
  implementation_notes  text
  evidence_quality      text   -- 'strong'|'moderate'|'limited'
  uk_transferability    text   -- 'high'|'medium'|'low'
  transferability_rationale text
  transferability_contexts  jsonb  -- string array
  investment_band       text
  investment_detail     text
  funding_sources       jsonb  -- string array
  content_hash          text
  generated_at          timestamptz
  generation_model      text
  is_stale              boolean
```

- **DO NOT** create a `card_data JSONB` column.
- **DO NOT** run a migration that recreates the table — it already exists.
- All inserts and reads must use **individual column names**.

---

## Gold standard JSON — two extra fields

The gold standard JSON must include **two additional fields** that are in the HTML but missing from earlier plans:

- `"challenges": ["string", "string", ...]`
- `"lessons_learned": ["string", "string", ...]`

Add these (and optional `innovation_opportunity`) to the table if not already present:

```sql
ALTER TABLE hive.article_cards
  ADD COLUMN IF NOT EXISTS challenges jsonb,
  ADD COLUMN IF NOT EXISTS lessons_learned jsonb,
  ADD COLUMN IF NOT EXISTS innovation_opportunity text;
```

The generation API must **produce and store** all fields, including `challenges`, `lessons_learned`, and `innovation_opportunity`, so the expanded view can render them as bullet lists.

---

## Migration script

Because the table already exists with the correct schema, any migration script should **confirm** the schema (e.g. check columns exist) rather than create or replace the table.

---

## Build order

1. Test on **ID_40** first.
2. Verify the JSON output matches the gold standard (including `challenges` and `lessons_learned`) before running on all 37 articles.
