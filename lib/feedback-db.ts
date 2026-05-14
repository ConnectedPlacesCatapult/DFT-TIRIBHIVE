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

  try {
    const { Pool } = await import("pg");
    const pool = new Pool({
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
    const c = await pool.connect();
    c.release();
    _pool = pool;
    return _pool;
  } catch (e) {
    console.error("[feedback-db] Azure pool connect failed:", e);
    _pool = null;
    return null;
  }
}

/** Postgres undefined_table */
export function isPgUndefinedTable(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "42P01";
}
