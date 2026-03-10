# TRIB / HIVE — Next steps

## How to run

1. From the project root: `npm install` (if not already done).
2. Start the dev server: `npm run dev`.
3. Open [http://localhost:3000](http://localhost:3000).

## What to check

- **Homepage** `/` — About, Projects (Roadmap and Vision, Climate Adaptation Hive), Our Members.
- **Handbook** `/handbook` — Filters, Case Study View / Options Table View, disclaimer and links.
- **Roadmap** `/roadmap` — 2035 Vision, workstreams, View Roadmap.
- **Handbook sub-pages** `/handbook/about`, `/handbook/search`, `/handbook/credits`.

## Current state

- Phase 2 visual parity with [trib.org.uk](https://trib.org.uk) is in progress: layout, copy, and branding (colours, typography) have been aligned with the live site using Firecrawl capture and GitHub references.
- Data layer (`lib/db.ts`, `data/articles.json`, `data/options.json`, API routes) is unchanged; handbook filtering and search work as before.

## Next (after visual parity)

1. Update the Notion page with Phase 2 progress: [TRIB/HIVE Notion](https://www.notion.so/313c9b382a74810a9b18c9baf0526c93).
2. Full roadmap data (ag-grid or equivalent) and options table if needed.
3. Phase 3: Supabase schema, prototype v4 UI on `/handbook`, AI intent + semantic search, synthesis/brief, analytics, then Vercel and Azure.
