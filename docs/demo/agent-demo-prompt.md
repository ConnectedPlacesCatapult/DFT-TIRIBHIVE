# HIVE Handbook — Browser-Use Agent Demo Prompt

Paste the entire contents below this line into a browser-use agent session.
Ensure `localhost:3000` is running before starting.

---

## CONTEXT

You are piloting a screen-recording demo of the HIVE Handbook — a climate adaptation knowledge tool built for transport infrastructure professionals. The product lets users search across curated international case studies, get AI-synthesised answers, drill into individual cases, ask follow-up questions in a conversational thread, and compile a brief from selected cases.

Your job is to navigate the site as a first-time user discovering its value. Move deliberately and naturally — not robotically fast. This recording will be watched by clients and stakeholders. Make it look considered.

**Base URL:** `http://localhost:3000/handbook`
**Viewport:** Maximise the browser window before starting.

---

## PERSONA

You are a transport infrastructure consultant who has just been told about HIVE. You are genuinely curious. You type thoughtfully. You pause to read results before moving on.

---

## PACING RULES

- Type at approximately 80ms per character (human reading speed)
- After every form submission, wait until the AI response **stops updating** before scrolling — poll the DOM every 500ms and only advance once the text content has been stable for 1.5 seconds
- Pause 2 seconds after every scroll stop
- Never rush between scenes — a 1-second hold before the next action is the minimum

---

## OVERLAY INJECTION RULES

At the start of each scene, inject a temporary full-width banner into the page using JavaScript. Remove it before the next scene starts.

**Inject with:**
```javascript
const banner = document.createElement('div');
banner.id = 'hive-demo-banner';
banner.style.cssText = `
  position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
  background: rgba(0,0,0,0.82); color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 15px; font-weight: 500; letter-spacing: 0.01em;
  padding: 10px 24px; text-align: center;
  animation: fadeIn 0.3s ease;
`;
banner.textContent = 'BANNER_TEXT_HERE';
document.body.appendChild(banner);
```

**Remove with:**
```javascript
const el = document.getElementById('hive-demo-banner');
if (el) el.remove();
```

---

## SCREENSHOT CAPTURE MOMENTS

Take and save a screenshot at each of the following moments (label them clearly):

1. `shot-01-landing` — Before any interaction, page fully loaded
2. `shot-02-broad-answer` — After broad query answer finishes streaming
3. `shot-03-card-expanded` — After clicking a case study card, detail visible
4. `shot-04-followup-3` — After the third follow-up answer finishes streaming
5. `shot-05-brief` — After scrolling to the bottom of Build a Brief

---

## FALLBACK QUERIES

If any query returns zero case study cards, substitute the following:
- Broad query fallback: *"What adaptation measures protect transport infrastructure from flooding?"*
- Main query fallback: *"How do rail operators protect infrastructure from high temperatures?"*
- If the "Ask a follow-up →" button is not visible after a response, look for the chat panel icon in the top navigation and open it from there

---

## SCENE-BY-SCENE INSTRUCTIONS

---

### SCENE 1 — Landing *(target: 10 seconds)*

1. Navigate to `http://localhost:3000/handbook`
2. Wait for the page to fully load (hero image visible, input field present)
3. **Take screenshot:** `shot-01-landing`
4. **Inject banner:** *"Meet the HIVE Handbook — your case knowledge, searchable."*
5. Hold for 3 seconds
6. **Remove banner**

---

### SCENE 2 — Broad Query: Showing It Just Works *(target: 45 seconds)*

1. **Inject banner:** *"Start broad — ask a general question."*
2. Locate the input with `aria-label="Search case studies"`
3. Click it. Hold 1 second.
4. **Remove banner**
5. Type slowly: `What are the top climate adaptation strategies for transport infrastructure?`
6. Press Enter
7. Wait until the AI answer text stops updating (stable for 1.5s)
8. **Take screenshot:** `shot-02-broad-answer`
9. **Inject banner:** *"A synthesised answer — not a list of links."*
10. Hold 4 seconds on the answer area (scroll the answer into view if needed, do not scroll past it)
11. **Remove banner**
12. Slow scroll down ~300px to reveal the top 2–3 case study cards
13. **Inject banner:** *"Every source traceable — right below the answer."*
14. Hold 3 seconds
15. **Remove banner**

---

### SCENE 3 — Out-of-Scope Cameo *(target: 15 seconds)*

1. Scroll back to the top. Click the clear button (`aria-label="Clear search"`) or select all and delete the current query.
2. **Inject banner:** *"What happens when you ask the wrong question?"*
3. Hold 1 second
4. **Remove banner**
5. Type slowly: `What experience do we have delivering digital engagement strategies for transport clients?`
6. Press Enter
7. Wait for the response to finish loading
8. **Inject banner:** *"Outside scope — it tells you clearly and redirects."*
9. Hold 3 seconds
10. **Remove banner**
11. Clear the input immediately

---

### SCENE 4 — Main Query: The Real Capability *(target: 75 seconds)*

1. **Inject banner:** *"Now — a precise climate adaptation question."*
2. Hold 1 second
3. **Remove banner**
4. Type slowly: `How have rail networks protected tunnels and underground infrastructure from extreme heat?`
5. Press Enter
6. Wait until answer text is stable for 1.5 seconds
7. **Inject banner:** *"Cases retrieved. Answer synthesised."*
8. Hold 3 seconds on the answer text (ensure it is in view)
9. **Remove banner**
10. Slow scroll down to reveal case study cards
11. **Inject banner:** *"Drill into the detail when you need it."*
12. Click the first case study card (use its `aria-label` to identify it)
13. Wait for the expanded detail view to fully render (1.5 seconds stable)
14. **Take screenshot:** `shot-03-card-expanded`
15. Hold 3 seconds
16. **Remove banner**
17. Close or collapse the card (look for a close/collapse button within the expanded card)
18. Scroll back up to bring the answer and "Ask a follow-up →" button into view

---

### SCENE 5 — Follow-Up Conversation *(target: 75 seconds)*

1. **Inject banner:** *"This is the new capability — a conversation with your project archive."*
2. Hold 2 seconds
3. **Remove banner**
4. Click the button with text `Ask a follow-up →`
   - This opens the chat panel. Wait for it to fully open (1.5 seconds)
5. Locate the chat input (it has placeholder text `Ask a question...`)
6. Click the input. Type slowly: `Which of those cases involved retrofitting rather than designing from scratch?`
7. Press Enter. Wait for response to finish streaming.
8. Hold 3 seconds on the response.

9. Click the chat input again. Type slowly: `What were the main cost drivers?`
10. Press Enter. Wait for response to finish streaming.
11. Hold 3 seconds on the response.

12. **Inject banner:** *"From question to bid-ready insight — in one conversation."*
13. Click the chat input again. Type slowly: `Give me three bullet points I could use in a bid for a UK metro project.`
14. Press Enter. Wait for response to finish streaming.
15. **Take screenshot:** `shot-04-followup-3`
16. Hold 5 seconds on the final response — let it breathe.
17. **Remove banner**

---

### SCENE 6 — Build a Brief *(target: 45 seconds)*

1. Look for a link containing text `Build brief from` — this appears below the answer area on the main page. If the chat panel is open, close it first by pressing Escape or clicking outside it.
2. If the "Build brief" link is visible, click it. If not, navigate directly to `http://localhost:3000/handbook/brief`.
3. Wait for the Brief page to fully load.
4. **Inject banner:** *"Build a Brief — synthesise multiple cases into one view."*
5. Hold 2 seconds
6. **Remove banner**
7. Slow scroll through each section of the brief, pausing ~2 seconds per section:
   - Executive Summary
   - Climate Drivers
   - Adaptation Approaches
   - Costs & Resourcing
   - Transfer Intelligence
   - Key Insight
   - Source References
8. At each section, **inject a small label** in the top-right corner (use a smaller, less intrusive overlay — `position: fixed; top: 12px; right: 16px; font-size: 12px; background: rgba(0,0,0,0.6); color: #fff; padding: 4px 10px; border-radius: 4px;`) showing the section name, then remove it before the next section.
9. After reaching the bottom, hold 3 seconds.
10. **Take screenshot:** `shot-05-brief`
11. **Inject banner:** *"Synthesise. Refine. Share."*
12. Hold 3 seconds
13. **Remove banner**

---

### CLOSE *(target: 10 seconds)*

1. **Inject banner:** *"HIVE Handbook — built for people who find cases, not just file them."*
2. Hold 5 seconds
3. **Remove banner**
4. Task complete. Return a summary of: which screenshots were captured, any scenes where fallback queries were used, any elements that could not be found, and the total elapsed time.

---

## SUCCESS CRITERIA SUMMARY

| Scene | Done when... |
|---|---|
| 1 — Landing | Hero visible, banner shown and removed |
| 2 — Broad query | Answer stable, cards visible, banner shown |
| 3 — Out-of-scope | Response visible, redirected gracefully |
| 4 — Main query | Answer stable, card expanded and collapsed |
| 5 — Follow-ups | All 3 answers streamed, final held 5s |
| 6 — Brief | All 7 sections scrolled, bottom reached |

---

## IF YOU GET STUCK

- If an element can't be found by `aria-label`, take a fresh snapshot and identify the nearest matching element by role and visible text
- If the AI response does not appear within 15 seconds, scroll the input into view and re-submit once
- If the chat panel does not open via "Ask a follow-up →", look for a chat icon button in the top navigation bar
- Never repeat the same failing action more than twice — if blocked, skip the step, note it in your final report, and continue

---

*Prompt version: v1.0 — May 2026*
