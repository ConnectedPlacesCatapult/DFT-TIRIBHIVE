/**
 * POST /api/handbook/brief/export
 *
 * Returns a print-ready HTML page for the brief that the browser can save as PDF.
 * Includes citations and "AI-generated" label per plan spec.
 */
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { getHiveArticleById } from "@/lib/handbook/db";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderCaseIdLinks(text: string): string {
  return text.replace(
    /\[?(ID_[\w]+)\]?/g,
    '<span style="color:#1d70b8;font-weight:600">[$1]</span>'
  );
}

function renderInline(text: string): string {
  return renderCaseIdLinks(escapeHtml(text));
}

function parseMarkdownTable(lines: string[]): { headers: string[]; rows: string[][] } | null {
  const pipeLines = lines.filter((l) => l.trim().startsWith("|") && l.trim().endsWith("|"));
  if (pipeLines.length < 2) return null;
  const splitRow = (row: string) => row.split("|").slice(1, -1).map((c) => c.trim());
  const headers = splitRow(pipeLines[0]);
  if (headers.length === 0) return null;
  const isSeparator = (l: string) => /^\|[\s\-:|]+\|$/.test(l.trim());
  const rows = pipeLines.slice(1).filter((l) => !isSeparator(l)).map(splitRow);
  return { headers, rows };
}

function renderTable(headers: string[], rows: string[][]): string {
  const thead = headers
    .map(
      (h) =>
        `<th style="text-align:left;padding:8px 10px;font-size:10px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#6b7280;background:#f3f4f6;border-bottom:2px solid #1d70b8">${renderInline(h)}</th>`
    )
    .join("");

  const tbody = rows
    .map((row, ri) => {
      const cells = row
        .map(
          (cell) =>
            `<td style="padding:8px 10px;font-size:12px;line-height:1.6;color:#374151;border-bottom:1px solid #e5e7eb">${renderInline(cell)}</td>`
        )
        .join("");
      const rowBg = ri % 2 === 1 ? "background:#f9fafb" : "";
      return `<tr style="${rowBg}">${cells}</tr>`;
    })
    .join("");

  return `<table style="width:100%;border-collapse:collapse;margin:8px 0 12px">${`<thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody>`}</table>`;
}

function renderSectionContent(content: string): string {
  if (!content) return "";
  const blocks = content.split(/\n\n+/);

  return blocks
    .map((block) => {
      const lines = block.split("\n").filter((l) => l.trim());
      if (lines.length === 0) return "";

      const table = parseMarkdownTable(lines);
      if (table) {
        return renderTable(table.headers, table.rows);
      }

      const isBullets = lines.every((l) => l.trim().startsWith("- "));
      if (isBullets) {
        const items = lines
          .map((line) => `<li style="margin-bottom:4px">${renderInline(line.replace(/^-\s*/, ""))}</li>`)
          .join("");
        return `<ul style="margin:8px 0 12px;padding-left:20px;font-size:13px;line-height:1.7;color:#374151">${items}</ul>`;
      }

      return `<p style="margin:0 0 10px">${renderInline(block).replace(/\n/g, "<br/>")}</p>`;
    })
    .join("");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = body.ids ?? [];
    const sections: Array<{
      section_key: string;
      section_title: string;
      content: string;
      confidence?: string;
    }> = body.sections ?? [];

    const articles = (
      await Promise.all(ids.map((id) => getHiveArticleById(id)))
    ).filter((a): a is NonNullable<typeof a> => a !== null);

    const date = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const confidenceBadge = (level?: string) => {
      const colors: Record<string, { bg: string; color: string }> = {
        high: { bg: "#d1fae5", color: "#065f46" },
        partial: { bg: "#fef3c7", color: "#92400e" },
        indicative: { bg: "#fee2e2", color: "#991b1b" },
      };
      const c = colors[level ?? "partial"] ?? colors.partial;
      return `<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;background:${c.bg};color:${c.color};text-transform:uppercase">${level ?? "partial"}</span>`;
    };

    const sectionsHtml = sections
      .map(
        (s) => `
        <div style="margin-bottom:24px;page-break-inside:avoid">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <h2 style="font-size:16px;font-weight:700;color:#0b0c0c;margin:0">${escapeHtml(s.section_title)}</h2>
            ${confidenceBadge(s.confidence)}
          </div>
          <div style="font-size:13px;line-height:1.7;color:#374151">${renderSectionContent(s.content)}</div>
        </div>`
      )
      .join("");

    const sourcesHtml = articles
      .map(
        (a) =>
          `<li style="margin-bottom:4px"><strong>${a.id}</strong>: ${escapeHtml(a.project_title)} (${escapeHtml(a.transport_sector ?? "")})</li>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>HIVE Intelligence Brief — ${date}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
    body { font-family:'DM Sans',sans-serif; margin:0; padding:0; color:#0b0c0c; }
    @page { margin: 2cm; }
    @media print { .no-print { display:none !important; } }
  </style>
</head>
<body>
  <div style="max-width:700px;margin:0 auto;padding:40px 24px">
    <!-- Header -->
    <div style="border-bottom:3px solid #006853;padding-bottom:16px;margin-bottom:24px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div style="width:28px;height:28px;border-radius:6px;background:#1d70b8;display:flex;align-items:center;justify-content:center">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <span style="font-size:18px;font-weight:700;color:#0b0c0c">HIVE Intelligence Brief</span>
      </div>
      <div style="font-size:12px;color:#6b7280">
        Generated ${date} · ${articles.length} case ${articles.length === 1 ? "study" : "studies"} · Climate Adaptation Intelligence
      </div>
      <div style="margin-top:8px;font-size:11px;padding:6px 10px;background:#fef3c7;border-radius:6px;color:#92400e;border:1px solid #fcd34d">
        AI-generated from ${articles.length} case ${articles.length === 1 ? "study" : "studies"} — review before use
      </div>
    </div>

    <!-- Sections -->
    ${sectionsHtml}

    <!-- Source references -->
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb">
      <h2 style="font-size:14px;font-weight:700;color:#0b0c0c;margin:0 0 10px">Source References</h2>
      <ul style="font-size:12px;color:#374151;line-height:1.7;padding-left:18px">${sourcesHtml}</ul>
    </div>

    <!-- Footer -->
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;text-align:center">
      HIVE · Climate Adaptation Intelligence · Connected Places Catapult · Department for Transport<br/>
      This brief is AI-generated and should be reviewed by qualified professionals before use in policy or decision-making.
    </div>
  </div>

  <script class="no-print">
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (err) {
    console.error("Brief export error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF export" },
      { status: 500 }
    );
  }
}
