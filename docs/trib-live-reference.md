# TRIB live site reference (Firecrawl + plan)

**What allows a 1:1 copy:** (1) Same HTML structure and sectioning as live. (2) Same CSS: colours, fonts, spacing, background bands. (3) Same assets: use live image URLs or download to `public/images/trib/` via `scripts/download-trib-images.mjs`. (4) Same interactions: expand/collapse, table layout (Workstream | Component | Target output end year), timeline dots. (5) Full roadmap data: four workstreams; roadmap static media at `https://trib.org.uk/roadmap/static/media/`.

**Layout (from live, confirmed):**
- **Homepage — Our Members:** The "Our Members" *heading* sits on the teal band (#21808B). The *logo strip* (member logos) sits on a **white** background section below it, not on the teal band.
- **Roadmap:** Vision text + "View Roadmap" / "Hide Roadmap"; then interactive table (Workstream | Component | Target output end year 2023-2025 | 2026-2030 | 2031-2035). Background image and SVG icons: run `node scripts/download-roadmap-images.mjs` to save to `public/images/trib/roadmap/` and reuse locally. Full workstreams 2–4 and remaining components can be added to `data/roadmap/RoadmapContent.json` from Firecrawl/GitHub.
- **Handbook:** Header: "TRIB - CLIMATE ADAPTATION HIVE" + nav (Home, Handbook, Roadmap, About, Credits, Contact Us) + search. Tabs Case Study View | Options Table View; filters: Transport Sector, Asset Type, Climate Hazard (Cause), Climate Hazard (Effect); disclaimer + links; case study cards with "Go to resource"; Options table with columns when data loaded.

---

Source: https://trib.org.uk/ (homepage, /handbook, /roadmap). Firecrawl scrape + user spec.

---

## Homepage (trib.org.uk)

### Content
- **About:** The Transport Research and Innovation Board (TRIB) brings together representatives from key organisations that fund and carry out research and innovation in the UK, as well as government departments with an interest in transport. For more information: [see more](https://www.gov.uk/government/groups/transport-research-and-innovation-board).
- **Objectives:** join-up leaders; join-up activities; leverage funding; facilitate demonstrators; engage globally; create a line of sight to government priorities.
- **Projects:** Two cards:
  1. **Roadmap and Vision** → /roadmap — "Our Vision is to enable a trusted ecosystem of connected digital twins for multi-modal UK transport networks..."
  2. **Climate Adaptation Hive** → /handbook — "This tool has been developed to assess the opportunities and benefits of adopting a cross-industry approach to sharing best practice in climate adaptation..."
- **Our Members:** Logos (DfT, CPC, MCA, Network Rail, UKRI, HVM Catapult, NDTP, National Highways, ADEPT, HS2, Innovate UK, EPSRC, DSIT, RSSB, Aerospace Technology Institute).

### Branding (homepage)
- colorScheme: light
- colors: primary #21808B, accent #21BA45, background #FFFFFF, textPrimary #212121, link #21BA45
- fonts: Helvetica Neue, Roboto (body); heading Lato/Helvetica Neue
- fontSizes: h1 28px, h2 28px, body 14.67px
- borderRadius: 4px

---

## Handbook (trib.org.uk/handbook)

### Content
- Tabs: "Case Study View" | "Options Table View"
- Headline: "Explore and contribute resources and best practices for climate change adaptation from all transport modes"
- Filters: Transport Sector, Asset Type, Climate Hazard (Cause), Climate Hazard (Effect)
- Transport sectors: Aviation, Maritime, Rail, Roads, Other sectors transferable to transport
- Hazard cause: Heavy rainfall, Sea level rise, High temperatures, etc.
- Hazard effect: Water damage, Wildfire, Pests and diseases, etc.
- Disclaimer text + link to climate risk assessment; link to "Find risk assessment policy and guidance"

### Branding (handbook)
- colors: primary #21BA45, accent #007BFF, background #FFFFFF, textPrimary #212121, link #DB2828
- buttonPrimary: background #007BFF, text #FFFFFF, borderRadius 5px
- buttonSecondary: background #D5D5D5, text #7A7878, borderRadius 5px
- input: background #BBF7D0, borderRadius 5px
- fontSizes: h1 32px, h2 32px, body 16px

---

## Roadmap (trib.org.uk/roadmap)

### Content
- **2035 Vision:** "Our Vision is to enable a trusted ecosystem of connected digital twins for multi-modal UK transport networks. This will facilitate effective decision making to optimise solutions and deliver efficient, safe, and environmentally conscious mobility for people and goods."
- Bullet list of what the Roadmap will do
- "View Roadmap" button; "Back" control
- Workstreams: 1 Strategy and innovation, 2 Enabling environment, 3 People skills and culture, 4 Technology and data — with components, outputs, activities, key contributors (Academia, Industry, Government, Innovation Funding Bodies)
- Table structure: Workstream | Component | Target output end year (2023-2025, 2026-2030, 2031-2035)
- "Learn More" → /roadmap/About

### Branding (roadmap)
- colors: primary #15335E, accent #9DEDDA, background #FFFFFF, textPrimary #15335E, link #15335E
- buttonPrimary: background #15335E, text #FFFFFF, borderRadius 10px
- buttonSecondary: background #C3EAFE, text #15335E
- fontSizes: h1 40px, h2 20px, body 20px
- Roboto fonts
