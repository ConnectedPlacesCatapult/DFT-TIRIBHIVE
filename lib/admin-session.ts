import { createHmac, createHash, timingSafeEqual } from "node:crypto";

/** HttpOnly cookie name for signed admin session */
export const HIVE_ADMIN_COOKIE = "hive_admin_session";

export function deriveSessionKey(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

export function signHiveAdminSession(): { name: string; value: string; maxAge: number } {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD (or ADMIN_SESSION_SECRET) must be set for admin auth");
  }
  const exp = Date.now() + 86400_000;
  const payload = JSON.stringify({ exp, v: 1 });
  const sig = createHmac("sha256", deriveSessionKey(secret))
    .update(payload, "utf8")
    .digest("base64url");
  const value = Buffer.from(payload, "utf8").toString("base64url") + "." + sig;
  return { name: HIVE_ADMIN_COOKIE, value, maxAge: 86400 };
}

/** Verify session token (Node runtime — API routes, scripts). */
export function verifyHiveAdminSessionToken(token: string | undefined | null): boolean {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret || !token) return false;
  const idx = token.indexOf(".");
  if (idx === -1) return false;
  const payloadB64 = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  let payload: string;
  try {
    payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  } catch {
    return false;
  }
  let data: { exp: number };
  try {
    data = JSON.parse(payload) as { exp: number };
  } catch {
    return false;
  }
  if (typeof data.exp !== "number" || data.exp < Date.now()) return false;
  const expected = createHmac("sha256", deriveSessionKey(secret))
    .update(payload, "utf8")
    .digest("base64url");
  if (expected.length !== sig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(sig, "utf8"));
  } catch {
    return false;
  }
}
