export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import {
  getHiveDataProvider,
  getLinkedOptionsForBriefArticles,
  type HiveOption,
} from "@/lib/handbook/db";
import { OPTIONS_DATA } from "@/lib/handbook/options-data";
import { getSupabaseClient } from "@/lib/supabase/client";

const SECTOR_NORMALISE: Record<string, string> = {
  Highways: "Roads",
  highways: "Roads",
  Railways: "Rail",
  railways: "Rail",
};

function normaliseSector(sector: string): string {
  const trimmed = sector.trim();
  return SECTOR_NORMALISE[trimmed] ?? trimmed;
}

function splitCsv(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function filterBySectors<T extends { transport_subsector?: string | null }>(
  rows: T[],
  sectors: string[]
): T[] {
  if (sectors.length === 0) return rows;
  const wanted = new Set(sectors.map((s) => s.toLowerCase()));
  return rows.filter((row) => {
    const sector = row.transport_subsector?.trim();
    return sector ? wanted.has(sector.toLowerCase()) : false;
  });
}

export async function GET(req: NextRequest) {
  try {
    const ids = splitCsv(req.nextUrl.searchParams.get("ids"));
    const sectors = splitCsv(req.nextUrl.searchParams.get("sectors")).map(normaliseSector);
    const uniqueSectors = [...new Set(sectors)];
    const provider = getHiveDataProvider();

    if (provider === "json") {
      const universe = filterBySectors(
        OPTIONS_DATA.map((row) => ({
          id: String(row.id),
          transport_subsector: row.transport_subsector,
          climate_hazard_cause: row.climate_hazard_cause,
          adaptation_measure: row.adaptation_measure,
        })),
        uniqueSectors
      );
      return NextResponse.json({
        mode: "json",
        covered: [],
        uncovered: universe,
        total: universe.length,
        sectors: uniqueSectors,
      });
    }

    const covered = await getLinkedOptionsForBriefArticles(ids);
    const coveredMeasures = new Set(
      covered.map((c) => c.adaptation_measure.trim().toLowerCase())
    );

    let universe: Pick<
      HiveOption,
      "id" | "transport_subsector" | "climate_hazard_cause" | "adaptation_measure"
    >[] = [];
    try {
      const sb = getSupabaseClient();
      let query = sb
        .from("options")
        .select("id, transport_subsector, climate_hazard_cause, adaptation_measure");
      if (uniqueSectors.length > 0) {
        query = query.in("transport_subsector", uniqueSectors);
      }
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      universe =
        (data as Pick<
          HiveOption,
          "id" | "transport_subsector" | "climate_hazard_cause" | "adaptation_measure"
        >[]) ?? [];
    } catch {
      universe = [];
    }

    const uncovered = universe.filter(
      (row) => !coveredMeasures.has(row.adaptation_measure.trim().toLowerCase())
    );

    return NextResponse.json({
      mode: "supabase",
      covered,
      uncovered,
      total: universe.length,
      sectors: uniqueSectors,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to compute options coverage" },
      { status: 500 }
    );
  }
}
