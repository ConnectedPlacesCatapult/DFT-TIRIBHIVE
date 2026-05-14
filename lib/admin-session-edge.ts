/**
 * Edge-safe HMAC verification for hive_admin_session (must match lib/admin-session.ts).
 */

function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function bytesToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256Bytes(data: Uint8Array): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", new Uint8Array(data) as BufferSource);
}

function timingSafeEqualAscii(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

export async function verifyHiveAdminSessionEdge(
  token: string,
  secret: string
): Promise<boolean> {
  if (!token || !secret || !token.includes(".")) return false;
  const idx = token.indexOf(".");
  const payloadB64 = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  let payload: string;
  try {
    payload = new TextDecoder().decode(b64urlToBytes(payloadB64));
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

  const keyRaw = await sha256Bytes(utf8(secret));
  const key = await crypto.subtle.importKey(
    "raw",
    keyRaw as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    utf8(payload) as BufferSource
  );
  const expected = bytesToB64url(sigBuf);
  if (expected.length !== sig.length) return false;
  return timingSafeEqualAscii(expected, sig);
}
