-- Run against Azure PostgreSQL (and separately on Supabase if you use sync).
-- Table: hive.feedback

CREATE TABLE IF NOT EXISTS hive.feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  sentiment       TEXT CHECK (sentiment IN ('positive', 'negative')),
  category        TEXT CHECK (category IN (
                    'bug', 'wrong_answer', 'suggestion', 'other'
                  )),
  user_message    TEXT,
  CONSTRAINT feedback_user_message_len
    CHECK (user_message IS NULL OR char_length(user_message) <= 1000),

  page_url        TEXT NOT NULL,
  trigger_source  TEXT CHECK (trigger_source IN ('nav', 'chat_message')),
  chat_context    JSONB,
  user_id         TEXT,

  app_version     TEXT
);

CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON hive.feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS feedback_sentiment_idx  ON hive.feedback (sentiment);
CREATE INDEX IF NOT EXISTS feedback_category_idx   ON hive.feedback (category);
