# TRIB faithful reproduction — plan (Firecrawl + Browser + GitHub)

**Goal:** Carbon-copy reproduction of the three key pages on the live site.

**Source of truth (split):**
- **Visual / layout:** Live site (trib.org.uk). Section backgrounds, typography, spacing, component placement — what you see.
- **Data shape and static data:** GitHub (or DB/API). The live site only *renders* data; it doesn’t expose schema, 65-column articles, options table structure, or roadmap JSON. For those we need the codebase (or equivalent). **GitHub wins for data shape; live wins for visual/layout.** If the repo has drifted from deployed behaviour, we still use it for schema and data files; we don’t re-infer schema from the UI.

**Key pages:** Homepage, Roadmap, HIVE/Handbook.

---

## Tools and how they’re used

| Tool | Role |
|------|------|
| **Firecrawl MCP** | Scrape live URLs. Get full HTML, markdown, and (where supported) metadata. Use for copy, structure, and sectioning. Run per URL: `/`, `/roadmap`, `/handbook`. |
| **Browser MCP (cursor-ide-browser)** | Open the same URLs; use `browser_snapshot` for DOM and layout. **Also use interaction capabilities (click, type):** on the handbook, apply a filter, run a search, then snapshot the *results* state — and explicitly open and capture the **Options Table View** tab so that view isn’t missed. Static snapshot = initial load only; interactions capture post-filter/post-search UI. |
| **GitHub** | Repos: TRIB/homepage, TRIB-CCAH, TRIB-Roadmap. Use for: **data shape** (articles schema, options table, roadmap JSON), filter option lists, API contracts, component behaviour. For visuals/layout, live wins; for data and schema, GitHub (or backend) is the only source. |

---

## Phase 1 — Gather live reference (single source of truth)

### 1.1 Firecrawl

- Scrape:
  - `https://trib.org.uk/`
  - `https://trib.org.uk/roadmap`
  - `https://trib.org.uk/handbook`
- Save or append to reference:
  - Markdown/HTML output per page
  - Section headings and order
  - Copy and link targets
- Store in: `docs/trib-live-reference.md` (append or replace sections) and/or `docs/firecrawl/` (one file per URL).

### 1.2 Browser MCP

- For each URL:
  - `browser_navigate` to the URL.
  - `browser_snapshot` to get DOM and structure.
- From the snapshots, extract and document:
  - **Homepage:** Which sections sit on teal (#21808B) vs white vs grey. Specifically: “Our Members” — background of the *container* for the logos (white vs teal). Header, About, Projects, Our Members, footer.
  - **Roadmap:** Layout of vision text, “View Roadmap” / “Hide Roadmap”, table columns (Workstream | Component | Target output end year), expand/collapse behaviour, timeline dots.
  - **Handbook (initial + interactive):**
    - Initial load: tabs (Case Study View vs Options Table View), filter dropdowns and labels, disclaimer, result cards/list, any accordions.
    - **Use Browser MCP interactions, not just a single snapshot:** apply a filter (e.g. select a climate hazard), run a search, then take a snapshot of the *results* state so the filtered/list view is documented.
    - **Explicitly capture the Options Table View:** click the “Options Table View” tab, then snapshot — that view is easy to miss if only the default Case Study view is captured.
- Write everything into the reference doc as a “Layout & styling (from live)” section so implementation isn’t guesswork.

### 1.3 Output of Phase 1

- One reference doc (or small set) with:
  - Per-page content/structure (from Firecrawl).
  - Per-section layout and backgrounds (from browser snapshot).
  - Exact colours and sectioning rules (e.g. “Our Members: white background, not inside teal band”).

---

## Phase 2 — GitHub (data shape and behaviour)

- **TRIB/homepage:** List components (e.g. `App.js`, `Header.js`), CSS files. Map to sections on live homepage; use for component names and structure only. Visuals/layout still follow live.
- **TRIB-Roadmap:** Locate roadmap JSON and any asset paths. Confirm workstreams (1–4), components, and target years. Align `data/` or `RoadmapContent.json` in this repo with that structure. This is **data** — the live site doesn’t expose the raw JSON, so GitHub (or repo) wins here.
- **TRIB-CCAH (handbook):** Locate filter config (risk/asset/sector options), API shape, articles schema (65 cols), options table structure, and any accordion/collapsible components. Use for **data shape and behaviour**; visuals/layout follow live.

**Rule:** If **layout or visuals** conflict between GitHub and live, follow live. If it’s **data or schema** (columns, option lists, JSON shape), we need GitHub (or DB/API) — the live site can’t supply that.

---

## Phase 3 — Implement in order

Using the merged spec (live + GitHub):

1. **Homepage**
   - Structure and copy from Firecrawl.
   - Section backgrounds and layout from browser snapshot (including Our Members = white).
   - Assets: reuse existing `public/images/trib/` or live URLs as decided.
2. **Roadmap**
   - Vision copy and CTA from Firecrawl.
   - Table layout and expand/collapse from browser snapshot.
   - Data from GitHub + `RoadmapContent.json` (all four workstreams, timeline).
3. **Handbook**
   - Tabs, filters, disclaimer from Firecrawl + snapshot.
   - Filter options and API from GitHub; keep existing `lib/db.ts` and API routes.
   - Any click-to-open sections: behaviour from GitHub, layout from live.

---

## Execution order (recommended)

1. Run **Firecrawl** for the three URLs; update `docs/trib-live-reference.md` (and/or `docs/firecrawl/`).
2. Run **browser MCP** for the same three URLs; add “Layout & styling (from live)” to the reference.
3. Use **GitHub** to fill in roadmap JSON, handbook filters, and component behaviour; note any differences from live.
4. Implement **homepage** then **roadmap** then **handbook**, with each change driven by the reference doc.

---

## Summary

- **Live site = source of truth** for layout and visuals (including “Our Members” = white).
- **Firecrawl** = content and structure.
- **Browser MCP** = section backgrounds and DOM layout; **plus interactions** on the handbook (apply filter, search, snapshot results; capture Options Table View tab).
- **GitHub** = data shape, schema, and static data (roadmap JSON, filter options, articles/options structure). For those, we *do* need the repo (or equivalent): the live site only renders data, it doesn’t expose schema or raw JSON. If the repo is out of date for *deployed behaviour*, we still use it for data/schema and follow live for how that data is presented.

**Do we need GitHub if it’s out of date?** Yes, for **data**. We need some source for the 65-column articles schema, options table, roadmap JSON, and filter option lists. The live UI can’t give us that. GitHub is the practical source; if it were missing we’d have to infer from API responses or a DB dump. For **look and feel**, live is the source; for **what data exists and how it’s shaped**, GitHub (or backend) wins.

This gives a clear, tool-driven plan so reproduction is clinical and repeatable rather than iterative guesswork.
