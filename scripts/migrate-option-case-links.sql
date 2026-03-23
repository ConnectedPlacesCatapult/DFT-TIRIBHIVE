-- Links adaptation options (options library) to case studies for brief alignment.
-- Production schema: article_id = hive.articles.id (UUID), option_id = hive.options.id (UUID).
-- Populate separately (SQL or ETL). Empty table = brief behaviour unchanged.

CREATE TABLE IF NOT EXISTS hive.option_case_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  option_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (article_id, option_id)
);

CREATE INDEX IF NOT EXISTS idx_option_case_links_article
  ON hive.option_case_links (article_id);

CREATE INDEX IF NOT EXISTS idx_option_case_links_option
  ON hive.option_case_links (option_id);

COMMENT ON TABLE hive.option_case_links IS
  'Join options framework measures to case studies (articles.id). Used by brief-generate.';
