# HIVE QA — Response Cover Note

**To:** Loren  
**From:** Dayo Odunlami, CPC Delivery Lead  
**Date:** 2 May 2026  
**Re:** QA Report (20 April 2026) — Full Response

---

Thank you for the thorough QA report. The 26-row breakdown was exactly the right format for working through this systematically, and the time you invested in testing directly against the deployed platform is evident. Several of the issues you identified were genuine and have been resolved as a direct result of this review.

Attached is our item-by-item response. The headline: **9 of your 26 items have been fixed in code**, with automated test verification on the AI-specific claims. A further 6 items are confirmed passes with evidence cited. The remainder are either scope disputes (with spec references), process items outside WP1, or agreed post-beta backlog.

Two findings during our verification are worth flagging separately. Running a **30-query reproducible test battery** against the AI — something your one-day manual sample couldn't cover — we identified two citation integrity defects not in your report: guidance-document chunks with missing database linkage were causing the AI to invent case IDs under sparse retrieval conditions, and unresolved database references were leaking into citation text. Both are now fixed. We're sharing this not to redirect from your findings, but because it shows the platform now has an evaluation harness that can catch these issues systematically going forward. The battery is in the regression suite and runs in under 5 minutes.

**Three things we need from you before the platform can progress:**

1. **DfT confirmation on GOV.UK Design System** (Q2) — the spec records this as an open question raised at kickoff with no resolution. We cannot treat it as a "Must Fix" without a DfT written position on design direction.
2. **Cyber review scheduling** (Q15) — this is a Gate 3 governance item coordinated with Chirag and Adam, not a software defect. If you need visibility on the timeline, we're happy to share the Gate 3 schedule.
3. **Confirmation of Q3 (UI/UX)** — if DfT have provided written acceptance of the current UI direction through the weekly review calls, that closes this row. If not, we'd welcome their specific feedback so we can act on it.

Full response document: `docs/qa/loren-qa-response-2026-05-02.md`  
Accessibility post-fix scan: `docs/qa/accessibility-audit-2026-05-02.md`  
AI retrieval battery results: `docs/qa/retrieval-battery-summary-2026-05-02.md`
