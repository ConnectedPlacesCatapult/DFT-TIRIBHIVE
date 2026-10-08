# HIVE — case-study source PDF links are all dead

**Status:** open · **Raised:** 5 Aug 2026 · **Source:** GA4 usage analysis, verified against live
**Scope:** HIVE handbook case studies. Not TRIB.

---

## Issue 1 — every `source_pdf_url` returns 404 (live, confirmed)

Each HIVE case study offers a link to its source document. Every one of those links is broken.

**Evidence — analytics.** GA4 for 30 Mar – 5 Aug 2026 records **13 attempts across 6 distinct
documents, all failing**, on `trib.org.uk`:

| Path | Attempts |
|---|---|
| `/documents/ID 01_Port of Calais_Extension and sea defence.pdf` | 3 |
| `/documents/ID 28_NSW Government_Climate resilient transport…pdf` | 3 |
| `/documents/ID 06_Austrian Federal Railways_climate adaptation measures.pdf` | 2 |
| `/documents/ID 11_Deutsche Bahn_Climate Adaptation Measures.pdf` | 2 |
| `/documents/ID 19_City of Phoenix…Cool Pavements Programme (1).pdf` | 2 |
| `/documents/ID 31_NetworkRail_Drainage System.pdf` | 1 |

**Evidence — live check.** HEAD requests on 5 Aug 2026 returned `404` for all four tested,
including `ID 40_Sheffield City Council Grey to Green.pdf`, which appears nowhere in the
analytics. So this is not six missing files — **the whole `/documents/` directory is gone**, and
the six above are simply the ones someone happened to click.

**Why it matters more than the volume suggests.** A reader who clicks through to a source PDF
has read the case, believed it, and gone looking for the evidence. That is the deepest
engagement HIVE produces, and it is the one path that fails every single time.

### Root cause

`lib/hive/seed-data.ts:41-45` resolves every case study's PDF to a TRIB URL:

```ts
export function getCaseStudyPdfUrl(cs: { id: string; title: string; source_pdf_url?: string }): string {
  if (cs.source_pdf_url) return cs.source_pdf_url;
  const slug = cs.id.replace(/_/g, " ") + "_" + cs.title;
  return "https://trib.org.uk/documents/" + encodeURIComponent(slug) + ".pdf";
}
```

Both branches land on `trib.org.uk/documents/…`:

- the explicit `source_pdf_url` values in `data/case-studies.json` are hard-coded TRIB URLs;
- the fallback constructs one from `id` + `title`.

The files are **not in this repo** — there is no `public/documents/`, and `public/docs/` holds
only three unrelated TRIB reports. `scripts/ingest-hive-pdfs.ts` fetches these same URLs, so they
existed on TRIB at some point and have since been removed or relocated.

### Where it surfaces

- `components/hive/CaseStudyDetail.tsx:291-292` — source link on the case detail page
- `components/handbook/case/CasePageClient.tsx:32` — same, handbook route
- `lib/hive/seed-data.ts:391` — fallback populates `source_pdf_url` during normalisation
- `data/case-studies.json` — `source_pdf_url` on each entry

### Proposed fix

**Do first — stop showing dead links.** Whatever the hosting decision, the UI should not render a
source link it cannot honour. Either verify availability at build time and omit the link, or
render it disabled with a "source document unavailable" note. This is a small guard in the two
components above and it stops the bleeding immediately.

**Then pick a home for the files.** Two real options:

1. **Host them in HIVE** (`public/documents/`), and change `getCaseStudyPdfUrl` to return a
   relative `/documents/…` path. Self-contained, survives any further TRIB change, and HIVE is
   moving to its own deployment anyway. Cost: ~36 PDFs of repo weight, and see the caveat below.
2. **Restore them on TRIB.** Smaller change here — none, in fact — but it keeps HIVE's case
   library dependent on a separate site and codebase that has already dropped these files once.

Recommendation: **option 1**, on the grounds that the current coupling has already failed silently
for months.

**Flag before re-hosting — this needs a decision, not an assumption.** These are third-party
documents: Deutsche Bahn, Network Rail, LA Metro, NSW Government, Austrian Federal Railways and
others. Copying them into a DfT-commissioned public site is a redistribution question, not a
technical one. The safer default for many of them is to link to the *publisher's* original URL
and keep a local copy only where licensing clearly permits. Worth confirming with Loren before
bulk-uploading anything.

### Acceptance

- No case study renders a source link that 404s.
- `getCaseStudyPdfUrl` has a test covering both branches (explicit and constructed).
- A check — script or CI step — that fails if any `source_pdf_url` is unreachable, so this
  cannot regress silently again.

---

## Issue 2 — `/handbook/cases/ID_*` link shape (probably already fixed — verify and close)

GA4 recorded 7 failed views across `/handbook/cases/ID_11`, `ID_13`, `ID_15`, `ID_16`. Case studies
live at `/handbook/ID_*`, one level shallower — the URLs were being built with an extra `cases/`
segment.

**This looks resolved already.** Every case link in the current codebase uses `/handbook/${id}`
correctly — `components/handbook/landing/CaseStudyCard.tsx:307`,
`components/handbook/case/RelatedCases.tsx:57`, `components/handbook/options/OptionRow.tsx:307`,
`app/handbook/brief/page.tsx:703`, and others. A search for the broken shape returns nothing.

All 7 failures were on `hive-staging…azurewebsites.net` by **a single internal user**, so this
almost certainly reflects an older staging build rather than current code. No real user hit it.

**Action:** confirm the deployed staging build matches current `main`, then close. Only reopen if
the path reappears in analytics.

---

## Not in scope

The same analysis found **125 failed views by 78 people on `trib.org.uk/roadmap/*`** — capitalised
URLs (`/roadmap/About`, `/roadmap/Case_Studies`) where working lowercase equivalents exist.
`/roadmap/About` alone caught 31 separate people. That is the live legacy TRIB site, a different
codebase, and belongs in a separate ticket — but it is a materially larger user-facing defect than
either issue above and should not be lost.
