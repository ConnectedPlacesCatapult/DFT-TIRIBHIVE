import { NextResponse } from "next/server";
import { HIVE_ADMIN_COOKIE, signHiveAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    console.error("[admin/auth] ADMIN_PASSWORD is not configured");
    return NextResponse.json({ success: false }, { status: 503 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (password.length === 0 || password !== expected) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  try {
    const session = signHiveAdminSession();
    const res = NextResponse.json({ success: true });
    res.cookies.set({
      name: session.name,
      value: session.value,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: session.maxAge,
    });
    return res;
  } catch (e) {
    console.error("[admin/auth] sign error:", e);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
