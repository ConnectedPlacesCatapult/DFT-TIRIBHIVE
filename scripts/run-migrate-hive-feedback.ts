/**
 * Run scripts/migrate-hive-feedback.sql against Azure Postgres using AZURE_POSTGRES_* from .env
 * Usage: npx tsx scripts/run-migrate-hive-feedback.ts
 */
import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  const host = process.env.AZURE_POSTGRES_HOST;
  const user = process.env.AZURE_POSTGRES_USER;
  const password = process.env.AZURE_POSTGRES_PASSWORD;
  const database = process.env.AZURE_POSTGRES_DB ?? "postgres";

  if (!host || !user || !password) {
    console.error("Missing AZURE_POSTGRES_HOST, AZURE_POSTGRES_USER, or AZURE_POSTGRES_PASSWORD in .env");
    process.exit(1);
  }

  const sqlPath = join(process.cwd(), "scripts", "migrate-hive-feedback.sql");
  const sql = readFileSync(sqlPath, "utf8");

  const { Client } = await import("pg");
  const client = new Client({
    host,
    port: 5432,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 60000,
  });

  await client.connect();
  try {
    await client.query(sql);
    console.log("OK: hive.feedback migration applied (or already present).");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
