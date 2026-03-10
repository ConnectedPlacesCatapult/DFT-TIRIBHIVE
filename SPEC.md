# HIVE Rebuild Spec — Local Mirror
**Living document**: https://www.notion.so/313c9b382a74810a9b18c9baf0526c93
**Last synced**: 5 March 2026

> This file mirrors the Notion page. Notion is the single source of truth.
> Update Notion first, then sync here.

---

## Project Overview

HIVE (trib.org.uk/handbook) is a climate adaptation intelligence platform for transport,
commissioned by DfT and managed by CPC. This project rebuilds the existing platform in
Next.js and upgrades /handbook with AI-powered search, synthesis, and improved UX.

**Three phases:**
- Phase 1: Audit (COMPLETE)
- Phase 2: Faithful Next.js rebuild of entire TRIB site (IN PROGRESS)
- Phase 3: Upgrade /handbook into full HIVE platform (NOT STARTED)

**Deadline:** 31 March 2026
**Budget:** £18,234

---

## Architecture Decisions

| Decision | Detail |
|----------|--------|
| Supabase | Same project as Sparkworks/Atlas. HIVE tables (sources, articles, document_chunks) coexist. Easy to extract to Azure later. |
| Phase 2 data | Static JSON extracted from SQL. lib/db.ts abstraction with env-switchable backend. |
| No Docker | Build from GitHub source analysis. No legacy container dependency. |
| Framework | Next.js 15 + React 19 + TypeScript + App Router |
| Deployment | Phase A: Vercel + Supabase. Phase B: Azure App Service + Azure Postgres. |

---

## Non-Negotiable Rules (from day one)

- `next.config.ts`: `output: 'standalone'`
- Port: `process.env.PORT ?? 3000`
- No Edge Runtime: `export const runtime = 'nodejs'` on all API routes
- No local disk writes
- All env vars in `.env.example`

---

## Environment Variables

```
DATABASE_URL=           # Phase A: Supabase | Phase B: Azure Postgres
SUPABASE_URL=           # Retained both phases for pgvector
SUPABASE_ANON_KEY=
OPENAI_API_KEY=         # Embeddings + report synthesis
NEXT_PUBLIC_APP_URL=    # Phase A: Vercel URL | Phase B: trib.org.uk
NODE_ENV=
```

---

## Existing TRIB Audit Summary

### Homepage (TRIB/homepage/)
- React 18 CRA (JS), react-ga4
- 2 components, static content

### Handbook (TRIB-CCAH/)
- FE: React 18 CRA (TS), axios, react-router-dom, masonry, react-table
- API: Express.js, pg, cors, rate-limit
- DB: PostgreSQL Docker (articles: 65 cols, options: 20 cols)
- Routes: /, /about, /credits, /search, /404

### Roadmap (TRIB-Roadmap/)
- React 18 CRA (JS), ag-grid-react
- 100% static JSON, no DB

---

## Supabase Schema (Phase 3)

```sql
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trib_id VARCHAR,
  title VARCHAR NOT NULL,
  source_type VARCHAR NOT NULL CHECK (source_type IN ('trib_pdf','external_url','guidance_doc')),
  original_url VARCHAR,
  storage_path VARCHAR,
  storage_url VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id),
  transport_sector VARCHAR,
  asset_type VARCHAR,
  hazard_cause VARCHAR,
  hazard_effect VARCHAR,
  project_title VARCHAR NOT NULL,
  measure_title VARCHAR NOT NULL,
  measure_description TEXT,
  case_study_text TEXT,
  content_type VARCHAR DEFAULT 'case_study'
    CHECK (content_type IN ('case_study','guidance')),
  trib_ranking INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE document_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id),
  article_id UUID REFERENCES articles(id),
  chunk_index INT NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Component Structure (Phase 3 target)

```
components/hive/
  Nav.tsx
  Hero.tsx
  Marquee2D.tsx
  Marquee3D.tsx
  MarqueeCard.tsx
  CaseStudyCard.tsx
  CaseStudyDetail.tsx
  SynthesisPanel.tsx
  BriefPanel.tsx
  FilterPill.tsx
  HazardBadge.tsx
```

---

## Repo Links

- TRIB (orchestration): https://github.com/DayoOdunlami/TRIB
- TRIB-CCAH (handbook): https://github.com/DayoOdunlami/TRIB-CCAH
- TRIB-Roadmap: https://github.com/DayoOdunlami/TRIB-Roadmap
