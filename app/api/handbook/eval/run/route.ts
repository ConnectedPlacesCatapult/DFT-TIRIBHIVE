const CASE_TIMEOUT_MS = 30_000;

/**
 * POST /api/handbook/eval/run
 *
 * Reads hive.eval_cases (supports body: page, mode, group, variant).
 * For each case: mode=search → semanticSearchChunks; else → getAIResponse.
 * Auto-scores, writes to hive.eval_runs. 300ms delay between cases, 15s timeout per case.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  getAIResponse,
  parseStringContext,
  semanticSearchChunks,
  type ChatMessageIn,
  type ChatContext,
  type ChatApiResponse,
} from "@/lib/handbook/chat-api";

// ---------------------------------------------------------------------------
// Types (match hive.eval_cases / hive.eval_runs)
// ---------------------------------------------------------------------------

type EvalCaseRow = {
  id: string;
  test_id: string;
  page: string;
  mode: string;
  description: string | null;
  messages: unknown; // jsonb: array of { role, text }
  context: string | null;
  brief_case_ids: string[] | null;
  expected_signals: unknown;
  variant: string | null;
  variant_config: Record<string, unknown> | null;
  test_group: string | null;
  follow_on_messages: unknown; // jsonb: array of { role, text } or null
};

type EvalRunInsert = {
  run_batch: string;
  eval_case_id: string;
  test_id: string;
  test_group: string | null;
  mode: string;
  page: string;
  variant: string | null;
  messages_sent: unknown;
  response_text: string;
  response_action: unknown;
  sources: string[] | null;
  retrieval_mode: string;
  response_ms: number;
  citation_count: number;
  admitted_no_data: boolean;
  proposed_update_fired: boolean;
  word_count: number;
  mentions_brief: boolean;
  expected_signals: unknown;
  score_citations: number | null;
  score_relevant: boolean | null;
  reviewer_notes: string | null;
};

const ADMITTED_PHRASES = [
  "insufficient",
  "no evidence",
  "don't have",
  "data doesn't specify",
  "cannot confirm",
  "not enough evidence",
];

const BRIEF_PHRASES = ["brief", "build a brief", "brief builder"];

function autoScore(responseText: string, responseAction: ChatApiResponse["action"]) {
  const citationCount = (responseText.match(/\[ID_\w+\]/g) || []).length;
  const admittedNoData = ADMITTED_PHRASES.some((phrase) =>
    responseText.toLowerCase().includes(phrase)
  );
  const proposedUpdateFired = responseAction?.type === "update_brief_section";
  const wordCount = responseText.trim().split(/\s+/).filter(Boolean).length;
  const mentionsBrief = BRIEF_PHRASES.some((phrase) =>
    responseText.toLowerCase().includes(phrase)
  );
  return { citationCount, admittedNoData, proposedUpdateFired, wordCount, mentionsBrief };
}

function parseMessages(messages: unknown): ChatMessageIn[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m): m is { role: string; text: string } => m && typeof m === "object" && "role" in m && "text" in m)
    .map((m) => ({ role: m.role as "user" | "ai", text: String(m.text) }));
}

/** Load document chunks for given trib IDs and return format suitable for ChatContext (article_id as trib id). */
async function loadChunksForTribIds(
  tribIds: string[]
): Promise<{ article_id: string; section_key: string; chunk_text: string }[]> {
  if (tribIds.length === 0) return [];
  const sb = getSupabaseClient();
  // Resolve trib_article_id -> articles.id (UUID)
  const { data: articles } = await sb
    .from("articles")
    .select("id, trib_article_id")
    .in("trib_article_id", tribIds);
  if (!articles?.length) return [];
  const uuids = articles.map((a) => a.id);
  const tribByUuid = new Map(articles.map((a) => [a.id, a.trib_article_id ?? a.id]));

  const { data: chunks } = await sb
    .from("document_chunks")
    .select("article_id, section_key, chunk_text")
    .in("article_id", uuids)
    .order("chunk_index", { ascending: true });

  if (!chunks?.length) return [];
  return chunks.map((c) => ({
    article_id: tribByUuid.get(c.article_id) ?? c.article_id,
    section_key: c.section_key ?? "general",
    chunk_text: c.chunk_text,
  }));
}

function buildContextFromCase(row: EvalCaseRow): ChatContext {
  const raw = row.context ?? "browse";
  const context = parseStringContext(raw);
  if (row.brief_case_ids?.length) {
    context.brief_case_ids = row.brief_case_ids;
  }
  return context;
}

export async function POST(req: NextRequest) {
  console.log("[EVAL] eval/run POST invoked once per request at", new Date().toISOString());
  const errors: string[] = [];
  let body: { batch?: string; page?: string; mode?: string; group?: string; variant?: string } = {};
  try {
    body = await req.json();
  } catch {
    // optional body
  }
  const runBatch = body.batch ?? new Date().toISOString().slice(0, 13);
  const filterPage = body.page;
  const filterMode = body.mode;
  const filterGroup = body.group;
  const filterVariant = body.variant;

  // Diagnostic: confirm env is available in API route (RAG fallback often = missing env here)
  console.log("[EVAL] OPENAI_API_KEY set:", !!process.env.OPENAI_API_KEY);
  console.log(
    "[EVAL] Supabase URL set:",
    !!(process.env.HIVE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
  );
  console.log(
    "[EVAL] Supabase anon key set:",
    !!(
      process.env.HIVE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );

  try {
    const sb = getSupabaseClient();
    let query = sb.from("eval_cases").select("*");
    if (filterPage) query = query.eq("page", filterPage);
    if (filterMode) query = query.eq("mode", filterMode);
    if (filterGroup) query = query.eq("test_group", filterGroup);
    if (filterVariant) query = query.eq("variant", filterVariant);
    const { data: cases, error: casesError } = await query;

    if (casesError) {
      return NextResponse.json(
        { error: `eval_cases: ${casesError.message}` },
        { status: 500 }
      );
    }
    const rows = (cases ?? []) as EvalCaseRow[];
    if (rows.length === 0) {
      return NextResponse.json(
        { batch: runBatch, total: 0, message: "No eval cases match filters" },
        { status: 200 }
      );
    }

    const byPage: Record<string, number> = {};
    const citationCounts: number[] = [];

    for (const row of rows) {
      byPage[row.page] = (byPage[row.page] ?? 0) + 1;
      const variantConfig = row.variant_config ?? {};

      if (row.mode === "search") {
        const messages = parseMessages(row.messages);
        const queryText = messages[0]?.text ?? "";
        const threshold = (variantConfig.match_threshold as number) ?? 0.4;
        const start = Date.now();
        let scenario: "A" | "B" | "C" = "C";
        let topSimilarity = 0;
        let resultCount = 0;
        let retrievalMode: "rag" | "fallback" = "fallback";
        try {
          const searchPromise = semanticSearchChunks(queryText, {
            limit: 12,
            threshold,
          });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Case timeout (${CASE_TIMEOUT_MS / 1000}s)`)), CASE_TIMEOUT_MS)
          );
          const { chunks, mode } = await Promise.race([searchPromise, timeoutPromise]);
          retrievalMode = mode;
          topSimilarity = chunks[0]?.similarity ?? 0;
          const articleMap = new Map<string, number>();
          for (const c of chunks) {
            const cur = articleMap.get(c.article_id);
            if (cur === undefined || (c.similarity ?? 0) > cur) {
              articleMap.set(c.article_id, c.similarity ?? 0);
            }
          }
          resultCount = articleMap.size;
          if (topSimilarity >= 0.55) scenario = "A";
          else if (topSimilarity >= 0.4 && resultCount > 0) scenario = "B";
          const responseMs = Date.now() - start;
          const responseText = JSON.stringify({
            scenario,
            top_similarity: topSimilarity,
            result_count: resultCount,
          });
          const run: EvalRunInsert = {
            run_batch: runBatch,
            eval_case_id: row.id,
            test_id: row.test_id,
            test_group: row.test_group ?? null,
            mode: row.mode,
            page: row.page,
            variant: row.variant,
            messages_sent: row.messages,
            response_text: responseText,
            response_action: null,
            sources: null,
            retrieval_mode: retrievalMode,
            response_ms: responseMs,
            citation_count: 0,
            admitted_no_data: false,
            proposed_update_fired: false,
            word_count: responseText.trim().split(/\s+/).filter(Boolean).length,
            mentions_brief: false,
            expected_signals: row.expected_signals ?? null,
            score_citations: null,
            score_relevant: null,
            reviewer_notes: null,
          };
          await sb.from("eval_runs").insert(run);
        } catch (err) {
          errors.push(`${row.test_id}: ${err instanceof Error ? err.message : String(err)}`);
        }
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }

      // Chat modes: explore, deep_dive, synthesis
      const context = buildContextFromCase(row);
      if (context.mode === "deep_dive" && context.article_id) {
        const chunks = await loadChunksForTribIds([context.article_id]);
        context.article_chunks = chunks.map((c) => ({
          section_key: c.section_key,
          chunk_text: c.chunk_text,
        }));
      }
      if (context.mode === "synthesis" && context.brief_case_ids?.length) {
        context.brief_case_chunks = await loadChunksForTribIds(context.brief_case_ids);
      }
      const promptVersion = variantConfig.prompt_version as string | undefined;
      if (promptVersion === "explicit_table" && !context.session_intent) {
        context.session_intent =
          "[TABLE FORMAT REQUIRED for adaptation_approaches]";
      } else if (row.context && typeof row.context === "string" && row.context.startsWith("brief:") && context.session_intent == null) {
        context.session_intent = "";
      }

      let messages = parseMessages(row.messages);
      const followOn = Array.isArray(row.follow_on_messages)
        ? row.follow_on_messages
        : [];
      const maxTokens = variantConfig.max_tokens as number | undefined;

      let lastResponse: ChatApiResponse | null = null;
      let totalMs = 0;

      for (let i = 0; i <= followOn.length; i++) {
        if (i > 0) {
          const next = followOn[i - 1] as { role: string; text: string };
          messages = [
            ...messages,
            { role: (next.role === "ai" ? "ai" : "user") as "user" | "ai", text: next.text },
          ];
        }
        const start = Date.now();
        try {
          const chatPromise = getAIResponse(messages, context, {
            max_tokens: maxTokens,
          });
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Case timeout (${CASE_TIMEOUT_MS / 1000}s)`)), CASE_TIMEOUT_MS)
          );
          lastResponse = await Promise.race([chatPromise, timeoutPromise]);
        } catch (err) {
          errors.push(`${row.test_id} (turn ${i + 1}): ${err instanceof Error ? err.message : String(err)}`);
          break;
        }
        totalMs += Date.now() - start;
      }

      if (!lastResponse) continue;

      const { citationCount, admittedNoData, proposedUpdateFired, wordCount, mentionsBrief } =
        autoScore(lastResponse.text, lastResponse.action);
      citationCounts.push(citationCount);

      const run: EvalRunInsert = {
        run_batch: runBatch,
        eval_case_id: row.id,
        test_id: row.test_id,
        test_group: row.test_group ?? null,
        mode: row.mode,
        page: row.page,
        variant: row.variant,
        messages_sent: row.messages,
        response_text: lastResponse.text,
        response_action: lastResponse.action ?? null,
        sources: lastResponse.sources ?? null,
        retrieval_mode: lastResponse.retrieval_mode,
        response_ms: totalMs,
        citation_count: citationCount,
        admitted_no_data: admittedNoData,
        proposed_update_fired: proposedUpdateFired,
        word_count: wordCount,
        mentions_brief: mentionsBrief,
        expected_signals: row.expected_signals ?? null,
        score_citations: citationCount,
        score_relevant: null,
        reviewer_notes: null,
      };
      await sb.from("eval_runs").insert(run);
      await new Promise((r) => setTimeout(r, 300));
    }

    const avgCitations =
      citationCounts.length > 0
        ? citationCounts.reduce((a, b) => a + b, 0) / citationCounts.length
        : 0;

    return NextResponse.json({
      batch: runBatch,
      total: rows.length,
      byPage,
      avgCitations,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[HIVE] Eval run error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Eval run failed",
        batch: runBatch,
      },
      { status: 500 }
    );
  }
}
