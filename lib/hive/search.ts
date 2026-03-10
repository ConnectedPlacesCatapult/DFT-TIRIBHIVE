// Search and synthesis logic ported from HIVE prototype v4.

import type { CaseStudy } from "./seed-data";
import { CASE_STUDIES } from "./seed-data";

export function detectIntent(query: string): { detectedHazards: string[]; detectedSectors: string[] } {
  const q = query.toLowerCase();
  const detectedHazards: string[] = [];
  const detectedSectors: string[] = [];
  if (q.includes("flood") || q.includes("water") || q.includes("rain") || q.includes("drainage")) detectedHazards.push("Heavy rainfall");
  if (q.includes("heat") || q.includes("hot") || q.includes("temperature") || q.includes("heatwave")) detectedHazards.push("High temperatures");
  if (q.includes("storm") || q.includes("wind")) detectedHazards.push("Storms");
  if (q.includes("sea level") || q.includes("coastal") || q.includes("surge")) detectedHazards.push("Sea level rise");
  if (q.includes("landslide") || q.includes("slope") || q.includes("embankment") || q.includes("rockfall") || q.includes("stability")) detectedHazards.push("Heavy rainfall");
  if (q.includes("drought") || q.includes("dry")) detectedHazards.push("Drought");
  if (q.includes("rail") || q.includes("train") || q.includes("track") || q.includes("railway")) detectedSectors.push("Rail");
  if (q.includes("aviation") || q.includes("airport") || q.includes("heathrow")) detectedSectors.push("Aviation");
  if (q.includes("port") || q.includes("maritime") || q.includes("harbour")) detectedSectors.push("Maritime");
  if (q.includes("road") || q.includes("highway") || q.includes("motorway")) detectedSectors.push("Highways");
  return {
    detectedHazards: [...new Set(detectedHazards)],
    detectedSectors: [...new Set(detectedSectors)],
  };
}

export function getMatchReasons(
  cs: CaseStudy,
  query: string,
  selectedHazards: string[],
  selectedSectors: string[]
): string[] {
  const reasons: string[] = [];
  const q = query.toLowerCase();
  const allHazards = [...cs.hazards.cause, ...cs.hazards.effect];
  if (q) {
    const words = q.split(" ").filter((w) => w.length > 3);
    words.forEach((word) => {
      cs.tags.forEach((t) => {
        if (t.includes(word)) reasons.push(t);
      });
      allHazards.forEach((h) => {
        if (h.toLowerCase().includes(word)) reasons.push(h);
      });
      cs.measures.forEach((m) => {
        if (m.toLowerCase().includes(word)) reasons.push(m);
      });
    });
  }
  selectedHazards.forEach((h) => {
    if (allHazards.some((ch) => ch.toLowerCase().includes(h.toLowerCase()))) reasons.push(h);
  });
  selectedSectors.forEach((s) => {
    if (cs.sector.toLowerCase() === s.toLowerCase()) reasons.push(cs.sector);
  });
  return [...new Set(reasons)].slice(0, 4);
}

function scoreResult(cs: CaseStudy, query: string): number {
  if (!query.trim()) return 1;
  const q = query.toLowerCase();
  let score = 0;
  const allHazards = [...cs.hazards.cause, ...cs.hazards.effect];
  if (cs.title.toLowerCase().includes(q)) score += 10;
  if (cs.summary.toLowerCase().includes(q)) score += 6;
  if (cs.insight.toLowerCase().includes(q)) score += 4;
  cs.tags.forEach((t) => {
    if (t.includes(q) || q.includes(t)) score += 3;
  });
  allHazards.forEach((h) => {
    if (h.toLowerCase().includes(q) || q.includes(h.toLowerCase())) score += 5;
  });
  cs.measures.forEach((m) => {
    if (m.toLowerCase().includes(q)) score += 3;
  });
  cs.ukApplicability.forEach((a) => {
    if (a.toLowerCase().includes(q)) score += 4;
  });
  const words = q.split(" ").filter((w) => w.length > 3);
  words.forEach((word) => {
    cs.tags.forEach((t) => {
      if (t.includes(word)) score += 2;
    });
    if (cs.summary.toLowerCase().includes(word)) score += 1;
    allHazards.forEach((h) => {
      if (h.toLowerCase().includes(word)) score += 3;
    });
  });
  return score;
}

export function searchCaseStudies(
  query: string,
  selectedHazards: string[],
  selectedSectors: string[],
  selectedRegions: string[],
  selectedCosts: string[]
): CaseStudy[] {
  let results = [...CASE_STUDIES];
  if (selectedHazards.length > 0) {
    results = results.filter((cs) => {
      const allH = [...cs.hazards.cause, ...cs.hazards.effect];
      return selectedHazards.some((h) => allH.some((ch) => ch.toLowerCase().includes(h.toLowerCase())));
    });
  }
  if (selectedSectors.length > 0) {
    results = results.filter((cs) => selectedSectors.some((s) => cs.sector.toLowerCase() === s.toLowerCase()));
  }
  if (selectedRegions.length > 0) {
    results = results.filter((cs) =>
      selectedRegions.some((r) => cs.ukRegion.includes(r) || cs.ukApplicability.some((a) => a.toLowerCase().includes(r.toLowerCase())))
    );
  }
  if (selectedCosts.length > 0) {
    results = results.filter((cs) => selectedCosts.includes(cs.costBand));
  }
  if (query.trim()) {
    results = results
      .map((cs) => ({ ...cs, _score: scoreResult(cs, query) }))
      .filter((cs) => (cs as CaseStudy & { _score: number })._score > 0)
      .sort((a, b) => (b as CaseStudy & { _score: number })._score - (a as CaseStudy & { _score: number })._score)
      .map(({ _score, ...cs }) => cs);
  }
  return results;
}

export type Synthesis = {
  count: number;
  sectors: string[];
  allCause: string[];
  commonMeasures: string[];
  commonMeasureTypes: string[];
  highTransferCount: number;
  insightSentence: string;
};

export function generateSynthesis(results: CaseStudy[], query: string): Synthesis | null {
  if (!results.length) return null;
  const allMeasures = results.flatMap((r) => r.measures);
  const sectors = [...new Set(results.map((r) => r.sector))];
  const highTransfer = results.filter((r) => r.transferability === "High");
  const commonMeasureTypes: string[] = [];
  if (allMeasures.some((m) => m.toLowerCase().includes("monitor") || m.toLowerCase().includes("sensor") || m.toLowerCase().includes("warning"))) {
    commonMeasureTypes.push("predictive monitoring");
  }
  if (allMeasures.some((m) => m.toLowerCase().includes("barrier") || m.toLowerCase().includes("wall") || m.toLowerCase().includes("stabilisation"))) {
    commonMeasureTypes.push("physical protection");
  }
  if (allMeasures.some((m) => m.toLowerCase().includes("nature") || m.toLowerCase().includes("vegetation") || m.toLowerCase().includes("forest"))) {
    commonMeasureTypes.push("nature-based approaches");
  }
  const insightSentence =
    results.length === 1
      ? `This case has high transferability to UK contexts. ${results[0].insight}`
      : commonMeasureTypes.length >= 2
        ? `A consistent pattern across these cases: ${commonMeasureTypes.slice(0, 2).join(" and ")} are deployed together rather than in isolation. ${highTransfer.length} of ${results.length} cases have explicitly identified UK applicability. ${results[0].insight}`
        : `${highTransfer.length} of ${results.length} matching cases have high transferability to UK transport contexts. The strongest cross-cutting lesson is that proactive adaptation — integrating resilience into planned maintenance cycles — consistently delivers lower cost than reactive repair after climate events.`;
  return {
    count: results.length,
    sectors,
    allCause: [...new Set(results.flatMap((r) => r.hazards.cause))].slice(0, 3),
    commonMeasures: [...new Set(allMeasures)].slice(0, 4),
    commonMeasureTypes,
    highTransferCount: highTransfer.length,
    insightSentence,
  };
}
