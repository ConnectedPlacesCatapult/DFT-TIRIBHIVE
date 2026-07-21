# CPC Git → Azure deploy cutover plan

**Status:** CPC repo synced to personal `main` as of 2026-07-21 (`4ab8799`). Azure still deploys from `DayoOdunlami/DFT-HIVE`.

## Repos

| Role | Repo |
|------|------|
| Live deploy today | https://github.com/DayoOdunlami/DFT-HIVE |
| CPC canonical (synced) | https://github.com/ConnectedPlacesCatapult/DFT-TIRIBHIVE |

Local remotes: `origin` = personal, `cpc` = CPC fork.

## What already works after sync

- CPC `main` matches personal `main` (carbon copy of code).
- Hompage layout + logo fixes are on both.

## Why “left crop” looked broken

Deploy of layout fix **succeeded** (Actions run for `4ab8799` → conclusion `success`). Live HTML on trib.org.uk already contains `max-w-[1120px] px-8`. Live CSS `200 OK`.

If the browser still looked flush-left, likely: hard cache of an older page, screenshot taken before deploy finished, or a visual preference for more inset — not a failed deploy.

## Azure cutover (so CPC Git deploys)

1. **Copy GitHub Actions secrets** from personal DFT-HIVE → CPC DFT-TIRIBHIVE  
   Required (same names as current workflows):
   - `AZUREAPPSERVICE_PUBLISHPROFILE_2430DF2D06004C83AF487394C07C0D15` (Hive-staging / prod)
   - `AZUREAPPSERVICE_PUBLISHPROFILE_TRIB_DEV` (trib-dev)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` / `DEV_APP_URL`
   - `ADMIN_PASSWORD`
2. **Confirm workflows exist** on CPC repo (`.github/workflows/main_hive-staging.yml`, `develop_trib-dev.yml`) — they copy with the sync.
3. **Test:** push a no-op commit to CPC `develop` → confirm trib-dev updates; then CPC `main` → Hive-staging / trib.org.uk.
4. **Disable or pause** deploy workflows on personal `DayoOdunlami/DFT-HIVE` so only CPC deploys (avoids race).
5. **Optional:** rename CPC repo `DFT-TIRIBHIVE` → `DFT-HIVE` / `TRIB-HIVE` for clarity; update bookmarks and IT docs.
6. **Ongoing sync:** either make CPC the only push target, or add a mirror Action personal→CPC (prefer single source of truth = CPC).

## AI / Supabase / Postgres — does cutover break them?

**No — if Azure App Service settings stay the same.** Deploy repo change ≠ database change.

Runtime config lives on **Azure App Service Configuration**, not in GitHub:

| Concern | Where it lives | Cutover impact |
|---------|----------------|----------------|
| OpenAI (chat, embeddings) | Azure app setting `OPENAI_API_KEY` (+ CI secret for build) | Copy secret to CPC Actions; keep Azure setting |
| Supabase (pgvector / search) | `NEXT_PUBLIC_SUPABASE_*`, `HIVE_SUPABASE_*` on Azure + CI | Same — copy secrets; keep Azure |
| Azure Postgres | `DATA_PROVIDER`, `AZURE_POSTGRES_*` on Azure | Unchanged — still CPC Azure |
| Admin | `ADMIN_PASSWORD` on Azure | Unchanged |

App data layer (`lib/handbook/db.ts`):

- `DATA_PROVIDER=json` → static JSON only  
- `DATA_PROVIDER=supabase` → Supabase Postgres + pgvector  
- `DATA_PROVIDER=azure` → **Azure Postgres primary**, falls back to Supabase, then JSON  

Production typically uses Azure Postgres for structured data **and** Supabase for vector search (or azure with Supabase fallback). Confirm live values in Azure Portal → App Service → Configuration. The site does **not** “move” databases when you change which GitHub repo deploys the app binary.

## Luke access (after cutover)

Grant Write on `ConnectedPlacesCatapult/DFT-TIRIBHIVE` (whole repo; process-limit homepage/roadmap). Azure RG access only if he needs logs/redeploy.

## Verification checklist

- [ ] CPC Actions green on `develop` and `main`
- [ ] trib-dev and trib.org.uk show new commit SHA / content
- [ ] `/handbook` AI chat still returns answers
- [ ] Logos load (`/images/trib/Logos/...`)
- [ ] Personal repo workflows disabled
- [ ] IT/docs updated to CPC repo URL
