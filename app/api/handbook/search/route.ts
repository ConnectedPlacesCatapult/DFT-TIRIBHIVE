export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/lib/db";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") || "";
  const articles = await searchArticles(search);

  return NextResponse.json({
    request: { search },
    rowCount: articles.length,
    rows: articles,
  });
}
