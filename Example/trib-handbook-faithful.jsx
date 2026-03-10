import { useState, useMemo } from "react";

// ── SEED DATA ─────────────────────────────────────────────────────────────────
// Replace with Supabase queries in Phase 3

const SECTORS = ["Rail", "Aviation", "Maritime", "Highways"];

const ASSET_TYPES = {
  Rail: ["Track & Signalling", "Stations", "Rolling Stock", "Bridges & Viaducts", "Tunnels", "Earthworks & Embankments", "Drainage Systems"],
  Aviation: ["Runways & Aprons", "Terminal Buildings", "Air Traffic Control", "Ground Support Equipment", "Fuel Infrastructure"],
  Maritime: ["Port Structures", "Sea Walls & Defences", "Locks & Canals", "Vessel Infrastructure", "Navigation Aids"],
  Highways: ["Roads & Carriageways", "Bridges", "Tunnels", "Drainage", "Signage & Lighting", "Earthworks"],
};

const HAZARD_CAUSES = [
  "Flooding", "Heavy Rainfall", "High Temperatures", "Drought",
  "Strong Winds", "Sea Level Rise", "Storm Surge", "Freeze-Thaw Cycles",
  "Ground Movement", "Wildfire", "Coastal Erosion", "Fog",
];

const HAZARD_EFFECTS = [
  "Track Buckling", "Asset Flooding", "Structural Damage", "Overheating of Equipment",
  "Embankment Failure", "Landslide / Rockfall", "Reduced Visibility", "Surface Degradation",
  "Erosion", "Bridge Scour", "Power Supply Disruption", "Signal Failure",
];

const CASE_STUDIES = [
  {
    id: 1, sector: "Maritime", asset: "Port Structures", year: "2019",
    title: "Port of Calais Extension",
    measure: "Port extension",
    description: "A port extension and new seawall designed to accommodate more and larger ships while protecting the port from rising sea level and storm surges.",
    fullDescription: "The Port of Calais expansion project involved the construction of a new 740m breakwater and a new 2.2km² port basin. The project was specifically designed to accommodate the next generation of large ferries and freight vessels while also providing enhanced protection against rising sea levels and increasingly severe storm surge events. Environmental impact assessments were conducted to mitigate effects on marine habitats.",
    hazardCause: "Sea Level Rise", hazardEffect: "Structural Damage",
    sourceUrl: "#", sourceLabel: "Port of Calais Authority",
  },
  {
    id: 2, sector: "Maritime", asset: "Sea Walls & Defences", year: "2016",
    title: "Port of Calais Sea Defence",
    measure: "Sea defence",
    description: "A port extension and new seawall designed to accommodate more and larger ships while protecting the port from rising sea level and storm surges.",
    fullDescription: "Integrated sea defence improvements at the Port of Calais involved raising existing sea walls, installing new tidal gates, and strengthening coastal protection infrastructure. The works were designed to a 1-in-200-year storm standard, accounting for projected sea level rise to 2100.",
    hazardCause: "Storm Surge", hazardEffect: "Asset Flooding",
    sourceUrl: "#", sourceLabel: "Port of Calais Sea Defence Report",
  },
  {
    id: 3, sector: "Rail", asset: "Bridges & Viaducts", year: "2012",
    title: "New locks in the Albert Canal",
    measure: "Archimedes screws installed in pumping",
    description: "Archimedes screws are hydraulic machines that consist of a screw inside a hollow shaft. They are designed to raise water up through the shaft and are often powered by motors. During periods of drought, the screws pump water back up the canal that is lost due to a ship passing through a lock.",
    fullDescription: "Installation of the screws began in 2012 at the Ham lock system, and these are one of the largest Archimedes screws in the world. Archimedes screws were installed at six lock systems along the Albert Canal. The installation of the screws was preceded by extensive engagement with stakeholders including shipping representatives, power companies, nature protection organisations, and drinking water supply companies. The Archimedes screws were identified as the preferred option after the effectiveness and costs were analysed and environmental considerations were assessed, particularly the preservation of fish migration and noise mitigation.",
    hazardCause: "Drought", hazardEffect: "Surface Degradation",
    sourceUrl: "#", sourceLabel: "Flanders Hydraulics Research",
  },
  {
    id: 4, sector: "Rail", asset: "Earthworks & Embankments", year: "2022",
    title: "Austrian Federal Railways Climate Adaptation Measures",
    measure: "Rockfall barriers",
    description: "Rockfall barriers to mitigate landslide and rockfall risks.",
    fullDescription: "Between 2022 and 2023, ÖBB raised the length of rockfall and avalanche barriers installed from 204 to 212 km and delivered 0.3 km of new torrent control barriers bringing the total installed length to 2.1 km.",
    hazardCause: "Ground Movement", hazardEffect: "Landslide / Rockfall",
    sourceUrl: "#", sourceLabel: "ÖBB Annual Sustainability Report",
  },
  {
    id: 5, sector: "Rail", asset: "Drainage Systems", year: "2022",
    title: "Austrian Federal Railways Climate Adaptation Measures",
    measure: "Drainage systems",
    description: "Installation of improved drainage systems to manage water runoff.",
    fullDescription: "ÖBB installed improved drainage systems and flood retention basins to manage water runoff during extreme precipitation events.",
    hazardCause: "Heavy Rainfall", hazardEffect: "Asset Flooding",
    sourceUrl: "#", sourceLabel: "ÖBB Annual Sustainability Report",
  },
  {
    id: 6, sector: "Rail", asset: "Earthworks & Embankments", year: "2022",
    title: "Austrian Federal Railways Climate Adaptation Measures",
    measure: "Slope stabilisation",
    description: "Slope stabilisation to mitigate landslide and rockfall risks.",
    fullDescription: "A functional and stable protective forest is an important safeguarding measure protecting infrastructure against landslides, mudslides or avalanches. ÖBB focuses on preserving the area of managed protected forest, which in the period 2021 to 2023 remained constant at 3,370 hectares.",
    hazardCause: "Ground Movement", hazardEffect: "Landslide / Rockfall",
    sourceUrl: "#", sourceLabel: "ÖBB Annual Sustainability Report",
  },
  {
    id: 7, sector: "Rail", asset: "Drainage Systems", year: "2022",
    title: "Austrian Federal Railways Climate Adaptation Measures",
    measure: "Flood defences",
    description: "Installation of flood retention basins to manage water runoff.",
    fullDescription: "ÖBB installed improved drainage systems and flood retention basins to manage water runoff during extreme precipitation events.",
    hazardCause: "Flooding", hazardEffect: "Asset Flooding",
    sourceUrl: "#", sourceLabel: "ÖBB Annual Sustainability Report",
  },
  {
    id: 8, sector: "Highways", asset: "Roads & Carriageways", year: "2021",
    title: "Phoenix Cool Pavement Programme",
    measure: "Cool pavement coating",
    description: "Reflective pavement coatings applied to city streets to reduce surface temperatures and mitigate urban heat island effects.",
    fullDescription: "The City of Phoenix applied cool pavement coatings across 70 miles of residential streets. The coatings reduced pavement surface temperatures by up to 10–12°F compared to untreated asphalt. The programme also reduced ambient air temperatures in treated neighbourhoods. An environmental justice lens was applied to prioritise historically underserved communities with highest heat exposure.",
    hazardCause: "High Temperatures", hazardEffect: "Surface Degradation",
    sourceUrl: "#", sourceLabel: "City of Phoenix Office of Heat Response",
  },
  {
    id: 9, sector: "Rail", asset: "Track & Signalling", year: "2019",
    title: "Network Rail Continuous Welded Rail Management",
    measure: "Rail stress management programme",
    description: "Heat-related rail buckling prevention through rail neutral temperature management and speed restrictions.",
    fullDescription: "Network Rail operates a comprehensive rail stress management programme to prevent buckling during high temperatures. This includes regular measurement of rail neutral temperature, targeted destressing works to relieve compressive stress, speed restrictions at temperatures above 27°C where risk is highest, and emergency response protocols for extreme heat events.",
    hazardCause: "High Temperatures", hazardEffect: "Track Buckling",
    sourceUrl: "#", sourceLabel: "Network Rail Engineering Standards",
  },
  {
    id: 10, sector: "Highways", asset: "Roads & Carriageways", year: "2018",
    title: "Sheffield Grey to Green Corridor",
    measure: "Urban drainage street design",
    description: "Conversion of a road carriageway to a green urban drainage corridor using sustainable drainage systems.",
    fullDescription: "The Grey to Green project in Sheffield city centre converted 1.3km of dual carriageway into a green linear park incorporating sustainable drainage systems. The scheme manages surface water through rain gardens, swales, and permeable surfaces, reducing flood risk and improving biodiversity. The project won multiple national awards and has informed the design of subsequent urban drainage schemes.",
    hazardCause: "Flooding", hazardEffect: "Asset Flooding",
    sourceUrl: "#", sourceLabel: "Sheffield City Council",
  },
  {
    id: 11, sector: "Aviation", asset: "Runways & Aprons", year: "2020",
    title: "Heathrow Airport Surface Water Management",
    measure: "Balancing ponds and attenuation",
    description: "A network of balancing ponds constructed to attenuate surface water runoff from the airport campus and prevent downstream flooding.",
    fullDescription: "Heathrow Airport operates an extensive surface water management system including 14 attenuation ponds with a total storage capacity of over 200,000m³. The system is designed to manage a 1-in-100-year storm event plus an allowance for climate change. Ongoing monitoring informs continuous improvement to the system's capacity and performance.",
    hazardCause: "Heavy Rainfall", hazardEffect: "Asset Flooding",
    sourceUrl: "#", sourceLabel: "Heathrow Airport Ltd",
  },
  {
    id: 12, sector: "Rail", asset: "Track & Signalling", year: "2023",
    title: "Deutsche Bahn Climate Adaptation Programme",
    measure: "Heat monitoring and speed restrictions",
    description: "Comprehensive heat monitoring network across the rail infrastructure with automated speed restriction triggers.",
    fullDescription: "Deutsche Bahn has deployed over 1,000 temperature sensors along the rail network that feed into an automated monitoring system. When track temperatures exceed threshold values, automated speed restrictions are applied to reduce thermal stress on rails and prevent buckling. The system is integrated with weather forecasting to allow proactive rather than reactive responses.",
    hazardCause: "High Temperatures", hazardEffect: "Track Buckling",
    sourceUrl: "#", sourceLabel: "Deutsche Bahn Sustainability Report 2023",
  },
];

// ── ICONS ─────────────────────────────────────────────────────────────────────

const ShareIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const AccessibilityIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e6b5e" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="8" r="1.5" fill="#2e6b5e"/>
    <path d="M8 12h8M12 12v4" strokeLinecap="round"/>
    <path d="M9.5 16l1.5-4 1.5 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ── CASE STUDY CARD ───────────────────────────────────────────────────────────

function CaseStudyCard({ cs, onExpand }) {
  return (
    <div style={{
      background: "#ffffff",
      border: "1px solid #d8d8d8",
      padding: "20px 22px 0",
      marginBottom: 0,
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Type label */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <ShareIcon size={14} color="#666" />
        <span style={{ fontSize: 13, color: "#555", fontFamily: "Arial, sans-serif" }}>Case Study</span>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: 20,
        fontWeight: 700,
        color: "#2e6b5e",
        lineHeight: 1.3,
        marginBottom: 10,
        fontFamily: "Arial, sans-serif",
      }}>{cs.title}</h3>

      {/* Measure subtitle */}
      <p style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#333",
        marginBottom: 10,
        fontFamily: "Arial, sans-serif",
      }}>{cs.measure}</p>

      {/* Description */}
      <p style={{
        fontSize: 13.5,
        color: "#444",
        lineHeight: 1.65,
        marginBottom: 18,
        fontFamily: "Arial, sans-serif",
        flex: 1,
      }}>{cs.description}</p>

      {/* Resource button */}
      <button
        onClick={() => onExpand(cs)}
        style={{
          width: "100%",
          background: "#1a1a2e",
          color: "#ffffff",
          border: "none",
          padding: "13px 0",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: "Arial, sans-serif",
          marginTop: "auto",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#2c2c4a"}
        onMouseLeave={e => e.currentTarget.style.background = "#1a1a2e"}
      >
        <ShareIcon size={15} color="#fff" />
        Go to resource
      </button>
    </div>
  );
}

// ── CASE STUDY DETAIL MODAL ───────────────────────────────────────────────────

function DetailModal({ cs, onClose }) {
  if (!cs) return null;
  return (
    <div
      style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background:"#fff",maxWidth:680,width:"100%",maxHeight:"85vh",overflowY:"auto",padding:36,position:"relative",fontFamily:"Arial, sans-serif" }}>
        <button onClick={onClose} style={{ position:"absolute",top:16,right:16,background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#666",lineHeight:1 }}>×</button>
        <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:14 }}>
          <ShareIcon size={13} color="#666" />
          <span style={{ fontSize:13,color:"#555" }}>Case Study</span>
        </div>
        <h2 style={{ fontSize:24,fontWeight:700,color:"#2e6b5e",marginBottom:10,lineHeight:1.3 }}>{cs.title}</h2>
        <p style={{ fontSize:15,fontWeight:700,color:"#333",marginBottom:18 }}>{cs.measure}</p>
        <p style={{ fontSize:14,color:"#444",lineHeight:1.75,marginBottom:22 }}>{cs.fullDescription}</p>
        <div style={{ background:"#f5f0e4",padding:"14px 18px",marginBottom:20,fontSize:13,color:"#444",lineHeight:1.65 }}>
          <strong>Sector:</strong> {cs.sector} &nbsp;|&nbsp; <strong>Hazard (Cause):</strong> {cs.hazardCause} &nbsp;|&nbsp; <strong>Hazard (Effect):</strong> {cs.hazardEffect}
        </div>
        <a href={cs.sourceUrl} target="_blank" rel="noreferrer" style={{ display:"inline-flex",alignItems:"center",gap:8,background:"#1a1a2e",color:"#fff",padding:"12px 24px",textDecoration:"none",fontSize:14,fontWeight:500 }}>
          <ShareIcon size={14} color="#fff" /> Visit source
        </a>
      </div>
    </div>
  );
}

// ── OPTIONS TABLE VIEW ────────────────────────────────────────────────────────

function OptionsTableView({ cases }) {
  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px", fontFamily: "Arial, sans-serif" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#2e6b5e", color: "#fff" }}>
            {["Title","Sector","Measure","Hazard (Cause)","Hazard (Effect)","Year"].map(h => (
              <th key={h} style={{ padding: "11px 14px", textAlign: "left", fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.map((cs, i) => (
            <tr key={cs.id} style={{ background: i % 2 === 0 ? "#fff" : "#f7f3eb", borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "10px 14px", color: "#2e6b5e", fontWeight: 600 }}>{cs.title}</td>
              <td style={{ padding: "10px 14px" }}>{cs.sector}</td>
              <td style={{ padding: "10px 14px" }}>{cs.measure}</td>
              <td style={{ padding: "10px 14px" }}>{cs.hazardCause}</td>
              <td style={{ padding: "10px 14px" }}>{cs.hazardEffect}</td>
              <td style={{ padding: "10px 14px" }}>{cs.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function TRIBHandbook() {
  const [view, setView] = useState("cases"); // "cases" | "table"
  const [sector, setSector] = useState("");
  const [asset, setAsset] = useState("");
  const [hazardCause, setHazardCause] = useState("");
  const [hazardEffect, setHazardEffect] = useState("");
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [navSearch, setNavSearch] = useState("");

  const availableAssets = sector ? ASSET_TYPES[sector] || [] : Object.values(ASSET_TYPES).flat();

  const filteredCases = useMemo(() => {
    if (!searched) return CASE_STUDIES;
    return CASE_STUDIES.filter(cs => {
      if (sector && cs.sector !== sector) return false;
      if (asset && cs.asset !== asset) return false;
      if (hazardCause && cs.hazardCause !== hazardCause) return false;
      if (hazardEffect && cs.hazardEffect !== hazardEffect) return false;
      return true;
    });
  }, [searched, sector, asset, hazardCause, hazardEffect]);

  const noSector = searched && !sector;
  const noAsset = searched && !asset;

  function handleExplore() {
    setSearched(true);
  }

  function handleReset() {
    setSector(""); setAsset(""); setHazardCause(""); setHazardEffect(""); setSearched(false);
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", background: "#f0ebe0" }}>
      {/* ── HEADER ── */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #ddd", padding: "0 32px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {/* Logo */}
          <span style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: 20, color: "#2e6b5e", letterSpacing: "0.01em" }}>
            TRIB - CLIMATE ADAPTATION HIVE
          </span>

          {/* Nav right */}
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {["About", "Credits", "Contact Us"].map(l => (
              <a key={l} href="#" style={{ fontSize: 14, color: "#333", textDecoration: "none", fontFamily: "Arial, sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.color = "#2e6b5e"}
                onMouseLeave={e => e.currentTarget.style.color = "#333"}>{l}</a>
            ))}
            {/* Search box */}
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #bbb", background: "#f9f9f9", borderRadius: 2, padding: "5px 10px", gap: 6 }}>
              <SearchIcon size={14} />
              <input
                value={navSearch} onChange={e => setNavSearch(e.target.value)}
                placeholder="Search..."
                style={{ border: "none", background: "none", outline: "none", fontSize: 13, width: 120, fontFamily: "Arial, sans-serif" }}
              />
            </div>
            <AccessibilityIcon />
          </div>
        </div>
      </header>

      {/* ── VIEW TOGGLE ── */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #ddd", padding: "10px 32px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", gap: 8 }}>
          <button
            onClick={() => setView("cases")}
            style={{
              background: view === "cases" ? "#0066cc" : "#e0e0e0",
              color: view === "cases" ? "#fff" : "#333",
              border: "none", padding: "8px 22px", fontSize: 14, fontWeight: 500,
              cursor: "pointer", borderRadius: 3, fontFamily: "Arial, sans-serif",
              transition: "background 0.15s",
            }}
          >Case Study View</button>
          <button
            onClick={() => setView("table")}
            style={{
              background: view === "table" ? "#0066cc" : "#e0e0e0",
              color: view === "table" ? "#fff" : "#333",
              border: "none", padding: "8px 22px", fontSize: 14, fontWeight: 500,
              cursor: "pointer", borderRadius: 3, fontFamily: "Arial, sans-serif",
              transition: "background 0.15s",
            }}
          >Options Table View</button>
        </div>
      </div>

      {/* ── MAIN FILTER AREA (Case Study View only) ── */}
      {view === "cases" && (
        <>
          <div style={{ background: "#f0ebe0", padding: "48px 32px 40px" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>

              {/* Left — hero text */}
              <div style={{ paddingTop: 20 }}>
                <p style={{ fontSize: 26, fontWeight: 400, color: "#888", lineHeight: 1.4, fontFamily: "Arial, sans-serif", maxWidth: 400 }}>
                  Explore and contribute resources and best practices for climate change adaptation from all transport modes
                </p>
              </div>

              {/* Right — filters */}
              <div>
                {/* Transport Sector */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 5, fontFamily: "Arial, sans-serif" }}>Transport Sector</label>
                  <select
                    value={sector} onChange={e => { setSector(e.target.value); setAsset(""); }}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 14, border: "1px solid #999", background: "#c8e6c9", cursor: "pointer", fontFamily: "Arial, sans-serif", outline: "none" }}
                  >
                    <option value="">-- Select a transport sector --</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Asset Type */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 5, fontFamily: "Arial, sans-serif" }}>Asset Type</label>
                  <select
                    value={asset} onChange={e => setAsset(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 14, border: "1px solid #999", background: "#fff9c4", cursor: "pointer", fontFamily: "Arial, sans-serif", outline: "none" }}
                  >
                    <option value="">-- Select an asset type --</option>
                    {availableAssets.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                {/* Hazard Cause */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 5, fontFamily: "Arial, sans-serif" }}>Climate Hazard (Cause)</label>
                  <select
                    value={hazardCause} onChange={e => setHazardCause(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 14, border: "1px solid #999", background: "#ffcc80", cursor: "pointer", fontFamily: "Arial, sans-serif", outline: "none" }}
                  >
                    <option value="">-- Select a climate hazard (cause) --</option>
                    {HAZARD_CAUSES.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Hazard Effect */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#333", marginBottom: 5, fontFamily: "Arial, sans-serif" }}>Climate Hazard (Effect)</label>
                  <select
                    value={hazardEffect} onChange={e => setHazardEffect(e.target.value)}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 14, border: "1px solid #999", background: "#ffcc80", cursor: "pointer", fontFamily: "Arial, sans-serif", outline: "none" }}
                  >
                    <option value="">-- Select a climate hazard (effect) --</option>
                    {HAZARD_EFFECTS.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                {/* Disclaimer */}
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.65, marginBottom: 16, fontFamily: "Arial, sans-serif", fontStyle: "italic" }}>
                  <p style={{ marginBottom: 3 }}><strong>Disclaimer:</strong></p>
                  <p style={{ marginBottom: 3 }}>If you do not select any filters, the full case study library will be shown</p>
                  <p style={{ marginBottom: 3 }}>Any number of filters can be selected to refine the case studies returned</p>
                  <p style={{ marginBottom: 10 }}>Please note that the selected hazard cause and hazard effect may not always be compatible. If non-complementary causes and effects are chosen, and no multi-adaptation measures exist for the case study, the query may return no results</p>
                  <p style={{ marginBottom: 3 }}>
                    Before selecting the right adaptation method, it is important that you conduct a full{" "}
                    <a href="#" style={{ color: "#1a0dab", textDecoration: "underline" }}>climate risk assessment</a>
                  </p>
                  <p>
                    <a href="#" style={{ color: "#1a0dab", textDecoration: "underline" }}>Find risk assessment policy and guidance</a>{" "}
                    from different organisations.
                  </p>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={handleExplore}
                    style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "10px 28px", fontSize: 14, fontWeight: 500, cursor: "pointer", borderRadius: 4, fontFamily: "Arial, sans-serif" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#2c2c4a"}
                    onMouseLeave={e => e.currentTarget.style.background = "#1a1a2e"}
                  >Explore</button>
                  {searched && (
                    <button
                      onClick={handleReset}
                      style={{ background: "none", color: "#555", border: "1px solid #bbb", padding: "10px 20px", fontSize: 14, cursor: "pointer", borderRadius: 4, fontFamily: "Arial, sans-serif" }}
                    >Reset</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── RISK BANNER ── */}
          <div style={{ background: "#f5c6cb", padding: "14px 32px" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#333", fontFamily: "Arial, sans-serif" }}>
                {searched && sector ? `Sector: ${sector}` : "Risk not provided"}
              </h2>
            </div>
          </div>

          {/* ── ASSET BANNER ── */}
          <div style={{ background: "#fff3cd", padding: "14px 32px 20px" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#333", marginBottom: 14, fontFamily: "Arial, sans-serif" }}>
                {searched && asset ? `Asset: ${asset}` : "Asset not provided"}
              </h2>

              {/* Upload / Suggest buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 720 }}>
                <button style={{ background: "#1a1a2e", color: "#fff", border: "none", padding: "13px 0", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "Arial, sans-serif", borderRadius: 3 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#2c2c4a"}
                  onMouseLeave={e => e.currentTarget.style.background = "#1a1a2e"}
                >
                  <UploadIcon /> Upload a resource
                </button>
                <button style={{ background: "#1a3a8a", color: "#fff", border: "none", padding: "13px 0", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "Arial, sans-serif", borderRadius: 3 }}
                  onMouseEnter={e => e.currentTarget.style.background = "#2a4fbb"}
                  onMouseLeave={e => e.currentTarget.style.background = "#1a3a8a"}
                >
                  <ShareIcon size={15} /> Suggest a link
                </button>
              </div>
            </div>
          </div>

          {/* ── CASE STUDY GRID ── */}
          <div style={{ background: "#f0ebe0", padding: "28px 32px 60px" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto" }}>
              {filteredCases.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 0", color: "#888", fontSize: 15, fontFamily: "Arial, sans-serif" }}>
                  No case studies match your selected filters. Try adjusting your selections.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {filteredCases.map(cs => (
                    <CaseStudyCard key={cs.id} cs={cs} onExpand={setExpanded} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── OPTIONS TABLE VIEW ── */}
      {view === "table" && (
        <div style={{ background: "#f0ebe0", minHeight: "80vh" }}>
          <OptionsTableView cases={CASE_STUDIES} />
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      <DetailModal cs={expanded} onClose={() => setExpanded(null)} />

      {/* ── FOOTER ── */}
      <footer style={{ background: "#2e6b5e", color: "#fff", padding: "24px 32px", fontFamily: "Arial, sans-serif" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>TRIB — Climate Adaptation HIVE</span>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Transport Research & Innovation Board · © 2024</span>
        </div>
      </footer>
    </div>
  );
}
