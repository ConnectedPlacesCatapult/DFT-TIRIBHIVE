export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getArticles, getArticlesAdvanced } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const risk = searchParams.get("risk") || undefined;
  const asset = searchParams.get("asset") || undefined;
  const sector = searchParams.get("sector") || undefined;
  const effect = searchParams.get("effect") || undefined;

  const useAdvanced = sector || effect;
  const articles = useAdvanced
    ? await getArticlesAdvanced({ sector, risk, asset, effect })
    : await getArticles({ risk, asset });

  return NextResponse.json({
    request: { risk, asset, sector, effect },
    rowCount: articles.length,
    rows: articles,
  });
}
