import { NextResponse } from "next/server";
import { getFeedbackPool, hasAzureFeedbackConfig } from "@/lib/feedback-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SENTIMENTS = new Set(["positive", "negative"]);
const CATEGORIES = new Set(["bug", "wrong_answer", "suggestion", "other"]);
const TRIGGERS = new Set(["nav", "chat_message"]);

let warnedNoAzure = false;

type ChatTurn = { role: string; content: string };

function validChatContext(x: unknown): ChatTurn[] | null {
  if (!Array.isArray(x)) return null;
  const out: ChatTurn[] = [];
  for (const item of x) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: string }).role;
    const content = (item as { content?: string }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    out.push({ role, content: content.slice(0, 500) });
    if (out.length >= 3) break;
  }
  return out.length ? out : null;
}

export async function POST(request: Request) {
  if (!hasAzureFeedbackConfig()) {
    if (!warnedNoAzure) {
      warnedNoAzure = true;
      console.warn("[feedback] AZURE_POSTGRES_* not set — feedback insert skipped");
    }
    return NextResponse.json({ success: false });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const pageUrl = typeof body.page_url === "string" ? body.page_url.trim() : "";
  if (!pageUrl || pageUrl.length > 4000) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const sentimentRaw = body.sentiment;
  const sentiment =
    typeof sentimentRaw === "string" && SENTIMENTS.has(sentimentRaw)
      ? sentimentRaw
      : null;

  const categoryRaw = body.category;
  const category =
    typeof categoryRaw === "string" && CATEGORIES.has(categoryRaw) ? categoryRaw : null;

  let userMessage =
    typeof body.user_message === "string" ? body.user_message.trim() : null;
  if (userMessage && userMessage.length > 1000) userMessage = userMessage.slice(0, 1000);

  const triggerRaw = body.trigger_source;
  const trigger_source =
    typeof triggerRaw === "string" && TRIGGERS.has(triggerRaw) ? triggerRaw : null;

  const chat_context = validChatContext(body.chat_context);

  const user_id =
    typeof body.user_id === "string" && body.user_id.length <= 200
      ? body.user_id
      : null;

  const app_version =
    (process.env.APP_VERSION && process.env.APP_VERSION.slice(0, 80)) || "unknown";

  const pool = await getFeedbackPool();
  if (!pool) {
    return NextResponse.json({ success: false });
  }

  try {
    const result = await pool.query(
      `INSERT INTO hive.feedback (
        sentiment, category, user_message, page_url, trigger_source, chat_context, user_id, app_version
      ) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8)
      RETURNING id::text`,
      [
        sentiment,
        category,
        userMessage,
        pageUrl,
        trigger_source,
        chat_context ? JSON.stringify(chat_context) : null,
        user_id,
        app_version,
      ]
    );
    const id = result.rows[0]?.id as string | undefined;
    return NextResponse.json({ success: true, id: id ?? null });
  } catch (e) {
    console.error("[feedback] insert error:", e);
    return NextResponse.json({ success: false });
  }
}
