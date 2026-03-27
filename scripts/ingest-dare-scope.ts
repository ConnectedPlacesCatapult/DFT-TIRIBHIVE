import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "hive" } }
);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const SOURCE_ID = "bddc6002-4788-425f-943f-d1fe695131ba";
const chunk = `DARe Hub — Scope of Programme (v1.1, July 2024)

The DARe Hub (Decarbonised Adaptable and Resilient Transport Infrastructures) is a national research hub that brings together leading UK universities and industry partners to develop tools, methods, and evidence for making transport infrastructure more resilient to climate change and aligned with net zero ambitions.

The Scope of Programme document (v1.1, July 2024) outlines the hub's research workstreams, governance, and expected outputs over the programme period. It provides context for DARe-funded research and publications listed at dare.ac.uk/publications/.

The hub covers:
- Climate resilience frameworks for transport infrastructure
- Asset management under climate uncertainty
- Digital tools for adaptation planning
- Integrated approaches combining decarbonisation and resilience
- Engagement with local authorities, national government, and infrastructure operators

The full scope document is available as a PDF: https://dare.ac.uk/wp-content/uploads/2024/07/DARe-Hub-Scope-1.1-12_07_24.pdf`;

async function main() {
  const res = await openai.embeddings.create({ model: "text-embedding-3-small", input: chunk });
  const embedding = res.data[0].embedding;
  const { error } = await supabase.from("document_chunks").insert({
    source_id: SOURCE_ID,
    article_id: null,
    chunk_index: 0,
    chunk_text: chunk,
    embedding: `[${embedding.join(",")}]`,
    section_key: "guidance",
    metadata: { source_type: "guidance_doc", title: "DARe Hub — Scope of Programme", url: "https://dare.ac.uk/wp-content/uploads/2024/07/DARe-Hub-Scope-1.1-12_07_24.pdf", is_guidance: true, note: "Summary from programme scope document — full PDF at URL" },
  });
  if (error) console.error(error.message);
  else console.log("DARe Scope chunk inserted.");
}
main().catch(console.error);
