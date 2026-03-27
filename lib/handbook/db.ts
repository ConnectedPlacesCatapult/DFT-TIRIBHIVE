/**
 * HIVE data abstraction layer.
 *
 * DATA_PROVIDER env var controls the primary backend:
 *   "json"      (L0) — static JSON/seed data, no external deps (default)
 *   "supabase"  (Phase A) — Supabase Postgres + pgvector
 *   "azure"     (Phase B) — Azure Postgres Flexible Server (PRIMARY)
 *                           automatically falls back to Supabase if Azure fails
 *
 * Fallback chain when DATA_PROVIDER=azure:
 *   Azure → Supabase → JSON (semantic search degrades to keyword in JSON mode)
 *
 * All functions are async so callers never need to change when the provider switches.
 * Pages and components import from here only — never from @supabase/* or pg directly.
 */

import type { CaseStudy } from "@/lib/hive/seed-data";
import type { OptionRow } from "@/lib/handbook/options-data";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type HiveArticle = {
  id: string;
  source_id?: string;
  transport_sector?: string;
  asset_type?: string;
  hazard_cause?: string;
  hazard_effect?: string;
  project_title: string;
  measure_title: string;
  measure_description?: string;
  case_study_text?: string;
  content_type?: "case_study" | "guidance";
  trib_ranking?: number;
  created_at?: string;
  source_pdf_url?: string;
  sections?: Record<string, string>;
};

export type HiveOption = {
  id: string;
  transport_subsector: string;
  transport_assets?: string;
  climate_hazard_cause?: string;
  climate_hazard_effect?: string;
  climate_risk_to_assets?: string;
  adaptation_measure: string;
  adaptation_measure_description?: string;
  response_and_recovery_measures?: string;
  identified_cobenefits?: string;
};

export type SynthesisSession = {
  id: string;
  article_ids: string[];
  query_context?: string;
  created_at?: string;
};

export type ReportSection = {
  id: string;
  session_id: string;
  section_key: string;
  section_title: string;
  content: string;
  confidence?: "high" | "partial" | "indicative";
  source_chunk_ids?: string[];
  sort_order: number;
};

export type DocumentChunk = {
  id: string;
  article_id?: string;
  chunk_index: number;
  chunk_text: string;
  metadata?: Record<string, unknown>;
  similarity?: number;
};

// ---------------------------------------------------------------------------
// Provider detection
// ---------------------------------------------------------------------------

function getProvider(): "json" | "supabase" | "azure" {
  const p = process.env.DATA_PROVIDER;
  if (p === "supabase" || p === "azure") return p;
  return "json";
}

/** Current data provider — gate Supabase-only brief features (article_cards, option links). */
export function getHiveDataProvider(): "json" | "supabase" | "azure" {
  return getProvider();
}

// ---------------------------------------------------------------------------
// Supabase client (lazy singleton)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getSupabaseClient(): any {
  if (_supabase) return _supabase;

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createClient } = require("@supabase/supabase-js");
  const url =
    process.env.HIVE_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.HIVE_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "HIVE_SUPABASE_URL and HIVE_SUPABASE_ANON_KEY must be set when DATA_PROVIDER=supabase"
    );
  }

  _supabase = createClient(url, key, { db: { schema: "hive" } });
  return _supabase;
}

// ---------------------------------------------------------------------------
// Azure PostgreSQL client (lazy Pool — reused across requests)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _azurePool: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAzurePool(): Promise<any> {
  if (_azurePool) return _azurePool;

  const host = process.env.AZURE_POSTGRES_HOST;
  const user = process.env.AZURE_POSTGRES_USER;
  const password = process.env.AZURE_POSTGRES_PASSWORD;
  const database = process.env.AZURE_POSTGRES_DB ?? "postgres";

  if (!host || !user || !password) {
    throw new Error(
      "AZURE_POSTGRES_HOST, AZURE_POSTGRES_USER and AZURE_POSTGRES_PASSWORD must be set when DATA_PROVIDER=azure"
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Pool } = require("pg");
  _azurePool = new Pool({
    host,
    port: 5432,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  // Validate on first use
  const client = await _azurePool.connect();
  client.release();
  return _azurePool;
}

// ---------------------------------------------------------------------------
// JSON fallback (L0 — from case-studies.json or seed data)
// ---------------------------------------------------------------------------

type CaseStudyJson = {
  trib_id: string;
  organisation: string;
  transport_subsector?: string | null;
  hazard_cause?: string | null;
  hazard_effect?: string | null;
  asset_type?: string | null;
  measure_title?: string | null;
  measure_description?: string | null;
  case_study_text?: string | null;
  source_pdf_url?: string | null;
  sections?: Record<string, string>;
};

let _jsonCache: HiveArticle[] | null = null;

function mapJsonToArticle(cs: CaseStudyJson): HiveArticle {
  return {
    id: cs.trib_id,
    transport_sector: cs.transport_subsector ?? undefined,
    hazard_cause: cs.hazard_cause ?? undefined,
    hazard_effect: cs.hazard_effect ?? undefined,
    asset_type: cs.asset_type ?? undefined,
    project_title: cs.organisation,
    measure_title: cs.measure_title ?? "Climate adaptation",
    measure_description: cs.measure_description ?? undefined,
    case_study_text: cs.case_study_text ?? cs.sections?.challenge ?? undefined,
    content_type: "case_study",
    source_pdf_url: cs.source_pdf_url ?? undefined,
    sections: cs.sections,
  };
}

async function getJsonArticles(): Promise<HiveArticle[]> {
  if (_jsonCache) return _jsonCache;
  try {
    const jsonData = (await import("@/data/case-studies.json")).default as CaseStudyJson[];
    _jsonCache = jsonData.map(mapJsonToArticle);
    return _jsonCache;
  } catch {
    const { CASE_STUDIES } = await import("@/lib/hive/seed-data");
    _jsonCache = CASE_STUDIES.map((cs: CaseStudy) => ({
      id: cs.id,
      transport_sector: cs.sector,
      hazard_cause: cs.hazards.cause.join(", "),
      hazard_effect: cs.hazards.effect.join(", "),
      project_title: cs.title,
      measure_title: cs.measures.join(", "),
      measure_description: cs.measures.join(", "),
      case_study_text: cs.summary,
      content_type: "case_study" as const,
    }));
    return _jsonCache;
  }
}

async function getJsonOptions(): Promise<HiveOption[]> {
  const { OPTIONS_DATA } = await import("@/lib/handbook/options-data");
  return OPTIONS_DATA.map((row: OptionRow) => ({
    id: String(row.id),
    transport_subsector: row.transport_subsector,
    transport_assets: row.transport_assets,
    climate_hazard_cause: row.climate_hazard_cause,
    climate_hazard_effect: row.climate_hazard_effect,
    climate_risk_to_assets: row.climate_risk_to_assets,
    adaptation_measure: row.adaptation_measure,
    adaptation_measure_description: row.adaptation_measure_description,
    response_and_recovery_measures: row.response_and_recovery_measures,
    identified_cobenefits: row.identified_cobenefits,
  }));
}

// ---------------------------------------------------------------------------
// Azure query helpers
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToArticle(row: any): HiveArticle {
  return {
    id: row.trib_article_id ?? row.id,
    source_id: row.source_id,
    transport_sector: row.transport_sector ?? undefined,
    asset_type: row.asset_type ?? undefined,
    hazard_cause: row.hazard_cause ?? undefined,
    hazard_effect: row.hazard_effect ?? undefined,
    project_title: row.project_title,
    measure_title: row.measure_title,
    measure_description: row.measure_description ?? undefined,
    case_study_text: row.case_study_text ?? undefined,
    content_type: row.content_type ?? undefined,
    trib_ranking: row.trib_ranking ?? undefined,
    created_at: row.created_at?.toISOString?.() ?? row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOption(row: any): HiveOption {
  return {
    id: row.id,
    transport_subsector: row.transport_subsector,
    transport_assets: row.transport_assets ?? undefined,
    climate_hazard_cause: row.climate_hazard_cause ?? undefined,
    climate_hazard_effect: row.climate_hazard_effect ?? undefined,
    climate_risk_to_assets: row.climate_risk_to_assets ?? undefined,
    adaptation_measure: row.adaptation_measure,
    adaptation_measure_description: row.adaptation_measure_description ?? undefined,
    response_and_recovery_measures: row.response_and_recovery_measures ?? undefined,
    identified_cobenefits: row.identified_cobenefits ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Fetch all case study articles, optionally filtered by sector/hazard. */
export async function getHiveArticles(filters?: {
  sector?: string;
  hazard?: string;
}): Promise<HiveArticle[]> {
  const provider = getProvider();

  if (provider === "json") {
    const articles = await getJsonArticles();
    if (!filters) return articles;
    return articles.filter((a) => {
      if (filters.sector && !a.transport_sector?.toLowerCase().includes(filters.sector.toLowerCase()))
        return false;
      if (filters.hazard && !a.hazard_cause?.toLowerCase().includes(filters.hazard.toLowerCase()))
        return false;
      return true;
    });
  }

  // Azure primary — Supabase fallback
  if (provider === "azure") {
    try {
      const pool = await getAzurePool();
      const params: string[] = [];
      const conditions: string[] = [];
      if (filters?.sector) { params.push(`%${filters.sector}%`); conditions.push(`transport_sector ILIKE $${params.length}`); }
      if (filters?.hazard) { params.push(`%${filters.hazard}%`); conditions.push(`hazard_cause ILIKE $${params.length}`); }
      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const result = await pool.query(`SELECT * FROM hive.articles ${where} ORDER BY created_at`, params);
      return result.rows.map(rowToArticle);
    } catch (azureErr) {
      console.warn("[HIVE] Azure getHiveArticles failed, falling back to Supabase:", azureErr);
    }
  }

  // Supabase (direct or fallback)
  const sb = getSupabaseClient();
  let query = sb.from("articles").select("*");
  if (filters?.sector) query = query.ilike("transport_sector", `%${filters.sector}%`);
  if (filters?.hazard) query = query.ilike("hazard_cause", `%${filters.hazard}%`);
  const { data, error } = await query;
  if (error) throw new Error(`Supabase getHiveArticles: ${error.message}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as Array<HiveArticle & { trib_article_id?: string }>).map((row) => ({
    ...row,
    id: row.trib_article_id ?? row.id,
  }));
}

/** Fetch a single article by its trib_article_id (e.g. "ID_40") or UUID. */
export async function getHiveArticleById(id: string): Promise<HiveArticle | null> {
  const provider = getProvider();

  if (provider === "json") {
    const articles = await getJsonArticles();
    return articles.find((a) => a.id === id) ?? null;
  }

  // Azure primary — Supabase fallback
  if (provider === "azure") {
    try {
      const pool = await getAzurePool();

      // Look up article
      const { rows } = await pool.query(
        `SELECT a.*, s.original_url
         FROM hive.articles a
         LEFT JOIN hive.sources s ON s.id = a.source_id
         WHERE a.trib_article_id = $1 OR a.id::text = $1
         LIMIT 1`,
        [id]
      );
      if (!rows.length) return null;

      const row = rows[0];
      const article: HiveArticle = {
        ...rowToArticle(row),
        source_pdf_url: row.original_url ?? undefined,
      };

      // Load sections from document_chunks
      const { rows: chunks } = await pool.query(
        `SELECT section_key, chunk_text FROM hive.document_chunks
         WHERE article_id = $1 AND section_key IS NOT NULL
         ORDER BY chunk_index`,
        [row.id]
      );
      if (chunks.length) {
        const sections: Record<string, string> = {};
        for (const c of chunks) {
          if (c.section_key && c.chunk_text) sections[c.section_key] = c.chunk_text;
        }
        article.sections = sections;
      }
      return article;
    } catch (azureErr) {
      console.warn("[HIVE] Azure getHiveArticleById failed, falling back to Supabase:", azureErr);
    }
  }

  // Supabase (direct or fallback)
  const sb = getSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let row: any = null;
  const { data: byTribId } = await sb.from("articles").select("*").eq("trib_article_id", id).maybeSingle();
  if (byTribId) {
    row = byTribId;
  } else {
    const { data } = await sb.from("articles").select("*").eq("id", id).maybeSingle();
    row = data;
  }
  if (!row) return null;

  const article: HiveArticle = { ...row, id: row.trib_article_id ?? row.id };

  const { data: chunks } = await sb.from("document_chunks").select("section_key, chunk_text").eq("article_id", row.id).order("chunk_index");
  if (chunks?.length) {
    const sections: Record<string, string> = {};
    for (const c of chunks) {
      if (c.section_key && c.chunk_text) sections[c.section_key] = c.chunk_text;
    }
    article.sections = sections;
  }

  if (row.source_id) {
    const { data: src } = await sb.from("sources").select("original_url").eq("id", row.source_id).maybeSingle();
    if (src?.original_url) article.source_pdf_url = src.original_url;
  }

  return article;
}

/** Fetch all adaptation options, optionally filtered by sector/hazard. */
export async function getHiveOptions(filters?: {
  sector?: string;
  hazard?: string;
}): Promise<HiveOption[]> {
  const provider = getProvider();

  if (provider === "json") {
    const options = await getJsonOptions();
    if (!filters) return options;
    return options.filter((o) => {
      if (filters.sector && !o.transport_subsector.toLowerCase().includes(filters.sector.toLowerCase())) return false;
      if (filters.hazard && !o.climate_hazard_cause?.toLowerCase().includes(filters.hazard.toLowerCase())) return false;
      return true;
    });
  }

  // Azure primary — Supabase fallback
  if (provider === "azure") {
    try {
      const pool = await getAzurePool();
      const params: string[] = [];
      const conditions: string[] = [];
      if (filters?.sector) { params.push(`%${filters.sector}%`); conditions.push(`transport_subsector ILIKE $${params.length}`); }
      if (filters?.hazard) { params.push(`%${filters.hazard}%`); conditions.push(`climate_hazard_cause ILIKE $${params.length}`); }
      const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
      const result = await pool.query(`SELECT * FROM hive.options ${where}`, params);
      return result.rows.map(rowToOption);
    } catch (azureErr) {
      console.warn("[HIVE] Azure getHiveOptions failed, falling back to Supabase:", azureErr);
    }
  }

  // Supabase (direct or fallback)
  const sb = getSupabaseClient();
  let query = sb.from("options").select("*");
  if (filters?.sector) query = query.ilike("transport_subsector", `%${filters.sector}%`);
  if (filters?.hazard) query = query.ilike("climate_hazard_cause", `%${filters.hazard}%`);
  const { data, error } = await query;
  if (error) throw new Error(`Supabase getHiveOptions: ${error.message}`);
  return (data ?? []) as HiveOption[];
}

/**
 * Semantic search over document_chunks using pgvector.
 * Falls back to keyword search in json mode.
 */
export async function semanticSearch(
  query: string,
  opts?: { limit?: number; threshold?: number; filterSection?: string }
): Promise<DocumentChunk[]> {
  const provider = getProvider();
  const limit = opts?.limit ?? 10;

  if (provider === "json") {
    const articles = await getJsonArticles();
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results: DocumentChunk[] = [];
    for (const a of articles) {
      const texts = [a.case_study_text, a.project_title, a.measure_title, a.hazard_cause, a.transport_sector];
      if (a.sections) { for (const content of Object.values(a.sections)) texts.push(content); }
      const match = words.some((w) => texts.some((t) => t?.toLowerCase().includes(w)));
      if (match) {
        results.push({ id: `json-${a.id}-0`, article_id: a.id, chunk_index: 0, chunk_text: a.case_study_text ?? a.measure_description ?? a.project_title });
      }
      if (results.length >= limit) break;
    }
    return results;
  }

  // Embed query with OpenAI (needed for both Azure and Supabase)
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const embResponse = await openai.embeddings.create({ model: "text-embedding-3-small", input: query });
  const embedding = embResponse.data[0].embedding;
  const embeddingStr = `[${embedding.join(",")}]`;
  const threshold = opts?.threshold ?? 0.7;

  // Azure primary — Supabase fallback
  if (provider === "azure") {
    try {
      const pool = await getAzurePool();
      const params = opts?.filterSection
        ? [embeddingStr, threshold, limit, opts.filterSection]
        : [embeddingStr, threshold, limit];
      const sql = opts?.filterSection
        ? `SELECT id, article_id, chunk_index, chunk_text, metadata,
                  1 - (embedding <=> $1::vector) AS similarity
           FROM hive.document_chunks
           WHERE embedding IS NOT NULL
             AND 1 - (embedding <=> $1::vector) > $2
             AND section_key = $4
           ORDER BY embedding <=> $1::vector
           LIMIT $3`
        : `SELECT id, article_id, chunk_index, chunk_text, metadata,
                  1 - (embedding <=> $1::vector) AS similarity
           FROM hive.document_chunks
           WHERE embedding IS NOT NULL
             AND 1 - (embedding <=> $1::vector) > $2
           ORDER BY embedding <=> $1::vector
           LIMIT $3`;
      const { rows } = await pool.query(sql, params);
      return rows.map((r: { id: string; article_id: string; chunk_index: number; chunk_text: string; metadata: Record<string, unknown>; similarity: number }) => ({
        id: r.id,
        article_id: r.article_id,
        chunk_index: r.chunk_index,
        chunk_text: r.chunk_text,
        metadata: r.metadata,
        similarity: r.similarity,
      }));
    } catch (azureErr) {
      console.warn("[HIVE] Azure semanticSearch failed, falling back to Supabase:", azureErr);
    }
  }

  // Supabase (direct or fallback)
  const sb = getSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb as any).rpc("hive_match_chunks", {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
    filter_section: opts?.filterSection ?? null,
  });
  if (error) throw new Error(`Supabase semanticSearch: ${error.message}`);
  return (data ?? []) as DocumentChunk[];
}

/** Create a synthesis session and persist generated sections. */
export async function createSynthesisSession(
  articleIds: string[],
  sections: Omit<ReportSection, "id" | "session_id">[],
  queryContext?: string
): Promise<SynthesisSession> {
  const provider = getProvider();

  if (provider === "json") {
    return { id: `session-${Date.now()}`, article_ids: articleIds, query_context: queryContext };
  }

  // Azure primary — Supabase fallback
  if (provider === "azure") {
    try {
      const pool = await getAzurePool();
      const { rows } = await pool.query(
        `INSERT INTO hive.synthesis_sessions (article_ids, query_context)
         VALUES ($1, $2) RETURNING *`,
        [articleIds, queryContext ?? null]
      );
      const session = rows[0];
      if (sections.length) {
        const sectionRows = sections.map((s, i) => ({ ...s, session_id: session.id, sort_order: s.sort_order ?? i }));
        for (const s of sectionRows) {
          await pool.query(
            `INSERT INTO hive.report_sections
               (session_id, section_key, section_title, content, confidence, source_chunk_ids, sort_order)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [s.session_id, s.section_key, s.section_title, s.content, s.confidence ?? null,
             s.source_chunk_ids ?? null, s.sort_order]
          );
        }
      }
      return { id: session.id, article_ids: session.article_ids, query_context: session.query_context ?? undefined };
    } catch (azureErr) {
      console.warn("[HIVE] Azure createSynthesisSession failed, falling back to Supabase:", azureErr);
    }
  }

  // Supabase (direct or fallback)
  const sb = getSupabaseClient();
  const { data: session, error: sessionError } = await sb.from("synthesis_sessions").insert({ article_ids: articleIds, query_context: queryContext ?? null }).select().single();
  if (sessionError) throw new Error(`Supabase createSynthesisSession: ${sessionError.message}`);
  const sectionRows = sections.map((s, i) => ({ ...s, session_id: session.id, sort_order: s.sort_order ?? i }));
  const { error: sectionsError } = await sb.from("report_sections").insert(sectionRows);
  if (sectionsError) throw new Error(`Supabase insertReportSections: ${sectionsError.message}`);
  return session as SynthesisSession;
}

/** Fetch all report sections for a synthesis session. */
export async function getReportSections(sessionId: string): Promise<ReportSection[]> {
  const provider = getProvider();

  if (provider === "json") return [];

  // Azure primary — Supabase fallback
  if (provider === "azure") {
    try {
      const pool = await getAzurePool();
      const { rows } = await pool.query(
        `SELECT * FROM hive.report_sections WHERE session_id = $1 ORDER BY sort_order`,
        [sessionId]
      );
      return rows as ReportSection[];
    } catch (azureErr) {
      console.warn("[HIVE] Azure getReportSections failed, falling back to Supabase:", azureErr);
    }
  }

  // Supabase (direct or fallback)
  const sb = getSupabaseClient();
  const { data, error } = await sb.from("report_sections").select("*").eq("session_id", sessionId).order("sort_order");
  if (error) throw new Error(`Supabase getReportSections: ${error.message}`);
  return (data ?? []) as ReportSection[];
}

/** Linked options-framework rows for brief generation. */
export type BriefLinkedOption = {
  trib_article_id: string;
  adaptation_measure: string;
  transport_subsector?: string | null;
  climate_hazard_cause?: string | null;
};

export async function getLinkedOptionsForBriefArticles(
  tribArticleIds: string[]
): Promise<BriefLinkedOption[]> {
  if (getProvider() === "json" || tribArticleIds.length === 0) return [];

  // Azure primary — Supabase fallback
  if (getProvider() === "azure") {
    try {
      const pool = await getAzurePool();
      const { rows } = await pool.query(
        `SELECT a.trib_article_id, o.adaptation_measure,
                o.transport_subsector, o.climate_hazard_cause
         FROM hive.option_case_links ocl
         JOIN hive.articles a ON a.id = ocl.article_id
         JOIN hive.options o ON o.id = ocl.option_id
         WHERE a.trib_article_id = ANY($1)`,
        [tribArticleIds]
      );
      return rows as BriefLinkedOption[];
    } catch (azureErr) {
      console.warn("[HIVE] Azure getLinkedOptionsForBriefArticles failed, falling back to Supabase:", azureErr);
    }
  }

  // Supabase (direct or fallback)
  try {
    const sb = getSupabaseClient();
    const { data: articleRows, error: artErr } = await sb.from("articles").select("id, trib_article_id").in("trib_article_id", tribArticleIds);
    if (artErr || !articleRows?.length) return [];

    const uuidToTrib = new Map<string, string>();
    for (const row of articleRows as { id: string; trib_article_id: string | null }[]) {
      if (row.id && row.trib_article_id) uuidToTrib.set(row.id, row.trib_article_id);
    }
    const articleUuids = [...uuidToTrib.keys()];
    if (!articleUuids.length) return [];

    const { data: links, error: linkErr } = await sb.from("option_case_links").select("article_id, option_id").in("article_id", articleUuids);
    if (linkErr || !links?.length) return [];

    const optionIds = [...new Set((links as { option_id: string }[]).map((l) => String(l.option_id)))];
    if (!optionIds.length) return [];

    const { data: optionRows, error: optErr } = await sb.from("options").select("id, adaptation_measure, transport_subsector, climate_hazard_cause").in("id", optionIds);
    if (optErr || !optionRows?.length) return [];

    const optById = new Map((optionRows as Record<string, unknown>[]).map((o) => [String(o.id), o]));
    const out: BriefLinkedOption[] = [];
    for (const l of links as { article_id: string; option_id: string }[]) {
      const trib = uuidToTrib.get(l.article_id);
      if (!trib) continue;
      const o = optById.get(String(l.option_id)) as { adaptation_measure?: string; transport_subsector?: string | null; climate_hazard_cause?: string | null } | undefined;
      if (!o?.adaptation_measure) continue;
      out.push({ trib_article_id: trib, adaptation_measure: o.adaptation_measure, transport_subsector: o.transport_subsector ?? null, climate_hazard_cause: o.climate_hazard_cause ?? null });
    }
    return out;
  } catch {
    return [];
  }
}

/** Check connectivity and return provider info — used by the admin health panel. */
export async function getProviderStatus(): Promise<{
  provider: string;
  healthy: boolean;
  message?: string;
  articleCount?: number;
  optionCount?: number;
  azureHealthy?: boolean;
  supabaseHealthy?: boolean;
}> {
  const provider = getProvider();

  if (provider === "json") {
    const articles = await getJsonArticles();
    const { OPTIONS_DATA } = await import("@/lib/handbook/options-data");
    return { provider: "json (L0 offline)", healthy: true, articleCount: articles.length, optionCount: OPTIONS_DATA.length };
  }

  if (provider === "azure") {
    let azureHealthy = false;
    let azureArticleCount = 0;
    let azureOptionCount = 0;
    let supabaseHealthy = false;

    try {
      const pool = await getAzurePool();
      const [a, o] = await Promise.all([
        pool.query("SELECT COUNT(*) FROM hive.articles"),
        pool.query("SELECT COUNT(*) FROM hive.options"),
      ]);
      azureArticleCount = parseInt(a.rows[0].count, 10);
      azureOptionCount = parseInt(o.rows[0].count, 10);
      azureHealthy = true;
    } catch (e) {
      console.warn("[HIVE] Azure health check failed:", e);
    }

    try {
      const sb = getSupabaseClient();
      await sb.from("articles").select("id", { count: "exact", head: true });
      supabaseHealthy = true;
    } catch {
      // non-fatal
    }

    return {
      provider: "azure (primary) + supabase (fallback)",
      healthy: azureHealthy,
      azureHealthy,
      supabaseHealthy,
      articleCount: azureArticleCount,
      optionCount: azureOptionCount,
      message: !azureHealthy ? "Azure unreachable — traffic routing to Supabase fallback" : undefined,
    };
  }

  // Supabase direct
  try {
    const sb = getSupabaseClient();
    const [{ count: articleCount }, { count: optionCount }] = await Promise.all([
      sb.from("articles").select("*", { count: "exact", head: true }),
      sb.from("options").select("*", { count: "exact", head: true }),
    ]);
    return { provider: "supabase (Phase A)", healthy: true, articleCount: articleCount ?? 0, optionCount: optionCount ?? 0 };
  } catch (err) {
    return { provider, healthy: false, message: err instanceof Error ? err.message : "Unknown connection error" };
  }
}

// ---------------------------------------------------------------------------
// Sync guard — warns if Supabase and JSON are out of sync
// ---------------------------------------------------------------------------

let _syncChecked = false;

export async function checkSyncStatus(): Promise<void> {
  if (_syncChecked || getProvider() !== "supabase") return;
  _syncChecked = true;
  try {
    const sb = getSupabaseClient();
    const { data: dbArticles } = await sb.from("articles").select("id");
    const dbCount = dbArticles?.length ?? 0;
    let jsonCount = 0;
    try {
      const jsonData = (await import("@/data/case-studies.json")).default;
      jsonCount = Array.isArray(jsonData) ? jsonData.length : 0;
    } catch { jsonCount = 0; }
    if (dbCount !== jsonCount) {
      console.warn(`[HIVE] Sync warning: DB has ${dbCount} articles, JSON has ${jsonCount}. Run: npm run export:hive`);
    }
  } catch { /* Non-fatal */ }
}
