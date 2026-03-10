# Handbook page — UX assessment

**Perspective:** What a senior UX designer would flag and how much room there is for improvement.

---

## What’s working

- **Clear primary task:** “Explore case studies” is obvious; filters + Explore + results flow is understandable.
- **Consistent branding:** TRIB colours, Lato, and CSS variables are applied consistently.
- **Useful affordances:** Four filters with distinct colours, tabs for Case Study vs Options Table, search in the header.
- **Reasonable IA:** About, Credits, Contact, search, and main content are where users would expect.

---

## Significant room for improvement

A strong UX lead would say there is **meaningful** room to improve: the page is functional and on-brand, but several patterns work against clarity, trust, and efficiency.

### 1. **Discoverability and first-run experience**

- **Issue:** On first load, the results area shows “Risk not provided” and “Asset not provided” before the user has done anything. That reads as an error or a demand, not as guidance.
- **Impact:** New users may think something is wrong or that they must provide risk/asset (and don’t know how).
- **Improvement:** Treat these as **contextual hints**, not permanent banners. For example: show them only **after** the user clicks Explore (or after they change a filter), and phrase as “Showing all case studies — narrow by Risk or Asset to refine” or move to a short inline tip near the filters instead of full-width banners.

### 2. **Filter + search mental model**

- **Issue:** Search (header) and filters (Explore) are separate. Typing in search runs a different path than “Explore”; combining filters + search is unclear (e.g. “Do I need to click Explore after searching?”).
- **Impact:** Extra cognitive load and inconsistent behaviour (search is live, filters are on-demand).
- **Improvement:** Unify behaviour: e.g. “Apply filters + search together when the user clicks Explore or presses Enter in search,” and show one clear “Applying filters…” / results state. Optionally add “Search within current filters” in the results section so the relationship is explicit.

### 3. **Feedback and loading**

- **Issue:** Only a small “Loading…” line indicates progress. No skeleton or inline feedback on the filters/cards area; no explicit “X results for your filters” or empty state that explains *why* (e.g. “No case studies match Rail + Bridge. Try broadening filters.”).
- **Impact:** Users can’t tell if the app is working, or why they see zero or many results.
- **Improvement:** Skeleton cards or a clear loading state in the results grid; after load, a short summary like “12 case studies” or “No case studies match your selection. Try different filters.” with a one-click “Clear filters” or “Show all.”

### 4. **Empty and error states**

- **Issue:** Empty state is generic (“Try adjusting your filters or click Explore”). Errors (e.g. API failure) are only in the console.
- **Impact:** Dead ends feel unhelpful; failures feel broken.
- **Improvement:** Empty state that explains cause (no query match vs. no filter match) and suggests next steps. Global or inline error message for network/API errors with “Try again” or “Reload.”

### 5. **Accessibility and focus**

- **Issue:** No skip link; focus management when switching tabs or after Explore is unclear; “Risk/Asset not provided” may be announced by screen readers as alerts even when they’re informational.
- **Impact:** Keyboard and screen-reader users have a harder time and may get noisy or confusing announcements.
- **Improvement:** “Skip to results” link; move focus to results heading or first card after Explore; ensure banners are not live regions unless they’re true alerts; check focus visible on all controls.

### 6. **Scannability and hierarchy**

- **Issue:** Long blocks of disclaimer and dense card copy with similar weight; “Upload a resource” / “Suggest a link” sit in the same visual band as results count and cards.
- **Impact:** Harder to scan and to understand what’s primary (results) vs. secondary (actions, disclaimers).
- **Improvement:** Reduce disclaimer to a collapsible “About these filters” or a single line + “Learn more”; visually separate “Refine” (filters) from “Contribute” (Upload/Suggest) and “Results” (count + cards); slightly stronger heading/type hierarchy so title → subtitle → body is obvious in each card.

### 7. **Trust and transparency**

- **Issue:** No indication of data freshness, source, or what “case study” means in this context; Options Table View is empty with a generic message.
- **Impact:** Professional users may not trust or reuse the tool if they don’t know what they’re looking at.
- **Improvement:** One line of provenance (e.g. “Case studies from [source], updated [frequency]”); short “What is a case study?” in the intro or next to the first card; Options Table given a clear “Coming soon” or “No options data loaded” with a reason/link.

### 8. **Mobile and responsive behaviour**

- **Issue:** Header nav and filters can wrap in a way that feels cramped; filter row (label + dropdown) may not stack cleanly on small screens; two-column cards may be tight.
- **Impact:** On phones, the experience can feel fragmented and tap targets small.
- **Improvement:** Consider a compact header (e.g. hamburger or prioritised links) and stacked filter layout on narrow viewports; ensure at least 44px tap targets and that “Explore” and “Go to resource” are easy to hit.

---

## Summary

- **Verdict:** There is **significant room for improvement** from a UX perspective. The page is usable and on-brand, but trust, clarity, feedback, and first-run experience would all benefit from targeted changes.
- **Highest impact, relatively low effort:** (1) Contextual “Risk/Asset not provided” and clearer empty states, (2) unified filter + search behaviour and one clear results summary, (3) loading and error feedback.
- **Next tier:** Accessibility (skip link, focus, live regions), clearer hierarchy and scannability, and data provenance.
- **Ongoing:** Responsive and touch behaviour, Options Table story, and optional “search within filters” to keep the mental model simple.

Implementing even the first three would make the handbook feel noticeably more polished and easier to use.
