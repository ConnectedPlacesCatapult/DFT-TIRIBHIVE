import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyHiveAdminSessionEdge } from "@/lib/admin-session-edge";

const PUBLIC_ADMIN_API = new Set([
  "/api/admin/auth",
  "/api/admin/logout",
  "/api/admin/demo-unlock",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret =
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";

  if (pathname.startsWith("/api/admin")) {
    if (PUBLIC_ADMIN_API.has(pathname)) {
      return NextResponse.next();
    }
    const token = request.cookies.get("hive_admin_session")?.value ?? "";
    if (!secret || !(await verifyHiveAdminSessionEdge(token, secret))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("hive_admin_session")?.value ?? "";
    if (!secret || !(await verifyHiveAdminSessionEdge(token, secret))) {
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
