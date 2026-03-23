import { NextRequest, NextResponse } from "next/server";
import {
  getAIResponse,
  parseStringContext,
  type ChatMessageIn,
  type ChatContext,
  type ChatApiResponse,
} from "@/lib/handbook/chat-api";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessageIn[] = body.messages ?? [];
    const rawContext = body.context;

    let context: ChatContext;
    if (typeof rawContext === "string") {
      context = parseStringContext(rawContext);
    } else if (rawContext && typeof rawContext === "object") {
      context = rawContext as ChatContext;
    } else {
      context = { mode: "explore" };
    }

    if (body.session_intent && !context.session_intent) {
      context.session_intent = body.session_intent;
    }

    if (body.result_set && Array.isArray(body.result_set) && body.result_set.length > 0) {
      context.result_set = body.result_set.map(
        (r: { id?: string; title?: string; sector?: string }) => ({
          id: r.id ?? "",
          title: r.title ?? "",
          sector: r.sector ?? "",
        })
      );
    }

    if (body.result_chunks && Array.isArray(body.result_chunks) && body.result_chunks.length > 0) {
      context.result_chunks = body.result_chunks.map(
        (c: { article_id?: string; section_key?: string; chunk_text?: string }) => ({
          article_id: c.article_id ?? "",
          section_key: c.section_key ?? "general",
          chunk_text: c.chunk_text ?? "",
        })
      ).filter((c: { chunk_text: string }) => c.chunk_text);
    }

    if (body.brief_sections && Array.isArray(body.brief_sections) && context.mode === "synthesis") {
      context.brief_sections = body.brief_sections.map(
        (s: { section_key?: string; section?: string; content: string }) => ({
          section: s.section_key ?? s.section ?? "",
          content: s.content ?? "",
        })
      );
    }

    if (Array.isArray(body.suggestions_shown)) {
      context.suggestions_shown = body.suggestions_shown;
    }

    const response: ChatApiResponse = await getAIResponse(messages, context);
    return NextResponse.json(response);
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      {
        message: "An error occurred. Please try again.",
        text: "An error occurred. Please try again.",
        retrieval_mode: "fallback",
      },
      { status: 500 }
    );
  }
}
