"use client";

import { useState, useMemo } from "react";
import { SECTORS, ASSET_TYPES, HAZARD_CAUSES, HAZARD_EFFECTS, CASE_STUDIES } from "@/lib/hive/seed-data-legacy";

// ── ICONS ─────────────────────────────────────────────────────────────────────

const ShareIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>
);

const SearchIcon = ({ size = 16 }: { size?: number }) => (
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

function CaseStudyCard({ cs, onExpand }: { cs: (typeof CASE_STUDIES)[number]; onExpand: (cs: (typeof CASE_STUDIES)[number]) => void }) {
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

function DetailModal({ cs, onClose }: { cs: (typeof CASE_STUDIES)[number] | null; onClose: () => void }) {
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

function OptionsTableView({ cases }: { cases: typeof CASE_STUDIES }) {
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

export default function TRIBHandbookLegacy() {
  const [view, setView] = useState<"cases" | "table">("cases");
  const [sector, setSector] = useState("");
  const [asset, setAsset] = useState("");
  const [hazardCause, setHazardCause] = useState("");
  const [hazardEffect, setHazardEffect] = useState("");
  const [searched, setSearched] = useState(false);
  const [expanded, setExpanded] = useState<(typeof CASE_STUDIES)[number] | null>(null);
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
          <span style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: 20, color: "#2e6b5e", letterSpacing: "0.01em" }}>
            TRIB - CLIMATE ADAPTATION HIVE
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <a href="/hive" style={{ fontSize: 14, color: "#2e6b5e", fontWeight: 600, textDecoration: "none" }}>Explore HIVE</a>
            {["About", "Credits", "Contact Us"].map(l => (
              <a key={l} href="#" style={{ fontSize: 14, color: "#333", textDecoration: "none", fontFamily: "Arial, sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.color = "#2e6b5e"}
                onMouseLeave={e => e.currentTarget.style.color = "#333"}>{l}</a>
            ))}
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

      {view === "cases" && (
        <>
          <div style={{ background: "#f0ebe0", padding: "48px 32px 40px" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "start" }}>
              <div style={{ paddingTop: 20 }}>
                <p style={{ fontSize: 26, fontWeight: 400, color: "#888", lineHeight: 1.4, fontFamily: "Arial, sans-serif", maxWidth: 400 }}>
                  Explore and contribute resources and best practices for climate change adaptation from all transport modes
                </p>
              </div>
              <div>
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
                <div style={{ fontSize: 12, color: "#555", lineHeight: 1.65, marginBottom: 16, fontFamily: "Arial, sans-serif", fontStyle: "italic" }}>
                  <p style={{ marginBottom: 3 }}><strong>Disclaimer:</strong></p>
                  <p style={{ marginBottom: 3 }}>If you do not select any filters, the full case study library will be shown</p>
                  <p style={{ marginBottom: 10 }}>Please note that the selected hazard cause and hazard effect may not always be compatible.</p>
                  <p style={{ marginBottom: 3 }}>
                    Before selecting the right adaptation method, it is important that you conduct a full{" "}
                    <a href="#" style={{ color: "#1a0dab", textDecoration: "underline" }}>climate risk assessment</a>
                  </p>
                </div>
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

          <div style={{ background: "#f5c6cb", padding: "14px 32px" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#333", fontFamily: "Arial, sans-serif" }}>
                {searched && sector ? `Sector: ${sector}` : "Risk not provided"}
              </h2>
            </div>
          </div>

          <div style={{ background: "#fff3cd", padding: "14px 32px 20px" }}>
            <div style={{ maxWidth: 1060, margin: "0 auto" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#333", marginBottom: 14, fontFamily: "Arial, sans-serif" }}>
                {searched && asset ? `Asset: ${asset}` : "Asset not provided"}
              </h2>
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

      {view === "table" && (
        <div style={{ background: "#f0ebe0", minHeight: "80vh" }}>
          <OptionsTableView cases={CASE_STUDIES} />
        </div>
      )}

      <DetailModal cs={expanded} onClose={() => setExpanded(null)} />

      <footer style={{ background: "#2e6b5e", color: "#fff", padding: "24px 32px", fontFamily: "Arial, sans-serif" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>TRIB — Climate Adaptation HIVE</span>
          <span style={{ fontSize: 12, opacity: 0.7 }}>Transport Research & Innovation Board · © 2024</span>
        </div>
      </footer>
    </div>
  );
}
