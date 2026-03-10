import { useState, useEffect, useRef } from "react";

// ── SHARED DATA ────────────────────────────────────────────────────────────────

const CS = [
  { id:"cs1", title:"Phoenix Cool Pavement Programme", sector:"Highways", hook:"100+ miles treated · 6°C surface reduction · $4.8m annual", hazards:{ cause:["High temperatures"], effect:["Road surface overheating"] }, summary:"Reflective CoolSeal coating applied to 100+ miles of residential roads to combat extreme urban heat island effect. Reduces surface temperatures by 6°C.", transferability:"Medium", transferabilityNote:"Directly applicable to UK cities. London hotspots 4.5°C warmer at night than surrounding areas.", costBand:"£1m–£10m", location:"Phoenix, USA", year:"2021–ongoing", insight:"Cool pavement extends road longevity by reducing thermal degradation — delivering avoided maintenance costs beyond the cooling benefit.", tags:["highways","roads","heat","heatwave","pavement","surface temperature"] },
  { id:"cs2", title:"Sheffield Grey to Green", sector:"Highways", hook:"60% grey to green · discharge cut 80% · 561% biodiversity uplift", hazards:{ cause:["Heavy rainfall","Flooding"], effect:["Water damage","Infrastructure disruption"] }, summary:"1.5km urban green corridor replacing a former ring road with SuDS following the 2007 floods that caused £30m damage and closed Sheffield station.", transferability:"High", transferabilityNote:"The largest retrofit grey-to-green project in the UK. Applicable to rail corridors following river valleys and urban tram networks.", costBand:"£1m–£10m per phase", location:"Sheffield, UK", year:"2014–ongoing", insight:"SuDS reduced discharge from a 1-in-100-year event by 87% — from 69.6 to 9.2 litres/sec.", tags:["highways","rail","tram","flooding","SuDS","nature-based","drainage","rainfall"] },
  { id:"cs3", title:"Croydon Grid Flood Defence", sector:"Rail", hook:"69,000 customers protected · 1-in-1,000-year standard · £800k", hazards:{ cause:["Flooding – fluvial"], effect:["Power disruption","Loss of electricity to transport"] }, summary:"Permanent flood barriers at Croydon Grid substation protecting electricity supply to 69,000 homes including South London transport infrastructure.", transferability:"High", transferabilityNote:"Part of a programme protecting 119 substations. Directly relevant to rail electrification supply infrastructure across South East England.", costBand:"Under £1m (site)", location:"Croydon, London, UK", year:"2022–2023", insight:"Site-specific hardening at £800k — part of a £14m programme since 2010. Demonstrates high network resilience ROI.", tags:["energy","flooding","infrastructure","substation","flood barriers","rail electrification"] },
  { id:"cs4", title:"Heathrow Airport Balancing Ponds", sector:"Aviation", hook:"Year-round flow control · £2.1m bundled into wider programme", hazards:{ cause:["Heavy rainfall","Drought"], effect:["Flooding – fluvial","Surface water flooding"] }, summary:"Balancing ponds manage both drought and heavy rainfall, controlling water entering drainage and reducing flood risk to airport access routes.", transferability:"High", transferabilityNote:"Tilting weir systems directly applicable to other airports, ports, and urban transport infrastructure facing surface water flooding.", costBand:"£1m–£10m", location:"London, UK", year:"2016–2022", insight:"Integrating adaptation into planned development kept costs minimal — bundled with wider infrastructure rather than standalone spend.", tags:["aviation","flooding","drought","nature-based","drainage","water management"] },
  { id:"cs5", title:"Austrian Federal Railways Climate Adaptation", sector:"Rail", hook:"212km barriers · 3,370ha protected forest · sensors across Alpine network", hazards:{ cause:["Heavy rainfall","Storms","Freeze-thaw"], effect:["Landslides","Rockfalls","Flooding"] }, summary:"Comprehensive physical and predictive adaptations across the Alpine rail network combining slope stabilisation, barriers and geotechnical monitoring.", transferability:"High", transferabilityNote:"Rockfall barriers and slope stabilisation directly applicable to UK upland rail: Peak District, Scottish Highlands, and Welsh valley lines.", costBand:"Large programme", location:"Austria", year:"2005–present", insight:"Site-specific assessment was more effective than blanket solutions. Early warning systems reduced reactive maintenance costs significantly.", tags:["rail","landslide","flooding","sensors","monitoring","slope","rockfall","precipitation"] },
  { id:"cs6", title:"Port of Calais Extension and Sea Defence", sector:"Maritime", hook:"3.3km seawall · 100-year design life · €863m total", hazards:{ cause:["Sea level rise","Storms"], effect:["Storm surge","Coastal flooding","Erosion"] }, summary:"Doubled port capacity while building a 3.3km seawall designed for 100-year service life, explicitly accounting for sea level rise projections.", transferability:"High", transferabilityNote:"Directly applicable to UK ports facing sea level rise. Humber Ports specifically identified as having medium sea level rise risk.", costBand:"£100m+", location:"Calais, France", year:"2021", insight:"Treating climate resilience as a core design requirement from the outset allowed the seawall to be cost-effectively integrated into a wider upgrade.", tags:["maritime","ports","sea level rise","storm surge","coastal","flooding","seawall"] },
  { id:"cs7", title:"Deutsche Bahn Climate Adaptation Measures", sector:"Rail", hook:"25% storm damage reduction · 20% fewer heat disruptions · IoT across national network", hazards:{ cause:["High temperatures","Storms"], effect:["Vegetation dieback","Storm damage","Track overheating"] }, summary:"Phased adaptation combining air-conditioned rolling stock, AI-assisted vegetation management via satellite data, and IoT sensor networks.", transferability:"High", transferabilityNote:"Vegetation management and rolling stock AC directly applicable to UK rail. Highest priority in South and East England.", costBand:"Large programme", location:"Germany", year:"2007–2024", insight:"Vegetation management delivered 25% reduction in storm damage 2018–2020 — one of the highest ROI findings in the HIVE database.", tags:["rail","heat","vegetation","sensors","rolling stock","storms","heatwave"] },
];

const MQ = [
  {id:'m1',title:'Dawlish Sea Wall',sector:'Rail',measure:'Sea wall',hook:'8m height · recurve design'},
  {id:'m2',title:'Sheffield Grey to Green',sector:'Highways',measure:'SuDS',hook:'60% grey→green · 1.5km'},
  {id:'m3',title:'ÖBB Rockfall Barriers',sector:'Rail',measure:'Physical barriers',hook:'212km barriers installed'},
  {id:'m4',title:'Heathrow Balancing Ponds',sector:'Aviation',measure:'Water management',hook:'Year-round flow control · £2.1m'},
  {id:'m5',title:'Copenhagen Metro Waterproofing',sector:'Rail',measure:'Flood protection',hook:'Waterproof walls to 2.3m'},
  {id:'m6',title:'Phoenix Cool Pavements',sector:'Highways',measure:'Cool pavement',hook:'100+ miles · 6°C reduction'},
  {id:'m7',title:'Port of Calais Sea Defence',sector:'Maritime',measure:'Sea defence',hook:'3.3km seawall · 100ha basin'},
  {id:'m8',title:'Berlin Green Tram Tracks',sector:'Rail',measure:'Green tramways',hook:'22,000m+ green track'},
  {id:'m9',title:'Gatwick Clays Lake Scheme',sector:'Aviation',measure:'Flood storage',hook:'400,000 m³ capacity'},
  {id:'m10',title:'Panama Canal Conservation',sector:'Maritime',measure:'Water optimisation',hook:'Strategic conservation'},
  {id:'m11',title:'Leeds Flood Alleviation',sector:'Highways',measure:'Natural Flood Management',hook:'500,000 trees planted'},
  {id:'m12',title:'MTA Flood Protection',sector:'Rail',measure:'Flood barriers',hook:'3,000+ barriers installed'},
  {id:'m13',title:'ÖBB Early Warning Systems',sector:'Rail',measure:'Geotechnical sensors',hook:'Real-time monitoring network'},
  {id:'m14',title:'Hammersmith Bridge Cooling',sector:'Highways',measure:'Bridge deck cooling',hook:'Water spray system'},
  {id:'m15',title:'TfL Rainwater Harvesting',sector:'Rail',measure:'Rainwater harvesting',hook:'23,000 m³ recycled annually'},
  {id:'m16',title:'Network Rail CWR Tracks',sector:'Rail',measure:'Thermally resilient tracks',hook:'Continuous Welded Rail'},
  {id:'m17',title:'LA Metro Wetlands Park',sector:'Rail',measure:'Relocating infrastructure',hook:'46-acre wetlands park'},
  {id:'m18',title:'Albert Canal – Archimedes Screws',sector:'Maritime',measure:'Archimedes screws',hook:'Largest screws in the world'},
  {id:'m19',title:'Deutsche Bahn – ICE 4 Trains',sector:'Rail',measure:'Air-conditioned trains',hook:'AC rated to 45°C'},
  {id:'m20',title:'Infrabel Tension Release Devices',sector:'Rail',measure:'Tension release devices',hook:'Prevents buckling + fracturing'},
];

const SECTORS = ["Rail","Aviation","Maritime","Highways"];
const HAZARDS = ["Heavy rainfall","High temperatures","Storms","Sea level rise","Drought","Freeze-thaw"];

const SC = { Rail:["#EBF4FF","#1A4A8A"], Aviation:["#F3EEF9","#5B3FA0"], Maritime:["#E6F5EE","#156840"], Highways:["#FDF0E5","#9A4812"] };

const score = (cs, q) => {
  if (!q.trim()) return 1;
  const ql = q.toLowerCase(); let s = 0;
  if (cs.title.toLowerCase().includes(ql)) s += 10;
  if (cs.summary.toLowerCase().includes(ql)) s += 6;
  cs.tags.forEach(t => { if (t.includes(ql) || ql.includes(t)) s += 3; });
  [...cs.hazards.cause, ...cs.hazards.effect].forEach(h => { if (h.toLowerCase().includes(ql)) s += 5; });
  q.split(" ").filter(w=>w.length>3).forEach(w => cs.tags.forEach(t => { if(t.includes(w)) s+=2; }));
  return s;
};

const search = (q, sH, sS) => {
  let r = [...CS];
  if (sH.length) r = r.filter(cs => { const ah=[...cs.hazards.cause,...cs.hazards.effect]; return sH.some(h=>ah.some(ch=>ch.toLowerCase().includes(h.toLowerCase()))); });
  if (sS.length) r = r.filter(cs => sS.some(s=>cs.sector.toLowerCase()===s.toLowerCase()));
  if (q.trim()) r = r.map(cs=>({...cs,_s:score(cs,q)})).filter(cs=>cs._s>0).sort((a,b)=>b._s-a._s);
  return r;
};

const detect = q => {
  const ql=q.toLowerCase(); const dH=[],dS=[];
  if(ql.includes("flood")||ql.includes("water")||ql.includes("rain")||ql.includes("drainage")) dH.push("Heavy rainfall");
  if(ql.includes("heat")||ql.includes("hot")||ql.includes("temperature")) dH.push("High temperatures");
  if(ql.includes("storm")||ql.includes("wind")) dH.push("Storms");
  if(ql.includes("sea level")||ql.includes("coastal")||ql.includes("surge")) dH.push("Sea level rise");
  if(ql.includes("rail")||ql.includes("train")||ql.includes("track")) dS.push("Rail");
  if(ql.includes("aviation")||ql.includes("airport")) dS.push("Aviation");
  if(ql.includes("port")||ql.includes("maritime")) dS.push("Maritime");
  if(ql.includes("road")||ql.includes("highway")) dS.push("Highways");
  return { dH:[...new Set(dH)], dS:[...new Set(dS)] };
};

const synthesis = (results) => {
  if (!results.length) return null;
  const sectors = [...new Set(results.map(r=>r.sector))];
  const highT = results.filter(r=>r.transferability==="High");
  const allM = results.flatMap(r=>r.tags);
  const types = [];
  if(allM.some(t=>t.includes("sensor")||t.includes("monitoring"))) types.push("predictive monitoring");
  if(allM.some(t=>t.includes("barrier")||t.includes("wall")||t.includes("slope"))) types.push("physical protection");
  if(allM.some(t=>t.includes("nature")||t.includes("vegetation")||t.includes("SuDS"))) types.push("nature-based approaches");
  const insight = results.length===1 ? results[0].insight
    : types.length>=2 ? `A consistent pattern: ${types.slice(0,2).join(" and ")} are deployed together. ${highT.length} of ${results.length} cases have explicitly identified UK applicability.`
    : `${highT.length} of ${results.length} cases have high UK transferability. Proactive adaptation integrated into planned maintenance consistently delivers lower cost than reactive repair.`;
  return { count:results.length, sectors, highT:highT.length, insight };
};

// ── DIRECTION A: SIGNAL (improved) ─────────────────────────────────────────────

const A = {
  bg:"#07101C", panel:"#0C1828", raised:"#11223A", border:"#1A3050",
  cream:"#EDE8DE",          // titles — unchanged, high contrast
  gold:"#C5A24A",           // accents
  goldFade:"rgba(197,162,74,0.13)", goldBorder:"rgba(197,162,74,0.32)",
  body:"#A8BFCF",           // body text — was #5A7494, now much lighter
  meta:"#637D96",           // secondary meta (year, region) — was #324D68
  hazardText:"#8FB4CC",     // hazard labels — readable on dark panel
};

// Sector → left-border accent colour
const SECTOR_BORDER = { Rail:"#5BADD4", Aviation:"#9B7FE0", Maritime:"#4BB885", Highways:"#E8934A" };

function SignalCard({ cs }) {
  const [h,setH]=useState(false);
  const borderCol = SECTOR_BORDER[cs.sector] || A.gold;
  return (
    <div onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ background:h?A.raised:A.panel, border:`1px solid ${h?A.gold:A.border}`,
               borderLeft:`3px solid ${borderCol}`,
               padding:"22px 24px 18px", cursor:"pointer", transition:"all 0.18s" }}>
      {/* Sector dot + label — no background box */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", color:borderCol, display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:borderCol, display:"inline-block", flexShrink:0 }}/>
          {cs.sector}
        </span>
        <span style={{ fontSize:11, color:A.meta }}>{cs.year?.split("–")[0]}</span>
      </div>
      <h3 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:14, lineHeight:1.45, fontWeight:700, marginBottom:8, color:A.cream }}>{cs.title}</h3>
      <p style={{ fontSize:12, color:A.gold, fontWeight:600, marginBottom:10 }}>{cs.hook}</p>
      <p style={{ fontSize:13, color:A.body, lineHeight:1.7, marginBottom:12, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{cs.summary}</p>
      {/* Hazard labels — plain text, no background box */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:12 }}>
        {cs.hazards.cause.slice(0,2).map(haz=>(
          <span key={haz} style={{ fontSize:11, color:A.hazardText, display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:3, height:3, borderRadius:"50%", background:A.hazardText, display:"inline-block" }}/>
            {haz}
          </span>
        ))}
      </div>
      <div style={{ background:A.goldFade, borderLeft:`2px solid ${A.goldBorder}`, padding:"7px 11px", marginBottom:14 }}>
        <span style={{ fontSize:10, color:A.gold, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>UK applicability · </span>
        <span style={{ fontSize:11, color:A.body }}>{cs.transferabilityNote?.slice(0,80)}…</span>
      </div>
      <div style={{ paddingTop:12, borderTop:`1px solid ${A.border}`, display:"flex", justifyContent:"space-between" }}>
        <span style={{ fontSize:10, fontWeight:700, color:cs.transferability==="High"?"#4ade80":"#fbbf24", textTransform:"uppercase", letterSpacing:"0.08em" }}>● {cs.transferability} transferability</span>
        <span style={{ fontSize:11, color:A.gold, cursor:"pointer", fontWeight:600 }}>Read case →</span>
      </div>
    </div>
  );
}

function DirectionA() {
  const [q,setQ]=useState(""); const [selS,setSelS]=useState([]); const [aiH,setAiH]=useState([]); const [aiS,setAiS]=useState([]);
  const [results,setResults]=useState(CS); const [syn,setSyn]=useState(null);
  const allH=aiH, allS=[...new Set([...selS,...aiS])];
  const hasF=q||selS.length||aiH.length||aiS.length;
  useEffect(()=>{ const t=setTimeout(()=>{ if(q.trim()){ const {dH,dS}=detect(q);setAiH(dH);setAiS(dS); }else{setAiH([]);setAiS([]);} },350); return()=>clearTimeout(t); },[q]);
  useEffect(()=>{ const r=search(q,allH,allS); setResults(r); setSyn(hasF&&r.length?synthesis(r):null); },[q,selS,aiH,aiS]);
  const tog=(set,v)=>set(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);
  const clear=()=>{ setQ("");setSelS([]);setAiH([]);setAiS([]); };
  return (
    <div style={{ background:A.bg, color:A.cream, minHeight:"100vh", fontFamily:"'DM Sans',sans-serif" }}>
      <nav style={{ borderBottom:`1px solid ${A.border}`, padding:"16px 52px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:40, background:"rgba(7,16,28,0.97)", backdropFilter:"blur(12px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <span style={{ fontFamily:"'Libre Baskerville',serif", fontSize:20, fontWeight:700, letterSpacing:"-0.01em" }}>HIVE</span>
          <div style={{ width:1, height:16, background:A.border }}/>
          <span style={{ fontSize:10, color:A.body, letterSpacing:"0.16em", textTransform:"uppercase" }}>Climate Adaptation Intelligence</span>
        </div>
        <div style={{ display:"flex", gap:28, fontSize:12, color:A.body }}>
          {["Handbook","Roadmap","About"].map(l=><span key={l} style={{ cursor:"pointer" }}>{l}</span>)}
          <span style={{ cursor:"pointer", color:A.gold, fontWeight:600 }}>DfT Partner</span>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"72px 52px 52px", display:"grid", gridTemplateColumns:"56fr 44fr", gap:80, alignItems:"start" }}>
        <div>
          <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:A.gold, marginBottom:20, fontWeight:600 }}>Vol. III — Transport Resilience Evidence Base</div>
          <h1 style={{ fontFamily:"'Libre Baskerville',serif", fontSize:50, lineHeight:1.1, fontWeight:700, letterSpacing:"-0.025em", marginBottom:20 }}>
            Adapting transport<br/><em style={{ color:A.gold, fontWeight:400 }}>to a changing climate</em>
          </h1>
          <p style={{ fontSize:15, lineHeight:1.8, color:A.body, maxWidth:420, marginBottom:36 }}>A curated intelligence resource for transport practitioners, researchers and policymakers navigating the evidence on climate adaptation.</p>

          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:A.meta, marginBottom:10 }}>Search the knowledge base</div>
            <div style={{ display:"flex" }}>
              <input value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. flood resilience, rail heatwave, coastal storm surge..."
                style={{ flex:1, background:A.panel, border:`1px solid ${q?A.gold:A.border}`, borderRight:"none", padding:"13px 16px", color:A.cream, fontSize:14, outline:"none", fontFamily:"'DM Sans',sans-serif", borderRadius:"3px 0 0 3px", transition:"border-color 0.2s" }}/>
              <button style={{ background:A.gold, color:A.bg, border:"none", padding:"0 24px", cursor:"pointer", fontSize:12, fontWeight:700, borderRadius:"0 3px 3px 0", fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.06em" }}>Search</button>
            </div>
          </div>

          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:28 }}>
            {["Flood","Sea level rise","Heatwave","Rockfall","SuDS","Vegetation"].map(qt=>(
              <button key={qt} onClick={()=>setQ(qt)} style={{ background:"none", border:`1px solid ${A.border}`, color:A.body, borderRadius:2, padding:"4px 12px", fontSize:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=A.gold;e.currentTarget.style.color=A.gold;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=A.border;e.currentTarget.style.color=A.body;}}>{qt}</button>
            ))}
          </div>

          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:A.meta, marginBottom:10 }}>Filter by sector</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {SECTORS.map(s=>{
                const sel=selS.includes(s);
                return <button key={s} onClick={()=>tog(setSelS,s)} style={{ background:sel?A.goldFade:"none", border:`1px solid ${sel?A.gold:A.border}`, color:sel?A.gold:A.body, borderRadius:3, padding:"5px 12px", fontSize:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>{s}</button>;
              })}
              {selS.length>0&&<button onClick={()=>setSelS([])} style={{ background:"none",border:"none",color:A.meta,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>× Clear</button>}
            </div>
          </div>

          {(aiH.length>0||aiS.length>0)&&(
            <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:10, color:A.gold, letterSpacing:"0.1em", textTransform:"uppercase" }}>Detected:</span>
              {[...aiH,...aiS].map(t=>(
                <span key={t} style={{ display:"inline-flex", alignItems:"center", gap:6, background:A.goldFade, border:`1px solid ${A.goldBorder}`, borderRadius:2, padding:"3px 10px", fontSize:11, color:A.gold }}>
                  {t}<button onClick={()=>{setAiH(p=>p.filter(x=>x!==t));setAiS(p=>p.filter(x=>x!==t));}} style={{ background:"none",border:"none",cursor:"pointer",color:A.gold,padding:0,lineHeight:1,fontSize:14 }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div style={{ paddingTop:56 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:A.border, marginBottom:1 }}>
            {[["109","Case Studies","fully indexed"],["4","Transport Modes","rail · aviation · maritime · highways"],[CS.filter(c=>c.transferability==="High").length.toString(),"High UK Transferability","directly applicable cases"],["12","Climate Hazards","cause & effect categories"]].map(([v,l,s])=>(
              <div key={l} style={{ background:A.panel, padding:"22px 24px" }}>
                <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:34, fontWeight:700, color:A.cream, marginBottom:4 }}>{v}</div>
                <div style={{ fontSize:10, color:A.body, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:3 }}>{l}</div>
                <div style={{ fontSize:11, color:A.meta }}>{s}</div>
              </div>
            ))}
          </div>

          {syn&&(
            <div style={{ background:A.goldFade, borderLeft:`3px solid ${A.gold}`, padding:"18px 22px", marginTop:1, animation:"fadeIn 0.3s ease" }}>
              <div style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.14em", color:A.gold, marginBottom:8, fontWeight:700 }}>Cross-case analysis · {syn.count} {syn.count===1?"study":"studies"}</div>
              <p style={{ fontSize:13, color:A.cream, lineHeight:1.7, marginBottom:12 }}>{syn.insight}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                {syn.sectors.map(s=><span key={s} style={{ background:A.panel, border:`1px solid ${A.border}`, color:A.body, borderRadius:2, padding:"3px 10px", fontSize:11 }}>{s}</span>)}
                <span style={{ fontSize:11, color:A.meta, alignSelf:"center" }}>{syn.highT} of {syn.count} high UK transferability</span>
              </div>
              <button style={{ background:"none", border:`1px solid ${A.gold}`, color:A.gold, padding:"8px 18px", fontSize:11, fontWeight:700, cursor:"pointer", borderRadius:3, fontFamily:"'DM Sans',sans-serif", letterSpacing:"0.08em" }}>Generate structured brief →</button>
            </div>
          )}
          {!hasF&&<div style={{ padding:"16px 0", borderTop:`1px solid ${A.border}`, marginTop:1 }}>
            <p style={{ fontSize:11, color:A.body, lineHeight:1.7 }}>Describe your infrastructure challenge above to surface relevant case studies, cross-case patterns, and structured evidence for decision-making.</p>
          </div>}
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 52px 32px", borderTop:`1px solid ${A.border}` }}>
        <div style={{ display:"flex", alignItems:"center", paddingTop:20, marginBottom:24 }}>
          <span style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:A.meta, marginRight:24 }}>
            {hasF?`${results.length} results`:`${CS.length} case studies`}
          </span>
          {hasF&&<button onClick={clear} style={{ background:"none",border:"none",color:A.body,fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textDecoration:"underline" }}>Clear all filters</button>}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:1, background:A.border }}>
          {(hasF?results:CS).map(cs=><SignalCard key={cs.id} cs={cs}/>)}
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 52px 120px", borderTop:`1px solid ${A.border}` }}>
        <div style={{ display:"flex", gap:48 }}>
          {[["109","Total case studies indexed"],["7","Fully loaded in prototype"],["4","Transport modes covered"],["12","Climate hazard categories"]].map(([v,l])=>(
            <div key={l}><div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:26, fontWeight:700, color:A.cream }}>{v}</div><div style={{ fontSize:11, color:A.meta, marginTop:2 }}>{l}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DIRECTION B: PROTOTYPE ─────────────────────────────────────────────────────

const THEMES = {
  light:{ bg:'#F7F5F0',surface:'#ffffff',surfaceAlt:'#fafaf9',border:'#e7e5e4',text:'#1c1917',textSec:'#78716c',textMuted:'#a8a29e',accent:'#047857',accentBg:'#d1fae5',accentText:'#065f46',nav:'rgba(255,255,255,0.92)',grad:'#F7F5F0',inBg:'#ffffff',inBorder:'#d6d3d1' },
  dark:{ bg:'#0d1117',surface:'#161b27',surfaceAlt:'#1e2535',border:'#2d3446',text:'#e2e8f0',textSec:'#94a3b8',textMuted:'#64748b',accent:'#34d399',accentBg:'#064e3b',accentText:'#34d399',nav:'rgba(13,17,23,0.96)',grad:'#0d1117',inBg:'#1e2535',inBorder:'#2d3446' },
  dft:{ bg:'#f3f2f1',surface:'#ffffff',surfaceAlt:'#f8f8f8',border:'#b1b4b6',text:'#0b0c0c',textSec:'#505a5f',textMuted:'#6f777b',accent:'#1d70b8',accentBg:'#e8f1fb',accentText:'#003a70',nav:'rgba(255,255,255,0.97)',grad:'#f3f2f1',inBg:'#ffffff',inBorder:'#0b0c0c' },
};

const SEC_CLS = { Rail:"#EBF4FF #1A4A8A", Aviation:"#F3EEF9 #5B3FA0", Maritime:"#E6F5EE #156840", Highways:"#FDF0E5 #9A4812", Energy:"#F5F0FD #6B3FA0", Multiple:"#F5F5F4 #78716c" };

function MCard({ c, onClick, dimmed, hl, T }) {
  const [h,setH]=useState(false);
  const [bg,col]=(SEC_CLS[c.sector]||"#f5f5f4 #78716c").split(" ");
  return (
    <div onClick={()=>onClick(c)} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{ flexShrink:0,width:260,cursor:"pointer",borderRadius:16,border:`1px solid ${hl?T.accent:T.border}`,background:hl?T.accentBg:T.surface,padding:"14px 16px",opacity:dimmed?0.25:1,transition:"all 0.25s",transform:h?"translateY(-3px) scale(1.02)":"none",boxShadow:h?"0 8px 24px rgba(0,0,0,0.12)":"none",fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8,gap:8 }}>
        <h4 style={{ fontSize:13,fontWeight:600,lineHeight:1.35,color:T.text,flex:1 }}>{c.title}</h4>
        <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20,border:`1px solid ${col}44`,background:bg,color:col,whiteSpace:"nowrap",flexShrink:0 }}>{c.sector}</span>
      </div>
      <p style={{ fontSize:11,color:T.textMuted,marginBottom:6,lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{c.measure}</p>
      <p style={{ fontSize:11,fontWeight:600,color:T.accent }}>{c.hook}</p>
    </div>
  );
}

function BCard({ cs, onPin, pinned, T, matchR }) {
  const [bg,col]=(SEC_CLS[cs.sector]||"#f5f5f4 #78716c").split(" ");
  return (
    <div style={{ background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px 20px 16px",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif",transition:"border-color 0.2s,box-shadow 0.2s" }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=T.accent;e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.1)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="none";}}>
      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap" }}>
        <span style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.accent }}>{cs.sector}</span>
        <span style={{ color:T.textMuted }}>·</span>
        <span style={{ fontSize:11,color:T.textSec }}>{cs.location}</span>
        <span style={{ color:T.textMuted }}>·</span>
        <span style={{ fontSize:11,color:T.textMuted }}>{cs.year}</span>
      </div>
      <h3 style={{ fontSize:15,fontWeight:600,lineHeight:1.4,marginBottom:6,color:T.text }}>{cs.title}</h3>
      <p style={{ fontSize:12,fontWeight:600,color:T.accent,marginBottom:8 }}>{cs.hook}</p>
      <p style={{ fontSize:13,color:T.textSec,lineHeight:1.65,marginBottom:10,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",flex:1 }}>{cs.summary}</p>
      {matchR?.length>0&&<div style={{ display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:8 }}>
        <span style={{ fontSize:11,color:T.textMuted }}>Matched:</span>
        {matchR.map(r=><span key={r} style={{ fontSize:11,border:`1px solid ${T.accent}`,borderRadius:4,padding:"1px 7px",color:T.accent,fontWeight:600 }}>{r}</span>)}
      </div>}
      <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:10 }}>
        {cs.hazards.cause.slice(0,2).map(h=>{
          const hc={"Heavy rainfall":["#EBF4FF","#1A4A8A"],"High temperatures":["#FEF3E2","#9A4812"],"Storms":["#F3EEF9","#5B3FA0"],"Sea level rise":["#E6F5EE","#156840"],"Drought":["#FDF6E3","#7A5C1E"],"Flooding":["#EBF4FF","#1A5C8A"]};
          const [hbg,hcol]=hc[h]||["#f5f5f4","#78716c"];
          return <span key={h} style={{ fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:4,border:`1px solid ${hcol}44`,background:hbg,color:hcol }}>{h}</span>;
        })}
        {cs.hazards.effect.slice(0,1).map(h=><span key={h} style={{ fontSize:10,padding:"2px 8px",borderRadius:4,background:"#f5f5f4",color:"#78716c",border:"1px solid #e7e5e4" }}>→ {h}</span>)}
      </div>
      <div style={{ background:T.accentBg,border:`1px solid ${T.accent}44`,borderRadius:10,padding:"8px 12px",marginBottom:10 }}>
        <span style={{ fontSize:10,fontWeight:700,color:T.accent,textTransform:"uppercase",letterSpacing:"0.08em" }}>UK: </span>
        <span style={{ fontSize:11,color:T.textSec }}>{cs.transferabilityNote?.slice(0,85)}…</span>
      </div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:10,borderTop:`1px solid ${T.border}` }}>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontSize:11,fontWeight:700,color:cs.transferability==="High"?"#059669":"#d97706",display:"flex",alignItems:"center",gap:4 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:cs.transferability==="High"?"#059669":"#d97706",display:"inline-block" }}/>{cs.transferability} UK transferability
          </span>
          <span style={{ fontSize:11,color:T.textMuted }}>{cs.costBand}</span>
        </div>
        <button onClick={e=>{e.stopPropagation();onPin(cs);}} style={{ fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:20,border:`1px solid ${pinned?T.accent:T.border}`,background:pinned?T.accent:"none",color:pinned?"#fff":T.textSec,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s" }}>
          {pinned?"✓ Pinned":"+ Pin to brief"}
        </button>
      </div>
    </div>
  );
}

function DirectionB() {
  const [thK,setThK]=useState("light"); const T=THEMES[thK];
  const [q,setQ]=useState(""); const [selH,setSelH]=useState([]); const [selS,setSelS]=useState([]);
  const [aiH,setAiH]=useState([]); const [aiS,setAiS]=useState([]);
  const [results,setResults]=useState(CS); const [syn,setSyn]=useState(null); const [matchR,setMatchR]=useState({});
  const [filOpen,setFilOpen]=useState(false); const [marqV,setMarqV]=useState("2d");
  const [pinned,setPinned]=useState([]); const [briefOpen,setBriefOpen]=useState(false);
  const allH=[...new Set([...selH,...aiH])], allS=[...new Set([...selS,...aiS])];
  const hasF=q||selH.length||selS.length;
  const mHF=allH.length>0||allS.length>0;
  useEffect(()=>{ const t=setTimeout(()=>{ if(q.trim()){const{dH,dS}=detect(q);setAiH(dH);setAiS(dS);}else{setAiH([]);setAiS([]);} },350); return()=>clearTimeout(t); },[q]);
  useEffect(()=>{
    const r=search(q,allH,allS); setResults(r);
    const mr={}; r.forEach(cs=>{ const ah=[...cs.hazards.cause,...cs.hazards.effect]; const reas=[...allH.filter(h=>ah.some(ch=>ch.toLowerCase().includes(h.toLowerCase()))),...allS.filter(s=>cs.sector.toLowerCase()===s.toLowerCase())]; mr[cs.id]=[...new Set(reas)].slice(0,3); }); setMatchR(mr);
    const bs=hasF&&r.length?synthesis(r):null; setSyn(bs?{...bs,insightSentence:bs.insight}:null);
  },[q,selH,selS,aiH,aiS]);
  const tog=(set,v)=>set(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);
  const togglePin=cs=>setPinned(p=>p.some(x=>x.id===cs.id)?p.filter(x=>x.id!==cs.id):[...p,cs]);
  const clear=()=>{ setQ("");setSelH([]);setSelS([]);setAiH([]);setAiS([]); };
  const mCards=MQ.slice(0,10), mCards2=MQ.slice(10)||MQ.slice(0,10);
  const isHl=c=>mHF&&(allS.length===0||allS.some(s=>s.toLowerCase()===c.sector.toLowerCase()));
  const isDim=c=>mHF&&!isHl(c);

  return (
    <div style={{ background:T.bg, minHeight:"100vh", fontFamily:"'DM Sans',sans-serif", transition:"background 0.3s,color 0.3s" }}>
      {thK==='dft'&&<div style={{ height:5,background:"#006853" }}/>}
      <nav style={{ position:"sticky",top:thK==='dft'?5:0,zIndex:40,background:T.nav,backdropFilter:"blur(12px)",borderBottom:`1px solid ${T.border}` }}>
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 24px",height:56,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:28,height:28,borderRadius:8,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"/></svg>
            </div>
            <span style={{ fontWeight:700,fontSize:15,color:T.text }}>HIVE</span>
            <span style={{ fontSize:11,color:T.textMuted }}>Transport Climate Adaptation Intelligence</span>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ display:"flex",gap:2,background:T.surfaceAlt,borderRadius:20,padding:3,border:`1px solid ${T.border}` }}>
              {Object.keys(THEMES).map(k=><button key={k} onClick={()=>setThK(k)} style={{ fontSize:11,fontWeight:700,padding:"5px 12px",borderRadius:16,border:"none",cursor:"pointer",background:thK===k?T.accent:"transparent",color:thK===k?"#fff":T.textSec,fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s" }}>{k.charAt(0).toUpperCase()+k.slice(1)}</button>)}
            </div>
            <button onClick={()=>setBriefOpen(true)} style={{ display:"flex",alignItems:"center",gap:6,fontSize:13,padding:"6px 14px",borderRadius:20,border:"none",background:"none",cursor:"pointer",color:pinned.length>0?T.accent:T.textSec,fontWeight:pinned.length>0?700:400,fontFamily:"'DM Sans',sans-serif" }}>
              ⚡ Brief {pinned.length>0&&<span style={{ background:T.accent,color:"#fff",fontSize:10,fontWeight:700,borderRadius:10,padding:"1px 7px" }}>{pinned.length}</span>}
            </button>
            <button style={{ fontSize:13,fontWeight:600,padding:"7px 16px",borderRadius:20,background:T.accent,color:"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>DfT Partner</button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"52px 24px 32px" }}>
        <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:T.accentBg,borderRadius:20,padding:"6px 14px",marginBottom:20 }}>
          <span style={{ width:6,height:6,borderRadius:"50%",background:T.accent,animation:"pulse 2s infinite" }}/>
          <span style={{ fontSize:11,fontWeight:700,color:T.accentText,letterSpacing:"0.1em",textTransform:"uppercase" }}>Prototype · 7 of 80+ case studies fully loaded</span>
        </div>
        <h1 style={{ fontSize:44,fontWeight:400,lineHeight:1.15,marginBottom:12,color:T.text,fontFamily:"'DM Serif Display',serif" }}>
          What risk are you <em style={{ color:T.accent }}>managing?</em>
        </h1>
        <p style={{ fontSize:15,color:T.textSec,lineHeight:1.7,maxWidth:560,marginBottom:28 }}>Describe your infrastructure challenge in plain English. HIVE surfaces proven adaptations, comparable case studies, and structured evidence you can use immediately.</p>

        <div style={{ maxWidth:680,position:"relative",marginBottom:12 }}>
          <div style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:T.textMuted }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. flooding on a rail corridor, heatwave road bridges, coastal port storm surge..."
            style={{ width:"100%",paddingLeft:42,paddingRight:36,paddingTop:14,paddingBottom:14,fontSize:15,borderRadius:16,border:`1.5px solid ${q?T.accent:T.inBorder}`,background:T.inBg,color:T.text,outline:"none",fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",transition:"border-color 0.2s",boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}/>
          {q&&<button onClick={()=>setQ("")} style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.textMuted }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>}
        </div>

        <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
          <button onClick={()=>setFilOpen(!filOpen)} style={{ fontSize:11,fontWeight:600,color:T.accent,background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontFamily:"'DM Sans',sans-serif" }}>
            {filOpen?"Hide filters":"Show filters"}
            {(selH.length+selS.length)>0&&<span style={{ background:T.accent,color:"#fff",fontSize:10,fontWeight:700,borderRadius:10,padding:"1px 7px" }}>{selH.length+selS.length}</span>}
          </button>
        </div>
        {filOpen&&<div style={{ marginBottom:16,display:"flex",flexDirection:"column",gap:10 }}>
          <div><p style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.textSec,marginBottom:6 }}>Climate driver</p>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{HAZARDS.map(h=>{ const s=selH.includes(h); return <button key={h} onClick={()=>tog(setSelH,h)} style={{ fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:20,border:`1px solid ${s?T.accent:T.border}`,background:s?T.accent:"none",color:s?"#fff":T.textSec,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s" }}>{s&&"✓ "}{h}</button>; })}</div>
          </div>
          <div><p style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.textSec,marginBottom:6 }}>Sector</p>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>{SECTORS.map(s=>{ const sel=selS.includes(s); return <button key={s} onClick={()=>tog(setSelS,s)} style={{ fontSize:11,fontWeight:600,padding:"5px 12px",borderRadius:20,border:`1px solid ${sel?T.accent:T.border}`,background:sel?T.accent:"none",color:sel?"#fff":T.textSec,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s" }}>{sel&&"✓ "}{s}</button>; })}</div>
          </div>
        </div>}

        {(aiH.filter(h=>!selH.includes(h)).length>0||aiS.filter(s=>!selS.includes(s)).length>0)&&(
          <div style={{ display:"flex",flexWrap:"wrap",alignItems:"center",gap:8,marginBottom:16 }}>
            <span style={{ fontSize:11,fontWeight:600,color:T.accent,display:"flex",alignItems:"center",gap:4 }}>⚡ Detected:</span>
            {[...aiH.filter(h=>!selH.includes(h)),...aiS.filter(s=>!selS.includes(s))].map(t=>(
              <span key={t} style={{ display:"inline-flex",alignItems:"center",gap:6,background:T.accentBg,border:`1px solid ${T.accent}44`,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:600,color:T.accentText }}>
                {t}<button onClick={()=>{setAiH(p=>p.filter(x=>x!==t));setAiS(p=>p.filter(x=>x!==t));}} style={{ background:"none",border:"none",cursor:"pointer",color:T.accent,padding:0,lineHeight:1,fontSize:14 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop:`1px solid ${T.border}`,paddingTop:24,paddingBottom:8 }}>
        <div style={{ maxWidth:1200,margin:"0 auto",padding:"0 24px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
          <div>
            <p style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:T.textMuted }}>From the knowledge base</p>
            <p style={{ fontSize:13,marginTop:2,color:T.textSec }}>{mHF?"Highlighted: matching sectors":"All 50 curated case studies — click any card to explore"}</p>
          </div>
          <div style={{ display:"flex",gap:4,background:T.surfaceAlt,borderRadius:20,padding:3,border:`1px solid ${T.border}` }}>
            {["2d","3d"].map(v=><button key={v} onClick={()=>setMarqV(v)} style={{ fontSize:11,fontWeight:700,padding:"5px 12px",borderRadius:16,border:"none",cursor:"pointer",background:marqV===v?T.text:"transparent",color:marqV===v?T.surface:T.textSec,fontFamily:"'DM Sans',sans-serif",textTransform:"uppercase",transition:"all 0.2s" }}>{v}</button>)}
          </div>
        </div>

        {marqV==="2d"?(
          <div style={{ overflow:"hidden" }}>
            {[mCards,mCards2].map((row,ri)=>(
              <div key={ri} style={{ overflow:"hidden",paddingTop:8,paddingBottom:8 }}
                onMouseEnter={e=>{ const el=e.currentTarget.querySelector('[data-track]'); if(el) el.style.animationPlayState='paused'; }}
                onMouseLeave={e=>{ const el=e.currentTarget.querySelector('[data-track]'); if(el) el.style.animationPlayState='running'; }}>
                <div data-track style={{ display:"flex",gap:12,width:"max-content",animation:`scrollX ${ri===0?100:130}s linear infinite ${ri===1?"reverse":""}`,padding:"0 6px" }}>
                  {[...row,...row].map((c,i)=><MCard key={`${ri}-${i}`} c={c} onClick={()=>{}} dimmed={isDim(c)} hl={isHl(c)} T={T}/>)}
                </div>
              </div>
            ))}
          </div>
        ):(
          <div style={{ height:420,overflow:"hidden",position:"relative" }}>
            <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",perspective:900 }}>
              <div style={{ display:"flex",gap:16,transform:"translateX(-40px) translateZ(-80px) rotateX(12deg) rotateY(-5deg) rotateZ(7deg)" }}>
                {[[0,2,4,6,8],[1,3,5,7,9]].map((idxs,ci)=>(
                  <div key={ci} style={{ overflow:"hidden",width:220,height:380,flexShrink:0 }}
                    onMouseEnter={e=>{ const el=e.currentTarget.querySelector('[data-col]'); if(el) el.style.animationPlayState='paused'; }}
                    onMouseLeave={e=>{ const el=e.currentTarget.querySelector('[data-col]'); if(el) el.style.animationPlayState='running'; }}>
                    <div data-col style={{ display:"flex",flexDirection:"column",gap:12,padding:8,animation:`scrollY ${ci===0?28:36}s linear infinite ${ci===1?"reverse":""}` }}>
                      {[...idxs,...idxs].map((idx,i)=>MQ[idx]&&<MCard key={`${ci}-${i}`} c={MQ[idx]} onClick={()=>{}} dimmed={isDim(MQ[idx])} hl={isHl(MQ[idx])} T={T}/>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position:"absolute",inset:"0 0 auto 0",height:64,background:`linear-gradient(180deg,${T.grad} 0%,transparent 100%)`,pointerEvents:"none" }}/>
            <div style={{ position:"absolute",inset:"auto 0 0 0",height:64,background:`linear-gradient(0deg,${T.grad} 0%,transparent 100%)`,pointerEvents:"none" }}/>
          </div>
        )}
        <p style={{ textAlign:"center",fontSize:11,color:T.textMuted,marginTop:10 }}>Hover to pause · Search above to filter</p>
      </div>

      <div style={{ maxWidth:1200,margin:"0 auto",padding:"24px 24px 120px" }}>
        {syn&&(
          <div style={{ background:"linear-gradient(135deg,#ecfdf5,#f0fdf4)",border:"1px solid #a7f3d0",borderRadius:20,padding:"18px 22px",marginBottom:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:10 }}>
              <div style={{ width:24,height:24,borderRadius:8,background:"#059669",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <span style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"#059669" }}>Cross-case analysis</span>
              <span style={{ fontSize:11,color:"#78716c" }}>{syn.count} studies</span>
            </div>
            <p style={{ fontSize:13,color:"#1c1917",lineHeight:1.7,marginBottom:10,fontWeight:500 }}>{syn.insightSentence}</p>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {syn.sectors.map(s=><span key={s} style={{ fontSize:11,background:"white",border:"1px solid #a7f3d0",borderRadius:20,padding:"3px 12px",color:"#059669",fontWeight:600 }}>{s}</span>)}
              <span style={{ fontSize:11,color:"#78716c",alignSelf:"center" }}>{syn.highT} of {syn.count} high UK transferability</span>
            </div>
          </div>
        )}

        {hasF&&<>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <span style={{ fontSize:13,fontWeight:600,color:T.textSec }}>{results.length} {results.length===1?"study":"studies"} matched</span>
            <button onClick={clear} style={{ fontSize:12,color:T.textMuted,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:"'DM Sans',sans-serif" }}>Clear all</button>
          </div>
          {results.length>0
            ?<div style={{ display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16 }}>{results.map(cs=><BCard key={cs.id} cs={cs} onPin={togglePin} pinned={pinned.some(x=>x.id===cs.id)} T={T} matchR={matchR[cs.id]}/>)}</div>
            :<div style={{ textAlign:"center",padding:"60px 0" }}><p style={{ fontSize:14,color:T.textSec,marginBottom:12 }}>No case studies found</p><button onClick={clear} style={{ fontSize:13,color:T.accent,background:"none",border:"none",cursor:"pointer",textDecoration:"underline",fontFamily:"'DM Sans',sans-serif" }}>Browse all</button></div>
          }
        </>}

        {!hasF&&<div style={{ marginTop:24,paddingTop:24,borderTop:`1px solid ${T.border}`,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24 }}>
          {[["7+","Case studies loaded","in this prototype"],["50","Marquee entries","hover and explore"],["4","Transport sectors","rail · aviation · maritime · highways"],["12","Climate hazards","cause & effect mapped"]].map(([v,l,s])=>(
            <div key={l}><div style={{ fontSize:26,fontWeight:600,color:T.text,fontFamily:"'DM Serif Display',serif" }}>{v}</div><div style={{ fontSize:12,fontWeight:600,color:T.textSec,marginTop:2 }}>{l}</div><div style={{ fontSize:11,color:T.textMuted,marginTop:2 }}>{s}</div></div>
          ))}
        </div>}
      </div>

      {briefOpen&&<div style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.35)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"flex-end",padding:16 }} onClick={()=>setBriefOpen(false)}>
        <div style={{ background:T.surface,borderRadius:24,boxShadow:"0 20px 60px rgba(0,0,0,0.25)",width:"100%",maxWidth:420,maxHeight:"85vh",overflowY:"auto" }} onClick={e=>e.stopPropagation()}>
          <div style={{ position:"sticky",top:0,background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:"24px 24px 0 0" }}>
            <div><div style={{ display:"flex",alignItems:"center",gap:8 }}><span style={{ fontSize:14,fontWeight:700,color:T.text }}>AI Brief</span><span style={{ fontSize:11,fontWeight:700,background:T.accentBg,color:T.accentText,borderRadius:12,padding:"2px 10px" }}>{pinned.length} cases</span></div><p style={{ fontSize:11,color:T.textMuted,marginTop:2 }}>Pinned cases for synthesis</p></div>
            <button onClick={()=>setBriefOpen(false)} style={{ width:32,height:32,borderRadius:"50%",background:T.surfaceAlt,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={T.textSec} strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div style={{ padding:20 }}>
            {pinned.length===0?<div style={{ textAlign:"center",padding:"40px 0" }}><p style={{ fontSize:13,color:T.textSec,marginBottom:6 }}>No cases pinned yet</p><p style={{ fontSize:12,color:T.textMuted }}>Add cases from search results</p></div>
            :<div style={{ marginBottom:16 }}>{pinned.map(cs=><div key={cs.id} style={{ display:"flex",gap:12,padding:12,borderRadius:14,border:`1px solid ${T.border}`,background:T.surfaceAlt,marginBottom:8 }}>
                <div style={{ flex:1 }}><span style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.accent }}>{cs.sector}</span><p style={{ fontSize:13,fontWeight:600,color:T.text,marginTop:2 }}>{cs.title}</p><p style={{ fontSize:11,color:T.accent,marginTop:2,fontWeight:600 }}>{cs.hook}</p></div>
                <button onClick={()=>togglePin(cs)} style={{ background:"none",border:"none",cursor:"pointer",color:T.textMuted,alignSelf:"flex-start" }}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>)}
            </div>}
            {pinned.length>=2&&<div style={{ borderTop:`1px solid ${T.border}`,paddingTop:16 }}>
              <div style={{ background:T.accentBg,borderRadius:16,padding:"14px 16px",marginBottom:12 }}>
                <p style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:T.accentText,marginBottom:6 }}>Pattern across {pinned.length} cases</p>
                <p style={{ fontSize:13,color:T.text,lineHeight:1.6 }}>{pinned.filter(c=>c.transferability==="High").length} of {pinned.length} have high UK transferability. Sectors: {[...new Set(pinned.map(c=>c.sector))].join(", ")}.</p>
              </div>
              <button style={{ width:"100%",padding:"12px 0",borderRadius:16,background:T.accent,color:"#fff",border:"none",cursor:"pointer",fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                ⚡ Generate AI brief <span style={{ fontSize:12,opacity:0.7,fontWeight:400 }}>— coming in full platform</span>
              </button>
            </div>}
          </div>
        </div>
      </div>}
    </div>
  );
}

// ── C: TERRAIN (Dark + Teal) ──────────────────────────────────────────────────

function DirectionC() {
  const [mode,setMode]=useState("All"); const [q,setQ]=useState(""); const [hov,setHov]=useState(null);
  const filtered=CS.filter(c=>(mode==="All"||c.sector===mode)&&(q===""||c.title.toLowerCase().includes(q.toLowerCase())||c.summary.toLowerCase().includes(q.toLowerCase())));
  const C={ bg:"#07101A",panel:"#0C1B28",raised:"#112233",teal:"#00D4AA",tealDim:"rgba(0,212,170,0.12)",tealBorder:"rgba(0,212,170,0.22)",text:"#DCE8F0",textMid:"#6E90A8",textDim:"#324D61" };
  const mCol={ Rail:"#5BC8F5",Aviation:"#C39BF5",Maritime:"#00D4AA",Highways:"#F5B043" };
  return (
    <div style={{ background:C.bg,color:C.text,minHeight:"100vh",fontFamily:"'Fira Sans',sans-serif",position:"relative" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@700;800;900&family=Fira+Sans:wght@300;400;500;600&display=swap');`}</style>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",backgroundImage:"linear-gradient(rgba(0,212,170,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,170,0.025) 1px,transparent 1px)",backgroundSize:"56px 56px",zIndex:0 }}/>
      <div style={{ position:"relative",zIndex:1 }}>
        <nav style={{ borderBottom:`1px solid ${C.tealBorder}`,padding:"16px 52px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:16 }}>
            <span style={{ fontFamily:"'Epilogue',sans-serif",fontSize:22,fontWeight:900,letterSpacing:"-0.03em",color:C.teal,textShadow:"0 0 24px rgba(0,212,170,0.45)" }}>HIVE</span>
            <div style={{ width:1,height:16,background:C.tealBorder }}/>
            <span style={{ fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:C.textMid }}>Transport Intelligence Platform</span>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            {Object.entries(mCol).map(([m,col])=><span key={m} style={{ fontSize:11,padding:"4px 12px",borderRadius:20,border:`1px solid ${col}44`,color:col,cursor:"pointer" }}>{m}</span>)}
          </div>
        </nav>
        <div style={{ padding:"76px 52px 56px",textAlign:"center",maxWidth:820,margin:"0 auto" }}>
          <div style={{ fontSize:11,letterSpacing:"0.18em",textTransform:"uppercase",color:C.teal,marginBottom:20,fontWeight:600 }}>DfT Climate Adaptation Handbook — v3.0</div>
          <h1 style={{ fontFamily:"'Epilogue',sans-serif",fontSize:58,fontWeight:900,letterSpacing:"-0.03em",lineHeight:1.0,marginBottom:22,background:`linear-gradient(140deg,${C.text} 30%,${C.teal} 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Navigate the<br/>evidence landscape</h1>
          <p style={{ fontSize:17,color:C.textMid,lineHeight:1.65,maxWidth:520,margin:"0 auto 52px" }}>109 transport case studies. AI-assisted synthesis. Structured briefings for climate adaptation decisions.</p>
          <div style={{ maxWidth:640,margin:"0 auto",background:C.panel,border:`1px solid ${q.length>2?C.teal:C.tealBorder}`,borderRadius:14,display:"flex",alignItems:"center",transition:"border-color 0.3s,box-shadow 0.3s",boxShadow:q.length>2?"0 0 32px rgba(0,212,170,0.18)":"0 6px 40px rgba(0,0,0,0.5)" }}>
            <span style={{ padding:"0 18px",color:C.teal,fontSize:20 }}>⌕</span>
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ask about any transport climate challenge..." style={{ flex:1,background:"none",border:"none",outline:"none",fontSize:16,color:C.text,padding:"18px 0",fontFamily:"'Fira Sans',sans-serif" }}/>
            {q&&<button style={{ background:C.teal,color:C.bg,border:"none",margin:7,borderRadius:9,padding:"10px 22px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Epilogue',sans-serif" }}>Search</button>}
          </div>
          {q.length>2&&<div style={{ maxWidth:640,margin:"10px auto 0",background:C.raised,border:`1px solid ${C.tealBorder}`,borderRadius:10,padding:"14px 22px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
            <div style={{ fontSize:13,color:C.textMid }}><span style={{ color:C.teal,fontWeight:700 }}>{filtered.length} results</span> — {[...new Set(filtered.map(c=>c.sector))].join(", ")}</div>
            <button style={{ background:"none",border:`1px solid ${C.teal}`,color:C.teal,borderRadius:7,padding:"6px 16px",fontSize:12,cursor:"pointer",fontFamily:"'Epilogue',sans-serif",fontWeight:700 }}>Synthesise →</button>
          </div>}
        </div>
        <div style={{ display:"flex",justifyContent:"center",gap:8,padding:"0 52px 36px",flexWrap:"wrap" }}>
          {["All",...SECTORS].map(m=><button key={m} onClick={()=>setMode(m)} style={{ background:mode===m?C.tealDim:"none",border:`1px solid ${mode===m?C.teal:C.tealBorder}`,color:mode===m?C.teal:C.textMid,borderRadius:9,padding:"9px 20px",fontSize:13,cursor:"pointer",fontFamily:"'Epilogue',sans-serif",fontWeight:700,transition:"all 0.2s" }}>{m==="All"?"All Modes":m}</button>)}
        </div>
        <div style={{ maxWidth:1180,margin:"0 auto",padding:"0 52px 140px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          {filtered.map(c=>(
            <div key={c.id} onMouseEnter={()=>setHov(c.id)} onMouseLeave={()=>setHov(null)}
              style={{ background:hov===c.id?C.raised:C.panel,border:`1px solid ${hov===c.id?(mCol[c.sector]+"88"):C.tealBorder}`,borderRadius:14,padding:"26px",cursor:"pointer",transition:"all 0.25s",transform:hov===c.id?"translateY(-3px)":"none",boxShadow:hov===c.id?"0 8px 40px rgba(0,0,0,0.35)":"none" }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:16 }}>
                <span style={{ fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",color:mCol[c.sector],fontFamily:"'Epilogue',sans-serif" }}>{c.sector}</span>
                <span style={{ fontSize:10,color:C.textDim }}>{c.year?.split("–")[0]}</span>
              </div>
              <h3 style={{ fontFamily:"'Epilogue',sans-serif",fontSize:15,fontWeight:800,lineHeight:1.32,marginBottom:10 }}>{c.title}</h3>
              <p style={{ fontSize:12,fontWeight:600,color:C.teal,marginBottom:10 }}>{c.hook}</p>
              <p style={{ fontSize:13,color:C.textMid,lineHeight:1.65 }}>{c.summary}</p>
              <div style={{ marginTop:18,display:"flex",gap:6,flexWrap:"wrap" }}>
                {c.hazards.cause.slice(0,2).map(h=><span key={h} style={{ fontSize:10,padding:"3px 10px",borderRadius:20,background:"rgba(255,255,255,0.04)",color:C.textMid,border:"1px solid rgba(255,255,255,0.07)" }}>{h}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── D: FIELD (Forest + White) ─────────────────────────────────────────────────

function DirectionD() {
  const [mode,setMode]=useState("All"); const [q,setQ]=useState(""); const [focused,setFocused]=useState(false);
  const filtered=CS.filter(c=>(mode==="All"||c.sector===mode)&&(q===""||c.title.toLowerCase().includes(q.toLowerCase())||c.summary.toLowerCase().includes(q.toLowerCase())));
  const F={ bg:"#F6F8F6",white:"#FFFFFF",forest:"#0D2718",green:"#1A7A45",greenLight:"#EBF5EF",border:"#CFD9D3",text:"#182820",textMid:"#4A6352",textDim:"#8FA699",accent:"#0B4D2C" };
  const chips={ Rail:["#E8F2FB","#1A4A8A"],Aviation:["#F3EEF9","#5B3FA0"],Maritime:["#E6F5EE","#156840"],Highways:["#FDF0E5","#9A4812"] };
  return (
    <div style={{ background:F.bg,color:F.text,minHeight:"100vh",fontFamily:"'Source Sans 3',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Source+Sans+3:wght@300;400;600;700&display=swap');`}</style>
      <nav style={{ background:F.forest,padding:"0 44px",height:54,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <div style={{ display:"flex",alignItems:"center",gap:36 }}>
          <span style={{ fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:800,letterSpacing:"0.06em",color:"#FFF" }}>HIVE</span>
          {["Handbook","Roadmap","About"].map(l=><span key={l} style={{ fontSize:13,color:"rgba(255,255,255,0.55)",cursor:"pointer",marginLeft:24 }}>{l}</span>)}
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ width:7,height:7,borderRadius:"50%",background:"#2ECC71" }}/>
          <span style={{ fontSize:12,color:"rgba(255,255,255,0.4)" }}>109 case studies · Last updated March 2026</span>
        </div>
      </nav>
      <div style={{ background:F.forest,padding:"52px 44px 64px" }}>
        <div style={{ maxWidth:700,margin:"0 auto",textAlign:"center" }}>
          <div style={{ fontFamily:"'Syne',sans-serif",fontSize:12,fontWeight:700,letterSpacing:"0.18em",textTransform:"uppercase",color:"#2ECC71",marginBottom:14 }}>DfT Climate Adaptation Handbook</div>
          <h1 style={{ fontFamily:"'Syne',sans-serif",fontSize:44,fontWeight:800,color:"#FFF",letterSpacing:"-0.025em",lineHeight:1.08,marginBottom:14 }}>Find the evidence.<br/>Brief the decision.</h1>
          <p style={{ fontSize:16,color:"rgba(255,255,255,0.5)",marginBottom:38,lineHeight:1.65 }}>Search 109 case studies across rail, aviation, maritime and highways infrastructure.</p>
          <div style={{ background:"#FFF",borderRadius:10,display:"flex",alignItems:"center",border:`2px solid ${focused?F.green:"transparent"}`,transition:"border-color 0.2s",boxShadow:"0 6px 32px rgba(0,0,0,0.35)" }}>
            <span style={{ padding:"0 18px",color:F.textMid,fontSize:20 }}>⌕</span>
            <input value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} placeholder="Search by risk type, asset, measure or question..." style={{ flex:1,background:"none",border:"none",outline:"none",fontSize:16,color:F.text,padding:"17px 0",fontFamily:"'Source Sans 3',sans-serif" }}/>
            {q&&<div style={{ padding:"0 8px 0 4px" }}>
              <button style={{ background:F.green,color:"#FFF",border:"none",borderRadius:7,padding:"9px 22px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif" }}>Search</button>
            </div>}
          </div>
          <div style={{ display:"flex",justifyContent:"center",gap:8,marginTop:14,flexWrap:"wrap" }}>
            {["Flood resilience","Net zero rail","Coastal erosion","Heatwave protocols"].map(qt=>(
              <button key={qt} onClick={()=>setQ(qt)} style={{ background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.7)",borderRadius:20,padding:"5px 14px",fontSize:12,cursor:"pointer",fontFamily:"'Source Sans 3',sans-serif" }}>{qt}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ background:F.white,borderBottom:`1px solid ${F.border}`,padding:"0 44px" }}>
        <div style={{ maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center" }}>
          {["All",...SECTORS].map(m=><button key={m} onClick={()=>setMode(m)} style={{ background:"none",border:"none",cursor:"pointer",padding:"13px 18px",fontSize:13,fontWeight:700,color:mode===m?F.green:F.textMid,borderBottom:`2px solid ${mode===m?F.green:"transparent"}`,fontFamily:"'Syne',sans-serif",transition:"color 0.15s" }}>{m==="All"?"All":m}</button>)}
          <span style={{ marginLeft:"auto",fontSize:12,color:F.textDim }}>{filtered.length} results</span>
        </div>
      </div>
      <div style={{ maxWidth:1100,margin:"0 auto",padding:"32px 44px 140px" }}>
        {q.length>2&&<div style={{ background:F.greenLight,border:`1px solid ${F.border}`,borderLeft:`4px solid ${F.green}`,borderRadius:8,padding:"14px 20px",marginBottom:24,display:"flex",gap:14,alignItems:"center" }}>
          <span style={{ fontSize:20 }}>✦</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13,fontWeight:700,color:F.accent,fontFamily:"'Syne',sans-serif",marginBottom:3 }}>AI Synthesis available</div>
            <div style={{ fontSize:13,color:F.textMid }}>{filtered.length} case studies found. Generate a structured brief.</div>
          </div>
          <button style={{ flexShrink:0,background:F.green,color:"#FFF",border:"none",borderRadius:7,padding:"9px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Syne',sans-serif" }}>Generate brief</button>
        </div>}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16 }}>
          {filtered.map(c=>(
            <div key={c.id} style={{ background:F.white,border:`1px solid ${F.border}`,borderRadius:10,padding:"22px 22px 18px",cursor:"pointer",transition:"box-shadow 0.2s,border-color 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 4px 24px rgba(13,39,24,0.1)";e.currentTarget.style.borderColor=F.green;}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.borderColor=F.border;}}>
              <div style={{ display:"flex",gap:6,marginBottom:12 }}>
                {chips[c.sector]&&<span style={{ background:chips[c.sector][0],color:chips[c.sector][1],fontSize:11,fontWeight:700,borderRadius:4,padding:"3px 9px",fontFamily:"'Syne',sans-serif" }}>{c.sector}</span>}
              </div>
              <h3 style={{ fontSize:14,fontWeight:700,lineHeight:1.4,marginBottom:9,fontFamily:"'Syne',sans-serif" }}>{c.title}</h3>
              <p style={{ fontSize:12,fontWeight:600,color:F.green,marginBottom:8 }}>{c.hook}</p>
              <p style={{ fontSize:13,color:F.textMid,lineHeight:1.65 }}>{c.summary}</p>
              <div style={{ marginTop:16,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontSize:11,color:F.textDim }}>{c.location} · {c.year?.split("–")[0]}</span>
                <span style={{ fontSize:12,color:F.green,fontWeight:700,cursor:"pointer" }}>View →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SWITCHER ──────────────────────────────────────────────────────────────────

const LABELS = {
  A:{ label:"A — Signal",    sub:"Editorial · Navy + Gold",    rec:true  },
  B:{ label:"B — Prototype", sub:"Full working prototype",     rec:true  },
  C:{ label:"C — Terrain",   sub:"Superseded",                 rec:false },
  D:{ label:"D — Field",     sub:"Superseded",                 rec:false },
};

export default function HIVEDesignReview() {
  const [dir, setDir] = useState("B");
  const views = { A:DirectionA, B:DirectionB, C:DirectionC, D:DirectionD };
  const Active = views[dir];
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display:ital@0;1&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes scrollX{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes scrollY{from{transform:translateY(0)}to{transform:translateY(-50%)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        input{font-family:inherit}
        .line-clamp-1{display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
        .line-clamp-2{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
      `}</style>
      <div style={{ paddingBottom:72 }}>
        <Active/>
      </div>
      {/* Switcher bar */}
      <div style={{ position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:"rgba(5,8,15,0.96)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"8px 10px",display:"flex",gap:4,boxShadow:"0 12px 48px rgba(0,0,0,0.5)",alignItems:"center" }}>
        {Object.entries(LABELS).map(([k,v],i)=>(
          <div key={k} style={{ display:"flex",alignItems:"center",gap:4 }}>
            {i===2&&<div style={{ width:1,height:28,background:"rgba(255,255,255,0.1)",marginRight:4 }}/>}
            <button onClick={()=>setDir(k)}
              style={{ background:dir===k?"rgba(255,255,255,0.12)":"none",border:`1px solid ${dir===k?"rgba(255,255,255,0.22)":"transparent"}`,borderRadius:10,padding:"7px 13px",cursor:"pointer",color:dir===k?"#fff":v.rec?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.35)",transition:"all 0.2s",textAlign:"left",fontFamily:"system-ui" }}>
              <div style={{ fontSize:11,fontWeight:700,whiteSpace:"nowrap",textDecoration:v.rec?"none":"line-through",opacity:v.rec?1:0.7 }}>
                {v.label}
              </div>
              <div style={{ fontSize:10,marginTop:1,whiteSpace:"nowrap",color:v.rec?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.2)" }}>{v.sub}</div>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
