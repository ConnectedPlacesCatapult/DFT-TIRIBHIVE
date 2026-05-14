/**
 * Seed hive.options table from OPTIONS_DATA (108 rows).
 *
 * Usage (needs HIVE_SUPABASE credentials in .env.local):
 *   npx tsx scripts/seed-options.ts
 *
 * To write a SQL file instead (no credentials needed):
 *   npx tsx scripts/seed-options.ts --sql
 *   Then run the generated scripts/seed-options.sql in the Supabase SQL editor.
 */

import { createClient } from "@supabase/supabase-js";
import { OPTIONS_DATA } from "../lib/handbook/options-data";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SQL_MODE = process.argv.includes("--sql");

// ── SQL generation mode ────────────────────────────────────────────────────

function sqlEscape(val: string | undefined): string {
  if (val === undefined || val === null) return "NULL";
  // Use dollar-quoting to avoid single-quote escaping complexity
  return `$val$${val}$val$`;
}

function toSqlRow(row: (typeof OPTIONS_DATA)[number]): string {
  const cols = [
    sqlEscape(row.transport_subsector),
    sqlEscape(row.transport_assets),
    sqlEscape(row.climate_hazard_cause),
    sqlEscape(row.climate_hazard_effect),
    sqlEscape(row.climate_risk_to_assets),
    sqlEscape(row.adaptation_measure),
    sqlEscape(row.adaptation_measure_description),
    sqlEscape(row.response_and_recovery_measures),
    sqlEscape(row.identified_cobenefits),
    sqlEscape(row.prompts_assumptions_comments),
    sqlEscape(row.relevant_case_studies),
    sqlEscape(row.case_study_id),
  ];
  return `(${cols.join(", ")})`;
}

if (SQL_MODE) {
  const columns = [
    "transport_subsector",
    "transport_assets",
    "climate_hazard_cause",
    "climate_hazard_effect",
    "climate_risk_to_assets",
    "adaptation_measure",
    "adaptation_measure_description",
    "response_and_recovery_measures",
    "identified_cobenefits",
    "prompts_assumptions_comments",
    "relevant_case_studies",
    "case_study_id",
  ].join(", ");

  const values = OPTIONS_DATA.map(toSqlRow).join(",\n");

  const sql = [
    "-- Auto-generated seed for hive.options (108 rows)",
    "-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/afysgjiczzptubonbuxs/sql/new",
    "",
    "DELETE FROM hive.option_case_links;",
    "DELETE FROM hive.options;",
    "",
    `INSERT INTO hive.options (${columns})`,
    "VALUES",
    values + ";",
    "",
    "SELECT transport_subsector, COUNT(*) FROM hive.options GROUP BY transport_subsector;",
  ].join("\n");

  const outPath = path.resolve(__dirname, "seed-options.sql");
  fs.writeFileSync(outPath, sql, "utf8");
  console.log(`✅  SQL written to ${outPath}`);
  console.log("    Open in Supabase SQL editor and run.");
  process.exit(0);
}

// ── Live Supabase insert mode ──────────────────────────────────────────────

const supabaseUrl =
  process.env.HIVE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.HIVE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌  Missing credentials.\n" +
      "    Set HIVE_SUPABASE_URL + HIVE_SUPABASE_SERVICE_ROLE_KEY in .env.local\n\n" +
      "    Or generate a ready-to-run SQL file instead:\n" +
      "      npx tsx scripts/seed-options.ts --sql"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: "hive" },
});

async function seed() {
  console.log(`⏳  Clearing existing rows…`);
  await supabase.from("option_case_links").delete().neq("option_id", "");
  const { error: delErr } = await supabase
    .from("options")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) {
    console.error("❌  Delete failed:", delErr.message);
    process.exit(1);
  }

  console.log(`⏳  Seeding ${OPTIONS_DATA.length} rows…`);
  const rows = OPTIONS_DATA.map(({ id: _id, ...rest }) => rest);
  const BATCH = 20;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("options").insert(batch);
    if (error) {
      console.error(`❌  Batch ${Math.floor(i / BATCH) + 1} failed:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    console.log(`    ✓  ${inserted} / ${rows.length}`);
  }

  console.log(`\n✅  Done — ${inserted} rows in hive.options.`);
}

seed().catch((err) => {
  console.error("❌  Unexpected error:", err);
  process.exit(1);
});
