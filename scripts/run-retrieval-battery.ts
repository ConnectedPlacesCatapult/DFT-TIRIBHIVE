/**
 * Retrieval battery runner — fires the same POST + SSE consumption as the browser chat.
 *
 * Usage (from repo root):
 *   npx tsx scripts/run-retrieval-battery.ts --base=http://localhost:3000 --in docs/qa/retrieval-battery-2026-05-01.jsonl --out docs/qa/retrieval-battery-run.jsonl
 *
 * Against staging:
 *   npx tsx scripts/run-retrieval-battery.ts --base=https://hive-staging-....azurewebsites.net
 *
 * If you get HTTP 500 with an empty body, the failure happens *before* the SSE stream starts
 * (usually Supabase/pgvector retrieval in prepareAICall, or an unclassified OpenAI error).
 * Use Azure Log stream or Application Insights on the failing request to see the stack trace.
 */

import { createReadStream, createWriteStream } from "fs";
import { createInterface } from "readline";

const ID_RE = /\[ID_[^\]]+\]/g;

type Row = Record<string, unknown>;

function normalizeBase(url: string): string {
  return url.replace(/\/$/, "");
}

function parseArgs(): { base: string; inputPath: string; outputPath: string } {
  const args = process.argv.slice(2);
  let base = "http://localhost:3000";
  let inputPath = "docs/qa/retrieval-battery-2026-05-01.jsonl";
  let outputPath = "docs/qa/retrieval-battery-run.jsonl";
  for (const a of args) {
    if (a.startsWith("--base=")) base = a.slice(7);
    else if (a.startsWith("--in=")) inputPath = a.slice(5);
    else if (a.startsWith("--out=")) outputPath = a.slice(6);
  }
  return { base: normalizeBase(base), inputPath, outputPath };
}

function extractIdsFromText(text: string): string[] {
  const matches = text.match(ID_RE);
  if (!matches) return [];
  return [...new Set(matches.map((m) => m.slice(1, -1)))];
}

async function chatOnce(base: string, query: string): Promise<{
  ok: boolean;
  status: number;
  text: string;
  chips: string[] | null;
}> {
  const body = {
    messages: [{ role: "user" as const, text: query }],
    context: { mode: "explore" as const },
  };
  const res = await fetch(`${base}/api/handbook/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    return {
      ok: false,
      status: res.status,
      text: await res.text().catch(() => ""),
      chips: null,
    };
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  let chips: string[] | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6)) as Record<string, unknown>;
        if (typeof data.token === "string") fullText += data.token;
        if (data.done === true) {
          if (typeof data.text === "string") fullText = data.text;
          if (typeof data.message === "string" && !fullText) fullText = data.message as string;
          if (Array.isArray(data.chips)) chips = data.chips as string[];
        }
      } catch {
        /* malformed SSE fragment */
      }
    }
  }
  return { ok: true, status: res.status, text: fullText, chips };
}

function scoreVerdict(row: Row & { _last_text?: string }, cited: string[]): { verdict: string; summary: string } {
  const expected = row.expected_ids;
  const cat = String(row.category ?? "");
  const body = String(row._last_text ?? "");

  if (expected === "outside_hive") {
    const refusal =
      /\boutside\b.*\bknowledge\b/i.test(body) ||
      /\b(can't|cannot|don't have)\b.*\bHive\b/i.test(body);
    if (refusal && cited.length === 0) return { verdict: "refused_correctly", summary: "Declined / scoped to KB" };
    if (cited.length === 0) return { verdict: "partial", summary: "No IDs cited; refusal wording unclear" };
    return { verdict: "fail", summary: "Cited IDs on an off-topic question" };
  }

  if (expected === "all_66" || expected === "count_66") {
    return {
      verdict: cited.length >= 12 ? "partial" : "partial",
      summary: expected === "count_66" ? "Enumeration/count — manual review" : "Full list unlikely — manual review",
    };
  }

  if (Array.isArray(expected)) {
    if (expected.length === 0) {
      const hasAny = cited.length > 0;
      return hasAny
        ? { verdict: "partial", summary: `Expected empty set; got ${cited.join(", ")}` }
        : { verdict: "pass", summary: "No matching cases cited as expected for sparse query" };
    }
    const overlap = cited.filter((id) => expected.includes(id));
    if (overlap.length === expected.length && cited.every((id) => expected.includes(id)))
      return { verdict: "pass", summary: `Matched expected: ${overlap.join(", ")}` };
    if (overlap.length > 0)
      return { verdict: "partial", summary: `Overlap ${overlap.join(", ")}; expected ${expected.join(", ")}` };
    return { verdict: "fail", summary: `No overlap; cited ${cited.join(", ") || "(none)"}` };
  }

  return { verdict: "partial", summary: `[${cat}] manual review — unexpected expected_ids shape` };
}

async function main() {
  const { base, inputPath, outputPath } = parseArgs();
  const out = createWriteStream(outputPath, { flags: "w", encoding: "utf8" });
  const rl = createInterface({
    input: createReadStream(inputPath, "utf8"),
    crlfDelay: Infinity,
  });

  console.error(`Battery: POST ${base}/api/handbook/chat (SSE)`);
  console.error(`Input:  ${inputPath}`);
  console.error(`Output: ${outputPath}\n`);

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let row = JSON.parse(trimmed) as Row;
    const query = String(row.query ?? "");

    try {
      const result = await chatOnce(base, query);
      row = { ...row };
      delete row.actual_response_summary;

      if (!result.ok) {
        row.returned_ids = null;
        row.verdict = "api_error";
        row.actual_response_summary = `HTTP ${result.status}${result.text ? ` — ${result.text.slice(0, 200)}` : ""}`;
        row.root_cause_hypothesis = `${row.root_cause_hypothesis ?? ""} (api_error)`.trim();
      } else {
        const cited = [...new Set([...(result.chips ?? []).filter(Boolean), ...extractIdsFromText(result.text)])];
        row.returned_ids = cited.length ? cited : [];
        const { verdict, summary } = scoreVerdict({ ...row, _last_text: result.text } as Row & { _last_text: string }, cited);
        row.verdict = verdict;
        row.actual_response_summary = summary;
      }

      delete row._last_text;
      const lineOut = `${JSON.stringify(row)}\n`;
      out.write(lineOut);
      console.error(`${row.verdict}\t${query.slice(0, 60)}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const rowOut = {
        ...row,
        returned_ids: null,
        verdict: "api_error",
        actual_response_summary: `Fetch error — ${msg}`,
      };
      out.write(`${JSON.stringify(rowOut)}\n`);
      console.error(`api_error\t${query.slice(0, 40)}\t${msg}`);
    }
  }

  out.end();
  await new Promise<void>((res, rej) => {
    out.on("finish", res);
    out.on("error", rej);
  });
  console.error("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
