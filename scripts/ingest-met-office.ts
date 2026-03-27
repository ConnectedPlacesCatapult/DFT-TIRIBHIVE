/**
 * Targeted ingest for Met Office Climate Data Portal
 * Content pre-fetched since the portal is JavaScript-rendered.
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

const SOURCE_ID = "046729f0-6d5c-4130-b78e-6f094c8bcd3e";

const CONTENT = [
  `Met Office Climate Data Portal — Overview

The Met Office Climate Data Portal is an online platform for exploring and downloading climate datasets across the UK and globally. It provides access to observed historical data and future projections based on UKCP18 (UK Climate Projections 2018), which is the standard dataset used for UK infrastructure adaptation planning.

The portal has been live as a production service since June 2023 and is actively maintained. It supports users from planning authorities, transport agencies, and infrastructure owners who need climate data for adaptation assessments.

Key capabilities:
- Observations (past): Temperature and precipitation datasets at national and global scale
- Projections (future): Temperature, precipitation, and sea level projections
- UK-specific data at 12km grid resolution and local authority boundaries
- File downloads in a range of formats including GIS-compatible formats
- Integration with ArcGIS Living Atlas

The portal launched a dedicated Local Authority climate service in September 2024, enabling local authorities to explore climate data at their specific administrative boundaries alongside tools for risk assessment and adaptation planning. This is directly relevant for transport asset owners operating across local authority areas.

URL: https://climatedataportal.metoffice.gov.uk/`,

  `Met Office Climate Data Portal — Data Categories and Datasets

The portal organises climate data into the following categories:

TEMPERATURE DATA
- Observations: historical temperature records for UK and global regions
- Projections: future temperature change scenarios including summer maximum temperature change and count of summer days (>25°C)

PRECIPITATION DATA
- Observations: historical rainfall and precipitation records
- Projections: future precipitation change including summer and winter precipitation change datasets

SEA LEVEL DATA
- Sea level projections relevant for coastal and maritime infrastructure
- Updated in June 2023 with new data. Note: datasets placed under review in October 2022 for units issue — resolved.

SOCIOECONOMIC DATA
- UK Shared Socioeconomic Pathways (SSPs) for scenario planning

DATA QUALITY NOTES
- January 2025 update: Some 12km-grid datasets corrected to fix an issue in 'Lower' values that were not fully representing the range of uncertainty
- March 2024: Correction to metadata on summer and winter precipitation change datasets
- All datasets now include corrected latitude/longitude fields following a 2023 correction

ACCESSING THE PORTAL
The data portal is free to access and does not require registration for basic use. GIS users can access data via ArcGIS and the Living Atlas. User guides are available for both standard and GIS users.

URL: https://climatedataportal.metoffice.gov.uk/`,
];

async function main() {
  console.log("Ingesting Met Office Climate Data Portal...");

  // Check if already ingested
  const { count } = await supabase
    .from("document_chunks")
    .select("*", { count: "exact", head: true })
    .eq("source_id", SOURCE_ID);

  if ((count ?? 0) > 0) {
    console.log(`Already has ${count} chunks — skipping`);
    return;
  }

  for (let i = 0; i < CONTENT.length; i++) {
    const chunk = CONTENT[i];
    const res = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: chunk.slice(0, 8000),
    });
    const embedding = res.data[0].embedding;

    const { error } = await supabase.from("document_chunks").insert({
      source_id: SOURCE_ID,
      article_id: null,
      chunk_index: i,
      chunk_text: chunk,
      embedding: `[${embedding.join(",")}]`,
      section_key: "guidance",
      metadata: {
        source_type: "guidance_doc",
        title: "Met Office Climate Data Portal",
        url: "https://climatedataportal.metoffice.gov.uk/",
        is_guidance: true,
        note: "Content manually structured from portal — JS-rendered site not directly scrapeable",
      },
    });

    if (error) console.error(`Chunk ${i} error: ${error.message}`);
    else console.log(`Chunk ${i} inserted`);
  }

  console.log("Done.");
}

main().catch(console.error);
