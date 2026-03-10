// ── LEGACY SEED DATA (TRIB handbook at /handbook/legacy)
// Used by app/handbook/legacy/page.tsx

export const SECTORS = ["Rail", "Aviation", "Maritime", "Highways"];

export const ASSET_TYPES: Record<string, string[]> = {
  Rail: ["Track & Signalling", "Stations", "Rolling Stock", "Bridges & Viaducts", "Tunnels", "Earthworks & Embankments", "Drainage Systems"],
  Aviation: ["Runways & Aprons", "Terminal Buildings", "Air Traffic Control", "Ground Support Equipment", "Fuel Infrastructure"],
  Maritime: ["Port Structures", "Sea Walls & Defences", "Locks & Canals", "Vessel Infrastructure", "Navigation Aids"],
  Highways: ["Roads & Carriageways", "Bridges", "Tunnels", "Drainage", "Signage & Lighting", "Earthworks"],
};

export const HAZARD_CAUSES = [
  "Flooding", "Heavy Rainfall", "High Temperatures", "Drought",
  "Strong Winds", "Sea Level Rise", "Storm Surge", "Freeze-Thaw Cycles",
  "Ground Movement", "Wildfire", "Coastal Erosion", "Fog",
];

export const HAZARD_EFFECTS = [
  "Track Buckling", "Asset Flooding", "Structural Damage", "Overheating of Equipment",
  "Embankment Failure", "Landslide / Rockfall", "Reduced Visibility", "Surface Degradation",
  "Erosion", "Bridge Scour", "Power Supply Disruption", "Signal Failure",
];

export const CASE_STUDIES = [
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
