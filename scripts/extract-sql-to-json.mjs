/**
 * Extract data from TRIB-CCAH SQL files into JSON seed files.
 *
 * Usage:
 *   node scripts/extract-sql-to-json.mjs <path-to-TRIB-CCAH-repo>
 *
 * Example:
 *   node scripts/extract-sql-to-json.mjs ../TRIB-CCAH
 *
 * This reads CleanedDataInsert.sql and produces:
 *   - data/articles.json
 *   - data/options.json
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, resolve } from "path";

const repoPath = process.argv[2];
if (!repoPath) {
  console.error("Usage: node scripts/extract-sql-to-json.mjs <path-to-TRIB-CCAH-repo>");
  process.exit(1);
}

const sqlPath = join(resolve(repoPath), "database", "CleanedDataInsert.sql");
const createPath = join(resolve(repoPath), "database", "CleanedDataCreate.sql");

console.log("Reading SQL files...");
const insertSql = readFileSync(sqlPath, "utf-8");
const createSql = readFileSync(createPath, "utf-8");

function extractColumns(sql, tableName) {
  const tableRegex = new RegExp(
    `CREATE TABLE IF NOT EXISTS public\\.${tableName}\\s*\\(([^;]+)\\)`,
    "is"
  );
  const match = sql.match(tableRegex);
  if (!match) return [];
  return match[1]
    .split("\n")
    .map((line) => {
      const colMatch = line.match(/"([^"]+)"/);
      return colMatch ? colMatch[1] : null;
    })
    .filter(Boolean);
}

function parseInsertValues(sql, tableName) {
  const regex = new RegExp(
    `INSERT INTO public\\.${tableName}[^;]*VALUES\\s*([\\s\\S]*?);`,
    "gi"
  );
  const rows = [];

  let match;
  while ((match = regex.exec(sql)) !== null) {
    const valuesStr = match[1];
    let current = "";
    let inQuote = false;
    let depth = 0;

    for (let i = 0; i < valuesStr.length; i++) {
      const ch = valuesStr[i];
      if (ch === "'" && !inQuote) {
        inQuote = true;
        current += ch;
      } else if (ch === "'" && inQuote) {
        if (valuesStr[i + 1] === "'") {
          current += "'";
          i++;
        } else {
          inQuote = false;
          current += ch;
        }
      } else if (ch === "(" && !inQuote) {
        depth++;
        if (depth === 1) {
          current = "";
          continue;
        }
        current += ch;
      } else if (ch === ")" && !inQuote) {
        depth--;
        if (depth === 0) {
          rows.push(current);
          current = "";
          continue;
        }
        current += ch;
      } else {
        current += ch;
      }
    }
  }

  return rows;
}

function parseRow(rowStr) {
  const values = [];
  let current = "";
  let inQuote = false;

  for (let i = 0; i < rowStr.length; i++) {
    const ch = rowStr[i];
    if (ch === "'" && !inQuote) {
      inQuote = true;
    } else if (ch === "'" && inQuote) {
      if (rowStr[i + 1] === "'") {
        current += "'";
        i++;
      } else {
        inQuote = false;
      }
    } else if (ch === "," && !inQuote) {
      values.push(current.trim() === "NULL" ? null : current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  values.push(current.trim() === "NULL" ? null : current.trim());
  return values;
}

const outDir = join(process.cwd(), "data");
mkdirSync(outDir, { recursive: true });

for (const table of ["articles", "options"]) {
  console.log(`\nProcessing ${table}...`);
  const columns = extractColumns(createSql, table);
  console.log(`  Columns (${columns.length}): ${columns.slice(0, 5).join(", ")}...`);

  const rawRows = parseInsertValues(insertSql, table);
  console.log(`  Raw rows found: ${rawRows.length}`);

  const jsonRows = rawRows.map((rowStr) => {
    const values = parseRow(rowStr);
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = values[i] ?? null;
    });
    return obj;
  });

  const outPath = join(outDir, `${table}.json`);
  writeFileSync(outPath, JSON.stringify(jsonRows, null, 2));
  console.log(`  Written to ${outPath} (${jsonRows.length} rows)`);
}

console.log("\nDone! Seed files created in data/");
