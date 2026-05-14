/**
 * Azure PostgreSQL access for hive.feedback (independent of DATA_PROVIDER).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _pool: any = null;

export type FeedbackRow = {
  id: string;
  created_at: string;
  sentiment: string | null;
  category: string | null;
  user_message: string | null;
  page_url: string;
  trigger_source: string | null;
  chat_context: unknown;
  user_id: string | null;
  app_version: string | null;
};

export function hasAzureFeedbackConfig(): boolean {
  return Boolean(
    process.env.AZURE_POSTGRES_HOST &&
      process.env.AZURE_POSTGRES_USER &&
      process.env.AZURE_POSTGRES_PASSWORD
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getFeedbackPool(): Promise<any | null> {
  if (!hasAzureFeedbackConfig()) return null;
  if (_pool) return _pool;

  const { Pool } = await import("pg");
  _pool = new Pool({
    host: process.env.AZURE_POSTGRES_HOST,
    port: 5432,
    database: process.env.AZURE_POSTGRES_DB ?? "postgres",
    user: process.env.AZURE_POSTGRES_USER,
    password: process.env.AZURE_POSTGRES_PASSWORD,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000,
  });
  const c = await _pool.connect();
  c.release();
  return _pool;
}
