import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ServiceResult = {
  healthy: boolean;
  latencyMs: number;
  detail?: string;
  count?: number;
};

async function checkAzure(): Promise<ServiceResult> {
  const host = process.env.AZURE_POSTGRES_HOST;
  const user = process.env.AZURE_POSTGRES_USER;
  const password = process.env.AZURE_POSTGRES_PASSWORD;
  const database = process.env.AZURE_POSTGRES_DB ?? "postgres";

  if (!host || !user || !password) {
    return { healthy: false, latencyMs: 0, detail: "AZURE_POSTGRES_* env vars not set" };
  }

  const t0 = Date.now();
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Client } = require("pg");
    const client = new Client({ host, port: 5432, database, user, password, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
    await client.connect();
    const result = await client.query(
      `SELECT
        (SELECT COUNT(*) FROM hive.articles)::int AS articles,
        (SELECT COUNT(*) FROM hive.sources)::int AS sources,
        (SELECT COUNT(*) FROM hive.document_chunks)::int AS chunks,
        (SELECT COUNT(*) FROM hive.options)::int AS options`
    );
    await client.end();
    const row = result.rows[0];
    return {
      healthy: true,
      latencyMs: Date.now() - t0,
      detail: `${row.articles} articles · ${row.sources} sources · ${row.chunks} chunks · ${row.options} options`,
      count: row.articles,
    };
  } catch (err) {
    return { healthy: false, latencyMs: Date.now() - t0, detail: err instanceof Error ? err.message : "Connection failed" };
  }
}

async function checkSupabase(): Promise<ServiceResult> {
  const url = process.env.HIVE_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.HIVE_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { healthy: false, latencyMs: 0, detail: "Supabase env vars not set" };
  }

  const t0 = Date.now();
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createClient } = require("@supabase/supabase-js");
    const sb = createClient(url, key, { db: { schema: "hive" } });
    const [a, s, c, o] = await Promise.all([
      sb.from("articles").select("*", { count: "exact", head: true }),
      sb.from("sources").select("*", { count: "exact", head: true }),
      sb.from("document_chunks").select("*", { count: "exact", head: true }),
      sb.from("options").select("*", { count: "exact", head: true }),
    ]);
    if (a.error) throw new Error(a.error.message);
    return {
      healthy: true,
      latencyMs: Date.now() - t0,
      detail: `${a.count} articles · ${s.count} sources · ${c.count} chunks · ${o.count} options`,
      count: a.count ?? 0,
    };
  } catch (err) {
    return { healthy: false, latencyMs: Date.now() - t0, detail: err instanceof Error ? err.message : "Connection failed" };
  }
}

async function checkOpenAI(): Promise<ServiceResult> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { healthy: false, latencyMs: 0, detail: "OPENAI_API_KEY not set" };

  const t0 = Date.now();
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const modelCount = data.data?.length ?? 0;
    return {
      healthy: true,
      latencyMs: Date.now() - t0,
      detail: `API reachable · ${modelCount} models available`,
    };
  } catch (err) {
    return { healthy: false, latencyMs: Date.now() - t0, detail: err instanceof Error ? err.message : "API unreachable" };
  }
}

export async function GET() {
  const [azure, supabase, openai] = await Promise.all([
    checkAzure(),
    checkSupabase(),
    checkOpenAI(),
  ]);

  const provider = process.env.DATA_PROVIDER ?? "json";

  return NextResponse.json({
    provider,
    checkedAt: new Date().toISOString(),
    services: { azure, supabase, openai },
  });
}
