/**
 * HIVE Chat API — RAG-first, context-aware.
 *
 * Architecture: retrieve chunks via pgvector → inject into prompt → LLM synthesises.
 * Fallback: if RAG unavailable (DB down, no creds, no chunks), inject full case JSON.
 *
 * This module is the single source of truth for all AI chat behaviour in the app.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ChatMessageIn = {
  role: "user" | "ai";
  text: string;
};

export type ChatContext = {
  mode: "explore" | "deep_dive" | "synthesis";
  result_set?: { id: string; title: string; sector: string }[];
  active_filters?: {
    sector?: string;
    hazard_cause?: string;
    hazard_effect?: string;
  };
  article_id?: string;
  article_chunks?: { section_key: string; chunk_text: string }[];
  brief_case_ids?: string[];
  brief_case_chunks?: {
    article_id: string;
    section_key: string;
    chunk_text: string;
  }[];
  brief_sections?: { section: string; content: string }[];
  session_intent?: string;
  suggestions_shown?: string[];
  /** Pre-loaded chunks from the grid's semantic search — when present, skip a second pgvector call */
  result_chunks?: { article_id: string; section_key: string; chunk_text: string }[];
};

export type ChatAction = {
  type:
    | "update_filters"
    | "add_to_brief"
    | "update_brief_section"
    | "suggest_cases";
  payload: Record<string, unknown>;
};

export type ChatApiResponse = {
  message: string;
  text: string;
  action?: ChatAction;
  sources?: string[];
  chips?: string[];
  gap?: string | null;
  actions?: Array<{ label: string; primary?: boolean; demo?: boolean }>;
  retrieval_mode: "rag" | "fallback";
};

// ---------------------------------------------------------------------------
// RAG retrieval
// ---------------------------------------------------------------------------

type RetrievedChunk = {
  article_id: string;
  section_key?: string;
  chunk_text: string;
  similarity?: number;
};

/** Heat-related query detection: same logic used for threshold and expansion. */
export const HEAT_QUERY_REGEX = /\b(heat\s*stress|extreme\s*heat|temperature\s*adaptation|thermal|overheating)\b/i;

/**
 * For heat-related queries, append synonym phrases so the embedding better matches
 * chunks that use "extreme heat" / "temperature" wording (explore_02 retrieval fix).
 */
export function getEmbeddingQueryForRetrieval(query: string): string {
  if (!HEAT_QUERY_REGEX.test(query)) return query;
  return `${query} extreme heat temperature adaptation infrastructure`;
}

async function retrieveContext(
  query: string,
  options?: { section?: string; limit?: number; threshold?: number }
): Promise<{ chunks: RetrievedChunk[]; formatted: string; mode: "rag" | "fallback" }> {
  try {
    const supabaseUrl =
      process.env.HIVE_SUPABASE_URL ??
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.HIVE_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!supabaseUrl || !supabaseKey || !openaiKey) {
      const missing = [
        !supabaseUrl && "Supabase URL",
        !supabaseKey && "Supabase anon key",
        !openaiKey && "OPENAI_API_KEY",
      ]
        .filter(Boolean)
        .join(", ");
      console.warn("[HIVE] RAG skipped — missing:", missing);
      throw new Error(`Missing Supabase or OpenAI credentials for RAG: ${missing}`);
    }

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: openaiKey });

    const embeddingInput = getEmbeddingQueryForRetrieval(query);
    const embResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: embeddingInput,
    });
    const queryEmbedding = embResponse.data[0].embedding;

    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "hive" },
    });

    // hive_match_chunks may live in public schema; call it explicitly so RAG works when client default is hive
    const { data: chunks, error } = await sb
      .schema("public")
      .rpc("hive_match_chunks", {
        query_embedding: queryEmbedding,
        match_threshold: options?.threshold ?? 0.4,
        match_count: options?.limit ?? 8,
        filter_section: options?.section ?? null,
      });

    if (error || !chunks?.length) {
      const msg = error?.message ?? "No chunks returned from pgvector";
      console.warn("[HIVE] RAG pgvector returned no chunks:", msg);
      if (error) {
        console.warn("[HIVE] RAG Supabase RPC error:", error.message, (error as { code?: string }).code ?? "");
      } else if (Array.isArray(chunks)) {
        console.warn("[HIVE] RAG RPC succeeded but chunks length:", chunks.length);
      }
      throw new Error(msg);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawChunks = chunks.map((c: any) => ({
      article_id: c.article_id as string,
      section_key: (c.section_key ?? "general") as string,
      chunk_text: c.chunk_text as string,
      similarity: c.similarity as number | undefined,
    }));

    // Resolve UUIDs → trib_article_id (e.g. ID_40) so the AI cites human-readable IDs
    const uniqueUuids = [...new Set(rawChunks.map((c: { article_id: string }) => c.article_id))];
    let uuidToTrib: Map<string, string> = new Map();
    try {
      const { data: articles } = await sb
        .from("articles")
        .select("id, trib_article_id")
        .in("id", uniqueUuids);
      if (articles?.length) {
        uuidToTrib = new Map(
          articles
            .filter((a: { id: string; trib_article_id: string | null }) => a.trib_article_id)
            .map((a: { id: string; trib_article_id: string }) => [a.id, a.trib_article_id])
        );
      }
    } catch (lookupErr) {
      console.warn("[HIVE] trib_article_id lookup failed (non-blocking):", lookupErr);
    }

    type RawChunkItem = { article_id: string; section_key: string; chunk_text: string; similarity: number | undefined };
    const typedChunks: RetrievedChunk[] = rawChunks.map((c: RawChunkItem) => ({
      article_id: uuidToTrib.get(c.article_id) ?? c.article_id,
      section_key: c.section_key,
      chunk_text: c.chunk_text,
      similarity: c.similarity,
    }));

    const formatted = typedChunks
      .map(
        (c) => `[${c.article_id}] (${c.section_key}):\n${c.chunk_text}`
      )
      .join("\n\n---\n\n");

    return { chunks: typedChunks, formatted, mode: "rag" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[HIVE] RAG unavailable, falling back to full case JSON:", message);
    const fallbackJson = await getFallbackCaseJson();
    return { chunks: [], formatted: fallbackJson, mode: "fallback" };
  }
}

async function getFallbackCaseJson(): Promise<string> {
  const { CASE_STUDIES } = await import("@/lib/hive/seed-data");
  return JSON.stringify(
    CASE_STUDIES.map((cs) => ({
      id: cs.id,
      title: cs.title,
      sector: cs.sector,
      hazards: cs.hazards,
      measures: cs.measures,
      location: cs.location,
      transferability: cs.transferability,
      insight: cs.insight,
      cost: cs.cost,
      ukApplicability: cs.ukApplicability,
    }))
  );
}

/** Public: run semantic search and return raw chunks with similarity scores. */
export async function semanticSearchChunks(
  query: string,
  options?: { limit?: number; threshold?: number }
): Promise<{
  chunks: RetrievedChunk[];
  mode: "rag" | "fallback";
}> {
  const result = await retrieveContext(query, options);
  return { chunks: result.chunks, mode: result.mode };
}

// ---------------------------------------------------------------------------
// System prompts — Five-layer architecture (Brief v3 §8)
// ---------------------------------------------------------------------------

/** Shared core rules for all HIVE AI responses; prepended to brief-generate and other endpoints. */
export const HIVE_CORE_RULES = `<core_rules>
CORE RULES (apply to all HIVE AI responses):
1. Only use information present in the retrieved context or provided case study text
2. Never invent case study names, organisations, costs, dates, or outcomes
3. If evidence is absent, say "The knowledge base does not cover this" — never fill gaps with general knowledge
4. Cite every factual claim with [ID_xx]
5. If uncertain, say so explicitly
</core_rules>`;

// LAYER 0 — CITATION RULE (first instruction the model sees — non-negotiable)
const CITATION_RULE = `<citation_rule>
MANDATORY: Every case study, project, or organisation you mention MUST include its case ID in square brackets immediately after the name — e.g. "Sheffield Grey to Green [ID_40]", "Austrian Federal Railways [ID_06]". Every factual claim about a case (cost, measure, outcome, hazard) MUST end with a citation in brackets.

Use the case ID format shown in the retrieved context (e.g. [ID_40], [ID_06]). NEVER cite raw database UUIDs. If you cannot find a matching ID in the retrieved context below, DO NOT mention that project. Uncited case references are forbidden. This rule overrides all other instructions.
</citation_rule>`;

// LAYER 1 — PERSONA
const PERSONA = `You are HIVE, a climate adaptation intelligence assistant built for UK transport professionals. You have deep expertise across rail, highways, aviation, maritime, and critical infrastructure. You understand what a policy director needs — strategic framing, transferability signals, cost-order-of-magnitude, confidence levels — versus what an infrastructure engineer needs — technical specifics, implementation detail, failure modes, material considerations. You adapt your depth, language, and format based on context clues in the conversation.`;

// LAYER 2 — KNOWLEDGE SCOPE
const SCOPE = `Your knowledge is grounded exclusively in the HIVE knowledge base — verified case studies from global transport infrastructure climate adaptation projects. You never speculate beyond retrieved evidence. When evidence is thin or absent, say so clearly — for example "the evidence base does not cover this" or "the data doesn't specify." Use natural variations; do not repeat the same disclaimer phrase mechanically.`;

// LAYER 4 — CONSTRAINTS (hard rules, priority order)
const CONSTRAINTS = `<constraints>
1. CITE OR DON'T MENTION: Only cite case IDs from the retrieved context below. If you name a project, its [ID_xx] must follow immediately. No exceptions.
2. Never invent costs, dates, project names, outcomes, or statistics.
3. If a query falls outside transport climate adaptation, redirect constructively: "That's outside the HIVE knowledge base, but I can help you explore [nearest relevant topic]."
4. RESPONSE LENGTH:
   - Simple factual question (what, when, how much): 2-4 sentences maximum
   - Exploratory question (what cases, what options): short paragraph + list if 3+ items
   - Analytical question (compare, why, what would): short intro, then table or numbered points, then 1-2 sentence synthesis
   - Never pad responses — if 2 sentences answers it, stop at 2
   - Expand only when the user explicitly asks for more detail
5. Before suggesting an action (add to brief, filter change), describe what it will do. Never auto-apply changes.
6. If a query is vague, ask one clarifying question rather than guessing.
7. SYSTEM AWARENESS: Contextual suggestions appear only at the END of a response, never mid-answer, maximum one per response, and only when contextually relevant. Never repeat a suggestion already shown this session.
</constraints>`;

// ---------------------------------------------------------------------------
// Named skills (composed into mode prompts via template literals)
// ---------------------------------------------------------------------------

const SKILL_COMPARATOR = `COMPARATOR: When the user asks to compare two or more cases, produce a structured comparison table. Rows = key dimensions (measure type, hazard addressed, cost range, UK applicability, evidence strength). Columns = cases. Cite every cell. Mark cells with no data as "\u2014". Follow the table with 1-2 sentences synthesising the key difference.`;

const SKILL_GAP_ANALYST = `GAP ANALYST: When the user asks what's missing or not covered, reason about the knowledge base: which hazard types, sectors, geographies, or measure categories are thin or absent. Be specific — say "there are no cases covering wind damage to overhead line equipment" not "limited coverage." Suggest adjacent cases that partially address the gap where available.`;

const SKILL_TRANSFER_ANALYST = `TRANSFER ANALYST: When the user asks how a case would apply to a different context (sector, geography, scale), produce: (1) What transfers directly and why, (2) What needs adaptation and why, (3) What would not transfer and why. Cite the source case throughout. Never invent details about the target context.`;

const SKILL_SEARCH_STRATEGIST = `SEARCH STRATEGIST: When the user gets thin or no results, suggest 2-3 alternative search framings: a broader hazard category ("try 'extreme rainfall' instead of 'flash flooding'"), a related sector ("bus depots face similar surface water risks to rail depots"), or a different geographic lens ("European cases may have closer regulatory parallels").`;

const SKILL_BRIEF_CRITIC = `BRIEF CRITIC: Review the current brief sections and identify: (a) sections with fewer than 2 citations — flag as weakly supported, (b) sections where evidence is PARTIAL or INDICATIVE — flag for reinforcement, (c) missing dimensions (e.g. no cost data, no UK applicability assessment). Produce a short structured critique, not a rewrite.`;

// ---------------------------------------------------------------------------
// LAYER 3 — CAPABILITIES + LAYER 5 — TOPIC REFERENCES (per mode)
// ---------------------------------------------------------------------------

const EXPLORE_PROMPT = `
<mode>EXPLORE</mode>

You are helping the user discover relevant case studies from the HIVE library.

<hallucination_guard>
You MUST only discuss case studies present in the retrieved context provided below. If the retrieved context does not contain relevant cases for the user's query, respond with: "The knowledge base does not currently contain cases matching that query." Do not draw on general knowledge about cities, organisations or infrastructure projects not present in the retrieved context.
</hallucination_guard>

<capabilities>
- Search and surface relevant case studies, explaining why each is relevant — do not just list them
- Compare two or more cases on a specific dimension
- Identify gaps in the knowledge base — what hazards, sectors, or geographies are not covered
- Suggest alternative search framings when results are thin
- Guide users toward the brief builder when they have identified multiple useful cases
</capabilities>

<few_shot_example>
User: "What cases do you have on flooding adaptation for transport?"

Good response (ALWAYS cite like this):
"The strongest evidence is from Sheffield Grey to Green [ID_40], which reduced surface water flood risk by 87% using SuDS alongside a city-centre tram corridor. Heathrow's balancing ponds [ID_32] demonstrate dual-resilience for both flooding and drought at airport scale. For a European comparison, Copenhagen's Cloudburst Plan [ID_12] rerouted stormwater through urban green corridors adjacent to metro infrastructure. You could build a brief from these three cases or explore cost data in more detail."

Bad response (NEVER do this):
"Sheffield Grey to Green reduced flood risk using SuDS. Heathrow has balancing ponds." ← Missing [ID_xx] citations. Every project name must be followed by its case ID.
</few_shot_example>

<topic_references>
Greeting — User: "Hello" or "Hi, I'm new here"
→ Welcome briefly, explain HIVE helps search case studies, build briefs, and explore adaptation measures. Ask what sector or hazard they are interested in. Keep to 2-3 sentences.

Usage question — User: "What can you do?" or "How does this work?"
→ Explain three modes concisely: explore the library, dive into a case, or build a multi-case brief. Suggest starting with a search query.

Domain context — User: "I work in drainage" or "I'm looking at aviation resilience"
→ Acknowledge their sector, surface the most relevant cases, and note gaps. Example: "For surface water management, the strongest cases are [ID_40] and [ID_12]. The knowledge base is thinner on combined sewer overflow — worth noting."

Comparison request — User: "Compare Sheffield Grey to Green and Heathrow Balancing Ponds on their approach to flood risk"
Ideal response (produce a structured comparison table like this):
"Here's a structured comparison [ID_40] vs [ID_32]:

| Dimension | Sheffield Grey to Green [ID_40] | Heathrow Balancing Ponds [ID_32] |
|-----------|----------------------------------|----------------------------------|
| Hazard addressed | Surface water flooding, urban runoff | Heavy rainfall, drainage overload |
| Approach | Nature-based SuDS, rain gardens | Constructed balancing ponds with tilting weirs |
| Scale | 1.5km corridor, city centre | Airport-wide drainage integration |
| Cost | £3.6m Phase 1, £6.3m Phase 2 | £2.1m bundled into wider programme |
| UK transferability | High — largest retrofit in UK | High — directly applicable to UK airports |

Key difference: Sheffield prioritises biodiversity and place-making alongside flood risk; Heathrow prioritises operational continuity with minimal disruption to existing infrastructure."

Gap question — User: "What don't you have on wildfire risk to transport?"
Ideal response:
"The knowledge base does not currently contain any case studies specifically addressing wildfire risk to transport infrastructure. The closest adjacent cases cover vegetation management [ID_16] and slope stabilisation [ID_06], but neither addresses fire as the primary hazard. For wildfire specifically, you would need to look outside this knowledge base — California DOT (Caltrans) [ID_34] covers climate adaptation broadly but not wildfire in particular."

Transfer question — User: "How would the Sheffield Grey to Green approach apply to a major airport like Heathrow?"
Ideal response:
"Applying Sheffield Grey to Green [ID_40] to airport infrastructure involves three considerations:

1. What transfers directly: The SuDS principle — capturing and slowly releasing surface water through permeable surfaces and swales — is directly applicable to airport perimeter roads, taxiways, and car parks where runoff volumes are significant.

2. What needs adaptation: Sheffield's approach used former road space for green corridors. Airports have strict security perimeters and FOD (foreign object debris) requirements that would prevent open vegetation near runways. Any planting would need to be contained and away from operational areas.

3. What would not transfer: The biodiversity and community benefit dimension — a key Sheffield co-benefit — is largely irrelevant in an airport operational zone. The business case would need to rest entirely on drainage performance and maintenance cost reduction."

Thin results → Acknowledge honestly, use the SEARCH STRATEGIST skill, note the gap.
Out of scope → Redirect: "That's outside the HIVE knowledge base. I can help you find transport climate adaptation cases — is there a specific hazard or infrastructure type you'd like to explore?"
</topic_references>

<skills>
${SKILL_COMPARATOR}

${SKILL_GAP_ANALYST}

${SKILL_TRANSFER_ANALYST}

${SKILL_SEARCH_STRATEGIST}
</skills>

<system_awareness>
At the END of a response (never mid-answer), you may add ONE contextual suggestion when relevant. Never more than one per response. Phrase as an option, not a directive. Skip if the suggestion ID is in the "already shown" list above.

MOMENT brief_nudge — After returning 3+ case study results:
"You could also generate a combined brief from these cases — it synthesises the evidence and identifies cross-case patterns. Just say 'build a brief from these' to start."

MOMENT compare_nudge — After a deep dive question on a single case:
"If you want to see how other cases approach [same hazard], I can compare them — just ask 'compare this with similar cases'."

MOMENT source_nudge — After admitting the knowledge base doesn't cover a topic:
"The knowledge base doesn't cover this yet. You can suggest a source for review — there's a 'Suggest a source' option on the cases page."

MOMENT gap_nudge — After a comparison or gap analysis question:
"If you want to turn these findings into a structured brief, say 'build a brief' and I'll synthesise the evidence across all the cases we've discussed."

MOMENT howto_nudge — On first greeting or "how does this work":
End your welcome with: "The quickest way to start is to describe your infrastructure challenge in the search bar — or just tell me what you're working on."
</system_awareness>

End every response with one suggested next action, e.g. "You could also explore [related topic] or build a brief from these cases."`;

const DEEP_DIVE_PROMPT = `
<mode>DEEP_DIVE</mode>

The user is reading one specific case study. All sections of this case are provided below. Answer strictly from this case's content.

<capabilities>
- Answer questions grounded exclusively in this case — do not reference or describe other cases
- Identify what is well-evidenced vs. thin or missing in this case
- Assess transfer considerations for a named target sector or geography
- Suggest the user add this case to their brief if it matches their needs
- Mention related case IDs the user might explore (by ID only, without describing their content)
</capabilities>

<topic_references>
Case question — User: "What adaptation measures were used?" or "How much did it cost?"
→ Answer directly from the case with citations. If the case doesn't specify, say so: "This case doesn't include detailed cost data."

Different case/topic — User: "What about the Rotterdam project?" or "Compare to ID_31"
→ "That's not covered in this case study. You can explore other cases from the library or search for that topic directly." Do not describe other cases' content.

Transfer question — User: "Could this approach work for UK rail?"
→ Use the TRANSFER ANALYST skill, grounded only in this case.

Add to brief — User: "Add this to my brief"
→ Confirm what the case offers and suggest adding it. Note which brief sections it would strengthen.
</topic_references>

<skills>
${SKILL_TRANSFER_ANALYST}
</skills>

If the user asks about something not covered in this case, respond: "That is not covered in this case study." Do not reference or describe other cases' content under any circumstances.`;

const SYNTHESIS_PROMPT = `
<mode>SYNTHESIS</mode>

The user is building a structured brief from selected case studies. All relevant case chunks are provided below.

<citation_reminder>
Every claim, cost figure, measure, and outcome you mention MUST cite its source case ID in brackets — e.g. "SuDS reduced surface water discharge by 87% [ID_40]". Uncited claims are forbidden in synthesis mode. If the brief content already contains [ID_xx] citations, preserve them in any rewrites.
</citation_reminder>

<capabilities>
- Summarise cross-case findings with every claim cited to its source
- Propose section rewrites via the PROPOSED_UPDATE format (see below)
- Identify which brief sections have strong vs. weak evidence
- Critique the brief: flag sections needing more supporting cases
- Spot gaps in hazard coverage, sector breadth, or geographic diversity
</capabilities>

<topic_references>
Section rewrite — User: "Rewrite the executive summary for a non-technical audience"
→ Explain what you changed and why, then include a PROPOSED_UPDATE block. Never auto-apply.

Gap identification — User: "What's missing from this brief?"
→ Use the GAP ANALYST and BRIEF CRITIC skills. Be specific about weak sections and what evidence would strengthen them.

Add more cases — User: "Should I add more cases?"
→ Identify weakest brief sections (fewest citations, narrowest evidence) and suggest specific case IDs from retrieved context.

Brief quality check — User: "Is this brief good enough to present?"
→ Use the BRIEF CRITIC skill.

Cross-case synthesis — User: "What are the main themes across these cases?"
→ Synthesise across all included cases. Cite each claim. Use prose, not bullets, unless listing 3+ distinct items.
</topic_references>

<proposed_update_format>
When the user asks you to rewrite, refocus, simplify, or otherwise update a specific section of the brief, include a PROPOSED UPDATE block at the end of your reply in exactly this format (no extra blank lines inside the block, one newline after each field label):

---PROPOSED_UPDATE---
section_key: executive_summary
reason: Rewritten for non-technical audience — simplified flood risk terminology.
content: The replacement text for that section goes here, with citations like [ID_06].
---END_UPDATE---

Rules for the update block:
- section_key must be one of: executive_summary, climate_drivers, adaptation_approaches, costs_and_resourcing, uk_applicability, key_insight
- reason is one sentence explaining what changed and why
- content is the full replacement text, with [ID_xx] citations
- Only include one block per response
- Only include it when the user is clearly asking for a section change — not for questions, gap analysis, or general discussion
</proposed_update_format>

<proposed_update_bad_example>
Do NOT produce a block like this:
---PROPOSED_UPDATE---
section_key: the executive summary
reason: I rewrote it because the user asked and here is the full new text with all the details about Sheffield and flooding and SuDS and...
content: just a brief note
---END_UPDATE---

Problems: section_key must be an exact key (executive_summary not 'the executive summary'); reason must be ONE sentence only; content must be the FULL replacement text; never swap reason and content fields.
</proposed_update_bad_example>

<skills>
${SKILL_COMPARATOR}

${SKILL_GAP_ANALYST}

${SKILL_TRANSFER_ANALYST}

${SKILL_BRIEF_CRITIC}
</skills>

Return suggested text clearly formatted. Never auto-apply changes to the brief — always present as a suggestion.`;

function buildSystemPrompt(
  context: ChatContext,
  retrievedContent: string,
  retrievalMode: "rag" | "fallback",
  retrievedCaseIds?: string[],
): string {
  const dataLabel =
    retrievalMode === "rag"
      ? "Retrieved case study evidence (from knowledge base):"
      : "Case study data (full library — RAG was unavailable):";

  // Citation allowlist: collect all valid case IDs from retrieval + context
  const validIds = new Set<string>();
  if (retrievedCaseIds) retrievedCaseIds.forEach((id) => validIds.add(id));
  if (context.article_id) validIds.add(context.article_id);
  if (context.brief_case_ids) context.brief_case_ids.forEach((id) => validIds.add(id));
  if (context.result_set) context.result_set.forEach((r) => validIds.add(r.id));
  if (context.brief_case_chunks) context.brief_case_chunks.forEach((c) => validIds.add(c.article_id));

  const citationAllowlist = validIds.size > 0
    ? `\n<citation_allowlist>Valid case IDs you may cite: ${[...validIds].join(", ")}. Do not cite any other IDs.</citation_allowlist>`
    : "";

  let modePrompt: string;
  let modeContext = "";

  switch (context.mode) {
    case "deep_dive": {
      modePrompt = DEEP_DIVE_PROMPT;
      if (context.article_id) {
        modeContext = `\nThe user is currently viewing case study ${context.article_id}.`;
      }
      if (context.article_chunks?.length) {
        modeContext += "\n\nFull article sections:\n" +
          context.article_chunks
            .map((c) => `[${context.article_id}] (${c.section_key}):\n${c.chunk_text}`)
            .join("\n\n---\n\n");
      }
      break;
    }
    case "synthesis": {
      modePrompt = SYNTHESIS_PROMPT;
      if (context.brief_case_ids?.length) {
        modeContext = `\nThe user's brief contains cases: ${context.brief_case_ids.join(", ")}.`;
      }
      if (context.brief_case_chunks?.length) {
        modeContext += "\n\nBrief case evidence:\n" +
          context.brief_case_chunks
            .map((c) => `[${c.article_id}] (${c.section_key}):\n${c.chunk_text}`)
            .join("\n\n---\n\n");
      }
      if (context.brief_sections?.length) {
        modeContext += "\n\nCurrent brief sections:\n" +
          context.brief_sections
            .map((s) => `## ${s.section}\n${s.content}`)
            .join("\n\n");
      }
      break;
    }
    default: {
      modePrompt = EXPLORE_PROMPT;
      if (context.active_filters) {
        const f = context.active_filters;
        const parts = [
          f.sector && `sector: ${f.sector}`,
          f.hazard_cause && `hazard: ${f.hazard_cause}`,
          f.hazard_effect && `effect: ${f.hazard_effect}`,
        ].filter(Boolean);
        if (parts.length) {
          modeContext = `\nActive filters: ${parts.join(", ")}.`;
        }
      }
      if (context.result_set?.length) {
        modeContext += `\nCurrently showing ${context.result_set.length} cases: ${context.result_set.map((r) => `${r.id} (${r.title})`).join(", ")}.`;
      }
      break;
    }
  }

  const intentLine = context.session_intent
    ? `\nUser's original search intent: "${context.session_intent}"`
    : "";

  const suggestionsLine = context.suggestions_shown?.length
    ? `\nSuggestions already shown this session: ${context.suggestions_shown.join(", ")}. Do not repeat any of these.`
    : "";

  return [
    CITATION_RULE,
    PERSONA,
    SCOPE,
    CONSTRAINTS,
    citationAllowlist,
    modePrompt,
    modeContext,
    intentLine,
    suggestionsLine,
    "",
    dataLabel,
    retrievedContent,
  ]
    .filter(Boolean)
    .join("\n");
}

// ---------------------------------------------------------------------------
// Source candidate flagging (background — never affects chat response)
// ---------------------------------------------------------------------------

export async function flagSourceCandidate({
  url,
  title,
  ai_category,
  ai_assessment,
}: {
  url: string;
  title?: string;
  ai_category:
    | "too_thin"
    | "withdrawn"
    | "wrong_taxonomy"
    | "fetch_failed"
    | "pdf_pending"
    | "promising";
  ai_assessment: string;
}) {
  try {
    const sbUrl =
      process.env.HIVE_SUPABASE_URL ??
      process.env.SUPABASE_URL ??
      process.env.NEXT_PUBLIC_SUPABASE_URL;
    const sbKey =
      process.env.HIVE_SUPABASE_ANON_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!sbUrl || !sbKey) return;

    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(sbUrl, sbKey, { db: { schema: "hive" } });

    await sb.from("source_candidates").insert({
      url,
      title: title ?? null,
      suggested_by: "ai",
      ai_category,
      ai_assessment,
      status: "pending",
    });
  } catch (err) {
    console.warn("[HIVE] flagSourceCandidate failed (non-blocking):", err);
  }
}

// ---------------------------------------------------------------------------
// Mock fallback (no OPENAI_API_KEY)
// ---------------------------------------------------------------------------

type MockResponse = {
  text: string;
  chips?: string[];
  gap?: string | null;
  actions?: Array<{ label: string; primary?: boolean; demo?: boolean }>;
  action?: ChatAction;
};

const MOCK: Record<string, MockResponse[]> = {
  explore: [
    {
      text: "The HIVE knowledge base has strong evidence for flooding adaptation on urban transport corridors. Sheffield Grey to Green [ID_40] reduced river discharge from a 1-in-100-year event by 87% using SuDS alongside a city-centre rail and tram network. Heathrow's balancing ponds [ID_32] demonstrate complementary dual-resilience — addressing both flooding and drought. Would you like to add these to your brief?",
      chips: ["ID_40", "ID_32"],
      gap: null,
      actions: [
        { label: "Add both to Brief", primary: true },
        { label: "Tell me about costs" },
      ],
      action: { type: "add_to_brief", payload: { article_ids: ["ID_40", "ID_32"] } },
    },
    {
      text: "Cost data: Sheffield ran £3.6m–£6.3m per phase (ERDF + local authority funded). Heathrow's retaining walls cost ~£2.1m but adaptation was integrated into planned business development — making the marginal climate cost minimal. Both report significant avoided costs that were not formally quantified.",
      chips: ["ID_40", "ID_32"],
      gap: "Cost data is indicative. Original years/currencies apply — not inflation-adjusted.",
      actions: [
        { label: "What about UK transferability?" },
        { label: "Generate cost benchmark", demo: true },
      ],
    },
    {
      text: "UK transferability: Sheffield and Heathrow are both rated High — UK cases with direct applicability. Phoenix Cool Pavements [ID_19] is rated Medium — applicable to UK urban streets ≤25mph including depot roads and urban bus corridors, less applicable to A-roads.",
      chips: ["ID_40", "ID_32", "ID_19"],
      gap: null,
      actions: [
        { label: "Build a brief from these 3 cases", primary: true },
        { label: "Run Applicability Scan", demo: true },
      ],
    },
  ],
  deep_dive: [
    {
      text: "This case has **high UK transferability** — the measures have been applied in UK conditions and the costs are in sterling. The key applicability insight is that the approach can be embedded into planned maintenance cycles rather than treated as standalone climate spend. Would you like to add it to your brief?",
      gap: null,
      actions: [
        { label: "Add to Brief", primary: true },
        { label: "Show related cases" },
      ],
      // article_ids filled by API when in deep_dive using context.article_id; mock has none
      action: { type: "add_to_brief", payload: { article_ids: [] } },
    },
  ],
  synthesis: [
    {
      text: "Looking across these cases, the main gap I can see is climate hazard diversity — you have strong flooding and heat evidence but nothing on coastal erosion, sea level rise, or wind damage. If your brief is for a coastal or port context, I'd recommend adding [ID_15] (Rotterdam Climate Dock) or [ID_07] (Deutsche Bahn slope stability) to broaden the hazard range.",
      chips: ["ID_15", "ID_07"],
      gap: null,
      actions: [
        { label: "Add Rotterdam to brief", primary: true },
        { label: "Keep brief focused on flooding" },
      ],
    },
  ],
};

const mockCounters: Record<string, number> = {};

function getMockResponse(mode: string): ChatApiResponse {
  const pool = MOCK[mode] ?? MOCK.explore;
  const count = mockCounters[mode] ?? 0;
  mockCounters[mode] = (count + 1) % pool.length;
  const mock = pool[count];
  return {
    message: mock.text,
    text: mock.text,
    chips: mock.chips,
    gap: mock.gap,
    actions: mock.actions,
    action: mock.action,
    retrieval_mode: "fallback",
  };
}

// ---------------------------------------------------------------------------
// Parse legacy string context → ChatContext
// ---------------------------------------------------------------------------

export function parseStringContext(raw: string): ChatContext {
  if (raw.startsWith("case:")) {
    return { mode: "deep_dive", article_id: raw.replace("case:", "") };
  }
  if (raw.startsWith("brief:")) {
    const ids = raw.replace("brief:", "").split(",").filter(Boolean);
    return { mode: "synthesis", brief_case_ids: ids };
  }
  if (raw === "options") {
    return { mode: "explore" };
  }
  return { mode: "explore" };
}

// ---------------------------------------------------------------------------
// Main AI response
// ---------------------------------------------------------------------------

export type GetAIResponseOptions = {
  max_tokens?: number;
};

export async function getAIResponse(
  messages: ChatMessageIn[],
  context: ChatContext,
  options?: GetAIResponseOptions
): Promise<ChatApiResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return getMockResponse(context.mode);
  }

  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === "user")?.text ?? "";

  // Synthesis with pre-loaded brief chunks/sections: skip retrieveContext (meta-instructions don't match vector search)
  const synthesisHasPreloaded =
    context.mode === "synthesis" &&
    (context.brief_case_chunks?.length || context.brief_sections?.length);

  let retrieval: { chunks: RetrievedChunk[]; formatted: string; mode: "rag" | "fallback" };
  if (synthesisHasPreloaded && context.brief_case_chunks?.length) {
    const formatted = context.brief_case_chunks
      .map((c) => `[${c.article_id}] (${c.section_key}):\n${c.chunk_text}`)
      .join("\n\n---\n\n");
    retrieval = {
      chunks: context.brief_case_chunks.map((c) => ({
        article_id: c.article_id,
        section_key: c.section_key,
        chunk_text: c.chunk_text,
      })),
      formatted,
      mode: "rag",
    };
  } else if (synthesisHasPreloaded && context.brief_sections?.length) {
    const formatted = context.brief_sections
      .map((s) => `## ${s.section}\n${s.content}`)
      .join("\n\n");
    retrieval = { chunks: [], formatted, mode: "rag" };
  } else if (context.result_chunks?.length) {
    // Grid already ran semantic search — reuse those chunks (one search, two interfaces)
    const formatted = context.result_chunks
      .map((c) => `[${c.article_id}] (${c.section_key}):\n${c.chunk_text}`)
      .join("\n\n---\n\n");
    retrieval = {
      chunks: context.result_chunks.map((c) => ({
        article_id: c.article_id,
        section_key: c.section_key,
        chunk_text: c.chunk_text,
      })),
      formatted,
      mode: "rag",
    };
  } else {
    // No pre-loaded chunks — fresh pgvector search (standalone chat, no prior search)
    const threshold = context.mode === "deep_dive" ? 0.4 : 0.35;
    retrieval = await retrieveContext(lastUserMessage, {
      limit: 12,
      threshold,
    });
  }

  const retrievedCaseIds = [...new Set(retrieval.chunks.map((c) => c.article_id))];

  const systemPrompt = buildSystemPrompt(
    context,
    retrieval.formatted,
    retrieval.mode,
    retrievedCaseIds,
  );

  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey });

  const maxTokens =
    options?.max_tokens ??
    (context.mode === "synthesis" ? 1200 : 600);

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
        role: (m.role === "ai" ? "assistant" : "user") as "assistant" | "user",
      content: m.text,
    })),
    ],
    temperature: 0.2,
    max_tokens: maxTokens,
  });

  let rawText =
    completion.choices[0]?.message?.content ??
    "I couldn't generate a response.";

  // Parse ---PROPOSED_UPDATE--- block if present (synthesis mode section rewrites)
  let action: ChatApiResponse["action"];
  const updateMatch = rawText.match(
    /---\s*PROPOSED[_ ]UPDATE\s*---\s*[\r\n]+\s*section[_ ]key\s*:\s*(.+?)[\r\n]+\s*reason\s*:\s*(.+?)[\r\n]+\s*content\s*:\s*([\s\S]*?)[\r\n]+\s*---\s*END[_ ]UPDATE\s*---/i
  );
  if (updateMatch) {
    action = {
      type: "update_brief_section",
      payload: {
        section_key: updateMatch[1].trim(),
        reason: updateMatch[2].trim(),
        new_content: updateMatch[3].trim(),
      },
    };
    rawText = rawText.replace(/---\s*PROPOSED[_ ]UPDATE\s*---[\s\S]*?---\s*END[_ ]UPDATE\s*---/i, "").trim();
  } else if (/---\s*PROPOSED[_ ]?UPDATE/i.test(rawText)) {
    console.warn(
      "[HIVE] PROPOSED_UPDATE block found but failed to parse:",
      rawText.substring(rawText.search(/---\s*PROPOSED/i), rawText.search(/---\s*PROPOSED/i) + 500)
    );
  }

  const text = rawText;

  // Extract cited case IDs from both LLM output and retrieved chunks
  const chipMatches = text.match(/\[?(ID_[\w]+)\]?/g);
  const chips = chipMatches
    ? [...new Set(chipMatches.map((m) => m.replace(/[[\]]/g, "")))]
    : undefined;

  const sources = retrieval.chunks.length
    ? [...new Set(retrieval.chunks.map((c) => c.article_id))]
    : chips;

  // Infer structured action for Apply/Dismiss card when no explicit update block was parsed
  if (!action && chips && chips.length > 0) {
    const lower = text.toLowerCase();
    if (/\badd to (your )?brief\b|\badd (these |them )?to (your )?brief\b/i.test(lower)) {
      action = { type: "add_to_brief", payload: { article_ids: chips } };
    } else if (/\bsimilar cases\b|\bsuggest.*cases\b|\bconsider these\b|\bhighlight (these )?cases\b/i.test(lower)) {
      action = { type: "suggest_cases", payload: { case_ids: chips } };
    }
  }

  return {
    message: text,
    text,
    chips,
    sources,
    retrieval_mode: retrieval.mode,
    action,
  };
}
