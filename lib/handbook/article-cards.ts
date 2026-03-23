/**
 * Types and helpers for the HIVE article card generation system.
 *
 * An ArticleCard is a GPT-4o-generated structured summary of a case study,
 * derived from document_chunks and stored in hive.article_cards.
 */

// ---------------------------------------------------------------------------
// Card data — the JSON payload produced by GPT-4o (matches gold standard)
// ---------------------------------------------------------------------------

export type ArticleCardData = {
  project_title: string;
  organisation: string | null;
  trib_article_id: string;
  transport_sector: string | null;
  year_range: string | null;
  subtitle_stats: string | null;
  key_metrics: { value: string; label: string }[];
  key_insight: string;
  main_applications: string[];
  key_takeaways: string[];
  co_benefits_summary: {
    community: string | null;
    environmental: string | null;
    economic: string | null;
    carbon: string | null;
  };
  uk_transferability: "high" | "medium" | "low";
  evidence_quality: "strong" | "moderate" | "limited";
  transferability_rationale: string | null;
  transferability_contexts: string[];
  investment_detail: string | null;
  investment_band: string | null;
  funding_sources: string[];
  implementation_notes: string | null;
  challenges: string[];
  lessons_learned: string[];
  innovation_opportunity: string | null;
};

// ---------------------------------------------------------------------------
// Database row — what's stored in hive.article_cards (individual columns)
// ---------------------------------------------------------------------------

export type ArticleCardRow = {
  id: string;
  article_id: string;
  trib_article_id: string;
  project_title: string | null;
  organisation: string | null;
  transport_sector: string | null;
  year_range: string | null;
  subtitle_stats: string | null;
  key_metrics: { value: string; label: string }[] | null;
  key_insight: string | null;
  main_applications: string[] | null;
  key_takeaways: string[] | null;
  co_benefits_summary: {
    community: string | null;
    environmental: string | null;
    economic: string | null;
    carbon: string | null;
  } | null;
  uk_transferability: string | null;
  evidence_quality: string | null;
  transferability_rationale: string | null;
  transferability_contexts: string[] | null;
  investment_band: string | null;
  investment_detail: string | null;
  funding_sources: string[] | null;
  implementation_notes: string | null;
  challenges: string[] | null;
  lessons_learned: string[] | null;
  innovation_opportunity: string | null;
  content_hash: string | null;
  is_stale: boolean;
  generated_at: string | null;
  generation_model: string | null;
};

/** Convert an ArticleCardRow (DB) into the full ArticleCardData shape. */
export function rowToCardData(row: ArticleCardRow): ArticleCardData {
  return {
    project_title: row.project_title ?? row.trib_article_id,
    organisation: row.organisation ?? null,
    trib_article_id: row.trib_article_id,
    transport_sector: row.transport_sector ?? null,
    year_range: row.year_range ?? null,
    subtitle_stats: row.subtitle_stats ?? null,
    key_metrics: row.key_metrics ?? [],
    key_insight: row.key_insight ?? "",
    main_applications: row.main_applications ?? [],
    key_takeaways: row.key_takeaways ?? [],
    co_benefits_summary: row.co_benefits_summary ?? {
      community: null,
      environmental: null,
      economic: null,
      carbon: null,
    },
    uk_transferability: (row.uk_transferability as "high" | "medium" | "low") ?? "medium",
    evidence_quality: (row.evidence_quality as "strong" | "moderate" | "limited") ?? "limited",
    transferability_rationale: row.transferability_rationale ?? null,
    transferability_contexts: row.transferability_contexts ?? [],
    investment_detail: row.investment_detail ?? null,
    investment_band: row.investment_band ?? null,
    funding_sources: row.funding_sources ?? [],
    implementation_notes: row.implementation_notes ?? null,
    challenges: row.challenges ?? [],
    lessons_learned: row.lessons_learned ?? [],
    innovation_opportunity: row.innovation_opportunity ?? null,
  };
}

/**
 * Human-readable block for brief-generation prompts (structured intelligence).
 * Prefer this for costs / transfer sections; chunk text remains for citations.
 */
export function formatArticleCardRowForBriefPrompt(row: ArticleCardRow): string {
  const cob = row.co_benefits_summary;
  const cobParts: string[] = [];
  if (cob) {
    if (cob.community?.trim()) cobParts.push(`Community: ${cob.community.trim()}`);
    if (cob.environmental?.trim())
      cobParts.push(`Environmental: ${cob.environmental.trim()}`);
    if (cob.economic?.trim()) cobParts.push(`Economic: ${cob.economic.trim()}`);
    if (cob.carbon?.trim()) cobParts.push(`Carbon: ${cob.carbon.trim()}`);
  }
  const cobLine = cobParts.length ? cobParts.join("; ") : "";

  const metrics =
    row.key_metrics?.length && row.key_metrics.length > 0
      ? row.key_metrics.map((m) => `${m.label}: ${m.value}`).join("; ")
      : "";

  const challenges =
    row.challenges?.length && row.challenges.length > 0
      ? row.challenges.map((c) => `• ${c}`).join("\n")
      : "";

  const transfer =
    row.transferability_contexts?.length && row.transferability_contexts.length > 0
      ? row.transferability_contexts.join("; ")
      : "";

  const lines: string[] = [];
  lines.push(`## Case [${row.trib_article_id}] — Structured intelligence`);
  if (row.key_insight?.trim()) lines.push(`Key insight: ${row.key_insight.trim()}`);
  if (row.investment_band?.trim() || row.investment_detail?.trim()) {
    const band = row.investment_band?.trim() ?? "—";
    const detail = row.investment_detail?.trim() ?? "";
    lines.push(
      detail ? `Investment: ${band} — ${detail}` : `Investment: ${band}`
    );
  }
  if (cobLine) lines.push(`Co-benefits: ${cobLine}`);
  if (metrics) lines.push(`Key metrics: ${metrics}`);
  if (challenges) lines.push(`Challenges:\n${challenges}`);
  if (transfer) lines.push(`Transferable contexts: ${transfer}`);
  if (row.transferability_rationale?.trim()) {
    lines.push(`Transfer rationale: ${row.transferability_rationale.trim()}`);
  }
  if (row.uk_transferability?.trim()) {
    lines.push(`UK transferability (structured): ${row.uk_transferability.trim()}`);
  }
  lines.push("---");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Validation — check GPT output has all required fields
// ---------------------------------------------------------------------------

const VALID_TRANSFERABILITY = ["high", "medium", "low"];
const VALID_EVIDENCE = ["strong", "moderate", "limited"];

/**
 * Validate GPT output. Only truly fatal issues cause rejection.
 * trib_article_id is NOT required from GPT (we override it).
 * Null arrays are coerced to [] by normalizeCardData().
 */
export function validateCardData(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Response is not a JSON object"] };
  }

  const d = data as Record<string, unknown>;

  if (typeof d.key_insight !== "string" || (d.key_insight as string).trim() === "") {
    errors.push("Missing or empty required field: key_insight");
  }

  if (d.uk_transferability && !VALID_TRANSFERABILITY.includes(d.uk_transferability as string)) {
    errors.push(`Invalid uk_transferability: ${d.uk_transferability} (must be high|medium|low)`);
  }

  if (d.evidence_quality && !VALID_EVIDENCE.includes(d.evidence_quality as string)) {
    errors.push(`Invalid evidence_quality: ${d.evidence_quality} (must be strong|moderate|limited)`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Normalize GPT output — coerce null/missing fields to safe defaults.
 * Called after validation passes, before DB upsert.
 */
export function normalizeCardData(data: Record<string, unknown>): ArticleCardData {
  const toArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];

  const toMetrics = (v: unknown): { value: string; label: string }[] => {
    if (!Array.isArray(v)) return [];
    return v
      .filter((m) => m && typeof m === "object" && typeof m.value === "string" && typeof m.label === "string")
      .map((m) => ({ value: m.value, label: m.label }));
  };

  const cob = data.co_benefits_summary;
  const cobObj =
    cob && typeof cob === "object" && !Array.isArray(cob)
      ? (cob as Record<string, unknown>)
      : {};

  return {
    project_title: typeof data.project_title === "string" ? data.project_title : "",
    organisation: typeof data.organisation === "string" ? data.organisation : null,
    trib_article_id: typeof data.trib_article_id === "string" ? data.trib_article_id : "",
    transport_sector: typeof data.transport_sector === "string" ? data.transport_sector : null,
    year_range: typeof data.year_range === "string" ? data.year_range : null,
    subtitle_stats: typeof data.subtitle_stats === "string" ? data.subtitle_stats : null,
    key_metrics: toMetrics(data.key_metrics),
    key_insight: typeof data.key_insight === "string" ? data.key_insight : "",
    main_applications: toArray(data.main_applications),
    key_takeaways: toArray(data.key_takeaways),
    co_benefits_summary: {
      community: typeof cobObj.community === "string" ? cobObj.community : null,
      environmental: typeof cobObj.environmental === "string" ? cobObj.environmental : null,
      economic: typeof cobObj.economic === "string" ? cobObj.economic : null,
      carbon: typeof cobObj.carbon === "string" ? cobObj.carbon : null,
    },
    uk_transferability: VALID_TRANSFERABILITY.includes(data.uk_transferability as string)
      ? (data.uk_transferability as "high" | "medium" | "low")
      : "medium",
    evidence_quality: VALID_EVIDENCE.includes(data.evidence_quality as string)
      ? (data.evidence_quality as "strong" | "moderate" | "limited")
      : "limited",
    transferability_rationale: typeof data.transferability_rationale === "string" ? data.transferability_rationale : null,
    transferability_contexts: toArray(data.transferability_contexts),
    investment_detail: typeof data.investment_detail === "string" ? data.investment_detail : null,
    investment_band: typeof data.investment_band === "string" ? data.investment_band : null,
    funding_sources: toArray(data.funding_sources),
    implementation_notes: typeof data.implementation_notes === "string" ? data.implementation_notes : null,
    challenges: toArray(data.challenges),
    lessons_learned: toArray(data.lessons_learned),
    innovation_opportunity: typeof data.innovation_opportunity === "string" ? data.innovation_opportunity : null,
  };
}

// ---------------------------------------------------------------------------
// Gold standard JSON — embedded for use in prompts
// ---------------------------------------------------------------------------

export function getGoldStandardJson(): string {
  return JSON.stringify(
    {
      project_title: "Sheffield Grey to Green",
      organisation: "Sheffield City Council",
      trib_article_id: "ID_40",
      transport_sector: "Highways",
      year_range: "2014\u2013ongoing",
      subtitle_stats:
        "60% grey to green \u00b7 discharge cut 87% \u00b7 75,000 plants \u00b7 561% biodiversity uplift",
      key_metrics: [
        { value: "87%", label: "reduction in river discharge (1-in-100-year event)" },
        { value: "\u00a39.9m", label: "Phase 1 + 2 investment (Phase 3 ongoing)" },
        { value: "1.5km", label: "continuous urban green corridor" },
        { value: "561%", label: "biodiversity uplift (BREEAM assessment, Phase 2)" },
      ],
      key_insight:
        "SuDS reduced river discharge from 69.6 to 9.2 litres/sec in a 1-in-100-year event. Even with a 30% climate change uplift applied, discharge remains below 12.1 litres/sec. The scheme is now the default approach for Sheffield city centre regeneration and has inspired an \u00a380m Severn Trent SuDS project in Mansfield.",
      main_applications: [
        "Urban transport corridors where road runoff contributes to downstream flooding of rail or tram infrastructure",
        "Rail and tram lines following river valleys \u2014 scheme directly protects Sheffield rail and tram network downstream",
        "Local authority highway flood management programmes operating within existing maintenance budgets",
        "City centre regeneration projects where climate adaptation can be bundled with place-making investment",
        "Any infrastructure where grey surfacing has been identified as a primary contributor to catchment runoff volumes",
      ],
      key_takeaways: [
        "Nature-based SuDS can outperform grey flood infrastructure at lower long-term cost",
        "Phased delivery reduces capital risk",
        "Cross-sector impact is underappreciated",
        "University partnership provided design credibility",
        "Specialist horticultural knowledge is essential for long-term success",
      ],
      co_benefits_summary: {
        community: "98% of users want more green spaces; up to 20,000 pedestrian users per day",
        environmental:
          "Urban heat island reduced from 55\u00b0C to 20\u00b0C; pollutants captured before entering River Don",
        economic:
          "\u00a31m new investment in Castlegate area; 540 jobs created",
        carbon:
          "230 tonnes CO\u2082 sequestered; active travel promoted",
      },
      uk_transferability: "high",
      evidence_quality: "strong",
      transferability_rationale:
        "Largest retrofit grey-to-green project in the UK \u2014 directly applicable nationwide.",
      transferability_contexts: [
        "UK city centre transport corridors",
        "Rail lines following river valleys",
        "Urban tram networks",
        "Local authority highway flood management",
      ],
      investment_detail:
        "Phase 1: \u00a33.6m (2016) \u00b7 Phase 2: \u00a36.3m (2020) \u00b7 Phase 3: ongoing.",
      investment_band: "\u00a31m\u2013\u00a310m per phase",
      funding_sources: [
        "South Yorkshire MCA",
        "EU Regional Development Fund",
        "Sheffield City Council",
        "Canal & Rivers Trust (Ph.1)",
        "Yorkshire Water (Ph.2)",
      ],
      implementation_notes: "Specialist horticultural skills required for plant selection and long-term maintenance.",
      challenges: [
        "Salt runoff from de-icing activities affects plant health",
        "Biodiversity net gain requirements can conflict with plant species choices",
        "Local authority procurement capability is a barrier to replication",
      ],
      lessons_learned: [
        "Multiple smaller green spaces can match the flood mitigation impact of one large scheme",
        "Quality of planting design is as important as the engineering works",
        "Academic partnership provided credibility and consultation support",
      ],
      innovation_opportunity:
        "Automated stormwater planters connected to weather forecast data.",
    },
    null,
    2
  );
}
