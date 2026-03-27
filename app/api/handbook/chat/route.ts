import { NextRequest, NextResponse } from "next/server";
import {
  streamAIResponse,
  getMockResponse,
  postProcessChatText,
  parseStringContext,
  type ChatMessageIn,
  type ChatContext,
} from "@/lib/handbook/chat-api";

export const runtime = "nodejs";

/** Parse and hydrate the ChatContext from the request body. */
function buildContext(body: Record<string, unknown>): ChatContext {
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
    context.session_intent = body.session_intent as string;
  }

  if (Array.isArray(body.result_set) && (body.result_set as unknown[]).length > 0) {
    context.result_set = (body.result_set as { id?: string; title?: string; sector?: string }[]).map((r) => ({
      id: r.id ?? "",
      title: r.title ?? "",
      sector: r.sector ?? "",
    }));
  }

  if (Array.isArray(body.result_chunks) && (body.result_chunks as unknown[]).length > 0) {
    context.result_chunks = (body.result_chunks as { article_id?: string; section_key?: string; chunk_text?: string }[])
      .map((c) => ({
        article_id: c.article_id ?? "",
        section_key: c.section_key ?? "general",
        chunk_text: c.chunk_text ?? "",
      }))
      .filter((c) => c.chunk_text);
  }

  if (Array.isArray(body.brief_sections) && context.mode === "synthesis") {
    context.brief_sections = (body.brief_sections as { section_key?: string; section?: string; content: string }[]).map((s) => ({
      section: s.section_key ?? s.section ?? "",
      content: s.content ?? "",
    }));
  }

  if (Array.isArray(body.suggestions_shown)) {
    context.suggestions_shown = body.suggestions_shown as string[];
  }

  return context;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON", text: "Invalid JSON", retrieval_mode: "fallback" }, { status: 400 });
  }

  const messages: ChatMessageIn[] = (body.messages as ChatMessageIn[]) ?? [];
  const context = buildContext(body);

  // ── Streaming path (SSE) ──────────────────────────────────────────────────
  const prepared = await streamAIResponse(messages, context).catch((err) => {
    console.error("[HIVE] streamAIResponse setup failed:", err);
    return null;
  });

  // No API key → send mock as a single SSE done event (instant)
  if (prepared === null) {
    const mock = getMockResponse(context.mode);
    const enc = new TextEncoder();
    const mockBytes = enc.encode(
      `data: ${JSON.stringify({ done: true, text: mock.text, message: mock.text, chips: mock.chips, gap: mock.gap, actions: mock.actions, action: mock.action, sources: undefined, retrieval_mode: "fallback" })}\n\n`
    );
    return new Response(mockBytes, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const { stream, retrieval } = prepared;
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      let fullText = "";
      try {
        for await (const chunk of stream) {
          const token = chunk.choices[0]?.delta?.content ?? "";
          if (token) {
            fullText += token;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
          }
        }
        // Stream complete — post-process and send final metadata
        const meta = postProcessChatText(fullText, retrieval);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              done: true,
              text: meta.text,
              message: meta.text,
              chips: meta.chips,
              sources: meta.sources,
              action: meta.action,
              retrieval_mode: meta.retrieval_mode,
            })}\n\n`
          )
        );
      } catch (err) {
        console.error("[HIVE] streaming error:", err);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, text: "Something went wrong. Please try again.", message: "Something went wrong. Please try again.", retrieval_mode: "fallback" })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
