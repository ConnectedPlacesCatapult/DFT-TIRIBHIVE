import { NextResponse } from "next/server";
import { HIVE_ADMIN_COOKIE } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("redirect") ?? "/admin/login";
  const res = NextResponse.redirect(new URL(next, url.origin), 303);
  res.cookies.set({
    name: HIVE_ADMIN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
