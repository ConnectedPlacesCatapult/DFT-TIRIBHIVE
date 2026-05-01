export const AI_TIMEOUT_MS = 30_000;

type ErrorWithFields = Error & {
  status?: number;
  code?: string;
  cause?: unknown;
};

const AI_UNAVAILABLE_STATUS = new Set([401, 403, 429, 500, 502, 503, 504]);
const AI_UNAVAILABLE_NAMES = new Set([
  "APIConnectionError",
  "APIConnectionTimeoutError",
  "RateLimitError",
  "AuthenticationError",
  "InternalServerError",
]);
const AI_UNAVAILABLE_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_SOCKET",
]);

function extractCode(err: unknown): string | null {
  if (!err || typeof err !== "object") return null;
  const code = (err as ErrorWithFields).code;
  if (typeof code === "string") return code;
  const cause = (err as ErrorWithFields).cause as ErrorWithFields | undefined;
  if (cause && typeof cause.code === "string") return cause.code;
  return null;
}

function isFetchFailure(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return /fetch failed/i.test(err.message);
}

export function isAIForceDisabled(): boolean {
  return process.env.AI_FORCE_DISABLED === "true";
}

export function isAIDisabled(requestForced = false): boolean {
  return requestForced || isAIForceDisabled();
}

export function isAIUnavailableError(err: unknown): boolean {
  if (isAIForceDisabled()) return true;
  if (!err || typeof err !== "object") return false;

  const e = err as ErrorWithFields;

  if (typeof e.status === "number" && AI_UNAVAILABLE_STATUS.has(e.status)) return true;
  if (typeof e.name === "string" && AI_UNAVAILABLE_NAMES.has(e.name)) return true;
  if (e.name === "APIError" && typeof e.status === "number" && AI_UNAVAILABLE_STATUS.has(e.status)) {
    return true;
  }

  const code = extractCode(err);
  if (code && AI_UNAVAILABLE_CODES.has(code)) return true;
  if (isFetchFailure(err)) return true;

  return false;
}

export async function withAITimeout<T>(promise: Promise<T>, timeoutMs = AI_TIMEOUT_MS): Promise<T> {
  let timer: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const timeoutErr = new Error(`AI request timed out after ${timeoutMs}ms`);
      timeoutErr.name = "AIRequestTimeoutError";
      reject(timeoutErr);
    }, timeoutMs);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

