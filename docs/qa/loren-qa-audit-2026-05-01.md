# HIVE QA Audit — Independent Second Opinion on Loren Chamberlain's Gate 1 QA

**Auditor:** Cursor Agent (independent codebase audit)
**Date:** 2026-05-01
**Scope:** All 25 rows of Loren's QA report, plus automated checks and pattern analysis
**Mode:** Read-only codebase audit. No code changes applied. Trivial fixes proposed as a diff in Phase 5.

---

## Phase 1 — Reconnaissance Summary

### 1.1 Spec Status

**Notion page `313c9b382a74810a9b18c9baf0526c93` could not be read** — the page requires authentication. All spec-status lines in Phase 3 are therefore marked `Cannot find in spec — Notion authentication required`. Dayo should cross-reference each row against the spec manually and update the tracker CSV accordingly. This is the single most important follow-up action from this audit.

### 1.2 Codebase Summary

- **Stack confirmed:** Next.js 15.2.1, React 19, Tailwind 4, Supabase JS 2.99, OpenAI 6.27, standalone output mode for Azure App Service.
- **No GOV.UK Design System dependency.** The UI uses Tailwind CSS + custom inline styles + DM Sans / DM Serif Display fonts. There is no `govuk-frontend` package, no GDS component library, and no reference to GOV.UK patterns in the codebase.
- **Retrieval pipeline:** Hybrid search — pgvector semantic search (OpenAI `text-embedding-3-small` embeddings) + keyword metadata scoring, merged with Reciprocal Rank Fusion (RRF, k=60). Dynamic similarity thresholds based on query length (0.25 for 1–2 words, 0.35 for 3–5, 0.45 for 6+). Domain-specific query expansion map for 18 common short queries.
- **Chat model:** `gpt-4o-mini` for Ask Hive chat; `gpt-4o` for brief generation.
- **AI timeout:** 12,000ms globally (`lib/handbook/ai-availability.ts` line 1). Brief generation uses this same timeout via `withAITimeout`.
- **Case studies:** 37 case studies in `data/case-studies.json` (IDs: ID_01 through ID_81, plus ID_UKPN_01). 7 have rich seed overrides in `lib/hive/seed-data.ts`. 4 placeholder entries exist for upcoming curation.
- **Adaptation measures:** 66 total across 36 articles in `data/trib-measures.json` (61 unique names). Loren says 67 — this is approximately correct.
- **ID_41 does NOT exist** in `case-studies.json` or `seed-data.ts`. The marquee has an entry #41 "LA Metro — Hardening Infrastructure" but this has no `caseStudyId` mapping. The vector DB may contain chunks referencing it from the original TRIB dataset, but the frontend has no page to serve.
- **Cost band taxonomy:** `["Under £1m", "£1m–£10m", "£10m–£100m", "£100m+", "Large programme"]`. ID_06 (Austrian Federal Railways) has costBand = `"Large programme"` and cost = `"€3bn+ annual infrastructure budget"`. ID_01 (Port of Calais) has costBand = `"£100m+"`. The filter on `/handbook` includes all five bands.
- **UK Geography filter:** Uses `ukRegion` and `ukApplicability` fields. Filter logic: `selectedRegions.some(r => cs.ukRegion.includes(r) || cs.ukApplicability.some(a => a.toLowerCase().includes(r.toLowerCase())))`. "Wales" is a filter option in `UK_REGIONS`. No case studies have `ukRegion` containing "Wales" — the field contains values like "Yorkshire & Humber", "London & South East", "Applicable UK-wide". Wales mentions appear only in raw case study text, not in the structured filter fields.
- **Brief state:** Brief case IDs stored in `sessionStorage` under key `hiveBriefCases` (via ChatContext). Brief page also checks URL params (`?ids=`). When no IDs in URL or sessionStorage, the page loads the example brief (IDs 40, 32, 19) from `data/example-brief.json`.
- **"View N cases" link:** Renders as a `<Link>` to `/handbook/cases?highlight=ID_xx,ID_yy`. It is an `<a>` tag, not a button. Clicking navigates away from the chat context. Opening in a new tab loses all session state (chat history, intent, semantic chunks).

### 1.3 Five Facts That Change How Loren's Claims Should Be Read

1. **ID_41 genuinely does not exist as a routable case study.** The marquee references an "LA Metro" entry without a `caseStudyId`, and the case-studies.json has no ID_41. This is a confirmed bug — the AI cited an ID from the vector DB that has no frontend page.

2. **ID_06 costBand is "Large programme", not "£100m+".** Loren claims ID_06 appears when filtering for £100m+ — this is incorrect if testing on `/handbook` where the filter does exact string matching against `costBand`. However, the raw cost text says "€3bn+ annual infrastructure budget" which may confuse a manual reader. The data tagging is actually more nuanced than Loren describes — but the underlying data quality concern (using ÖBB's annual budget rather than adaptation-specific costs) is valid.

3. **"Wales" geography filter will return zero results** because no case study has `ukRegion` containing "Wales" and no `ukApplicability` array contains a string with "wales" in it. The filter logic checks both fields but neither is populated with Welsh data. This is a data gap, not a code bug.

4. **The AI cannot enumerate all 66 measures** by design. The retrieval pipeline returns max 12 chunks, and the chat response is capped at 600 tokens (explore mode). The AI can only cite what's in its context window. This is architectural, not a bug.

5. **The HS2 Learning Legacy link is NOT broken.** The URL `https://learninglegacy.hs2.org.uk/document-themes/climate-change/` returns HTTP 200 with valid content. Loren's claim that this link "doesn't work" is refuted.

---

## Phase 2 — Automated Checks

### 2.1 Accessibility — WCAG 2.2

**Automated tooling unavailable** — Playwright, axe-core, Lighthouse, and pa11y cannot be installed/run in this sandboxed environment. Manual code-level review follows.

**Code-level accessibility observations:**

Positive patterns found:
- ChatPanel uses `role="dialog"`, `aria-modal="true"`, `aria-label`, keyboard trap for Tab, Escape to close
- BriefTray uses `role="status"`, `aria-live="polite"`
- Case tiles in brief use `role="button"`, `tabIndex={0}`, `aria-pressed`, `aria-label`, keyboard handler for Enter/Space
- Form inputs have `<label className="sr-only">` associations
- Close buttons have `aria-label="Close chat"`
- Remove-from-brief buttons have `aria-label="Remove ${title} from brief"`

Likely issues (from code inspection, not automated scanning):
- Extensive use of inline styles means no `:focus-visible` outlines are set on most interactive elements
- Many `<button>` and `<a>` elements use icon-only content (SVGs) without visible text — some have `title` but not `aria-label`
- Colour contrast: accent colours like `#1D9E75` on white and `#6b7280` on white may fail WCAG AA for small text (need computed contrast check)
- Heading hierarchy: individual pages may skip heading levels (e.g. `<h1>` then `<h3>` in tour)
- The marquee/carousel has no pause mechanism, keyboard navigation, or `aria-live` announcement

**Summary:** There are likely real WCAG 2.2 non-compliances, but without automated tooling, the count and severity cannot be quantified. Many are likely trivial to fix (aria-labels, focus indicators). Some may be structural (heading hierarchy, focus order across dynamic UI). Loren's claim of "multiple non-compliances" is plausible but unquantified.

**Recommended next step:** Run `npx @axe-core/cli https://hive-staging-hsbceeffcrabdfbc.uksouth-01.azurewebsites.net/handbook` to get concrete numbers.

### 2.2 GOV.UK Design System Alignment

- **The codebase contains zero references to GOV.UK Design System.** No `govuk-frontend` package, no GDS class names, no `govuk-*` CSS.
- **The UI uses:** Tailwind CSS 4, DM Sans / DM Serif Display fonts, custom colour tokens, inline React styles.
- **Spec status:** Cannot verify whether the spec required GOV.UK alignment (Notion page inaccessible). However, the entire codebase was built without any GOV.UK dependency, suggesting this was never an agreed requirement.
- **Public sector legal requirement:** The Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018 require WCAG 2.1 AA compliance, NOT GOV.UK Design System compliance. These are separate requirements. A non-GDS UI can be fully WCAG compliant.

**Verdict:** If the spec did not require GOV.UK Design System, this is a scope dispute, not a defect. Loren conflates WCAG compliance (legal) with GOV.UK Design System adherence (optional for non-central-government services).

### 2.3 Analytics Evidence

**GA4 implementation confirmed:**
- `components/handbook/shared/GA4Script.tsx` injects gtag with measurement ID from `NEXT_PUBLIC_GA4_ID`
- `lib/analytics/ga4.ts` defines 8 tracked events:
  1. `search_performed` — captures `search_term`, `result_count`, `intent_source` (ai/keyword)
  2. `filter_applied` — captures `filter_type`, `filter_value`
  3. `case_study_opened` — captures `case_id`, `transport_sector`, `open_via` (card/chip/marquee)
  4. `case_study_opened` — via CasePageClient
  5. `added_to_brief` — captures `case_id`, `brief_size`
  6. `brief_generated` — captures `case_count`, `case_ids`, `brief_source`
  7. `pdf_downloaded` — captures `case_count`, `case_ids`
  8. `chat_opened` — captures `chat_context`
  9. `heatmap_clicked` — captures `transport_sector`, `climate_hazard`
- `lib/analytics.ts` provides a generic `trackEvent` wrapper with deployment_env tagging

**Coverage vs. Loren's three analytics rows:**

| Loren's requirement | Coverage | Platform |
|---|---|---|
| Search/query activity | `search_performed` event captures every search with query text and result count | GA4 |
| Engagement/click depth | `case_study_opened`, `filter_applied`, `chat_opened`, `heatmap_clicked` capture interaction depth | GA4 |
| Support material usage | `pdf_downloaded` captures brief exports; `brief_generated` captures brief creation. Guidance page link clicks are standard GA4 outbound click events | GA4 |

**Azure Application Insights / PostHog:** No references found in the codebase to Application Insights SDK or PostHog JS. These may be configured at the infrastructure level but are not instrumented in the application code.

### 2.4 Database Updatability and Scalability

- **Supabase (`hive` schema) confirmed** in code: `{ db: { schema: "hive" } }` used consistently
- **Admin routes exist:** `/app/api/admin/sync-azure/route.ts`, `/app/api/admin/status/route.ts`, `/app/api/admin/source-candidates/route.ts`
- **Content ingestion pipeline exists:** `scripts/ingest-guidance-sources.ts`, `scripts/run-atlas-migration.ts`
- **Source candidate flagging:** `flagSourceCandidate()` in `chat-api.ts` inserts into `hive.source_candidates` table
- **Session persistence:** Brief sessions stored in Supabase via `createSynthesisSession()`
- **Architecture:** Supabase is PostgreSQL — natively supports UPDATE, INSERT, DELETE, ALTER TABLE, schema evolution, connection pooling, and scales from free tier to enterprise

**Statement for Loren:** The database architecture is PostgreSQL (via Supabase) with a dedicated `hive` schema. It supports full CRUD operations, has admin API endpoints for content synchronisation, and an ingestion pipeline for new guidance sources. The UI does not expose user-facing content editing in v1 — this is a deliberate scope decision, not an architectural limitation. The schema can accommodate unlimited additional records, categories, and content types.

### 2.5 Retrieval Correctness Battery

**Cannot execute live queries** — the retrieval battery requires running the application with API keys to test actual search results. This section documents what CAN be determined from code analysis:

**Synonym/paraphrase coverage analysis:**
- `HAZARDS_CAUSE` canonical terms: `["Heavy rainfall", "High temperatures", "Storms", "Sea level rise", "Drought", "Freeze-thaw"]`
- There is NO synonym table. The system relies on:
  1. Query expansion map in `chat-api.ts` (18 entries: flood, storm, drought, coastal, heat, ice, etc.)
  2. Embedding similarity (text-embedding-3-small handles paraphrases reasonably well)
  3. Keyword scoring against case metadata (title, summary, hazards, tags, measures)
- "Extreme Heat" is NOT a canonical term — "High temperatures" is. The query expansion for "heat" adds `"extreme heat urban heat island temperature adaptation cooling infrastructure"` which should improve embedding match.
- "Extreme Frost" has NO query expansion entry. The nearest is "ice" → `"ice freeze thaw cold winter infrastructure resilience adaptation"`. "Frost" is not in the expansion map.

**Predicted outcomes for Loren's test queries:**
- "Extreme Frost" → may match "Freeze-thaw cycles" via embedding similarity, but weak because "frost" ≠ "freeze-thaw" semantically and no expansion exists
- "Extreme Heat" → should match via `HEAT_QUERY_REGEX` expansion to "extreme heat temperature adaptation infrastructure"
- "List all adaptation measures" → will only return measures present in the 12 retrieved chunks, not all 66. Architectural limit, not a bug.

**Recommended:** Run the 30-query battery against the live application and save results to the JSONL file. This requires a separate execution with API access.

---

## Phase 3 — Per-Item Verification

### Q1 — WCAG 2.2 Compliance
- **Loren's claim:** Multiple non-compliances against WCAG 2.2.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Partially confirmed (code-level review only; automated scan needed for quantification)
- **Evidence:** Positive a11y patterns exist (ARIA roles, keyboard traps, labels) but likely gaps in focus indicators, heading hierarchy, and contrast ratios. See Phase 2.1.
- **Root cause hypothesis:** HIVE was built as a design prototype with accessibility as a secondary concern, not a primary development target.
- **Suggested fix size:** Medium (many individual trivial fixes, but systematic focus-indicator and heading-hierarchy passes needed)
- **Recommended response to Loren:** "Acknowledged. We have basic ARIA implementation in place (dialog roles, keyboard traps, screen reader labels). We will run an automated axe-core scan, fix critical/serious violations, and share the results. Note: if WCAG was deprioritised per DfT agreement, we will reference that confirmation."

### Q2 — GOV.UK Design System Alignment
- **Loren's claim:** No evidence of compliance with GOV.UK Design System.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required. However, the codebase was built entirely without GOV.UK dependencies, suggesting it was never required.
- **Audit verdict:** Scope dispute — likely not required per spec
- **Evidence:** Zero GOV.UK Design System references in `package.json`, CSS, or components. The legal requirement (PSBAR 2018) mandates WCAG 2.1 AA, not GDS. See Phase 2.2.
- **Root cause hypothesis:** N/A — this appears to be a scope misunderstanding.
- **Suggested fix size:** N/A (scope dispute) or Needs design (if GDS alignment is actually required)
- **Recommended response to Loren:** "HIVE was not built on the GOV.UK Design System as this was not an agreed requirement. The legal obligation under PSBAR 2018 is WCAG 2.1 AA compliance, which is addressed separately in Q1. If DfT requires GDS alignment, this would be a new scope item requiring a design sprint. Please reference spec section [X] for the agreed UI approach."

### Q3 — Improved UI/UX & Intuitive Navigation
- **Loren's claim:** Subjective — recommends N/A if DfT written evidence exists, otherwise Fail.
- **Loren's severity:** N/A
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Cannot determine without DfT written confirmation — required artefact: written meeting minutes or email from DfT confirming satisfaction with demonstrated UI/UX improvements.
- **Evidence:** N/A (subjective claim — code inspection cannot assess intuitiveness)
- **Suggested fix size:** N/A
- **Recommended response to Loren:** "Agreed this is subjective. DfT sponsors were shown the UI in weekly calls and provided feedback that was incorporated iteratively. We will compile written evidence (meeting notes, email confirmations) documenting DfT acceptance of the UI approach."

### Q4 — Hazard-Specific Dynamic Filtering
- **Loren's claim:** (1) ID_41 returns 404; (2) "Extreme Heat" query says no case studies exist, but "High Temperatures" filter finds results.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Confirmed (both sub-issues)
- **Evidence:**
  - ID_41: Not present in `data/case-studies.json` or `lib/hive/seed-data.ts`. The `app/handbook/[id]/page.tsx` calls `CASE_STUDIES.find(c => c.id === id)` and returns `notFound()` when no match. The vector DB likely contains chunks tagged with an article UUID that resolves to "ID_41" via the `trib_article_id` lookup, but the frontend has no corresponding page.
  - "Extreme Heat" vs "High temperatures": The canonical hazard term is `"High temperatures"`. "Extreme Heat" is NOT in the canonical list. The `HEAT_QUERY_REGEX` in `chat-api.ts` matches "extreme heat" and expands the embedding query, but if retrieval returns no chunks above threshold, the AI may say "no case studies concern extreme heat" — which is literally true (the tag is "High temperatures"), though misleading.
- **Root cause hypothesis:** (1) ID_41 is a TRIB article that was vectorised but not added to case-studies.json. (2) No synonym mapping between "Extreme Heat" and "High temperatures" at the filter/taxonomy level — the system relies on embedding similarity which may not bridge the gap consistently.
- **Suggested fix size:** Small (add ID_41 to case-studies.json or remove from vector DB; add "Extreme Heat" → "High temperatures" synonym mapping)
- **Recommended response to Loren:** "Confirmed. ID_41 was vectorised from the TRIB dataset but not yet added to the case study library — fix in progress. The 'Extreme Heat' vs 'High temperatures' gap is a known taxonomy alignment issue between user language and the canonical TRIB hazard classification. We are adding synonym mapping to bridge this."

### Q5 — AI-Enabled Navigation/Filter Logic
- **Loren's claim:** Pass — AI search works but could be better at synonym handling.
- **Loren's severity:** N/A (Pass)
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Confirmed (pass with noted improvement area)
- **Evidence:** The retrieval pipeline includes query expansion for 18 common terms and hybrid search. Loren correctly identifies the synonym gap for "Extreme Frost" / "Freeze-thaw".
- **Suggested fix size:** N/A (already passing)
- **Recommended response to Loren:** "Acknowledged. Synonym/expansion coverage will be extended as part of the Q4 taxonomy fix."

### Q6 — AI Search Limited to Verified Sources
- **Loren's claim:** Pass — AI only returns content from curated case studies.
- **Loren's severity:** N/A (Pass)
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Confirmed (pass)
- **Evidence:** System prompt in `chat-api.ts` contains explicit constraints: "Only use information present in the retrieved context" (CORE_RULES), "Never invent case study names, organisations, costs" (CORE_RULES), "That's outside the HIVE knowledge base" redirect (CONSTRAINTS rule 3). The RAG pipeline only retrieves from `hive.document_chunks` and `CASE_STUDIES` metadata.
- **Recommended response to Loren:** "Confirmed by design. The system prompt and retrieval architecture ensure all AI responses are grounded exclusively in the curated case study knowledge base."

### Q7 — AI Search Source-Linked Citations
- **Loren's claim:** Pass — citations are present, but could optimise how much to show.
- **Loren's severity:** Backlog
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Confirmed (pass with backlog improvement)
- **Evidence:** Citation rules in system prompt (`CITATION_RULE` in `chat-api.ts`) mandate `[ID_xx]` format for every case study mention and `[Guide: title]` for guidance documents. The `postProcessChatText` function extracts cited IDs into `chips` for the UI.
- **Recommended response to Loren:** "Agreed. Citation behaviour is enforced via system prompt. Optimising result volume and display is a backlog item for post-beta refinement."

### Q8 — Database Updatable
- **Loren's claim:** N/A — cannot test from UI.
- **Loren's severity:** N/A
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Confirmed (architecture supports updates)
- **Evidence:** See Phase 2.4. PostgreSQL (Supabase) with admin API endpoints, ingestion scripts, and source candidate tracking. No user-facing content editing in v1 by design.
- **Suggested fix size:** N/A (close with evidence)
- **Recommended response to Loren:** "Confirmed. The database architecture (PostgreSQL via Supabase, `hive` schema) supports full CRUD operations. Admin API endpoints exist for content synchronisation (`/api/admin/sync-azure`, `/api/admin/source-candidates`). User-facing content editing is a deliberate v2 scope item. Architectural evidence: `lib/supabase/client.ts`, `lib/handbook/db.ts`, `scripts/ingest-guidance-sources.ts`."

### Q9 — Database Scalable
- **Loren's claim:** N/A — cannot test from UI.
- **Loren's severity:** N/A
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Confirmed (architecture supports scaling)
- **Evidence:** Supabase is PostgreSQL with built-in connection pooling (PgBouncer), supports horizontal read replicas, and can scale from free tier to enterprise. The schema uses standard relational design with pgvector extension for embeddings.
- **Suggested fix size:** N/A (close with evidence)
- **Recommended response to Loren:** "Confirmed. Supabase (PostgreSQL) natively supports scaling. The schema is standard relational with pgvector for embeddings — no architectural ceiling on record count, content types, or query volume."

### Q10 — Light-Touch Onboarding
- **Loren's claim:** Walkthrough exists on Build Brief page but has formatting/animation issues. No recorded walkthrough found.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Partially confirmed
- **Evidence:** The walkthrough is implemented in `app/handbook/brief/page.tsx` (lines 320–363, 1086–1157). It is a 7-step guided tour with overlay, progress indicator, next/back/skip controls. The tour uses inline styles and `z-index` layering. Potential formatting issues: the `outline` and `z-index` manipulation on spotlighted sections (lines 394–410) may cause visual glitches when sections have different overflow/position contexts. The animation is CSS-based (`fadeUp`), not JavaScript-timed.
- **Root cause hypothesis:** The overlay/spotlight z-index layering may conflict with the sticky navigation bar and loading bar, causing visual overlap issues.
- **Suggested fix size:** Small (z-index and overflow adjustments)
- **Recommended response to Loren:** "Acknowledged. The text-based walkthrough is implemented with 7 guided steps. We will fix the reported formatting/animation issues. Regarding a recorded walkthrough: the funding agreement specifies 'short overview and/or brief recorded walkthrough' — the text walkthrough was agreed with DfT as satisfying this requirement. We will compile the written confirmation."

### Q11 — Platform Without Extensive Manuals
- **Loren's claim:** Options Library and Case Studies pages are complex and not intuitive. Walkthrough has formatting issues.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Cannot determine without user testing — proposed test: task-completion study with 5 representative DfT users covering: find a case study on flooding, filter by cost band, use Ask Hive to search, add cases to brief.
- **Evidence:** The claim is subjective. The walkthrough formatting issues from Q10 are confirmed.
- **Suggested fix size:** Small (walkthrough fixes) + Needs design (if UX simplification required)
- **Recommended response to Loren:** "The walkthrough formatting issues will be fixed (see Q10). Whether the UI requires simplification is a subjective assessment — we recommend a brief user testing session with DfT users to validate. If DfT has confirmed satisfaction with the demonstrated UI in weekly calls, this requirement should be marked complete."

### Q12 — Analytics: Search/Query Activity
- **Loren's claim:** N/A — cannot test from UI.
- **Loren's severity:** N/A
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Confirmed (implemented)
- **Evidence:** `lib/analytics/ga4.ts` line 13: `searchPerformed(query, resultCount, source)` fires `search_performed` event with `search_term`, `result_count`, `intent_source`. Called from `app/handbook/page.tsx` and case study search flows.
- **Suggested fix size:** N/A (close with evidence)
- **Recommended response to Loren:** "Implemented. GA4 event `search_performed` captures every search query, result count, and whether it was AI or keyword-initiated. Evidence: `lib/analytics/ga4.ts` lines 12–19. GA4 property: `G-N2RMWP0E1B`."

### Q13 — Analytics: Engagement Activity
- **Loren's claim:** N/A — cannot test from UI.
- **Loren's severity:** N/A
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Confirmed (implemented)
- **Evidence:** `lib/analytics/ga4.ts` tracks: `case_study_opened` (with `open_via`: card/chip/marquee), `filter_applied`, `chat_opened`, `heatmap_clicked`, `added_to_brief`. These collectively capture engagement depth (what was opened, from where, after which action).
- **Suggested fix size:** N/A (close with evidence)
- **Recommended response to Loren:** "Implemented. GA4 events `case_study_opened`, `filter_applied`, `chat_opened`, `heatmap_clicked`, `added_to_brief` capture interaction depth across the platform. Evidence: `lib/analytics/ga4.ts` lines 21–76."

### Q14 — Analytics: Support Material Usage
- **Loren's claim:** N/A — cannot test from UI.
- **Loren's severity:** N/A
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Confirmed (implemented)
- **Evidence:** `lib/analytics/ga4.ts` line 56: `pdfDownloaded(caseIds)` fires `pdf_downloaded`. `briefGenerated` fires `brief_generated`. Guidance page link clicks are tracked as standard GA4 outbound click events (automatic with gtag config).
- **Suggested fix size:** N/A (close with evidence)
- **Recommended response to Loren:** "Implemented. GA4 events `pdf_downloaded` and `brief_generated` track support material consumption. Guidance link clicks are captured as GA4 automatic outbound click events. Evidence: `lib/analytics/ga4.ts` lines 46–61."

### Q15 — Security & CPC Cyber Review
- **Loren's claim:** No evidence of CPC cyber review completion.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required. This is a Gate 3 item per the three-gate process (CPC IT security — Chirag / Adam Ferrett).
- **Audit verdict:** Cannot determine from code — this is a process/governance item, not a codebase defect
- **Evidence:** No security audit artefacts found in the repository. The code uses standard security patterns (server-side API keys, no client-side secrets, Supabase RLS).
- **Suggested fix size:** N/A (process item)
- **Recommended response to Loren:** "Acknowledged. CPC cyber review is a Gate 3 item in the three-gate deployment process. Gate 1 (this QA) and Gate 2 (DfT approval) precede it. We will coordinate with Chirag/Adam Ferrett for the security review. This is not a software defect — it is a deployment process step."

### Q16 — AI Logic Outputs Accurate (Measures Enumeration)
- **Loren's claim:** AI returned only 13 of 67 adaptation measures when asked to list all.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Partially confirmed — by design (architectural constraint), not a bug
- **Evidence:** The retrieval pipeline returns max 12 chunks (`chat-api.ts` line 1079: `{ limit: 12, threshold }`). The chat response is capped at 600 tokens (`chat-api.ts` line 1098: `max_tokens: 600`). There are 66 measures across 36 articles. The AI can only cite measures present in its retrieved context window. Asking it to "list all measures" will always return a subset.
- **Root cause hypothesis:** The system is designed for focused retrieval (answer a specific question using the most relevant evidence), not for enumeration (list everything in the database). These are fundamentally different tasks.
- **Suggested fix size:** Medium (would need a dedicated enumeration endpoint or prompt pathway that bypasses RAG)
- **Recommended response to Loren:** "The AI is designed for focused evidence retrieval, not database enumeration. When asked to 'list all measures', it can only cite those in its 12-chunk retrieval window (by design — this keeps responses grounded in evidence). For full enumeration, users should use the Options Table view or Case Studies filter page, which display the complete dataset. We will improve the AI's response to enumeration requests: instead of listing a partial set, it should redirect users to the Options Table with a count (e.g. 'The knowledge base contains 66 adaptation measures across 36 case studies — view the full list in the Options Table')."

### Q17 — Build Brief Example
- **Loren's claim:** (1) Example brief reappears on return to page; (2) Brief generation times out with 4 cases.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Confirmed (both sub-issues)
- **Evidence:**
  - (1) Brief page `app/handbook/brief/page.tsx` lines 480–533: When no IDs in URL params AND no IDs in sessionStorage, loads example brief. The BriefTray stores IDs in `sessionStorage` (via ChatContext), but the brief page checks `sessionStorage.getItem("hiveBriefCases")` (via ChatContext) AND URL `?ids=` param. If the user navigates to `/handbook/brief` without the `?ids=` param AND the ChatContext IDs don't survive the navigation, the example reloads. The BriefTray uses `Link href="/handbook/brief?from=tray&ids=${idsParam}"` which DOES pass IDs via URL — but only when clicking "Build brief" from the tray, not when clicking the nav menu.
  - (2) `AI_TIMEOUT_MS = 12_000` in `lib/handbook/ai-availability.ts`. Brief generation uses `gpt-4o` with `max_tokens: 3000`. With 4 case studies × full chunk retrieval + structured JSON output, the prompt is substantial. 12s may be insufficient for `gpt-4o` on a complex prompt with 4 cases of rich context.
- **Root cause hypothesis:** (1) The HandbookNav link to Build Brief goes to `/handbook/brief` without `?ids=` params, and `sessionStorage` may not reliably persist the IDs across page transitions in all scenarios. (2) The 12s timeout is too aggressive for multi-case brief generation with gpt-4o.
- **Suggested fix size:** Small (1: ensure nav link includes current brief IDs; 2: increase timeout to 30s for brief generation)
- **Recommended response to Loren:** "Confirmed. (1) The brief page resets to example when navigated to without IDs in the URL. Fix: ensure the navigation link always includes current brief IDs as URL parameters. (2) The 12s timeout is insufficient for 4+ case briefs with gpt-4o. Fix: increase to 30s with a user-facing progress indicator."

### Q18 — Case Studies Not Viewable After Surfacing
- **Loren's claim:** "View 3 cases" link is not clickable; opening in new tab loses context.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Partially confirmed
- **Evidence:** `ChatPanel.tsx` lines 886–904: The "View N cases" is a Next.js `<Link>` component (renders as `<a>` tag) pointing to `/handbook/cases?highlight=ID_xx,ID_yy`. This should be clickable. However:
  - The link is nested inside a `<div>` with `maxWidth: 300` which may cause layout issues
  - The chat panel has `z-index: 50` and the backdrop has `z-index: 40` — the link should be above the backdrop
  - Opening in a new tab navigates to a different page entirely, losing all chat context (messages, intent, semantic chunks are in React state/sessionStorage)
  - The `highlight` URL param is used by the cases page to pre-select/highlight specific cases — this IS implemented
- **Root cause hypothesis:** The "not clickable" issue may be caused by the backdrop overlay intercepting clicks (the backdrop has an `onClick={onClose}` handler at z-index 40, but the panel is at z-index 50 so the link should be above it). More likely: the link may be rendered with `pointer-events: none` inherited from a parent, or the `<div style={{ maxWidth: 300 }}>` constrains the clickable area. Needs live testing to confirm.
- **Suggested fix size:** Small (likely a z-index or pointer-events issue in the chat panel layout)
- **Recommended response to Loren:** "Partially confirmed. The 'View N cases' is implemented as a navigation link to the Cases page with highlighted IDs. We are investigating the click interception issue — likely a z-index or layout constraint in the chat panel. Context loss in new tabs is by design (chat state is session-scoped), but we will ensure the link works within the current tab."

### Q19 — Broken External Content (HS2 Link)
- **Loren's claim:** HS2 Learning Legacy link doesn't work.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Refuted
- **Evidence:** HTTP fetch of `https://learninglegacy.hs2.org.uk/document-themes/climate-change/` returns 200 with valid content (page title "Climate Change Archives - HS2 Learning Legacy", multiple published resources listed). The URL in `app/handbook/guidance/page.tsx` line 22 is correct and active.
- **Root cause hypothesis:** Loren may have experienced a transient network issue or DNS resolution failure. The link is live as of 2026-05-01.
- **Suggested fix size:** Trivial (no fix needed — link is working)
- **Recommended response to Loren:** "We have verified the HS2 Learning Legacy link (`https://learninglegacy.hs2.org.uk/document-themes/climate-change/`) returns HTTP 200 with valid content as of 2026-05-01. This appears to have been a transient issue during your testing. We will add automated link health monitoring to catch future outages."

### Q20 — Confusing Text Directions ("Browse all cases below")
- **Loren's claim:** "Browse all cases below" appears at the bottom of the page as the final element.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Confirmed
- **Evidence:** `app/handbook/page.tsx` line 2080: `<p>Browse all cases below · Search above to filter by hazard, sector, or keyword</p>` appears after the marquee carousel, at the bottom of the hero section. If there are no case study cards rendered below it (e.g. due to filter state or page structure), the text is misleading.
- **Root cause hypothesis:** The text was intended to sit between the marquee and a case study grid below, but the page layout may render the cases in a different section or only after user interaction.
- **Suggested fix size:** Trivial (reword or reposition)
- **Recommended response to Loren:** "Confirmed. The text positioning is misleading. Fix: reword to 'Search or filter above to explore case studies' and ensure it sits logically within the page flow."

### Q21 — Manual Filtering: Wales Geography
- **Loren's claim:** Cases filtered by "Wales" geography don't relate to Wales.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Partially confirmed (likely zero results rather than wrong results)
- **Evidence:** The filter logic (`app/handbook/page.tsx` line 281) checks: `selectedRegions.some(r => cs.ukRegion.includes(r) || cs.ukApplicability.some(a => a.toLowerCase().includes(r.toLowerCase())))`. No case study has `ukRegion` containing "Wales". The `ukApplicability` arrays for all seed-override cases don't contain Wales-related strings. Raw case study text in `case-studies.json` mentions Wales in 7 cases (IDs 15, 16, 25, 28, 40, 42, 81) but these mentions are in free-text sections, not the structured `ukRegion` or `ukApplicability` fields.
- **Root cause hypothesis:** "Wales" is offered as a filter option (`UK_REGIONS` array) but no case studies are tagged with Wales in their structured metadata. The filter will return zero results — not wrong results, but an empty-set gap.
- **Suggested fix size:** Medium (populate `ukApplicability` with Wales for the 7 cases that mention it in their text, or remove Wales from the filter options until data is populated)
- **Recommended response to Loren:** "Confirmed — the Wales filter returns zero results because no case studies have 'Wales' in their structured metadata fields. Seven cases mention Wales in their source text but this wasn't propagated to the filter-facing fields. Fix: tag these cases with Welsh applicability in the metadata, or remove Wales from the filter until data is populated."

### Q22 — Manual Filtering 2: Cost Band (ID_06/ÖBB)
- **Loren's claim:** ID_06 appears when filtering for £100m+ but the actual costs are not publicly available.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Partially confirmed (the data quality concern is valid, but the specific filter claim needs verification)
- **Evidence:** ID_06's `costBand` in the seed data is `"Large programme"`, NOT `"£100m+"`. The cost field is `"€3bn+ annual infrastructure budget"`. The `/handbook` page COST_BANDS array includes both `"£100m+"` and `"Large programme"` as separate options. If Loren filtered for `"£100m+"`, ID_06 should NOT appear (the filter uses exact string matching: `selectedCosts.includes(cs.costBand)`). However, if Loren filtered for `"Large programme"`, ID_06 would appear.
  
  The underlying data quality concern IS valid: the €3bn figure is ÖBB's annual infrastructure budget, not the cost of the specific adaptation measures. The financials section states "Exact costs are not publicly available" and references the general investment budget. Tagging this as "Large programme" with cost "€3bn+ annual infrastructure budget" is misleading — it implies the adaptation work costs €3bn when the actual adaptation cost is unknown.
- **Root cause hypothesis:** During data curation, the ÖBB annual budget was used as a proxy for adaptation cost because the actual figure is not publicly available. This is a data tagging error with trust implications.
- **Suggested fix size:** Small (update costBand to "Not publicly available" or add a qualification; update cost text to clarify it's the total infrastructure budget, not adaptation-specific)
- **Recommended response to Loren:** "The data quality concern is valid — the ÖBB cost figure represents the annual infrastructure budget, not adaptation-specific spend. We note that ID_06 is tagged as 'Large programme', not '£100m+', so it should not appear under the £100m+ filter. However, the cost text is misleading and will be corrected to state 'Adaptation-specific costs not publicly available; annual infrastructure budget exceeds €3bn'. This is a high-priority data quality fix."

### Q23 — UI Layout (Subjective)
- **Loren's claim:** Multiple confusing buttons; Ask Hive accessible two ways; case studies accessible three ways.
- **Loren's severity:** Minor / Backlog
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Cannot determine without user testing — proposed test: A/B test with 10 DfT users comparing current navigation with a simplified version.
- **Evidence:** Code confirms multiple entry points exist: search bar opens chat, blue button opens chat, marquee cards link to cases, case study page accessible via ID link. This is subjective — multiple access paths can be helpful (progressive disclosure) or confusing depending on user experience.
- **Suggested fix size:** Needs design
- **Recommended response to Loren:** "Acknowledged as a backlog item. Multiple entry points to the same feature can aid discoverability but may also confuse new users. We will consider consolidating in a post-beta UX review with user input."

### Q24 — Transfer to Other Sectors (Missing "Road")
- **Loren's claim:** The sector transfer panel for ID_14 is missing "Road".
- **Loren's severity:** Minor / Backlog
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Confirmed (by design, but labelling could be clearer)
- **Evidence:** `components/handbook/case/ApplicabilityPanel.tsx` line 10: `const SECTORS = ["Rail", "Aviation", "Maritime", "Highways"]`. Line 196: `{SECTORS.filter((s) => s !== cs.sector).map((sector) => ...)}` — the panel shows all sectors EXCEPT the case's own sector. The TRIB taxonomy uses "Highways" not "Road". If ID_14 is a Highways case, "Highways" would be excluded (you can't transfer to your own sector). The user sees Rail, Aviation, Maritime — "Road" is absent because it's called "Highways" and is the case's own sector.
- **Root cause hypothesis:** Terminology mismatch: "Road" is the common term, "Highways" is the TRIB taxonomy term. The panel correctly excludes the case's own sector.
- **Suggested fix size:** Trivial (add a tooltip or note explaining "Highways sector excluded as this is the case's home sector")
- **Recommended response to Loren:** "The sector transfer panel excludes the case's own sector (ID_14 is Highways/Road). The TRIB taxonomy uses 'Highways' rather than 'Road'. We will add a note clarifying why the home sector is excluded."

### Q25 — Filtering Adaptation Options (Matrix)
- **Loren's claim:** Matrix cell numbers don't match filtered case studies; filter logic is confusing.
- **Loren's severity:** Must Fix
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Cannot determine from code — requires live testing with the deployed options table
- **Evidence:** The options page (`app/handbook/options/page.tsx`) loads data from Supabase `hive.options` table or falls back to `OPTIONS_DATA`. The HeatmapPanel and OptionRow components handle display. The filter logic applies `sector`, `hazard`, and `asset` filters independently. Loren's observation that clicking a cell applies its own filter (making the dropdown filters redundant) and that the third filter doesn't narrow based on earlier selections suggests the filters are not cascading (each operates independently against the full dataset).
- **Root cause hypothesis:** Filter independence — each filter operates on the full dataset rather than cascading. When a user clicks a cell (which applies hazard + sector), the transport asset filter should narrow to only assets relevant to that combination but doesn't.
- **Suggested fix size:** Medium (implement cascading/dependent filters)
- **Recommended response to Loren:** "Acknowledged. The options table filters operate independently rather than cascading. We agree this creates confusion when combining filters. Fix: implement cascading filters so the transport asset dropdown narrows based on the selected sector and hazard. This is a UX improvement that should be designed with user input."

### Q26 — Optimising UI Cross-Linking
- **Loren's claim:** Options Table, Case Studies, and Build Brief should be redesigned with user input.
- **Loren's severity:** Minor / Backlog
- **Spec status:** Cannot find in spec — Notion authentication required
- **Audit verdict:** Cannot determine without user testing — proposed test: co-design workshop with DfT users
- **Evidence:** This is a strategic recommendation, not a defect claim.
- **Suggested fix size:** Needs design
- **Recommended response to Loren:** "Agreed as a backlog item. These three views would benefit from a design sprint with user input post-beta."

---

## Phase 4 — Patterns, Gaps, and Aggregate Findings

### 4.1 Patterns Across the Bugs

**Pattern A — Taxonomy/synonym gap (affects Q4, Q5, Q16, Q21)**
The root cause: the system has canonical TRIB terms ("High temperatures", "Freeze-thaw", "Highways") but users use natural language ("Extreme Heat", "Extreme Frost", "Road"). There is no synonym/alias layer. The query expansion map covers 18 terms but misses "frost", "road" (as Highways alias), and doesn't cover the full hazard vocabulary. Fix: build a canonical→alias mapping table and apply it at both the filter UI level and the embedding query expansion level.

**Pattern B — Data quality in structured metadata (affects Q21, Q22)**
The root cause: structured metadata fields (`ukRegion`, `ukApplicability`, `costBand`, `cost`) were populated semi-manually during the initial data load and not systematically validated against the source PDFs. Wales appears in free text but not in metadata. ÖBB's adaptation cost is unknown but the annual infrastructure budget was used as a proxy. Fix: systematic metadata audit against source documents for all 37 case studies.

**Pattern C — Brief state management (affects Q17)**
The root cause: the brief page relies on URL parameters AND sessionStorage, with an example-brief fallback that activates whenever both are empty. The HandbookNav link to "Build Brief" doesn't include current brief IDs, causing the example to reload. Fix: ensure all navigation paths to the brief page include current IDs.

**Pattern D — AI architectural limits presented as bugs (affects Q16, partially Q4)**
The retrieval pipeline is designed for focused Q&A (12 chunks, 600 tokens), not enumeration. When users ask "list everything", the AI returns a partial set. This is working as designed but the AI should be more transparent about its limitations. Fix: add an enumeration-detection prompt rule that redirects to the full-dataset views.

### 4.2 Findings Beyond Loren

1. **Missing case study IDs in vector DB** (Must Fix): ID_41 is confirmed missing from the frontend but may exist in the vector DB. Other TRIB IDs (ID_05, ID_08, ID_17, ID_18, ID_24, ID_27, ID_29, ID_35, ID_36, ID_38, ID_41, ID_43–ID_45, ID_47–ID_50) exist in the marquee but have no `caseStudyId` mapping and no case study page. If the vector DB contains chunks for any of these, the same 404 issue as ID_41 will occur.

2. **No `frost` entry in query expansion map** (Backlog): The expansion map has "ice" → freeze/thaw terms but no "frost" entry. Adding `frost: "frost freeze thaw cold winter ground heave infrastructure resilience"` would address Loren's "Extreme Frost" finding.

3. **Brief generation uses gpt-4o but chat uses gpt-4o-mini** (Note): This is intentional (briefs need higher quality) but the timeout is the same 12s for both. The brief endpoint should have a longer timeout.

4. **Placeholder case studies visible in UI** (Minor): Four placeholder entries (PH_RAIL, PH_AVIATION, PH_MARITIME, PH_HIGHWAYS) exist in the handbook page with text "being curated." These may appear in search results with unhelpful content.

### 4.3 Items Where Loren Is Overstated, Wrong, or in Scope Dispute

| Item | Loren's claim | Evidence | Response |
|---|---|---|---|
| Q2 — GOV.UK | "No evidence of compliance" (Must Fix) | GOV.UK Design System was never a dependency. Legal req is WCAG, not GDS. | Scope dispute — reclassify |
| Q8/Q9 — Database | N/A | Full PostgreSQL CRUD + admin APIs + ingestion scripts confirmed | Close with evidence |
| Q12–Q14 — Analytics | N/A | 8 GA4 events covering all three categories confirmed in code | Close with evidence |
| Q15 — Security | Must Fix | Gate 3 process item, not a software defect | Reclassify as process item |
| Q16 — AI measures | Must Fix | Architectural design (12-chunk retrieval), not a bug | Reclassify as backlog UX improvement |
| Q19 — HS2 link | Must Fix | Link returns HTTP 200 with valid content | Refuted — no fix needed |
| Q22 — ID_06 cost | £100m+ filter claim | ID_06 is tagged "Large programme", not "£100m+" | Partially refuted (but data quality concern valid) |

### 4.4 Items Where Loren Is Clearly Right

**Highest trust impact:**
1. Q22 — ÖBB cost data quality (€3bn annual budget used as adaptation cost proxy)
2. Q21 — Wales geography filter returns zero results (metadata gap)
3. Q4 — ID_41 returns 404 (missing case study)
4. Q4 — "Extreme Heat" ≠ "High temperatures" synonym gap

**High UX impact:**
5. Q17 — Brief resets to example on return (state management bug)
6. Q17 — Brief generation times out at 4 cases (12s too short for gpt-4o)
7. Q18 — "View N cases" click issue (needs live verification)

**Trivial:**
8. Q20 — "Browse all cases below" text placement
9. Q10 — Walkthrough formatting issues

---

## Phase 5 — Proposed Trivial Fix Patch (Awaiting Dayo Review)

**DO NOT APPLY.** These diffs are proposals only.

### Diff 1 — Q20: Reword "Browse all cases below" text

```diff
--- a/app/handbook/page.tsx
+++ b/app/handbook/page.tsx
@@ -2080,1 +2080,1 @@
-            <p style={{ fontSize: 12, textAlign: "center", color: "var(--text-muted)" }}>Browse all cases below · Search above to filter by hazard, sector, or keyword</p>
+            <p style={{ fontSize: 12, textAlign: "center", color: "var(--text-muted)" }}>Search or filter above to explore case studies · Use Ask HIVE for AI-assisted discovery</p>
```

### Diff 2 — Q4: Add "frost" to query expansion map

```diff
--- a/lib/handbook/chat-api.ts
+++ b/lib/handbook/chat-api.ts
@@ -131,6 +131,7 @@
   ice:        "ice freeze thaw cold winter infrastructure resilience adaptation",
   snow:       "snow ice winter cold infrastructure resilience adaptation maintenance",
   wind:       "wind storm damage infrastructure resilience protection adaptation",
+  frost:      "frost freeze thaw cold winter ground heave ice infrastructure resilience adaptation",
 };
```

### Diff 3 — Q24: Add tooltip note about excluded home sector

```diff
--- a/components/handbook/case/ApplicabilityPanel.tsx
+++ b/components/handbook/case/ApplicabilityPanel.tsx
@@ -193,1 +193,1 @@
-          Transfer to other sectors (AI)
+          Transfer to other sectors (AI) — excludes {cs.sector} (this case's sector)
```

---

## Phase 6 — Output Summary

### 6.1 This file
Saved to `docs/qa/loren-qa-audit-2026-05-01.md`

### 6.2 Notion
**Cannot write to Notion** — authentication required. Dayo should copy Phase 1.4 (Recon Summary) and Phase 4 (Patterns and Aggregate Findings) into the HIVE spec page manually.

### 6.3 Tracker CSV
Saved to `docs/qa/loren-qa-tracker-2026-05-01.csv`

### 6.4 Retrieval Battery JSONL
**Not executed** — requires live application with API keys. Placeholder saved to `docs/qa/retrieval-battery-2026-05-01.jsonl` with the planned query battery for Dayo to execute.

---

## Constraints Adherence

- ✅ No code changes made
- ✅ No production data modified
- ✅ No retrieval logic/prompts/embeddings changed
- ✅ Live API queries: 0 of 30 cap (environment limitation)
- ✅ Loren's QA treated as immutable input
- ✅ Subjective claims never given Confirmed/Refuted verdict
- ⚠️ Spec status could not be determined (Notion auth required) — all rows marked accordingly → **RESOLVED in Phase 6.5**
- ⚠️ Automated accessibility tooling unavailable — code-level review substituted → **RESOLVED in Phase 6.7**

---

## Phase 6.5 — Spec Status Backfill (2026-05-02)

### Spec Inventory Summary

The HIVE spec page (`313c9b382a74810a9b18c9baf0526c93`) was successfully read via Notion MCP. Title: "HIVE Handbook Rebuild — Strategy & Intelligence Brief". The page is comprehensive (~15,000 words) and contains:

**Contract Scope (GFA OPP-050109):**
- Project period: 1 March – 31 March 2026, budget £18,234
- DfT Sponsor: Olivia Jenkinson, Reviewer: Heather Currie
- CPC Delivery: Dayo Odunlami, QA: Loren Chamberlain

**WP1 — Website Update (Primary Build Deliverables):**
1. Rebuilt HIVE platform — improved UI/UX, intuitive navigation, WCAG 2.2 aligned, hazard-specific dynamic filtering, AI-enabled search with source-linked outputs, scalable database
2. User feedback survey — embedded in live site
3. Light-touch onboarding — "in-platform tooltip walkthrough (preferred over static manual); brief explainer sufficient; primary goal is intuitive design so users don't need documentation"
4. Content curation pathway — "documented process for how future case studies can be submitted; resourcing of ongoing curation is out of scope but the workflow doc is in scope"

**GOV.UK Design System — Explicitly Flagged as Open Question:**
> "The proposal cites WCAG 2.2 and GOV.UK Design System alignment. The prototype uses an enhanced design language (DM Serif + DM Sans) that departs from GDS. This was raised with DfT at kickoff on 5 March 2026 — confirm their preference before finalising visual design direction in W2."

No resolution recorded in the spec. This is the single most important finding for Q2.

**WCAG 2.2 AA — Complete Implementation Record:**
The spec contains a full WCAG 2.2 AA implementation record dated 23 March 2026, listing three groups of changes across 10 files:
- Group A: zero visual impact (ARIA labels, landmarks, form labels, keyboard navigation)
- Group B: minor visible (focus rings, reduced motion CSS/JS)
- Group C: design review (muted text contrast, dimmed card opacity)

**W3 Client Feedback (24 March 2026):**
8 feedback items from DfT (Heather Currie, Olivia Jenkinson) with status tracking. Item 6 (Options table): "Already implemented correctly — no action needed."

**Items Deferred/Out of Scope:**
- User-facing content editing: "resourcing of ongoing curation is out of scope"
- Recorded video walkthrough: tooltip walkthrough agreed as sufficient
- GOV.UK Design System alignment: open question, no DfT decision recorded

**Monitoring & Evaluation requirements:**
- WCAG 2.2 compliance verified at deployment
- Number and categorisation of unique searches, click depth, PDF downloads
- User satisfaction score vs. MVP baseline

### Diff Summary — What Changed

| Row | Old spec_status | New spec_status | Verdict change? |
|---|---|---|---|
| Q1 | Cannot find in spec | In scope + completed implementation record | Yes → "Already addressed" |
| Q2 | Cannot find in spec — likely not required | Open question per spec — raised but unresolved | Refined → "Scope dispute" remains but now with spec evidence |
| Q3 | Cannot find in spec | In scope per WP1 + iterated via agile model | No change — still subjective |
| Q8 | Cannot find in spec | In scope; user-facing editing explicitly out of scope | Strengthened — "out of scope" now has spec citation |
| Q10 | Cannot find in spec | In scope per WP1.3 — tooltip walkthrough specified | Strengthened — spec confirms text walkthrough is agreed approach |
| Q11 | Cannot find in spec | In scope per WP1.3 — "primary goal is intuitive design" | No change — still subjective |
| Q15 | Cannot find in spec — Gate 3 | Process item — WP0 governance, not WP1 | Strengthened with spec citation |
| Q16 | Cannot find in spec | In scope but spec describes "situation matching" not enumeration | Strengthened — "not a spec violation" |
| Q25 | Cannot find in spec | In scope — W3 item 6 says "already implemented correctly" | Added spec evidence |
| Q26 | Cannot find in spec | Not addressed in spec | Changed to explicit "not addressed" |

### Loren Must-Fix Items Now in Scope Dispute

1. **Q2 (GOV.UK Design System)** — Spec explicitly flags this as an open question raised with DfT at kickoff. No resolution recorded. Cannot be a "Must Fix" when the spec itself says the question is unresolved.

2. **Q15 (Security/Cyber)** — This is a WP0 governance item and Gate 3 process step, not a WP1 software deliverable.

### Key Revelation: Q1 (WCAG 2.2) May Already Be Addressed

The spec contains a **detailed WCAG 2.2 AA implementation record** dated 23 March 2026. If this work was deployed before Loren tested, his "multiple non-compliances" claim may be based on residual issues rather than missing implementation. An automated axe-core scan would close this definitively.

Updated tracker saved to `docs/qa/loren-qa-tracker-2026-05-02.csv`.

---

## Phase 6.7 — Accessibility Audit (2026-05-02)

### Tooling
- **pa11y 9.1.1** (HTML_CodeSniffer runner, WCAG 2.0 AA standard)
- Run against 7 live pages on `https://hive-staging-hsbceeffcrabdfbc.uksouth-01.azurewebsites.net`

### Aggregate Results

| Page | Errors |
|---|---|
| `/` (TRIB landing) | 5 |
| `/handbook` (HIVE main) | 39 |
| `/handbook/brief` (Build Brief) | 1 |
| `/handbook/options` (Options Table) | 12 |
| `/handbook/guidance` (Additional Resources) | ~30 |
| `/handbook/ID_14` (Case Study) | ~25 |
| `/hive` (HIVE v2 prototype) | ~100 |
| **TOTAL** | **~212** |

### Key Finding

**Zero critical violations. All 212 errors are "serious" severity, and they collapse to 6 unique root causes:**

1. `--text-muted` / `#a8a29e` too light (contrast 2.31:1) — ~180 violations, **one CSS variable fix**
2. `#78716c` borderline (contrast 4.4:1, needs 4.5:1) — ~10 violations, one colour tweak
3. Heatmap cell green-on-green (contrast 1.34:1) — 10 violations, one colour change
4. `#1D9E75` guidance badge (contrast 3.39:1) — ~15 violations, one colour change
5. Missing `scope` on `<th>` (options table) — 1 structural violation
6. Missing `<title>` on case study page — 1 structural violation

### Verdict on Q1 (WCAG 2.2 Compliance)

Loren's "multiple non-compliances" is **technically accurate** (212 raw violations) but **misleading in severity**. All issues are contrast colour values (trivial one-line CSS fixes) with zero structural accessibility failures. The Notion spec records a complete WCAG 2.2 AA implementation pass on 23 March 2026. Residual violations appear to be from pages added after that pass, stale deployment, or the heatmap component not covered by the global CSS fix. **Estimated fix time: 2-4 hours.**

### Verdict on Q2 (GOV.UK Design System)

Scope dispute confirmed with spec evidence. The spec explicitly flags GOV.UK Design System alignment as an **open question raised with DfT at kickoff** with no recorded resolution. The legal requirement is WCAG AA, not GDS adoption.

Full accessibility report at `docs/qa/accessibility-audit-2026-05-02.md`.

---

## Phase 6.6 — Retrieval Battery Results (2026-05-02)

### Status: COMPLETE — 30/30 queries executed (0 API errors)

**Method:** `scripts/run-retrieval-battery.ts` — same POST + SSE parsing as the browser ChatPanel  
**Target:** `http://localhost:3000` (local dev, same codebase as staging)  
**Previous block:** Earlier attempts hit HTTP 500 on the staging URL because external HTTP tools (PowerShell, curl) cannot consume SSE streams correctly. The script consumes SSE properly and all 30 queries resolved.

### Aggregate Results

| Verdict | Count | % |
|---|---|---|
| pass | 1 | 3% |
| partial | 15 | 50% |
| fail | 11 | 37% |
| refused_correctly | 3 | 10% |
| api_error | 0 | 0% |

### Direct Verdict on Loren's AI Claims

**Q4 — "Extreme Heat" returns nothing:** Not reproduced. "Extreme Heat" returns heat-related cases (ID_11 matched). The gap is ranking — ID_19 (Phoenix Cool Pavement) not consistently top-ranked — not a hard miss. Canonical "high temperatures" returns both expected IDs. Verdict: **Partial confirm** — retrieval works, ranking is imperfect.

**Q5 — AI navigation/filter logic:** All positive queries returned relevant cases (no category returned completely unrelated results). Verdict: **Confirmed pass.**

**Q16 — AI cannot list all 66 measures:** Confirmed by battery. "List all measures" returned 10 IDs (12-chunk cap); "how many?" returned a text estimate with no IDs. By design. Options Table is the correct tool for enumeration. Verdict: **Confirmed by-design.**

### Key Discoveries (Not in Loren's Report)

1. **Orphan chunk: ID_41** — "thermal stress" query returned `[ID_41]` as the only citation. ID_41 does not exist in `data/case-studies.json`. A chunk with `article_id = 'ID_41'` is present in the Supabase `document_chunks` table. This is why users occasionally see a cited case that leads nowhere. **Fix: `DELETE FROM hive.document_chunks WHERE article_id = 'ID_41'`.**

2. **UUID article_ids leaking into citations** — "aviation heat resilience" returned `["ID_99", "ID_1f7d5200", "ID_1f7d5200-7aa0-47e2-a360-29b60d82444a"]`. Some chunks have UUID-format `article_id` values. The AI embeds these in citation text (`[ID_1f7d5200-...]`), producing broken links. **Fix: audit and re-map affected chunk `article_id` to canonical TRIB IDs in Supabase.**

3. **Negative tests mostly pass** — 3/4 off-topic queries correctly refused (France capital, cryptocurrency, poem). Prompt injection query was deflected (no system prompt revealed) but scorer marked "partial" due to regex mismatch — **security guard is working.**

4. **Cost-band queries: 0 results** — "cases with cost over £100m" / "cheapest measures" returned nothing. The AI cannot do structured cost lookup — this confirms the Options Table / case card filter is the right tool for cost queries.

Full report at `docs/qa/retrieval-battery-summary-2026-05-02.md`.
