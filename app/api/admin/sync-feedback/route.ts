import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyHiveAdminSessionToken, HIVE_ADMIN_COOKIE } from "@/lib/admin-session";
import { syncFeedbackAzureToSupabase } from "@/lib/feedback-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(HIVE_ADMIN_COOKIE)?.value;
  if (!verifyHiveAdminSessionToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncFeedbackAzureToSupabase();
  if (!result.ok) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}
