# HIVE AI Resilience QA Checklist (PR 1)

Date: 2026-04-27  
Branch: `feat/ai-evidence-mode-resilience`

## Legend

- PASS: verified in this session
- MANUAL: not fully automatable in current local harness; manual verification steps provided

## Results Matrix

| Feature | `AI_FORCE_DISABLED=true` | Invalid key (`OPENAI_API_KEY=invalid-key`) | Valid key + OpenAI 429 | Valid key + OpenAI 500 | Network timeout |
|---|---|---|---|---|---|
| Semantic search (`/api/handbook/semantic-search`) | PASS | PASS | MANUAL | MANUAL | MANUAL |
| Unified search (`/api/handbook/unified-search`) | PASS | PASS | MANUAL | MANUAL | MANUAL |
| Brief generator (`/api/handbook/brief-generate`) | PASS | PASS | MANUAL | MANUAL | MANUAL |
| Chat drawer (`/api/handbook/chat` + drawer UI) | PASS (API path) / MANUAL (UI disable state) | PASS (API path) / MANUAL (UI disable state) | MANUAL | MANUAL | MANUAL |
| Applicability (`/api/handbook/applicability`) | PASS | PASS | MANUAL | MANUAL | MANUAL |

## Automated checks executed

Two local server runs were executed on port `3100`:

1. `AI_FORCE_DISABLED=true`, empty OpenAI key  
2. `AI_FORCE_DISABLED=false`, `OPENAI_API_KEY=invalid-key`

For each run, requests were made to:

- `GET /api/handbook/semantic-search?q=flooding`
- `POST /api/handbook/unified-search`
- `POST /api/handbook/brief-generate`
- `POST /api/handbook/chat` (SSE completion payload)
- `POST /api/handbook/applicability`

Observed expected behavior:

- Unified/brief/chat/applicability returned explicit `ai_unavailable: true` and evidence-only/fallback payloads.
- Semantic search continued returning case evidence via fallback retrieval path.

## Manual verification steps for 429 / 500 / timeout scenarios

### A) OpenAI 429 (rate-limit/quota)

1. Run app with valid key: `AI_FORCE_DISABLED=false`, real `OPENAI_API_KEY`.
2. Temporarily force 429 by proxying OpenAI endpoint to a local stub that returns 429, or use org/project quota-limited key.
3. Verify each endpoint returns evidence-only/fallback contract (not broken empty states).

### B) OpenAI 500

1. Run with valid key.
2. Route OpenAI base URL through a stub/proxy and return HTTP 500.
3. Verify degraded behavior for unified/brief/chat/applicability and continued non-AI search behavior.

### C) Network timeout

1. Run with valid key.
2. Blackhole OpenAI requests (firewall/DNS override) or use proxy delaying upstream >12s.
3. Verify timeout is classified as `ai_unavailable` and degraded contracts are returned.

### D) Chat drawer UI disable state (manual browser check)

1. Open `/handbook`.
2. Trigger chat under `AI_FORCE_DISABLED=true` or invalid key.
3. Confirm:
   - input is disabled,
   - send button disabled,
   - evidence-only explainer is visible,
   - preset evidence navigation links are present.

