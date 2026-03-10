import type { Article, Option, FilterMaps, HandbookFilterOptions } from "./types";

/**
 * Data abstraction layer.
 *
 * Phase 2: reads from static JSON files in /data.
 * Phase 3: env var switches to Supabase or Azure Postgres.
 *
 * All functions are async to support future DB backends without interface changes.
 */

let _articles: Article[] | null = null;
let _options: Option[] | null = null;

async function loadArticles(): Promise<Article[]> {
  if (_articles) return _articles;
  const data = await import("@/data/articles.json");
  _articles = data.default as Article[];
  return _articles;
}

async function loadOptions(): Promise<Option[]> {
  if (_options) return _options;
  const data = await import("@/data/options.json");
  _options = data.default as Option[];
  return _options;
}

export async function getArticles(filters?: {
  risk?: string;
  asset?: string;
}): Promise<Article[]> {
  const articles = await loadArticles();
  if (!filters) return articles;

  return articles.filter((a) => {
    if (filters.risk && a.risk !== filters.risk) return false;
    if (filters.asset && a.asset !== filters.asset) return false;
    return true;
  });
}

export async function getArticlesAdvanced(filters?: {
  sector?: string;
  risk?: string;
  asset?: string;
  effect?: string;
}): Promise<Article[]> {
  const articles = await loadArticles();
  if (!filters) return articles;

  return articles.filter((a) => {
    if (filters.sector) {
      const s = filters.sector;
      if (
        a.primary_transport_subsector?.trim() !== s &&
        a.secondary_transport_subsector?.trim() !== s
      )
        return false;
    }

    if (filters.asset) {
      const assetVal = filters.asset;
      const assetFields = [a.asset, a.subasset, a.subasset2, a.subasset3, a.subasset4];
      if (!assetFields.some((f) => f?.trim() === assetVal)) return false;
    }

    if (filters.risk) {
      const riskKey = filters.risk
        .trim()
        .replace(/ /g, "_")
        .replace(/-/g, "")
        .replace(/[()]/g, "")
        .replace(/\//g, "")
        .replace(/,/g, "")
        .replace(/__+/g, "_")
        .toLowerCase();
      const val = (a as Record<string, string>)[riskKey];
      if (val !== "Yes") return false;
    }

    if (filters.effect) {
      const effectKey = filters.effect
        .trim()
        .replace(/ /g, "_")
        .replace(/-/g, "")
        .replace(/[()]/g, "")
        .replace(/\//g, "")
        .replace(/,/g, "")
        .replace(/__+/g, "_")
        .toLowerCase();
      const val = (a as Record<string, string>)[effectKey];
      if (val !== "Yes") return false;
    }

    return true;
  });
}

export async function getOptionsData(filters?: {
  sector?: string;
  risk?: string;
  asset?: string;
  effect?: string;
}): Promise<Option[]> {
  const options = await loadOptions();
  if (!filters) return options;

  return options.filter((o) => {
    if (filters.sector && o.transport_subsector?.trim() !== filters.sector)
      return false;
    if (filters.asset && o.transport_assets?.trim() !== filters.asset)
      return false;
    if (
      filters.risk &&
      !o.climate_hazard_cause
        ?.toLowerCase()
        .includes(filters.risk.toLowerCase())
    )
      return false;
    if (filters.effect && o.climate_hazard_effect?.trim() !== filters.effect)
      return false;
    return true;
  });
}

export async function searchArticles(query: string): Promise<Article[]> {
  const articles = await loadArticles();
  if (!query.trim()) return articles;

  const words = query.trim().split(/\s+/);
  const searchFields: (keyof Article)[] = [
    "adaptation_measure",
    "adaptation_measure_title",
    "case_study",
    "title",
  ];

  const scored = articles.map((article) => {
    let score = 0;
    for (const word of words) {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      for (const field of searchFields) {
        const val = article[field];
        if (typeof val === "string" && regex.test(val)) {
          score++;
        }
      }
    }
    return { article, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.article);
}

export async function getFilterMaps(): Promise<FilterMaps> {
  const articles = await loadArticles();
  const allRisks: string[] = [
    ...new Set(articles.map((a) => a.risk).filter((r): r is string => r != null)),
  ];
  const allAssets: string[] = [
    ...new Set(articles.map((a) => a.asset).filter((a): a is string => a != null)),
  ];

  const riskToAssetMap: Record<string, string[]> = {};
  const assetToRiskMap: Record<string, string[]> = {};

  for (const a of articles) {
    if (a.risk && a.asset) {
      if (!riskToAssetMap[a.risk]) riskToAssetMap[a.risk] = [];
      if (!riskToAssetMap[a.risk].includes(a.asset))
        riskToAssetMap[a.risk].push(a.asset);
      if (!assetToRiskMap[a.asset]) assetToRiskMap[a.asset] = [];
      if (!assetToRiskMap[a.asset].includes(a.risk))
        assetToRiskMap[a.asset].push(a.risk);
    }
  }

  return { allRisks, allAssets, riskToAssetMap, assetToRiskMap };
}

/** Live handbook sectors; effect labels match Article effect-style columns. */
const HANDBOOK_SECTORS = [
  "Aviation",
  "Maritime",
  "Rail",
  "Roads",
  "Other sectors transferable to transport",
];

const HANDBOOK_EFFECTS = [
  "Water damage",
  "Storm damage",
  "Coastal erosion",
  "Wildfire",
  "Pests and diseases",
  "Vegetation dieback",
  "Urban heat island (UHI) effect",
];

export async function getHandbookFilterOptions(): Promise<HandbookFilterOptions> {
  const articles = await loadArticles();
  const sectors = [
    ...new Set(
      articles
        .flatMap((a) => [
          a.primary_transport_subsector,
          a.secondary_transport_subsector,
        ])
        .filter((s): s is string => typeof s === "string" && s.trim() !== "")
    ),
  ].sort();
  return {
    sectors: sectors.length > 0 ? sectors : HANDBOOK_SECTORS,
    effects: HANDBOOK_EFFECTS,
  };
}
