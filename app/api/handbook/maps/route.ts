export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getFilterMaps } from "@/lib/db";

export async function GET() {
  const maps = await getFilterMaps();
  return NextResponse.json(maps);
}
