# HIVE — analytics instrumentation backlog

**Status:** backlog, not scheduled · **Raised:** 5 Aug 2026
**Origin:** GA4 usage analysis, 30 Mar – 5 Aug 2026. Every item below is a gap found while trying
to answer "is HIVE being used, and does it work?" and failing.

The through-line: **HIVE's distinctive feature — search-and-ask across the case library — is the
one thing not measured.** Reporting therefore describes the pages people didn't open rather than
the answers they did get, which makes usage look worse than it is and gives no way to prove the
product's actual value.

---

## 1. Register custom dimensions — do this first, it is time-sensitive

**Problem.** No custom dimensions are registered on property 530495696. Events already carry
useful parameters, and GA4 discards every one of them from reporting.

Most importantly `intent_source` (`"ai"` | `"keyword"`), sent on every `search_performed` from
[`app/handbook/page.tsx:1277`](../app/handbook/page.tsx) and
[`:1287`](../app/handbook/page.tsx) — so the AI-versus-keyword split is being collected and
thrown away. Querying it returns HTTP 400.

**Why it is urgent.** Custom dimensions are **not retroactive**. Registering today gives data
from today. Every day unregistered is a day of that split lost permanently — including all the
data already gathered.

**Fix.** GA4 → Admin → Custom definitions → Create custom dimension (event-scoped) for:

| Dimension | Parameter | Event |
|---|---|---|
| Intent source | `intent_source` | `search_performed` |
| Result count | `result_count` | `search_performed` |
| Opened via | `open_via` | `case_study_opened` |
| Case ID | `case_id` | `case_study_opened`, `added_to_brief` |
| Brief source | `brief_source` | `brief_generated` |
| Chat context | `chat_context` | `chat_opened` |

Requires `analytics.edit`; the credentials configured on this machine are `analytics.readonly`,
so this is a console task by design.

**Acceptance.** `customEvent:intent_source` returns rows from the Data API.

---

## 2. Wire up the analytics helpers that are never called

**Problem.** [`lib/analytics/ga4.ts`](../lib/analytics/ga4.ts) defines eight helpers. Four have
**no call sites anywhere in the codebase** and have therefore never fired:

| Helper | Line | Consequence of it being dead |
|---|---|---|
| `chatOpened` | 64 | **AI chat usage has never been recorded at all** |
| `addedToBrief` | 39 | Can't see who started assembling a brief and abandoned it |
| `pdfDownloaded` | 56 | The 14 downloads in reports are GA4 auto-tracking, not the export |
| `heatmapClicked` | 69 | Heatmap engagement unknown |

`searchPerformed`, `caseStudyOpened`, `briefGenerated` and `filterApplied` are wired correctly.

**Fix.** Call them at the obvious sites — chat panel open handler, add-to-brief control, export
handler, heatmap cell click. `ChatPanel.tsx` is the priority.

**Acceptance.** All eight appear in GA4 Realtime during a manual pass through the handbook.

---

## 3. Stop `search_performed` firing on every keystroke

**Problem.** 564 search events across 172 distinct terms, but 53% are typing fragments —
`f`, `fl`, `flo`, `S`, `St`, `Ste`. The event fires per keystroke, so search volume is
substantially overstated.

This is the explanation for the 517-searches-versus-9-result-views discrepancy that looked like
a contradiction in the August report.

**Fix.** Debounce, or fire on submit / result-settle rather than on input change. Consider also
firing GA4's standard `view_search_results` alongside, so the built-in site-search reporting
works.

**Consequence to note.** Search counts before and after this change are not comparable. Record
the change date; any trend line spanning it will show a fall that is an artefact, not a drop in
use.

**Acceptance.** One `search_performed` per intentful search. No sub-4-character fragments in
the `searchTerm` report.

---

## 4. Measure whether the answer removed the need to open the case

**Problem.** The current reporting cannot distinguish "nobody wanted the case studies" from
"people got what they needed from the answer without opening one" — and the second is the whole
premise of the product. The search terms are scenario questions
(*"flooding on a rail corridor"*, *"heatwave on road bridges"*), which is consistent with the
second reading, but it is unprovable as instrumented.

**Fix.** Two additions:

```ts
/** An answer was returned, citing these cases */
answerReturned(caseIds: string[], intentSource: "ai" | "keyword") {
  track("answer_returned", {
    case_count: caseIds.length,
    case_ids: caseIds.join(","),
    intent_source: intentSource,
  });
}
```

and extend `open_via` on `caseStudyOpened` to include `"answer"`, so an open that follows an
answer is distinguishable from one that came from a card or the index.

**What it buys.** A reportable statement of the form: *"answers surfaced N cases; in X% of
sessions the user got what they needed without opening one."* That converts the current defensive
position into the product's headline metric.

**Acceptance.** Answer-to-open rate is queryable for any date range.

---

## 5. Outcome instrumentation — the "impact" gap

**Problem.** Nothing records whether a read fed a decision, a bid, a document or a brief sent
onward. This is why the August report had to say impact "can neither be evidenced nor ruled out",
and it is the question stakeholders actually ask.

**Fix.** Agree what an outcome is before instrumenting. Candidates: brief generated *and*
exported; a case cited in an outbound document; a return visit within N days of an answer; an
explicit "was this useful?" response. `FeedbackSurvey.tsx` already exists and may be the cheapest
starting point.

**Note.** Keep this pseudonymous. Do not send names or identifiers into GA4 — see the note on
personal data in the analytics report.

---

## Ordering

1 is urgent because it is lossy. 2 is a few hours and unlocks the AI question. 3 prevents a
misleading trend line later. 4 is the one that changes the story stakeholders hear. 5 needs a
conversation about definitions before any code.
