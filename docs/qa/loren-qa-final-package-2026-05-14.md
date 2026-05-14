# HIVE — Final QA response package (for Loren)

**Date:** 14 May 2026  
**From:** Dayo Odunlami  
**Re:** Loren Chamberlain technical QA (GFA-aligned) and follow-up fixes  

This document does three things: (1) a **short email-ready summary** Loren can read in a few minutes, (2) a **plain-language clarification** on WCAG versus GOV.UK Design System so reviewers can disagree with precision, and (3) a pointer to a **spreadsheet-style tracker** you can open in Excel.

---

## 1. Email-ready summary (you can paste and trim)

Hi Loren,

Thank you again for the systematic QA against the GFA — it was exactly the kind of pressure-testing we needed, and several items were genuine defects we have now closed in code or data.

**Where we agree there was a real issue**  
We have fixed or materially improved: WCAG contrast and related token issues (with automated re-scan evidence), hazard and synonym behaviour including citation integrity under sparse retrieval, the Build Brief navigation and timeout, the walkthrough stacking and scroll behaviour, “View N cases” clickability, misleading handbook copy, Wales geography metadata, ID_06 cost wording, and retrieval consistency for cold or frost style queries so the main search and Ask Hive draw from the same hybrid retrieval path.

**Where we need different language from the spreadsheet**  
Some rows mix three separate ideas: legal accessibility (WCAG), optional GOV.UK Design System branding, and subjective “intuitive” UX. We can show **what we implemented** for WCAG-oriented accessibility (including tooling output and file-level changes). GOV.UK Design System alignment was **explicitly recorded as an open question with DfT** in the spec — it is not the same thing as the accessibility regulations, and we should not treat “not looking like GOV.UK” as a WCAG failure without DfT confirming GDS as a contractual visual standard.

**What still sits outside a code fix**  
CPC cyber Gate 3 is a governance process, not a missing feature. Full enumeration of every adaptation measure in natural language remains the role of the **Options Table** surface by design of the RAG limits. A few items (options filter cascade expectations, HS2 external link reliability over time, ID_41 content ingestion vs marketing references) need either **scope confirmation** or **phase 2** design budget — Daniel has flagged zero budget for further phase 1 work.

**Enclosed artefacts**  
- `docs/qa/loren-qa-final-package-2026-05-14.md` (this file — narrative + framing)  
- `docs/qa/loren-qa-tracker-final-2026-05-14.csv` (**import into Excel** — one row per Loren row, extra columns for response, changes, evidence, open actions)  
- Existing detail remains in `docs/qa/loren-qa-response-2026-05-02.md` and `docs/qa/accessibility-audit-2026-05-02.md`  

If anything in the CSV does not match what you see on staging after a hard refresh, tell us the exact URL and step sequence — we will treat that as a reproducible defect, not a debate.

Best,  
Dayo

---

## 2. WCAG versus “what Loren saw” versus GOV.UK Design System

### 2.1 WCAG (what the law and good practice centre on)

- The **Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018** (UK) require accessibility of public sector websites against **WCAG 2.1 Level AA** (EN 301 549). WCAG **2.2** is a reasonable forward target where we agreed it in WP1.  
- **Automated tools do not “prove” full WCAG compliance** — they catch many real issues (especially colour contrast) and miss others (logic, meaning, some keyboard edge cases). They are still valuable because they give **repeatable numbers** and show **what we changed in CSS**.  
- Our position is not “we are perfect” — it is: **we implemented a documented WCAG-oriented pass**, then **ran pa11y on staging**, then **fixed the dominant root causes** (six contrast and labelling patterns described in `docs/qa/accessibility-audit-2026-05-02.md`). Loren’s spreadsheet phrase **“multiple non-compliances”** is compatible with “many pa11y serious findings” **when those are almost all the same contrast tokens repeated across cards** — that is very different from “keyboard broken” or “no ARIA on controls.”  
- **What we want Loren (or any reviewer) to be able to say:** “Here is my automated scan on build *X* on date *Y* — here are violations that are **not** contrast-only, or here is a **manual** WCAG step where the product still fails.” That is actionable; “it doesn’t feel like WCAG” without that split is ambiguous.

### 2.2 GOV.UK Design System (GDS) — different contract from WCAG

- **GDS is a design system** (patterns, typography, form components). It supports consistency and can help accessibility, but **adopting GDS is not a legal substitute for WCAG** and **not adopting GDS is not automatically a WCAG failure**.  
- The **Notion spec** records that the HIVE visual language departs from GDS and that **DfT preference was to be confirmed at kickoff**. Until DfT explicitly chooses “must look like GOV.UK”, a Fail on “GOV.UK alignment” is better classified as **scope / design direction** than as “same bucket as WCAG Must Fix.”  
- **What we implemented instead of GDS:** TRIB-aligned typography, colour system, and shadcn-style components, with WCAG-oriented fixes layered on top.

### 2.3 “Public sector legal accessibility” wording in the QA sheet

If “legal accessibility” is read as **the 2018 regulations**, the artefact is **WCAG conformance** plus accessibility statement process — not “clone GOV.UK.” If DfT intended **GDS conformance** as a separate contractual requirement, that needs to be **named explicitly** in the agreed spec or change control — we can then respond in kind.

---

## 3. One-line answers to each Loren row (quick table)

| ID | Topic | One-line response |
|----|--------|-------------------|
| Q1 | WCAG 2.2 | Implemented WCAG-oriented pass + automated scans; fixed dominant contrast roots — invite re-scan on current staging. |
| Q2 | GOV.UK Design System | Not the same as legal WCAG; spec flags DfT open question on visual direction. |
| Q3 | UI/UX intuitive | Iterated with DfT; several concrete pain points fixed; remainder is subjective / phase 2. |
| Q4 | Hazard filtering / frost / heat / ID_41 | Fixed synonym + citation + guidance data; frost path hardened; ID_41 is content not in corpus if still linked from marketing — decide ingest or remove. |
| Q5 | AI navigation | Pass maintained; retrieval unified for consistency. |
| Q6–Q7 | Verified sources / citations | Pass; backlog on “how much to show” is fair. |
| Q8–Q9 | Database | Architecture supports update and scale; in-app CMS not in WP1 scope text. |
| Q10–Q11 | Onboarding / no manuals | Walkthrough defects fixed; recorded video vs text per funding wording — DfT confirm. |
| Q12–Q14 | Analytics | Implemented in GA4 — evidence pack available on request. |
| Q15 | Cyber | Gate 3 process — coordinate with CPC; not a missing library in the repo. |
| Q16 | “List all measures” | RAG is top-K by design; Options Table is the enumeration surface. |
| Q17 | Build Brief | Fixed nav carry of IDs + 30s timeout. |
| Q18 | View N cases | Fixed z-index; new tab without state is expected unless we add URL session design. |
| Q19 | HS2 link | Verified 200 at audit; external link risk accepted — monitor in phase 2. |
| Q20 | Confusing copy | Fixed. |
| Q21 | Wales | Fixed structured tagging where text supported it. |
| Q22 | ID_06 cost | Fixed wording to match PDF honesty. |
| Q23 | UI layout | Backlog / subjective. |
| Q24 | Transfer sectors | Working as designed (exclude home sector); optional copy tweak. |
| Q25 | Options table | Independent filters per W3 note; cascading is a scoped change if DfT wants it. |
| Q26 | Cross-linking | Agreed backlog / phase 2. |

---

## 4. Excel-sized tracker (CSV)

For Loren (or Liz) to **sort, filter, and add columns**, use:

**`docs/qa/loren-qa-tracker-final-2026-05-14.csv`**

Columns include: Loren status/severity, short issue text, **our response status**, **what we built**, **changes since Loren’s review**, **evidence**, **spec/scope note**, **open actions**. Import into Excel with UTF-8.

The row order matches the existing internal mapping **Q1–Q26** aligned to `docs/qa/loren-qa-tracker-2026-05-02.csv`.

---

## 5. Relationship to the earlier long-form response

The item-by-item narrative with file paths and battery notes remains the authoritative “deep” document:

- `docs/qa/loren-qa-response-2026-05-02.md`  

This **final package** adds: (a) clearer **WCAG vs GDS** articulation for stakeholders, (b) an **importable tracker**, and (c) post–early-May **retrieval consistency** notes (hybrid path for chat, editorial seed floor for cold/frost terms, cache versioning) that extend Q4/Q5 beyond the 2 May text — those code paths live in `lib/handbook/chat-api.ts` and `app/api/handbook/unified-search/route.ts`.

---

## 6. Suggested ask back to Loren (one sentence)

If you can run **one** fresh pa11y or axe scan on the current staging build and share the HTML or JSON export, we will reconcile any remaining violations line by line against our contrast patch list — that closes the loop without mixing GDS into WCAG.
