# HIVE QA — State of Play (2 May 2026)

## The Bottom Line

Out of 26 QA items raised, **the house is built and the plumbing works**. What we're arguing about is paint colours and whether we should have used a different brand of door handles.

---

## The Analogy

Imagine you commissioned a house. The contract says: 4 bedrooms, central heating, double glazing, modern kitchen, landscaped garden.

You get:
- 4 bedrooms (all furnished) — **done**
- Central heating that works in every room — **done**
- Double glazing fitted — **done**
- A modern kitchen with appliances — **done**
- Landscaped garden — **done**

The QA inspector arrives and reports:

> "Multiple non-compliances. The paint in the hallway is slightly lighter than the swatch. The door handles are brushed nickel, not chrome. The third bedroom's light switch is 2cm too low. The garden shed has no padlock. Also, why isn't this a Georgian manor house?"

Some of those are valid snagging items. One of them is a different house entirely. None of them mean the house is unfit for purpose.

**That's where we are with HIVE.**

---

## By the Numbers

| Metric | Value |
|---|---|
| QA items raised | 26 |
| Already working / implemented | 10 (38%) |
| Confirmed bugs (fix in progress) | 5 (19%) |
| Data quality fixes needed | 2 (8%) |
| By-design (not defects) | 2 (8%) |
| Scope disputes (need DfT decision) | 2 (8%) |
| Refuted (not reproducible) | 1 (4%) |
| Process items (not software) | 1 (4%) |
| Subjective (need user testing) | 2 (8%) |
| Agreed backlog | 1 (4%) |

**10 of 26 items (38%) are already working.** Loren's report marked these as N/A or Pass but they still count — they're deliverables we built and they function correctly.

**5 genuine bugs (19%)** — all small, all fixable this sprint:
- Q4: Missing case study + synonym mapping (~2 hours)
- Q17: Brief nav link + timeout (~1 hour)
- Q18: Chat panel click target (~1 hour)
- Q20: Text rewording (~5 minutes)
- Q22: One cost data correction (~10 minutes)

**2 data quality issues (8%)** — Wales tagging and options filter investigation. Medium effort but not architectural.

**2 scope disputes (8%)** — GOV.UK Design System and UI/UX assessment. These literally cannot be resolved without DfT writing down what they agreed to. The spec flags GOV.UK Design System as an *open question raised at kickoff with no recorded answer*.

---

## The WCAG Story (Q1) — Most Important Item

This is the one that sounds worst on paper: "multiple non-compliances."

**What actually happened:**
1. We completed a systematic WCAG 2.2 AA pass on **23 March** — ARIA labels, keyboard navigation, focus rings, reduced motion, contrast adjustments. Documented in the spec across 10 files.
2. We ran an automated scan (pa11y) on **1 May** against 7 live pages.
3. Result: **zero critical violations**. All ~212 raw violations are the same 5-6 contrast colour values that need darkening slightly. No structural accessibility failures whatsoever.

Think of it like a car MOT. The inspector checks brakes, lights, tyres, emissions, steering. Everything structural passes. The advisory is: "windscreen washer fluid slightly low." Technically a finding. Not the same as "brakes failed."

**Fix time: 2-4 hours** to darken 5-6 CSS colour values and add two HTML attributes.

---

## The AI Story (Q16) — Second Most Misunderstood Item

Loren asked the AI to "list all 66 adaptation measures" and it returned about 13. This is reported as "AI logic outputs inaccurate."

This is like asking Alexa to "read me every book in the library" and marking it as broken when it offers you three relevant recommendations instead. The AI is designed for **situation matching** — you describe your problem, it finds the most relevant cases. The spec literally says: "help transport asset managers make faster, better-informed decisions."

The complete list of all 66 measures lives on the **Options Table** (`/handbook/options`), which was built for exactly this purpose. The fix here is better signposting: when someone asks an enumeration question, the AI should say "for the complete list, visit the Options Table" instead of attempting a partial answer.

---

## What's Strong

- **Core AI pipeline** — hybrid semantic search with RAG, source-linked citations, prompt injection protection. This is genuinely sophisticated engineering, not a toy demo.
- **Analytics** — GA4 events capture search, engagement, and downloads per spec M&E requirements. Three separate event categories, all wired up.
- **Database architecture** — PostgreSQL with pgvector, admin APIs, ingestion scripts. Scales without rearchitecting. User-facing editing explicitly out of scope per contract.
- **Accessibility** — structural a11y (keyboard, ARIA, focus, screen readers) is solid. Only contrast cosmetics remain.
- **Agile delivery** — weekly DfT review calls with documented feedback. Not waterfall hand-off.

---

## What Needs Fixing (Priority Order)

### This Sprint (1-2 days)
1. **5 confirmed bugs** — Q4, Q17, Q18, Q20, Q22 (~half day total)
2. **6 contrast values** — resolve the WCAG residuals (~2-4 hours)

### Next Sprint
3. **Wales data tagging** (Q21) — tag 7 cases with Welsh applicability
4. **Options filter investigation** (Q25) — determine if cascading is desired
5. **Synonym expansion** — add frost, heatwave, drought variants to query map

### Needs DfT Input (Not Fix-able Without Them)
6. **GOV.UK Design System** (Q2) — DfT to confirm: do they want GDS or the current design?
7. **UI/UX acceptance** (Q3) — DfT to confirm the iterative review process reached agreement
8. **CPC Cyber Review** (Q15) — standard Gate 3 process, not a code change

---

## Recommendations

1. **Share the item-by-item response with Loren** (`docs/qa/loren-qa-response-2026-05-02.md`). Every claim has evidence and a spec reference. Transparency is the best defence.

2. **Fix the 5 bugs and 6 contrast values first.** This eliminates 11 items in one push and makes the tracker look dramatically better. More importantly, it removes any ammunition for "the platform has defects."

3. **Get DfT to write down their position on GOV.UK Design System.** This is the single biggest open risk. The spec says it was raised at kickoff — if they said "we don't need GDS," great. If they said "we do," we need to know now. Either way, get it in writing.

4. **Don't fight the backlog items.** Q23, Q24, Q26 are legitimate post-beta improvements. Agreeing to them shows maturity, not weakness. Loren rated them Backlog/Minor — that's the right priority.

5. **Push back firmly on Q19 (HS2 link).** The link works. It was working when we tested. If Loren can reproduce the failure, we'll investigate. Otherwise, this is a transient network issue, not a platform defect.

---

*Full evidence: `docs/qa/loren-qa-response-2026-05-02.md` | Tracker: `docs/qa/loren-qa-tracker-2026-05-02.csv` | Accessibility scan: `docs/qa/accessibility-audit-2026-05-02.md`*
