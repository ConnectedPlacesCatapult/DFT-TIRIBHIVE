/**
 * Ingest guidance documents into hive.document_chunks
 * Run with: npx tsx scripts/ingest-guidance-sources.ts
 *
 * Sources are already in hive.sources — this script only inserts chunks.
 * Fetches each URL, chunks the text, generates embeddings, inserts rows.
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "hive" } }
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// ── Source records (from hive.sources — do NOT re-insert) ───────────────────

const SOURCES = [
  {
    id: "48c0c641-d4c5-49d2-bdf3-2650c534cb38",
    title: "Climate Adaptation Strategy for Transport 2025",
    url: "https://www.gov.uk/government/publications/climate-adaptation-strategy-for-transport/climate-adaptation-strategy-for-transport",
    source_type: "gov_uk",
  },
  {
    id: "fd308382-991f-4e6f-8836-aa0b6ea3cf00",
    title: "HS2 Learning Legacy — Climate Change",
    url: "https://learninglegacy.hs2.co.uk/categories/climate-change/",
    source_type: "guidance_doc",
  },
  {
    id: "046729f0-6d5c-4130-b78e-6f094c8bcd3e",
    title: "Met Office Climate Data Portal",
    url: "https://climatedataportal.metoffice.gov.uk/",
    source_type: "guidance_doc",
  },
  {
    id: "3cff9641-0889-427e-9960-8a9af6684efe",
    title: "DARe Hub — National Research Hub",
    url: "https://dare.ac.uk/",
    source_type: "guidance_doc",
  },
  {
    id: "a44b5961-e199-43ba-84fd-f9d68bddebc6",
    title: "CIHT — Climate Change and Resilience",
    url: "https://www.ciht.org.uk/resilience",
    source_type: "guidance_doc",
  },
  {
    id: "52f6cc0c-fdcc-4026-857e-b93456a06fe8",
    title: "ADEPT RAPA Toolkit",
    url: "https://www.adeptnet.org.uk/rapa-toolkit",
    source_type: "guidance_doc",
  },
  // PIARC — likely access-restricted, attempt and mark if inaccessible
  {
    id: "9813769a-30c3-4ebf-b19e-c6ed2c07b106",
    title: "PIARC — Climate Change Adaptation Framework 2023",
    url: "https://www.piarc.org/en/order-library/42628-en",
    source_type: "guidance_doc",
  },
  {
    id: "05aa7822-8a9c-45ca-a394-ca5a11fbf464",
    title: "PIARC — Climate Change Resilience and Disaster Management for Roads",
    url: "https://www.piarc.org/en/order-library/42098-en",
    source_type: "guidance_doc",
  },
  {
    id: "12e5d852-3a5c-4683-8a11-36e1248170ec",
    title: "PIARC — Collection of Case Studies on Climate Change Resilience",
    url: "https://www.piarc.org/en/order-library/39873-en",
    source_type: "guidance_doc",
  },
  {
    id: "75787609-5857-465b-96df-c5f23c7cd5f4",
    title: "PIARC — Road Bridges Climate Change Adaptation Literature Review",
    url: "https://www.piarc.org/en/order-library/38687-en",
    source_type: "guidance_doc",
  },
  {
    id: "fcbecd98-edbe-4840-a36e-dc45b88036c6",
    title: "PIARC — Preserve Earthworks and Rural Roads from Climate Change",
    url: "https://www.piarc.org/en/order-library/34433-en",
    source_type: "guidance_doc",
  },
  {
    id: "01891485-1e1c-4864-927b-6f2b6982a251",
    title: "PIARC — Adaptation Methodologies and Strategies for Road Resilience",
    url: "https://www.piarc.org/en/order-library/31335-en",
    source_type: "guidance_doc",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{3,}/g, "\n\n")
    .trim();
}

function chunkText(text: string, maxWords = 400): string[] {
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current: string[] = [];
  let wordCount = 0;

  for (const para of paragraphs) {
    const words = para.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) continue;

    if (wordCount + words.length > maxWords && current.length > 0) {
      chunks.push(current.join("\n\n").trim());
      current = [];
      wordCount = 0;
    }

    current.push(para.trim());
    wordCount += words.length;
  }

  if (current.length > 0) {
    chunks.push(current.join("\n\n").trim());
  }

  return chunks.filter((c) => c.length > 100);
}

async function embed(text: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return res.data[0].embedding;
}

async function fetchPage(url: string): Promise<{ text: string; ok: boolean; status: number }> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; HIVE-bot/1.0)",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return { text: "", ok: false, status: res.status };
    const html = await res.text();
    const text = stripHtml(html);
    return { text, ok: true, status: res.status };
  } catch (err) {
    console.error(`  Fetch error: ${err}`);
    return { text: "", ok: false, status: 0 };
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function ingestSource(source: typeof SOURCES[0]) {
  console.log(`\n── ${source.title} ──`);

  const { text, ok, status } = await fetchPage(source.url);

  if (!ok) {
    console.log(`  SKIPPED — HTTP ${status} (access restricted or unreachable)`);
    // Insert a single placeholder chunk noting access restriction
    const placeholderText = `${source.title}\n\nThis document is available at: ${source.url}\n\nAccess may require registration or purchase. Content not yet ingested.`;
    const embedding = await embed(placeholderText);
    const { error } = await supabase.from("document_chunks").insert({
      source_id: source.id,
      article_id: null,
      chunk_index: 0,
      chunk_text: placeholderText,
      embedding: `[${embedding.join(",")}]`,
      section_key: "guidance",
      metadata: {
        source_type: source.source_type,
        title: source.title,
        url: source.url,
        is_guidance: true,
        access_restricted: true,
      },
    });
    if (error) console.error(`  Insert error: ${error.message}`);
    else console.log(`  Inserted placeholder chunk (access restricted)`);
    return;
  }

  const chunks = chunkText(text);
  console.log(`  Fetched ${text.length} chars → ${chunks.length} chunks`);

  if (chunks.length === 0) {
    console.log(`  SKIPPED — no usable content extracted`);
    return;
  }

  let inserted = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    try {
      const embedding = await embed(chunk);
      const { error } = await supabase.from("document_chunks").insert({
        source_id: source.id,
        article_id: null,
        chunk_index: i,
        chunk_text: chunk,
        embedding: `[${embedding.join(",")}]`,
        section_key: "guidance",
        metadata: {
          source_type: source.source_type,
          title: source.title,
          url: source.url,
          is_guidance: true,
          chunk_index: i,
          total_chunks: chunks.length,
        },
      });
      if (error) {
        console.error(`  Chunk ${i} insert error: ${error.message}`);
      } else {
        inserted++;
      }
      await sleep(200); // rate-limit OpenAI
    } catch (err) {
      console.error(`  Chunk ${i} embed error: ${err}`);
    }
  }

  console.log(`  Inserted ${inserted}/${chunks.length} chunks`);
}

async function main() {
  console.log("HIVE Guidance Source Ingestion");
  console.log("================================");
  console.log(`Sources to process: ${SOURCES.length}`);

  const results: { title: string; chunks: number; status: string }[] = [];

  for (const source of SOURCES) {
    try {
      await ingestSource(source);
    } catch (err) {
      console.error(`  ERROR processing ${source.title}: ${err}`);
    }
    await sleep(500);
  }

  console.log("\n\n================================");
  console.log("Ingestion complete.");

  // Final count
  const { data } = await supabase
    .from("document_chunks")
    .select("source_id")
    .in("source_id", SOURCES.map((s) => s.id));

  console.log(`Total chunks in DB for these sources: ${data?.length ?? 0}`);
}

main().catch(console.error);
