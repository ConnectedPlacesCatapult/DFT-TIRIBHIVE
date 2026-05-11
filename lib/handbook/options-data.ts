/**
 * Adaptation options library — full dataset from TRIB Climate Adaptation Handbook.
 * Source: trib.org.uk/handbook (Options Table View)
 */

export type OptionRow = {
  id: number | string;
  transport_subsector: string;
  transport_assets: string;
  climate_hazard_cause: string;
  climate_hazard_effect: string;
  climate_risk_to_assets: string;
  adaptation_measure: string;
  adaptation_measure_description: string;
  response_and_recovery_measures: string;
  identified_cobenefits: string;
  prompts_assumptions_comments?: string;
  relevant_case_studies?: string;
  case_study_id?: string;
};

export const OPTIONS_DATA: OptionRow[] = [

  // ─── ROADS ──────────────────────────────────────────────────────────────────

  {
    id: 1,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets: "Surface failure of road pavement from thermal expansion",
    adaptation_measure: "Asset temperature threshold considerations",
    adaptation_measure_description:
      "Use of materials that can withstand higher temperatures or are lighter in colour, such as reflective coating for pavement surfaces, aimed at reducing heat impact on roads",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "Can materials that absorb less thermal energy be used in new pavements and considered in upgrades of existing pavements?\nIs there shading nearby that can reduce the thermal energy?",
    case_study_id: "1922106107137140141",
    relevant_case_studies:
      "Cool pavement technology - Parramatta City Council\nCool pavement technology - City of Phoenix Street Transportation Department",
    identified_cobenefits: "community, decreased energy consumption, carbon reduction",
  },
  {
    id: 2,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water, flooding - fluvial",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets: "Asset flooding and scour resulting in damage to road surface",
    adaptation_measure: "Appropriate drainage design to account for climate change uplift",
    adaptation_measure_description:
      "Consideration of Sustainable Drainage System (SuDS) that account for climate change uplift\nReview climate uplift recommendations based on Environment Agency guidance (see Resources tab)",
    response_and_recovery_measures:
      "Emergency repair or replacement of asset\nAlternative traffic management",
    prompts_assumptions_comments:
      "Is there appropriate drainage in the area?\nHave you considered future projected flood extents and depths?\nWhat routes are most critical and can they be prioritised for investment?\nWhat is the scale of impact on the road surface — are repairs viable (short term impact) or repavement required (longer term impact)?",
    case_study_id: "1339139142",
    relevant_case_studies:
      "Sustainable Drainage System - Transport for London\nSustainable Drainage System - Thames Water Utilities Ltd",
    identified_cobenefits: "community, environment, biodiversity, carbon reduction",
  },
  {
    id: 3,
    transport_subsector: "Roads",
    transport_assets: "Road - Structures",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Leaf-fall / tree-fall / debris",
    climate_risk_to_assets:
      "Inability to use road structures (e.g. bridges, overpasses) due to blockages during increased storm activity",
    adaptation_measure: "Traffic management / Wind barriers",
    adaptation_measure_description:
      "Consider appropriate traffic management strategies for when storm and high wind events are occurring, and what resources are available to address adverse impacts\nIntroduce wind barriers to shield vehicles from high winds and reduce the amount of debris from blocking road structures",
    response_and_recovery_measures:
      "Emergency response (immediate safety actions; road closures/diversions)\nRemoval of blockage/debris",
    prompts_assumptions_comments:
      "What is the road structure type?\nHow are high winds and storms affecting its functionality?\nAre alternative routes available to redirect traffic away from the affected structure?\nHave other road structures impacted by high winds been identified?\nIs further monitoring required to assess the impact of high winds on road structures?\nAre other measures, such as using nature strips with certain varieties of trees, viable for reducing the impacts of wind?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 4,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water, flooding - fluvial",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Risk to road users (e.g., hydroplaning) due to temporary flooding impacts; premature pavement failure due to insufficient maintenance for climate change",
    adaptation_measure: "Appropriate drainage design to account for climate change uplifts / Procuring advanced warning systems",
    adaptation_measure_description:
      "Ensure that all drainage components (channels, pipes, receiving ponds) across the network are appropriately sized to account for future climate conditions, particularly increased rainfall intensity\nDevelop and implement a reconsidered maintenance plan or repair schedule that reflects climate uplift factors\nEnsure advanced warning systems are available (e.g., warnings for forecasted rainfall impact a day in advance and deploying warning systems)",
    response_and_recovery_measures:
      "Emergency response (immediate safety actions; road closures/diversions)\nSmart utilisation of existing communication networks to communicate road closures (e.g., coordination on smart motorways)",
    prompts_assumptions_comments:
      "Where does the drainage system discharge? For example, does it release into a river or water body that is prone to high levels that might result in hydraulic locking?\nWhat is the condition and capacity of the existing drainage infrastructure?\nHas the broader system been considered rather than the asset in isolation?\nIf a temporary impact, how quickly can the road be drained to allow usage?",
    case_study_id: "1339",
    relevant_case_studies:
      "Sustainable Drainage System - Transport for London\nSustainable Drainage System - Thames Water Utilities Ltd",
    identified_cobenefits: "community, environmental, biodiversity, carbon reduction",
  },
  {
    id: 5,
    transport_subsector: "Roads",
    transport_assets: "Road - Drainage",
    climate_hazard_cause: "High temperatures, drought",
    climate_hazard_effect: "Changes to vegetation, including vegetation dieback and storm damage",
    climate_risk_to_assets:
      "Wetlands and vegetation planted to treat surface water runoff from roads or pollutants may experience dieback due to high temperatures, reducing their effectiveness",
    adaptation_measure: "Use of drought-resistant plant species",
    adaptation_measure_description:
      "Select plant species for SuDS that account for increased temperatures\nEnsure appropriate maintenance levels to sustain vegetation health",
    response_and_recovery_measures: "Emergency planting and removal of dead/damaged vegetation",
    prompts_assumptions_comments:
      "What drought-resistant plant species have been identified for use in the drainage system?\nHow do these species perform in conditions of increased temperature?\nAre there examples of successful integration of these species into similar systems?",
    case_study_id: "133933109129",
    relevant_case_studies:
      "Sustainable Drainage System - Transport for London\nSustainable Drainage System - Thames Water Utilities Ltd\nClimate-resilient grass - Heathrow Airport Ltd",
    identified_cobenefits: "community, environmental, biodiversity, carbon reduction, economic",
  },
  {
    id: 6,
    transport_subsector: "Roads",
    transport_assets: "Road - Drainage",
    climate_hazard_cause: "Drought, heavy rainfall, high temperatures",
    climate_hazard_effect: "Water quality deterioration",
    climate_risk_to_assets:
      "First flush events (initial stormwater flows) after high temperatures carry high concentrations of pollutants from road surfaces into drainage systems, leading to deteriorating water quality",
    adaptation_measure: "Improved drainage design with pollutant traps",
    adaptation_measure_description:
      "Consider integrating pollutant traps, such as sediment traps, oil separators, or natural filtration systems, into the road drainage design\nUse treatment sandbags (e.g., chemical dosing) to neutralise pollutants\nInstall temporary filtration barriers (e.g., silt traps, activated carbon filters) in high-risk areas",
    response_and_recovery_measures: "",
    prompts_assumptions_comments:
      "What has been the environmental impact of first flush events from this asset in the past?\nHow can pollutant traps be effectively integrated into existing drainage system design?\nIf necessary, evaluate whether the use of climate-resilient species for natural filtration systems will provide the intended benefits. Additionally, consider the connection of the adaptation measure to flood mitigation for this asset.",
    case_study_id: "133981143146",
    relevant_case_studies:
      "Sustainable Drainage System - Transport for London\nSustainable Drainage System - Thames Water Utilities Ltd\nFoamed bitumen stabilisation - Department of Transport and Main Roads Queensland",
    identified_cobenefits: "community, environmental, biodiversity, carbon reduction, economic",
  },
  {
    id: 7,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "Flooding - surface water",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Increased risk to road users, particularly on local roads. Hidden hazards (e.g., submerged debris, road collapse) pose dangers to drivers and vehicles",
    adaptation_measure: "Early warning systems / Road safety education programs",
    adaptation_measure_description:
      "Provide road users with information on how to assess the depth of floodwater and identify potential hidden hazards\nInstall automatic road closure barriers to prevent entry to flooded areas\nInstall flood warning signs in high-risk areas",
    response_and_recovery_measures: "Emergency response (immediate safety actions; closures/diversions)",
    prompts_assumptions_comments:
      "Is the asset located on a local road or a main road, and how does this affect road safety?\nHow aware are drivers of the risks and hidden dangers associated with flooded roads?\nWhat measures can be taken to improve driver awareness of the risks and hidden dangers associated with flooded roads in flood-prone areas?",
    case_study_id: "133",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 8,
    transport_subsector: "Roads",
    transport_assets: "Road - Structures",
    climate_hazard_cause: "High temperatures, changes to humidity",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Shortened asset lifespan due to exposure to high humidity and heat; increased corrosion and degradation, especially in metal structures (e.g., bridges)",
    adaptation_measure: "Corrosion prevention",
    adaptation_measure_description:
      "Use of corrosion-resistant materials for metal structures\nProtective coating to limit moisture absorption in existing structures",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "Is the asset constructed from materials that are especially vulnerable to humidity? For example, hygroscopic materials.\nWhat ongoing maintenance strategies are required to protect structures that are vulnerable to high humidity?",
    case_study_id: "20",
    relevant_case_studies: "Glass fibre reinforcement for concrete - Major Road Projects Victoria",
    identified_cobenefits: "carbon reduction, economic",
  },
  {
    id: 9,
    transport_subsector: "Roads",
    transport_assets: "Road - Structures",
    climate_hazard_cause: "Flooding - fluvial",
    climate_hazard_effect: "Rockfalls, landslides, avalanches, scouring",
    climate_risk_to_assets:
      "Structure scour (e.g., undercutting of bridge foundations due to strong water flow) may cause structural instability and potential for bridge failure",
    adaptation_measure: "Scour protection",
    adaptation_measure_description:
      "Evaluate the need for scour protection for this asset\nConsider various options, such as rock armour (riprap) and articulated block mats\nConsider how to integrate climate uplift into the foundation design to withstand projected levels of water velocity",
    response_and_recovery_measures:
      "Emergency response (immediate safety actions; closures/diversions)\nBridge inspection after severe flooding events",
    prompts_assumptions_comments:
      "Is the bridge located in an area with high river flows?\nHave there been previous instances of bridge scour at this location?\nAre there alternative routes available, or is this bridge considered a critical route?\nIf it is a critical route, should an increased inspection regime be implemented?",
    case_study_id: "123134135",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 10,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "Storms and high winds, flooding - surface water, heavy rainfall",
    climate_hazard_effect: "Leaf-fall / tree-fall / debris",
    climate_risk_to_assets:
      "Roads becoming blocked due to fallen trees, debris, or accidents, leading to travel disruptions",
    adaptation_measure: "Automated Route Diversion Systems",
    adaptation_measure_description:
      "Use of existing smart communication systems on motorways to communicate automated route diversions based on real-time weather conditions\nEnsure that the smart communication networks are climate resilient, including features such as backup power banks in case of a power outage",
    response_and_recovery_measures: "Emergency response (immediate safety actions; closures/diversions)",
    prompts_assumptions_comments:
      "If applicable to the asset category, can smart communication systems be integrated with real-time weather and traffic updates?\nIs there a contingency plan in place for communication network failures during severe weather events?\nCould road authorities and emergency services more effectively use smart communication systems during emergencies?",
    case_study_id: "111116",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 11,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "Flooding - fluvial",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Flooding of roads built in floodplains; risk of extended road closures, increased maintenance costs",
    adaptation_measure: "Appropriate design to account for climate change uplifts",
    adaptation_measure_description:
      "During the design process, ensure that floodplain compensation measures account for future climate conditions, particularly increased rainfall intensity (i.e. compensation basins should account for the climate change uplift)\nUse climate projections to model increased peak river flows and rainfall levels\nThis information will help in designing road elevations, drainage systems, and embankments in accordance with Environment Agency guidance",
    response_and_recovery_measures:
      "Emergency response (immediate safety actions; closures/diversions)\nExisting flood recovery plans",
    prompts_assumptions_comments:
      "What is the current climate uplift factor for floodplain considerations in highway planning?\nHow does this uplift factor align with the guidelines provided by the Environment Agency?\nAre floodplain compensation measures, which include climate uplift considerations, consistently applied across all new road projects?\nIf not, can this be changed?",
    case_study_id: "136",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 12,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Rockfalls, landslides, avalanches, scouring",
    climate_risk_to_assets:
      "Flood-prone roads pose safety risks to road users at night due to poor visibility; drivers may be unaware of flooded sections, leading to accidents, vehicle damage or being stranded",
    adaptation_measure: "Early warning systems",
    adaptation_measure_description:
      "Link real-time weather monitoring to early warning systems to provide road users and operators with advanced updates on conditions",
    response_and_recovery_measures: "Emergency response (immediate safety actions; closures/diversions)",
    prompts_assumptions_comments:
      "Which types of roads (e.g., motorways, rural, urban) are most affected by adverse weather conditions in terms of safety for road users?\nHave early warning systems for these road types historically been effective in notifying drivers about hazards caused by flooding?\nWhat implications does this answer have for developing effective early warning systems?",
    case_study_id: "6",
    relevant_case_studies:
      "Early warning systems - Austrian Federal Railways (ÖBB)\nReal-time monitoring - Austrian Federal Railways (ÖBB)",
    identified_cobenefits: "community, biodiversity, economic",
  },
  {
    id: 13,
    transport_subsector: "Roads",
    transport_assets: "Road - Lighting",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Unlit flood-prone roads pose safety risks to road users at night due to poor visibility; drivers may be unaware of flooded sections, leading to accidents, vehicle damage or being stranded. Increased risk of hydroplaning in low-visibility conditions",
    adaptation_measure: "Enhanced lighting",
    adaptation_measure_description:
      "Install flood detection systems that activate flashing flood warning signs on roads prone to flooding\nImprove overhead lighting on roads in flood-prone areas",
    response_and_recovery_measures: "Emergency response (immediate safety actions; closures/diversions)",
    prompts_assumptions_comments:
      "Is the asset located within an existing or projected floodplain?\nHave unlit areas with a history of accidents been prioritised for improved lighting?\nIs the road a major route with high speeds, or a local road?\nWhat existing safety measures are in place for flooding events?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 14,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "Sea level rise",
    climate_hazard_effect: "Coastal erosion",
    climate_risk_to_assets:
      "Permanent loss of road infrastructure due to gradual or sudden erosion; safety risk to road users; loss of land",
    adaptation_measure: "Integrated coastal resilience planning / Nature-based solutions",
    adaptation_measure_description:
      "Establish a collaborative framework between transportation and environmental agencies for the development of coordinated adaptation strategies for coastal erosion\nIntegrate coastal defences (e.g. sea wall) to protect against or slow down coastal erosion\nIncorporate coastal protection measures within overall planning processes, rather than as a distinct issue\nRelocation of asset inland",
    response_and_recovery_measures:
      "Emergency response (immediate safety actions; closures/diversions)\nStrategic closure of road assets (where not critical)",
    prompts_assumptions_comments:
      "Where is the asset located, and what are the specific characteristics of this coastal area?\nWhat hazards does coastal erosion pose to road infrastructure in this location?\nHow can interagency cooperation enhance resilience and improve responses to coastal erosion in this area?\nWhat opportunities exist to strengthen collaboration between agencies for coordinated resilience measures?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 15,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "Sea level rise, flooding - coastal",
    climate_hazard_effect: "Other",
    climate_risk_to_assets: "Temporary road closure or loss of asset",
    adaptation_measure: "Intertidal reefs / Nature-based solutions",
    adaptation_measure_description:
      "Dune restoration and shoreline stabilisation through nature-based solutions, such as intertidal reefs",
    response_and_recovery_measures: "Temporary or permanent road closure",
    prompts_assumptions_comments:
      "Where is the asset situated in relation to the coast?\nHow susceptible is this land to coastal erosion?\nWhat are the potential impacts of coastal flooding on this asset?\nWould implementing a nature-based solution, such as intertidal reefs, be beneficial in this area?\nCan the loss of this road be managed through the existing network (i.e. accept risk)?",
    case_study_id: "2",
    relevant_case_studies: "Intertidal reefs - Prince Edward Island Transportation Infrastructure and Energy",
    identified_cobenefits: "community, environmental, biodiversity, carbon reduction",
  },
  {
    id: 16,
    transport_subsector: "Roads",
    transport_assets: "Road - Geotechnics",
    climate_hazard_cause: "Sea level rise",
    climate_hazard_effect: "Coastal erosion",
    climate_risk_to_assets:
      "Loss of road infrastructure and built-up earthworks due to gradual or sudden erosion; safety risk to road users; loss of land",
    adaptation_measure: "Use of nature-based solutions such as vegetation barriers",
    adaptation_measure_description:
      "Using nature-based solutions, such as vegetation barriers, can help reduce the rate of coastal erosion and provide additional environmental benefits\nEvaluate if road drainage systems are exacerbating coastal erosion, such as on coastlines where road drainage systems discharge onto weak cliffs\nRelocation of the road further inland to avoid the eroding cliff",
    response_and_recovery_measures:
      "Emergency response (immediate safety actions; closures/diversions)",
    prompts_assumptions_comments:
      "How vulnerable is the surrounding land of this asset to coastal erosion?\nWhat specific future climate conditions should be prepared for?\nHow might they influence coastal erosion at this location?\nHow does the soil type around the asset affect the erosion rate, and what precautions should be taken?\nAre existing road drainage systems inadvertently contributing to the erosion? Is this being monitored?\nHow can nature-based solution measures be incorporated into the road design to mitigate erosion and improve drainage?",
    case_study_id: "34128",
    relevant_case_studies: "Habitat restoration - California Department of Transportation (Caltrans)",
    identified_cobenefits: "community, environmental, biodiversity, economic",
  },
  {
    id: 17,
    transport_subsector: "Roads",
    transport_assets: "Road - Drainage",
    climate_hazard_cause: "Flooding - groundwater",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Groundwater upwelling can cause reverse flow into attenuation basins and infiltration devices, reducing the efficiency of drainage systems, heightening the risk of flooding, and pushing polluted road runoff back into natural water systems",
    adaptation_measure: "Appropriate drainage design to account for climate change uplifts",
    adaptation_measure_description:
      "In vulnerable areas consider using higher elevation discharge points or backflow prevention systems\nAttenuation basins should be designed to include overflow relief measures, taking groundwater upwelling into account",
    response_and_recovery_measures: "Existing flood recovery plans",
    prompts_assumptions_comments:
      "How does groundwater upwelling affect the effectiveness of drainage systems in this location?\nCan overflow basins be designed to effectively prevent runoff from being pushed back into natural water systems?",
    case_study_id: "42",
    relevant_case_studies: "Debris basin - Santa Barbara County",
    identified_cobenefits: "community, environmental, economic",
  },
  {
    id: 18,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "Storms and high winds, flooding - surface water, heavy rainfall",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "During roadworks or construction, unsealed roads are at risk of flooding, potentially leading to structural damage. Increased dangers from displaced traffic management (e.g., cones and barriers)",
    adaptation_measure: "Protection during road works",
    adaptation_measure_description:
      "Implement long-term strategic roadwork and construction planning that considers seasonal weather patterns to minimise the impact of extreme weather events\nIntegrate real-time weather forecasts into roadwork planning to allow for timely implementation of temporary protective measures, such as sealing partially exposed roads and installing flood barriers\nEvaluate and enhance traffic management measures, including cones and barriers, during extended roadworks",
    response_and_recovery_measures: "Existing flood recovery plans",
    prompts_assumptions_comments:
      "Are local road work schedules aligned with seasonal weather risks?\nWhat planning measures are currently in place for unsealed roads during extreme weather events?\nDo these measures effectively prevent damage to assets and hazards for road users?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 19,
    transport_subsector: "Roads",
    transport_assets: "Road - Roadside Operational Technology",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Communication and electrical system failure during extreme heat events (consecutive days of temperatures exceeding +40°C); overheating of roadside technology such as traffic signals, variable message signs and traffic monitoring equipment",
    adaptation_measure: "Asset temperature threshold considerations / Ventilation systems",
    adaptation_measure_description:
      "Upgrade roadside operational technology by utilising heat-resilient materials and improving ventilation to prevent overheating to account for future climate conditions",
    response_and_recovery_measures:
      "Emergency response\nConduct a post-event assessment to evaluate the reasons for system failures and integrate the findings into design standards",
    prompts_assumptions_comments:
      "How have high temperatures historically affected the reliability and functionality of communication systems?\nHow can future climate projections for the region be utilised to inform the planning, design, and maintenance of communication systems?",
    case_study_id: "108",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 20,
    transport_subsector: "Roads",
    transport_assets: "Road - Pavements",
    climate_hazard_cause: "Snow and ice",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Warmer weather leads to fewer freezing events and reduces the need for salting roads, leading to less material degradation and corrosion of road pavements and structures",
    adaptation_measure: "N/A - this is an opportunity",
    adaptation_measure_description:
      "Will the projected reduction in frost events and snowfall present an opportunity for lower maintenance and removal costs?",
    response_and_recovery_measures: "",
    prompts_assumptions_comments: "",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },

  // ─── AVIATION ───────────────────────────────────────────────────────────────

  {
    id: 21,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Hardstanding",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets: "Overheating in idle aircraft from outside air temperature increase",
    adaptation_measure: "Cooling, shading, ventilation, irrigation to prevent overheating",
    adaptation_measure_description:
      "Increase efficiency of air conditioning for parked aircraft by using internal cooling units or power connections powered by renewable sources",
    response_and_recovery_measures: "Temporary cooling systems or reduced operational capacity",
    prompts_assumptions_comments:
      "What are the operational and environmental co-benefits of improving the efficiency of air conditioning systems on stationed aircraft?\nWhat new technologies can integrate low-carbon building cooling systems with stationed aircraft on hardstanding?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 22,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Runway",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Risks to operations include flight delays, cancellations, and rerouting, as well as reduced air density affecting take-off and landing capabilities",
    adaptation_measure: "Adapting operations to environmental conditions / Cooling, shading, ventilation, irrigation",
    adaptation_measure_description:
      "Adjust flight schedules and loading capacities based on air density and peak temperatures\nUse cooling towers and irrigation techniques nearby the airfield to lower both surface and air temperatures on the runway",
    response_and_recovery_measures:
      "Emergency response (flight cancellations, rerouting, changes to schedules)",
    prompts_assumptions_comments:
      "What are the projected peak temperature periods in the region, and is the airport infrastructure resilient to these future temperatures?\nWhat historical data is there on runway performance during prolonged periods of high temperatures at the airport?\nWhat is the capacity of cooling towers for irrigation at the airport?\nHow might changes in temperature and humidity influence the overall irrigation strategy for the airport?\nWhat strategies are in place to address the reduced ability to climb in low-density conditions?",
    case_study_id: "14",
    relevant_case_studies: "Irrigation - Adelaide Airport",
    identified_cobenefits: "community, environmental, biodiversity, carbon reduction, decreased energy consumption, economic",
  },
  {
    id: 23,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Mechanical & electrical equipment",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Mechanical and electrical damage due to surface water flooding",
    adaptation_measure: "Appropriate design to account for climate change uplifts",
    adaptation_measure_description:
      "Design and implement suitably sized flood storage reservoirs based on projected future rainfall to temporarily store excess rainwater during heavy downpours, safeguarding areas with vulnerable electrical equipment from surface water flooding\nElevating electrical equipment to prevent damage from surface water flooding",
    response_and_recovery_measures:
      "Emergency response (drain surface water flooding)\nRepair or replace damaged equipment",
    prompts_assumptions_comments:
      "What areas at the airport are prone to flooding?\nIs there critical electrical equipment located in these areas?\nCan the equipment be moved or elevated?\nWould flood storage reservoirs be effective in reducing flooding in this area and recycling water for various uses?",
    case_study_id: "15",
    relevant_case_studies: "Flood storage reservoirs (dams) - Environment Agency",
    identified_cobenefits: "community, economic",
  },
  {
    id: 24,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Mechanical & electrical equipment",
    climate_hazard_cause: "Storm and high winds, high temperatures, changes to humidity, snow and ice",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Impact to external power supply resulting in impacts to airline operations",
    adaptation_measure: "Liaison with third party power supplies / Build in redundancy in power supplies",
    adaptation_measure_description:
      "Consider dependencies with external power providers\nConsider building in redundancy (e.g. battery storage, generators)\nEnsure critical infrastructure is prioritised for the return of power",
    response_and_recovery_measures:
      "Deployment of emergency electrical generation where plausible",
    prompts_assumptions_comments:
      "Have there been lessons learnt from previous power outages (e.g. Heathrow)?\nWhat localised power generation is possible (e.g. solar panels, battery storage)?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 25,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Access routes",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Disruptions of ground transportation and damage to infrastructure",
    adaptation_measure: "Pumping station and outfall tunnel",
    adaptation_measure_description:
      "Implement a pumping station and an outfall tunnel to manage heavy rainfall, preventing flooding on access routes",
    response_and_recovery_measures:
      "Emergency response (drain surface water flooding)\nEstablish alternative access routes if roads are blocked",
    prompts_assumptions_comments:
      "What are the historical flooding patterns for this asset?\nWould the implementation of outfall pumping tunnels improve the resilience of airport infrastructure?\nWhat are the long-term costs and benefits of this measure for airport operations?",
    case_study_id: "26",
    relevant_case_studies: "Pumping station and outfall tunnel - Qatar's Public Works Authority",
    identified_cobenefits: "community, carbon reduction, decreased energy consumption, economic",
  },
  {
    id: 26,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Runway",
    climate_hazard_cause: "Drought",
    climate_hazard_effect: "Changes to vegetation, including vegetation dieback and storm damage",
    climate_risk_to_assets:
      "Dead and dry grass, 'balling' or forming clumps on runways can affect aircraft take-off and landing",
    adaptation_measure: "Use of drought-resistant plant species",
    adaptation_measure_description:
      "Select plant species that can tolerate increased temperatures, such as deep-rooted grasses, which are known to withstand stresses like drought and diseases\nEnsure appropriate maintenance levels to sustain vegetation health",
    response_and_recovery_measures:
      "Changes to schedules\nTemporary irrigation\nRemoval of clumps of dry/dead grass on runways",
    prompts_assumptions_comments:
      "Can dieback of vegetation be replaced with climate-resilient grass that can withstand higher temperatures as part of standard maintenance schedules?\nWhat grass species will prevent balling or forming clumps that may impact the runway?\nAre there examples of successful integration of these species into similar scenarios?",
    case_study_id: "33",
    relevant_case_studies: "Climate-resilient grass - Heathrow Airport Ltd",
    identified_cobenefits: "environmental, carbon reduction, economic",
  },
  {
    id: 27,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Airline services",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Increased frequency and intensity of storms can lead to longer grounding of planes, disrupting the entire supply system of the airport. Operational risks include delays, cancelled flights and air traffic congestion. Reputational risks from passenger dissatisfaction and financial losses",
    adaptation_measure: "Communication strategies for resilience planning",
    adaptation_measure_description:
      "Develop knowledge of existing support systems, including regional hub airports for disrupted operations\nAssess the increasing frequency of storms on the global aviation system\nStrengthen channels with other airports to ensure readiness for the availability of hardstanding during irregular operations\nCreate effective communication strategies to address disruptions and minimise cascading impacts of storm events and high winds on operations and reputation",
    response_and_recovery_measures:
      "Emergency response (flight cancellations, rerouting, changes to schedules)",
    prompts_assumptions_comments:
      "How effectively does the airport coordinate with global aviation networks during storm-related disruptions?\nWhat buffer time is in place between landing and take-off?\nAre there contingency gates available to allow for adaptation during storm events?\nHow do deviation times for navigating around large storm systems impact the airport's operational resilience?\nWhat best-practice examples exist from other airports that can serve as models for improving communication measures?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 28,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Runway",
    climate_hazard_cause: "Flooding - surface water",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Heavy rainfall and surface water flooding can cause temporary operational disruptions, leading to flight delays and cancellations",
    adaptation_measure: "Appropriate design to account for climate change uplifts",
    adaptation_measure_description:
      "Build or increase the capacity of flood storage reservoirs to temporarily retain, store and discharge stormwater\nLong-term infrastructure planning should assess the capacity of localised drainage systems and whether they align with local projections of long-duration (5+ day cumulative rainfall events)\nStrategic discharge ahead of heavy rainfall, where possible",
    response_and_recovery_measures:
      "Emergency response (flight cancellations, rerouting, changes to schedules)",
    prompts_assumptions_comments:
      "What is the maximum amount of water that can be temporarily stored in local storage systems before needing to be discharged off-site?\nHow do extended periods of rainfall (e.g., 5-day rainfall) affect the ability to drain the area, particularly considering high water levels in the receiving environment?",
    case_study_id: "15",
    relevant_case_studies: "Flood storage reservoirs (dams) - Environment Agency",
    identified_cobenefits: "community, economic",
  },
  {
    id: 29,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Runway",
    climate_hazard_cause: "Sea level rise, flooding - coastal",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Risk of inundation from sea level rise and tidal surges inhibiting drainage, leading to prolonged flooding and operational disruptions for airports located near coastal and tidal river systems",
    adaptation_measure: "Appropriate design to account for climate change uplifts",
    adaptation_measure_description:
      "Build water retention areas to store excess water when river levels are too high to discharge, taking into account projected future high river levels\nAssess the combined impacts of high tides with high river levels, especially for estuary airports\nMonitor tidal conditions and discharge flood storage reservoirs during low tide\nEnsure drainage networks are clear and functioning",
    response_and_recovery_measures:
      "Emergency response (flight cancellations, rerouting, changes to schedules)",
    prompts_assumptions_comments:
      "Is the airport situated near coastal or estuarine features that may influence its vulnerability to high tides and coastal flooding?\nHow well understood are the current risks associated with storm effects during high tides on water retention areas?\nAre the existing strategies sufficient to mitigate the increased risks identified?",
    case_study_id: "15",
    relevant_case_studies: "Flood storage reservoirs (dams) - Environment Agency",
    identified_cobenefits: "community, economic",
  },
  {
    id: 30,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Access routes",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Flooded access roads can delay or prevent movement of passengers, airport staff, and emergency services, impacting operations and safety",
    adaptation_measure: "Appropriate design to account for climate change uplifts",
    adaptation_measure_description:
      "Construct alternative access routes with appropriate drainage design that meet climate uplift standards to withstand expected localised heavy rainfall events",
    response_and_recovery_measures:
      "Emergency response (flight cancellations, rerouting, changes to schedules)\nTargeted movement of people to allow emergency services to move freely",
    prompts_assumptions_comments:
      "How resilient is existing infrastructure to heavy rainfall events? What are the specific vulnerabilities?\nWhat data is available to understand the maximum rainfall patterns? How is this expected to change in the future?\nHow can this data inform route design for both current conditions and future climate scenarios?",
    case_study_id: "32",
    relevant_case_studies: "Balancing ponds - Heathrow Airport Ltd",
    identified_cobenefits: "community, environmental, biodiversity, carbon reduction",
  },
  {
    id: 31,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Runway",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets: "Risk of runway rutting due to prolonged high temperatures",
    adaptation_measure: "Irrigation and maintenance measures to cool the runway",
    adaptation_measure_description:
      "Store and use recycled water for cooling the runway during extreme heat events\nConsider using lighter colours for materials and areas surrounding the runway to reduce heat absorption",
    response_and_recovery_measures:
      "Emergency response (flight cancellations, rerouting, changes to schedules)\nEmergency repair or replacement of asset",
    prompts_assumptions_comments:
      "What are the temperature thresholds of the materials used on the runway?\nHow do these align with future projected max temperatures for the region?",
    case_study_id: "14",
    relevant_case_studies: "Irrigation - Adelaide Airport",
    identified_cobenefits: "community, environment, biodiversity, carbon reduction, decreased energy consumption, economic",
  },
  {
    id: 32,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Access routes",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Flooded access routes to and around the airport, including train stations, roads, emergency access routes and parking areas, leading to congestion and impacting airport operations",
    adaptation_measure: "Coordinated flood risk management with wider regional transport authorities",
    adaptation_measure_description:
      "Coordinate efforts with wider regional transport authorities to improve existing drainage systems to handle higher rainfall volumes, for example restoring natural assets such as wetlands upstream of the airport\nIncrease green infrastructure around transport links by replacing concrete areas with soil and vegetation where feasible to improve natural drainage",
    response_and_recovery_measures: "Existing flood recovery plans",
    prompts_assumptions_comments:
      "Which access routes to the airport are most vulnerable to flooding?\nIf flooded, what operational impact would this have on the airport?\nWho are the key external partners to involve in the development of a coordinated flood risk management plan?\nAre there adaptation measures that could be implemented within the airport grounds to increase natural drainage near transport links?",
    case_study_id: "32",
    relevant_case_studies: "Balancing ponds - Heathrow Airport Ltd",
    identified_cobenefits: "community, environment, biodiversity, carbon reduction",
  },
  {
    id: 33,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Airline services",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Reduced cargo capacity due to higher temperatures affecting take-off performance. Risk of delayed operations impacting airline and airport profitability, as well as supply chain disruptions",
    adaptation_measure: "Adjustments in operations and infrastructure to address impacts of high temperatures",
    adaptation_measure_description:
      "Develop plans to reroute critical cargo through alternative airports to minimise supply chain disruptions\nIf feasible, extend runway length to accommodate reduced aircraft performance and longer take-off distances\nReduce cargo on aircraft",
    response_and_recovery_measures: "",
    prompts_assumptions_comments:
      "What are the temperature thresholds that significantly affect take-off performance at this airport?\nHas this historically caused delays and disruptions in the supply chain?\nWhat was the cost to the airport?\nWere there alternative airports available to reroute critical cargo?\nIs it feasible to extend the runway length at the airport to accommodate reduced aircraft performance?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 34,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Airport services",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets: "Health risks to ground staff from extreme heat exposure",
    adaptation_measure: "Early warning systems that adjust work schedules",
    adaptation_measure_description:
      "Monitor weather forecasts to implement early warning systems that adjust work schedules to minimise ground staff's exposure to high temperatures\nIncreasing automation of remotely operated loading systems to limit human exposure to high temperatures\nUpgrading cooling systems in buildings where ground staff operate",
    response_and_recovery_measures: "Follow heat response plans\nOn-site medical response",
    prompts_assumptions_comments:
      "What are the heat exposure thresholds for safe working conditions?\nHow do these align with the region's projected maximum temperature data?\nWhat early warning systems are currently in place to ensure safe working conditions for ground staff?\nHow can these be improved to ensure safe working conditions for ground staff?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 35,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Hardstanding",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Increased solar gain on aircraft and cargo stored on hardstanding for prolonged periods. Risks to cargo, particularly perishables",
    adaptation_measure: "Increased shaded areas on hardstanding with targeted irrigation",
    adaptation_measure_description:
      "Build shading on hard-standing cargo areas; incorporate nature-based cooling solutions, such as green roofs to provide natural cooling\nUse of targeted irrigation to reduce surface air temperature",
    response_and_recovery_measures:
      "Rapid cooling techniques (i.e. moving to well ventilated or shaded or air-conditioned areas) to provide rapid heat relief to cargo",
    prompts_assumptions_comments:
      "How can shading and cooling systems for cargo be integrated into existing airport hardstanding infrastructure without consuming excessive energy?",
    case_study_id: "14",
    relevant_case_studies: "Irrigation - Adelaide Airport",
    identified_cobenefits: "community, environment, biodiversity, carbon reduction, decreased energy consumption, economic",
  },
  {
    id: 36,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Runway",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Intense crosswinds impact operations at UK airports, particularly during peak summer. Risk of flight delays or cancellations",
    adaptation_measure: "Runway alignment",
    adaptation_measure_description:
      "Evaluate the trends of prevailing wind patterns at the airport and consider the alignment of the runway to better align with dominant wind directions (e.g., east-west runways may offer better compatibility with wind patterns in the UK)",
    response_and_recovery_measures:
      "Emergency response (flight cancellations, rerouting, changes to schedules)",
    prompts_assumptions_comments:
      "How do crosswinds currently impact flight operations at the airport?\nWhat do climate models show for future wind patterns at the airport?\nWill these patterns change seasonally?\nCan existing runways or future designs be adjusted to better align with projected wind conditions?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 37,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Airline services",
    climate_hazard_cause: "Fog",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Reduced visibility affecting take-off and landing; risk of flight delays and cancellations; increased risk of collision",
    adaptation_measure: "Auto-landing technology",
    adaptation_measure_description:
      "Implement an auto-landing system at the airport\nLearn from other airport operators, such as Hong Kong Airport, who deal with similar visibility challenges",
    response_and_recovery_measures:
      "Emergency response (flight cancellations, rerouting, changes to schedules)",
    prompts_assumptions_comments:
      "How often are airport operations impacted by fog?\nHow can best practices from other airports that encounter similar visibility challenges be applied to this airport?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 38,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Airport services",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Risk of stranded passengers due to weather-related disruptions",
    adaptation_measure: "Early warning systems",
    adaptation_measure_description:
      "Early warning systems to include multiple real-time forecasting sources to alert airlines before a disruption occurs and to avoid passenger congestion\nDeploy teams to assist stranded passengers",
    response_and_recovery_measures: "",
    prompts_assumptions_comments:
      "How can real-time weather data be more effectively integrated with current airline scheduling?\nCould this system improve operational disruptions by notifying airlines before a disruption occurs?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 39,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Access routes",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Wildfire",
    climate_risk_to_assets:
      "Risk of delayed operations and damage to airport infrastructure",
    adaptation_measure: "Firebreaks and vegetation management",
    adaptation_measure_description:
      "Firebreaks on access routes and continued management of vegetation on airport grounds",
    response_and_recovery_measures:
      "Emergency service response\nEmergency response (flight cancellations, rerouting, changes to schedules)",
    prompts_assumptions_comments:
      "Have there historically been wildfires in the vicinity of the airport?\nDoes vegetation near access routes currently pose a fire risk?\nIn the event of a fire, which access routes are essential for maintaining functionality and require firebreaks?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 40,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Airport services",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Wildfire",
    climate_risk_to_assets:
      "Risk of delayed operations from wildfires nearby the airport",
    adaptation_measure: "Collaboration on fire risk management plans",
    adaptation_measure_description:
      "Collaboration with the local authority and other relevant stakeholders on fire risk management in areas surrounding the airport grounds",
    response_and_recovery_measures:
      "Emergency response (flight cancellations, rerouting, changes to schedules)",
    prompts_assumptions_comments:
      "Who are the key stakeholders necessary for implementing fire risk management in the vicinity of the airport grounds?\nHow can collaboration with these stakeholders be strengthened?\nHow can local firefighting agencies coordinate with airport operations during a wildfire?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 41,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Mechanical & electrical equipment",
    climate_hazard_cause: "Flooding - surface water",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Damage to supplier communication systems equipment; operational risks from overreliance on backup systems if communication supplier services are disrupted",
    adaptation_measure: "Supplier resilience planning",
    adaptation_measure_description:
      "Proactive conversations with private communications suppliers to ensure flood resilience in their infrastructure and equipment servicing the airport\nDeveloping emergency communication plans with the supplier in case of a potential outage",
    response_and_recovery_measures:
      "Use of backup systems until service is restored or emergency response (flight cancellations, rerouting, changes to schedules)",
    prompts_assumptions_comments:
      "What are the operational risks from overreliance on backup systems in the event that communication supplier services are disrupted?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 42,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Mechanical & electrical equipment",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Overheating in energy storage systems increases fire risks and can lead to power backup failures. Anticipated risks are associated with the increase in battery solutions as part of decarbonisation efforts within airports",
    adaptation_measure: "Fire safety measures for battery storage",
    adaptation_measure_description:
      "Designated fire-resistant areas for battery storage\nIntegrate temperature-controlled storage units\nImplement fire suppression systems in areas containing lithium-ion batteries\nTrain emergency teams for incidents involving battery-related fires\nDevelop a plan for energy rerouting in the event of a fire and/or backup power failure",
    response_and_recovery_measures:
      "Emergency service response\nEmergency response (flight cancellations, rerouting, changes to schedules)",
    prompts_assumptions_comments:
      "How should power banks be stored to minimise future fire risk?\nHow can we ensure that these areas are adequately protected against potential fire hazards?\nWhat methods can be used to monitor and maintain storage units to minimise fire risk?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 43,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Runway",
    climate_hazard_cause: "Low temperatures",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Warmer seasonal temperatures will reduce the frequency of days with temperatures below freezing, reducing the need for de-icing. Presents an economic opportunity for reduced costs associated with recycling de-icing materials (e.g. glycol), as well as less corrosion from de-icing chemicals",
    adaptation_measure: "N/A - this is an opportunity",
    adaptation_measure_description: "",
    response_and_recovery_measures: "",
    prompts_assumptions_comments: "",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 44,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Hardstanding",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Storm damage",
    climate_risk_to_assets:
      "Risk to aircraft damage when exposed to storms and high winds on hardstanding; increased maintenance costs due to wind-related damage",
    adaptation_measure: "Operational/maintenance adjustments",
    adaptation_measure_description:
      "Use aircraft shelters where possible\nSecure aircraft to mooring to minimise damage",
    response_and_recovery_measures:
      "Emergency repair or replacement of asset\nEmergency response (flight cancellations, rerouting, changes to schedules)",
    prompts_assumptions_comments:
      "What specific risks do storms and high winds have to aircraft on the hardstand at this airport?\nHow could these risks impact maintenance costs and operations?\nWhat operational adjustments can be made to reduce the risk of aircraft damage?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 45,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Airline services",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Changes to the jet stream could offer opportunities through increased tailwinds, increasing fuel efficiency on some routes",
    adaptation_measure: "N/A - this is an opportunity",
    adaptation_measure_description: "",
    response_and_recovery_measures: "",
    prompts_assumptions_comments: "",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 46,
    transport_subsector: "Aviation",
    transport_assets: "Aviation - Airline services",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Changes to jet streams could pose a risk to airline operations due to increasingly unpredictable seasonal shifts: stronger tailwinds might lead to aircraft arriving ahead of schedule, or stronger winds could disrupt flight paths",
    adaptation_measure: "Advanced jetstream forecasting",
    adaptation_measure_description:
      "Use multiple weather forecasting tools to anticipate changes in the jet stream ahead of time, adjusting flight routes and schedules according to the jet stream shifts",
    response_and_recovery_measures: "Changes to schedules\nLimit operations",
    prompts_assumptions_comments:
      "How can airlines use advanced weather forecasting to understand jet stream change and optimise flight routes and schedules?\nHow can this forecasting be utilised to take advantage of changes in jet streams, e.g., increased tailwinds and improved fuel efficiency on certain routes?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },

  // ─── RAIL ────────────────────────────────────────────────────────────────────

  {
    id: 47,
    transport_subsector: "Rail",
    transport_assets: "Rail - Signalling systems",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets: "Communications failure due to temperature threshold",
    adaptation_measure: "Cooling, shading, ventilation, irrigation to prevent overheating",
    adaptation_measure_description:
      "Locate equipment within shade, heat-resilient housing or areas with increased ventilation",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "How have high temperatures historically impacted the reliability and functionality of different types of signalling systems?\nWould locating vulnerable equipment in shade or heat-resilient housing, with increased ventilation, help mitigate against these impacts?\nIn what ways can projections of future maximum temperatures for the region be used to guide the planning, design, and maintenance of signalling systems?",
    case_study_id: "28101103105145148",
    relevant_case_studies: "Ventilation Systems - Government of South Australia",
    identified_cobenefits: "community, decreased energy consumption",
  },
  {
    id: 48,
    transport_subsector: "Rail",
    transport_assets: "Rail - Geotech",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets: "Ballast washout",
    adaptation_measure: "Appropriate design to account for climate change uplifts",
    adaptation_measure_description:
      "Drainage design to include climate uplift factor\nInstall protective barriers, such as rock armour in areas vulnerable to washout",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "Is this asset prone to flooding?\nHave ballasts previously been washed away beneath the tracks?\nIs flooding a drainage issue, or are protective barriers required?",
    case_study_id: "16100149",
    relevant_case_studies: "Earthworks - Network Rail",
    identified_cobenefits: "community, environment, biodiversity, carbon reduction, economic",
  },
  {
    id: 49,
    transport_subsector: "Rail",
    transport_assets: "Rail - Geotech",
    climate_hazard_cause: "Drought",
    climate_hazard_effect: "Subsidence / soil degradation / soil erosion",
    climate_risk_to_assets:
      "Delays, damages and safety risks due to decreased rainfall",
    adaptation_measure: "Use of drought-resistant plant species to provide stability / Consideration of ground movements in design",
    adaptation_measure_description:
      "Select plant species that are known to withstand drought, such as deep-rooted grasses\nDesign considerations for the potential of increased or decreased soil moisture\nEnsure appropriate maintenance levels to sustain vegetation health\nApply soil amendments to stabilise the soil quickly",
    response_and_recovery_measures: "",
    prompts_assumptions_comments:
      "Where is the asset located?\nWhat type of drought resistant vegetation is best suited to local soil and/or climate conditions?",
    case_study_id: "31132",
    relevant_case_studies: "Slope Stabilisation - Network Rail",
    identified_cobenefits: "community, environment, biodiversity, carbon reduction, economic",
  },
  {
    id: 50,
    transport_subsector: "Rail",
    transport_assets: "Rail - Track",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Wildfire",
    climate_risk_to_assets: "Risk of damage to rail infrastructure and rail track",
    adaptation_measure: "Firebreaks and vegetation management",
    adaptation_measure_description:
      "Consideration of any vegetation adjacent to the rail track and implications for fire risk",
    response_and_recovery_measures: "Emergency service response",
    prompts_assumptions_comments:
      "Are nature-based solutions introducing new wildfire risks to the rail network?\nCan strategic fire breaks be incorporated to reduce the spread of fire?\nAre suitable contingency options available to deal with increased fire risks?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 51,
    transport_subsector: "Rail",
    transport_assets: "Rail - Drainage",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Flooding from intense rainfall affects tram and train operations, especially those reliant on ground-based power. Risk to service disruptions, delays and increased reliance on backup systems",
    adaptation_measure: "Appropriate design to account for climate change uplifts",
    adaptation_measure_description:
      "Consider local climate projections for rainfall when designing rail drainage systems to ensure long-term resilience\nIf possible, raise tracks in flood-prone areas\nCollaboration between rail operators, other transport sectors and local authorities to ensure that shared drainage systems are maintained\nUse battery backup power to support rail services during power outage\nLong-term strategy — increase operational expenditure (OPEX) to enable more inspections and maintenance of drainage systems",
    response_and_recovery_measures:
      "Emergency response (drain excess water using water pumps and repair damaged equipment)\nAlternative route",
    prompts_assumptions_comments:
      "Is the tram/rail infrastructure built to withstand projected flood levels from future climate scenarios?\nDoes the track sit above flood levels?\nAre the current response plans adequately addressing recent rainfall events?\nHow do land use and location (urban vs. rural) influence drainage capacity and flood risk around rail infrastructure?",
    case_study_id: "3",
    relevant_case_studies:
      "Elevated tracks - Copenhagen Metro\nImproved drainage - Copenhagen Metro",
    identified_cobenefits: "community, environment, economic",
  },
  {
    id: 52,
    transport_subsector: "Rail",
    transport_assets: "Rail - Building and structures",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Risk of a flooded asset causing disruption to the transport network",
    adaptation_measure: "Natural Flood Management",
    adaptation_measure_description:
      "Plant trees in the upper catchment area to mitigate the flooding source, as well as soil and land management practices, such as soil aeration, planting hedgerows and buffer strips",
    response_and_recovery_measures: "Existing flood recovery plans",
    prompts_assumptions_comments:
      "What are the specific flood risks and vulnerabilities at the rail site?\nHow frequently do flooding events occur?\nWhat impact do they have on the asset and rail operations?\nWhat natural flood risk management options are available for this type of flooding?",
    case_study_id: "12",
    relevant_case_studies: "Natural Flood Management - Leeds City Council",
    identified_cobenefits: "community, environmental, biodiversity, carbon reduction, economic",
  },
  {
    id: 53,
    transport_subsector: "Rail",
    transport_assets: "Rail - Building and structures",
    climate_hazard_cause: "Flooding - fluvial",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Risk of a flooded asset causing disruption to the transport network due to river flooding",
    adaptation_measure: "Traditional engineering approaches",
    adaptation_measure_description:
      "Installation of movable weirs to lower the river level\nInstallation of flood walls and embankments to control water flow",
    response_and_recovery_measures: "Existing flood recovery plans",
    prompts_assumptions_comments:
      "What are the specific flood risks and vulnerabilities at the rail site?\nHow frequently do flooding events occur?\nWhat impact do they have on the asset and rail operations?\nWhat traditional flood risk management options are available for this type of flooding?",
    case_study_id: "12",
    relevant_case_studies: "Traditional engineering approaches - Leeds City Council",
    identified_cobenefits: "community, biodiversity, carbon reduction, economic",
  },
  {
    id: 54,
    transport_subsector: "Rail",
    transport_assets: "Rail - Track",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Extended periods of thermal stress can lead to broken rails, posing significant safety and operational risks from rail fractures, misalignment and buckling",
    adaptation_measure: "Real-time or remote monitoring",
    adaptation_measure_description:
      "Digital real-time monitoring systems for predictive decision-making when temperature trigger points are reached\nEstablish maximum temperature thresholds (trigger points) for each specific asset and connect these to operational changes and responses (e.g., enforced speed limits during extended heatwaves of 38°C)\nUnderstand asset vulnerability to stress-free temperature based on regional climate data rather than UK-wide data (currently set at 27°C for UK wide)\nIntroduce nature-based solutions, such as drought-resilient vegetation, to help reduce heat stress on the tracks",
    response_and_recovery_measures:
      "Speed restrictions on overheated tracks\nEmergency repair or replacement of the asset",
    prompts_assumptions_comments:
      "What is the stress-free temperature of this asset?\nWho is responsible for certain decisions, and has this been effectively outlined?\nAre the maintenance and degradation implications due to climate change clearly outlined in operating strategies?\nHow long would the track be resilient to high temperatures (e.g. 6 hours, 24 hours, 1 week), and do you have adequate response time?\nWhat is a trigger point for when a plan needs to be implemented?",
    case_study_id: "11102",
    relevant_case_studies: "Temperature Sensors - Deutsche Bahn",
    identified_cobenefits: "biodiversity, carbon reduction, decreased energy consumption",
  },
  {
    id: 55,
    transport_subsector: "Rail",
    transport_assets: "Rail - Lineside",
    climate_hazard_cause: "Heavy rainfall",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Risk to ground-sourced electrical systems (or battery-powered), causing power failures due to water ingress",
    adaptation_measure: "Resilient power supply",
    adaptation_measure_description:
      "Identify and transition vulnerable existing infrastructure from ground sources to elevated electrical systems wherever possible\nDesign new assets with elevated electrical systems\nImprove track drainage maintenance",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "What are the specific risks associated with water ingress in our current infrastructure?\nWould elevated systems mitigate these risks?\nWhat long-term benefits can be expected from using elevated electrical systems, and how do these compare to the initial investment?",
    case_study_id: "7",
    relevant_case_studies:
      "Elevating of critical equipment - Metropolitan Transportation Authority (MTA) - New York City Transit",
    identified_cobenefits: "environment, economic",
  },
  {
    id: 56,
    transport_subsector: "Rail",
    transport_assets: "Rail - Lineside",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Overheating of lineside equipment, leading to system failures and operational disruptions",
    adaptation_measure: "Cooling, shading, ventilation, irrigation to prevent overheating",
    adaptation_measure_description:
      "Use heat-resistant housing of lineside equipment to protect it from extreme temperatures\nApply light-coloured paint to minimise heat absorption\nAssess the use of nature-based cooling solutions, such as green infrastructure, wherever it does not increase the risk of leaf fall\nEstablish system redundancy by incorporating backup power systems and rapid-response protocols",
    response_and_recovery_measures:
      "Emergency response (move passengers to the nearest safe access point in case of system failure)\nIf a system failure is imminent, implement emergency cooling measures",
    prompts_assumptions_comments:
      "What colour can the box be coloured without causing glare concerns?\nAre there mal-adaptation concerns with the maintenance challenges of nature-based solutions?\nAre standards available to inform a consistent approach to dealing with overheating, and do adaptation measures align with design standards?\nDo standards meet future climate uplift?",
    case_study_id: "28",
    relevant_case_studies: "Ventilation Systems - Government of South Australia",
    identified_cobenefits: "community, decreased energy consumption",
  },
  {
    id: 57,
    transport_subsector: "Rail",
    transport_assets: "Rail - Drainage",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Wetlands and vegetation planted to treat surface water runoff or pollutants may experience dieback, reducing their effectiveness; increased runoff pollution, decreased flood resilience and higher maintenance costs",
    adaptation_measure: "Use of drought-resistant plant species",
    adaptation_measure_description:
      "Select plant species for Sustainable Drainage Systems (SuDS) that account for increased temperatures\nEnsure appropriate maintenance levels to sustain vegetation health\nLow maintenance structures to store water and slow release during droughts",
    response_and_recovery_measures: "Emergency planting and removal of dead/damaged vegetation",
    prompts_assumptions_comments:
      "How can water storage structures be integrated to support nature-based solutions / vegetation during drought periods?",
    case_study_id: "29122",
    relevant_case_studies: "Plant procurement strategy - High Speed 2",
    identified_cobenefits: "community, biodiversity, economic",
  },
  {
    id: 58,
    transport_subsector: "Rail",
    transport_assets: "Rail - Track",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Disturbance to wheel-rail interface and adhesion between rolling stock and track due to extreme high temperatures, resulting in potential derailment or collision",
    adaptation_measure: "Real-time or remote monitoring",
    adaptation_measure_description:
      "Survey areas with low adhesion using automated vehicles to map areas at risk\nUse remote sensing, such as technical sensors and weather forecasting tools, to provide real-time risks of adhesion to allow timely interventions",
    response_and_recovery_measures: "Emergency response (lubrication of track)",
    prompts_assumptions_comments:
      "What warning systems are currently in place to indicate when adhesion is at risk?\nDo the existing subsystems provide alerts for adhesion risks?\nHow can real-time and remote monitoring be integrated to provide more accurate information for timely decision-making?\nAre assets being maintained frequently enough to mitigate adhesion risks?\nHow is condition information used to inform adaptive management practices?",
    case_study_id: "6",
    relevant_case_studies: "Real-time monitoring - Austrian Federal Railways (ÖBB)",
    identified_cobenefits: "community, biodiversity, economic",
  },
  {
    id: 59,
    transport_subsector: "Rail",
    transport_assets: "Rail - Building and structures",
    climate_hazard_cause: "Sea level rise, flooding - coastal",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Exposure to saline water speeds up the corrosion of buildings and structures, increasing the risk of structural deterioration. This poses a risk to the inaccessibility and operational functionality of essential buildings, such as stations or maintenance facilities",
    adaptation_measure: "Installation of flood protection devices",
    adaptation_measure_description:
      "Flood barriers to prevent floodwater intrusion at high tide events\nExisting flood recovery plans\nReview and improve flood resilience plan based on incident report learnings",
    response_and_recovery_measures: "",
    prompts_assumptions_comments:
      "Can we learn from past flooding events to inform future resilience strategies?\nFor this asset type and location, what flood protection devices would be most effective?",
    case_study_id: "7112",
    relevant_case_studies:
      "Installation of flood protection devices - Metropolitan Transportation Authority (MTA) - New York City Transit",
    identified_cobenefits: "environment, economic",
  },
  {
    id: 60,
    transport_subsector: "Rail",
    transport_assets: "Rail - Building and structures",
    climate_hazard_cause: "Sea level rise, flooding - coastal",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Exposure to saline water speeds up the corrosion of buildings and structures, increasing the risk of structural deterioration. This poses a risk to the inaccessibility and operational functionality of essential buildings, such as stations or maintenance facilities",
    adaptation_measure: "Appropriate design to account for climate change uplifts",
    adaptation_measure_description:
      "Design culvert and drainage systems that naturally redirect water from buildings and structures\nInstallation of remote monitoring systems in flood-prone areas for proactive asset management and early detection\nConsider the abandonment of non-critical buildings and structures",
    response_and_recovery_measures: "Emergency diversion around these areas",
    prompts_assumptions_comments:
      "Is the vulnerable building or structure essential for operational continuity?\nWhat is the likelihood and severity of damage from sea level rise or coastal flooding?\nCan drainage systems be designed to redirect floodwater from this building or structure?\nDoes this design account for future sea level rise and increased severity of extreme weather events?",
    case_study_id: "31121124",
    relevant_case_studies: "Drainage renewal and refurbishment - Network Rail",
    identified_cobenefits: "community, environmental, biodiversity, carbon reduction, economic",
  },
  {
    id: 61,
    transport_subsector: "Rail",
    transport_assets: "Rail - Track",
    climate_hazard_cause: "Sea level rise, flooding - coastal",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Exposure to saline water, accelerating corrosion of track and electrical components. Service disruptions and safety risks caused by track deterioration or electrical failure",
    adaptation_measure: "Corrosion prevention",
    adaptation_measure_description:
      "Increased Ingress Protection (IP) ratings for electrical enclosures\nCathodic protection for vulnerable assets, such as civil assets, location cabinets, switches, relays and other sensitive electrical equipment",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "Would waterproofing and other protective measures, such as IP-rated enclosures, protect against saline intrusion in this location?\nCould cathodic protection be used to protect the most vulnerable assets?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 62,
    transport_subsector: "Rail",
    transport_assets: "Rail - Building and structures",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Storm damage",
    climate_risk_to_assets:
      "Structural damage to rail buildings and critical infrastructure. Increased risk of debris impact, affecting operations, safety and damaging assets",
    adaptation_measure: "Appropriate design to account for climate change uplifts / In-built financial consideration for resilience measures",
    adaptation_measure_description:
      "Consider barriers / protective screens (e.g. built or nature-based solutions) to reduce the impacts of high winds\nIn-built financial support for resilience measures and consideration of CAPEX and OPEX planning\nPre-allocate and distribute funds to allow increased funding available for impacts from storms",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "Is there sufficient funding for recovery from debris hitting built assets?\nWhat are the operational implications due to increased storm damage?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 63,
    transport_subsector: "Rail",
    transport_assets: "Rail - Track",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Derailment of trams, service disruptions, safety. Tram systems are particularly vulnerable as the tracks are often built into road surfaces, making it more difficult to drain and at higher risk of flooding",
    adaptation_measure: "Early warning systems",
    adaptation_measure_description:
      "Early warning systems which use technical sensors and weather forecasting tools to predict hazards and proactively apply speed restrictions, divert or cancel services\nFlood recovery plan",
    response_and_recovery_measures: "",
    prompts_assumptions_comments:
      "How can early warning systems be integrated into current decision-making?\nHow would these measures improve passenger safety and reduce infrastructure damage during heavy rainfall and flooding events?",
    case_study_id: "6113",
    relevant_case_studies:
      "Early warning systems - Austrian Federal Railways (ÖBB)\nReal-time monitoring - Austrian Federal Railways (ÖBB)",
    identified_cobenefits: "community, biodiversity, economic",
  },
  {
    id: 64,
    transport_subsector: "Rail",
    transport_assets: "Rail - Lineside",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water, storms and high winds",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets: "Electrical damage to lineside equipment",
    adaptation_measure: "Appropriate design to account for climate change uplifts",
    adaptation_measure_description:
      "Elevation of vulnerable lineside equipment above projected local flood levels to reduce water exposure\nRelocation of vulnerable equipment within high risk areas",
    response_and_recovery_measures:
      "Emergency flood response, including pumping systems for badly affected areas\nPost-event inspection of lineside equipment",
    prompts_assumptions_comments:
      "What are the projected flood levels for the local area? Will the asset be affected by these projections?\nWhich lineside equipment is vulnerable to water damage due to flooding?\nIs it possible to elevate or relocate the equipment out of high-risk areas?",
    case_study_id: "7",
    relevant_case_studies:
      "Elevating of critical equipment - Metropolitan Transportation Authority (MTA) - New York City Transit",
    identified_cobenefits: "environment, economic",
  },
  {
    id: 65,
    transport_subsector: "Rail",
    transport_assets: "Rail - Signalling systems",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Water damage to signalling systems can lead to signal failures, communication breakdowns, long-term operational issues, and continued repairs. This poses both operational and safety risks",
    adaptation_measure: "Resilient power supply and electrical equipment",
    adaptation_measure_description:
      "Utilise battery reserves near essential feeder points to ensure signalling systems remain operational during power outages\nEnhance the IP rating for enclosures housing critical assets, making sure they are more resilient to water damage (i.e. water resistant or waterproofing)\nTemporary signalling systems",
    response_and_recovery_measures: "",
    prompts_assumptions_comments:
      "Do current battery reserves provide enough power during prolonged flooding?\nHow can reserves be made more resilient during extreme weather conditions?\nShould IP ratings be increased for signalling systems in flood prone areas?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 66,
    transport_subsector: "Rail",
    transport_assets: "Rail - Track",
    climate_hazard_cause: "Sea level rise, flooding - coastal",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Increased corrosion caused by saltwater exposure of coastal railways poses a risk of more rapid degradation of track infrastructure, leading to safety concerns and higher maintenance costs",
    adaptation_measure: "Corrosion prevention",
    adaptation_measure_description:
      "Apply protective coatings to rail fastening and exposed steel to prevent salt and moisture corrosion\nUse of cathodic protection for sensitive electronics on coastal lines\nIncreased IP ratings for enclosures housing signalling and power",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "What is the most cost-effective and long-lasting coating solution for coastal railways?\nDoes this coating affect the functionality of the asset during high summer temperatures?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 67,
    transport_subsector: "Rail",
    transport_assets: "Rail - Track",
    climate_hazard_cause: "Drought",
    climate_hazard_effect: "Leaf-fall / tree-fall / debris",
    climate_risk_to_assets:
      "Adhesion risks from increased leaf fall which cause safety hazards from extended braking distances, and operational disruptions due to speed restrictions",
    adaptation_measure: "Vegetation management",
    adaptation_measure_description:
      "Increased vegetation maintenance to reduce drought stress and leaf fall\nReplacing dieback with drought-resistant species",
    response_and_recovery_measures: "Emergency removal of leaf fall from track surfaces",
    prompts_assumptions_comments:
      "Is leaf fall causing an adhesion risk during periods of drought?\nCan species with reduced leaf fall be used to replace the dieback of vegetation?\nAre existing maintenance measures sufficient for more frequent and prolonged droughts / low-adhesion conditions?",
    case_study_id: "1133",
    relevant_case_studies:
      "Vegetation Management - Deutsche Bahn\nClimate-resilient grass - Heathrow Airport Ltd",
    identified_cobenefits: "environmental, carbon reduction, economic",
  },
  {
    id: 68,
    transport_subsector: "Rail",
    transport_assets: "Rail - Building and structures",
    climate_hazard_cause: "Sea level rise, flooding - coastal",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Increased corrosion of tunnels and bridges from saltwater exposure, causing structural weakening of key assets",
    adaptation_measure: "Corrosion prevention",
    adaptation_measure_description:
      "Apply protective coatings on exposed metal surfaces to prevent salt and moisture corrosion",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "What is the most cost-effective and long-lasting coating solution for the asset?\nHow often would it need to be maintained to ensure continuous protection against corrosion?\nWould this coating affect the functionality of the asset during high summer temperatures?",
    case_study_id: "3",
    relevant_case_studies: "Waterproof tunnel designs - Copenhagen Metro",
    identified_cobenefits: "community, environment, economic",
  },
  {
    id: 69,
    transport_subsector: "Rail",
    transport_assets: "Rail - Power distribution",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Flooding incidents affecting stations, substations, and underground railway structures can result in significant operational and electrical damage. Risks posed by water intrusion into electrical systems",
    adaptation_measure: "Improved safeguarding of electrical systems",
    adaptation_measure_description:
      "Elevation of critical electrical systems above anticipated flood levels\nUse of cathodic protection for sensitive electronics on coastal lines\nIncreased IP ratings for enclosures housing signalling and power",
    response_and_recovery_measures:
      "Emergency response (in most flood prone areas)",
    prompts_assumptions_comments:
      "What are the projected local flood levels for the area?\nWill power distribution assets be affected by these projections?\nWhat assets have been identified as most vulnerable to water damage by flooding?\nIs it possible to elevate, protect, or relocate the equipment from the high-risk area?",
    case_study_id: "7",
    relevant_case_studies:
      "Elevating critical equipment - Metropolitan Transportation Authority (MTA) - New York City Transit",
    identified_cobenefits: "environmental, economic",
  },
  {
    id: 70,
    transport_subsector: "Rail",
    transport_assets: "Rail - Building and structures",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Flooding incidents affecting stations, substations, and underground railway structures can result in significant operational and structural damage. These flooding events present safety risks to both staff and passengers",
    adaptation_measure: "Storm basins design",
    adaptation_measure_description:
      "Design culvert systems to redirect stormwater away from critical buildings and structures\nRegularly maintain these drainage systems to ensure they function properly during storm and flood events",
    response_and_recovery_measures:
      "Flood recovery plan (pumping water from severely affected areas)",
    prompts_assumptions_comments:
      "How vulnerable is the asset to storm damage?\nWhat drainage system is most effective for underground or substation infrastructure?",
    case_study_id: "10",
    relevant_case_studies: "Storm Basins - Infrabel",
    identified_cobenefits: "environment, carbon reduction, decreased energy consumption, economic",
  },
  {
    id: 71,
    transport_subsector: "Rail",
    transport_assets: "Rail - Geotech",
    climate_hazard_cause: "Heavy rainfall",
    climate_hazard_effect: "Rockfalls, landslides, avalanches, scouring",
    climate_risk_to_assets:
      "Landslips and shrink-swell clays can cause ground movements (subsidence), increasing the risk of track deformation and misalignment due to unstable ground conditions. This event poses considerable safety and operational risks",
    adaptation_measure: "Slope stabilisation / Real-time or remote monitoring",
    adaptation_measure_description:
      "Alterations to earthworks using geotextiles, boulders or soil nails to reinforce embankments and prevent soil slippage during heavy rainfall events\nUse of LIDAR technology to monitor slope movement and detect early signs of instability, alongside existing ground sensors",
    response_and_recovery_measures:
      "Response teams for landslip clearance, stabilisation and temporary service diversion",
    prompts_assumptions_comments:
      "Is the track sitting on the top or bottom of earthworks?\nWhat drainage interventions (e.g. geotextiles or boulders) can be used to prevent soil slippage?\nHow can LIDAR technology be integrated into existing monitoring of ground stability?\nWhat impact would an early ground detection system have on track safety and rail operations?\nWould increased remote sensing mean less on-ground maintenance to be required?",
    case_study_id: "31130131",
    relevant_case_studies: "Slope Stabilisation - Network Rail",
    identified_cobenefits: "community, environmental, biodiversity, carbon reduction, economic",
  },

  // ─── MARITIME ────────────────────────────────────────────────────────────────

  {
    id: 72,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Machinery and equipment",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Lightning strikes",
    climate_risk_to_assets:
      "Damage to electrical machinery and equipment due to lightning strike, causing operational disruption",
    adaptation_measure: "Resilience and protection of electrical system",
    adaptation_measure_description:
      "Consider back-up electrical system and machinery (increase redundancy)\nKeep electrical equipment enclosed within a casing",
    response_and_recovery_measures:
      "Emergency repair or replacement of asset\nConsideration of temporary electrical equipment and standby equipment",
    prompts_assumptions_comments:
      "Where is the electrical machinery or equipment located?\nAre the electrical components exposed, do they require protection?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 73,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Dredged channels and berth-pockets",
    climate_hazard_cause: "Sea level rise, flooding - coastal",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Sea level rise leads to high water levels in the port, resulting in a reduced window for berthing and disruption of operations",
    adaptation_measure: "Operational/maintenance adjustments",
    adaptation_measure_description:
      "Increased maintenance dredging schedule due to change in water level in port",
    response_and_recovery_measures:
      "Changes to schedules, emergency diversions to other ports",
    prompts_assumptions_comments:
      "How will timings in the port be altered by rising sea levels?\nWill there need to be changed assumptions about how many vessels can be received each day?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 74,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Utilities and communication equipment",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Outages of electrical equipment and communications system due to extreme high temperatures, impacting capacity and performance of the electrical systems and causing operational disruption",
    adaptation_measure: "Cooling, shading, ventilation, irrigation to prevent overheating / Asset temperature threshold considerations",
    adaptation_measure_description:
      "Consideration of temperatures that utilities and communication systems may need to withstand; use equipment with higher temperature thresholds\nActive or passive cooling techniques (ventilation, shading, air conditioning)\nLocate equipment away from direct sunlight",
    response_and_recovery_measures:
      "Emergency portable generators to maintain electrical supply\nStandby emergency replacement of critical parts",
    prompts_assumptions_comments:
      "What are the operational temperature thresholds for electrical equipment?\nCould you consider active or passive cooling systems?\nWhat is the asset life of the equipment and will the future temperature over its asset life exceed thresholds?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 75,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Maritime port structures",
    climate_hazard_cause: "Sea level rise",
    climate_hazard_effect: "Coastal erosion",
    climate_risk_to_assets:
      "Scouring and undermining of port structures due to coastal erosion processes and higher wave activity (combination of higher sea level rise and extreme high water levels and bigger waves from increased wind speeds)",
    adaptation_measure: "Breakwater height considerations / Toe protection to structures / Maintenance and inspection scheduling",
    adaptation_measure_description:
      "Consider if breakwaters need to be built higher above the water level to reduce overtopping or if toe protection is suitable to reduce scouring and undermining effects\nIncrease in maintenance and inspection schedule to identify coastal erosion or scouring of port structures",
    response_and_recovery_measures:
      "Emergency repair or replacement of asset\nBeach nourishment",
    prompts_assumptions_comments:
      "Does the design of port structures account for scour and undermining risks?\nWhat material is the asset made of and is it susceptible to scour processes?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 76,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Dredged channels and berth-pockets",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Vessel access into and around the navigation zone and port is disrupted due to increased storms (high winds and wave heights), leading to operational downtime and disruption of supply chain",
    adaptation_measure: "Upgrade approach channels / Protect navigation zone / Upgrade vessels / Utilise weather forecasting",
    adaptation_measure_description:
      "Deepening or widening of approach channels\nExtend existing or construct new protection structures (e.g. breakwaters) to shelter critical areas of the navigation zone and port waters by dissipating waves\nUpgrade tug vessel fleet to improve control of vessels\nUpgrade vessels to improve their manoeuvrability (e.g. upgrading the propulsion system or increasing the size of the vessel for increased resilience to larger waves)\nWeather forecasting to prepare for storm disruption",
    response_and_recovery_measures:
      "Changes to schedules\nEmergency diversions to other ports",
    prompts_assumptions_comments:
      "What sizes of vessels does the port accommodate?\nWhat are their propulsion systems and manoeuvrability like in high winds and waves?\nDoes the current protection infrastructure shelter critical areas of the navigation zone and port waters?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 77,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Dredged channels and berth-pockets",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Coastal erosion",
    climate_risk_to_assets:
      "Higher intensity and frequency of storms lead to greater erosion, resulting in increased sediment entering waterbodies which is transported and deposited in dredged channels and berth pockets; this limits vessel access to and around the port",
    adaptation_measure: "Operational/maintenance adjustments",
    adaptation_measure_description:
      "More frequent dredging of higher volumes of sediment required",
    response_and_recovery_measures:
      "Emergency maintenance dredging\nChanges to schedules\nEmergency diversions to other ports",
    prompts_assumptions_comments:
      "What are the coastal processes currently like in the port, particularly in terms of sedimentation, accretion and flushing?\nIs the port inland, or within the catchment area of rivers and channels (which are sources of sediment)?\nWhat is the current monitoring and maintenance regime for the dredged channels and berth pockets, and how might this need to change in future?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 78,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Canals and inland waterways, including inland ports",
    climate_hazard_cause: "Sea level rise",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Increased water depths due to sea level rise provides an opportunity for larger vessels to use the port, increasing economic revenue",
    adaptation_measure: "N/A - this is an opportunity",
    adaptation_measure_description:
      "Can an increased sea level mean decreased requirement for dredging?\nCould deeper ships now access the port under certain scenarios?\nIs the projected increase in sea level enough to result in material changes to ship depths that can enter the port?",
    response_and_recovery_measures: "",
    prompts_assumptions_comments: "",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "economic",
  },
  {
    id: 79,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Canals and inland waterways, including inland ports",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Coastal erosion",
    climate_risk_to_assets:
      "Higher intensity and frequency of storms lead to greater erosion, resulting in increased sediment entering waterbodies which is transported and deposited in inland waterways; this limits vessel access to and around inland ports",
    adaptation_measure: "Operational/maintenance adjustments",
    adaptation_measure_description:
      "More frequent dredging of higher volumes of sediment required",
    response_and_recovery_measures:
      "Emergency maintenance dredging\nChanges to schedules\nEmergency diversions to other ports",
    prompts_assumptions_comments:
      "What are the coastal processes in the port, particularly in terms of sedimentation, accretion and flushing?\nIs the port inland, or within the catchment area of rivers and channels (which are sources of sediment)?\nWhat is the current monitoring and maintenance regime for the canals and inland waterways, and how might this need to change in future?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 80,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Maritime port structures",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Storm damage",
    climate_risk_to_assets:
      "Structural damage to port infrastructure (e.g. breakwaters and quay walls) due to overtopping and increased wave action",
    adaptation_measure: "Improve protection structures to protect critical port structures",
    adaptation_measure_description:
      "Increase sizing (height, length and width) of breakwaters to reduce overtopping and risk of failure\nAppropriate height of protection structures to account for suitable climate change uplifts",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "Where is the asset located and how vulnerable are they to structural damage?\nWhat is the height of the protection infrastructure and is it feasible to increase this?",
    case_study_id: "1979",
    relevant_case_studies:
      "Port extension, Sea defence - Société des Ports du Détroit (Strait Ports Company)\nWharf height increase, Rock armour - Cook Islands Ports Authority (CIPA)\nTidal barriers - Environment Agency",
    identified_cobenefits: "community, biodiversity, carbon reduction, decreased energy consumption, economic",
  },
  {
    id: 81,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Maritime port structures",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Storm damage",
    climate_risk_to_assets:
      "Mooring failure of physical navigation aids due to increased wind and wave action",
    adaptation_measure: "Operational/maintenance adjustments",
    adaptation_measure_description:
      "Consider non-physical navigation aids\nUpgrade and strengthen mooring of physical navigation aids\nIncreased, more regular maintenance and monitoring of physical navigation aids\nImprove and maintain effectiveness of non-physical navigation aids (e.g. keep navigation charts up to date)\nUpgrade and strengthen mooring of physical navigation aids to withstand higher loads",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "Consider the strength and age of the mooring system.\nWhat non-physical navigation aids are used by vessels in/out/around the port?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 82,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Maritime port structures",
    climate_hazard_cause: "Sea level rise",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Mooring structures are inoperable due to inundation of water from increasing sea levels",
    adaptation_measure: "Raise or strengthen mooring structures",
    adaptation_measure_description:
      "Raise elevation or strengthen mooring structures to maintain operations during higher water levels and waves",
    response_and_recovery_measures: "Changes to schedules, emergency diversions",
    prompts_assumptions_comments:
      "Consider the elevation of mooring structures compared to water levels.",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 83,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Maritime port structures",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "High wind and waves acting on a vessel increase the mooring forces beyond the mooring structures' capacity, resulting in their failure and potential damage to the vessel",
    adaptation_measure: "Increase mooring capacity",
    adaptation_measure_description:
      "Install more bollards, fenders and other mooring structures",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "Are bollards and other supporting mooring structures available and what is the cost of bollards and mooring structures?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 84,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Maritime port structures",
    climate_hazard_cause: "Sea level rise, flooding - coastal, flooding - groundwater",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Saltwater intrusion further inland increases the salinity of rivers, resulting in a higher risk of corrosion to port structures made of metal",
    adaptation_measure: "Corrosion prevention / Update maintenance schedules",
    adaptation_measure_description:
      "Install cathodic protection system for metal structures to prolong their asset life. Consider thicker structures in future construction\nIncreased maintenance and repair rating",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "Are there implications for asset life due to corrosion?\nConsideration of chemical composition as this can impact effectiveness of cathodic protection.",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 85,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Machinery and equipment",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "High temperatures result in mechanical failure due to overheating of machinery and equipment. They also increase health, safety and welfare risks to personnel, reducing the window for operation and maintenance activities",
    adaptation_measure: "Cooling, shading, ventilation, irrigation to prevent overheating / Equipment temperature threshold considerations",
    adaptation_measure_description:
      "Consideration of temperatures that utilities and communication systems may need to withstand; use equipment with higher temperature thresholds\nActive or passive cooling techniques (ventilation, shading, air conditioning)\nPlanning of work schedules to undertake operations in lower temperatures\nLocate equipment away from direct sunlight",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "What are the operational temperature thresholds for electrical equipment?\nCould you consider active or passive cooling systems?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 86,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Machinery and equipment",
    climate_hazard_cause: "Heavy rainfall, flooding - surface water",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Heavy rainfall causes surface water flooding which exceeds the capacity of the port's drainage system and causes water damage to machinery and equipment",
    adaptation_measure: "Improved drainage systems / Increase resilience of machinery and equipment",
    adaptation_measure_description:
      "Increase capacity of drainage system (e.g. increasing the diameter of pipes and culverts to discharge excess water into the sea at a quicker rate; use water storage/attenuation techniques such as balancing ponds)\nWaterproofing or increase elevation of critical machinery or equipment",
    response_and_recovery_measures:
      "Emergency repair or replacement of asset\nAllowing for flooding in less critical areas (i.e. accept risk)",
    prompts_assumptions_comments:
      "Does your port have sufficient area to increase drainage capacity or are there land constraints?",
    case_study_id: "25",
    relevant_case_studies: "Drainage systems - Resilient Florida Program",
    identified_cobenefits: "community, environmental",
  },
  {
    id: 87,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Machinery and equipment",
    climate_hazard_cause: "Sea level rise, flooding - coastal, flooding - groundwater",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Higher water levels due to sea level rise limits the effectiveness of the port's drainage system, delaying the drainage of surface water which increases risk of water damage to machinery and equipment",
    adaptation_measure: "Improved drainage systems / Increase resilience of machinery and equipment",
    adaptation_measure_description:
      "Increase capacity of drainage system (e.g. increasing the diameter of pipes and culverts to discharge excess water into the sea at a quicker rate; use water storage/attenuation techniques such as balancing ponds)\nWaterproofing or increase elevation of critical machinery or equipment",
    response_and_recovery_measures:
      "Emergency repair or replacement of asset\nAllowing for flooding in less critical areas (i.e. accept risk)",
    prompts_assumptions_comments:
      "Where is (critical) machinery and equipment located?\nAre they located near to parts of the drainage systems?\nAre critical components of the machinery and equipment raised off the ground level/floor?",
    case_study_id: "25",
    relevant_case_studies: "Drainage systems - Resilient Florida Program",
    identified_cobenefits: "community, environmental",
  },
  {
    id: 88,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Machinery and equipment",
    climate_hazard_cause: "Sea level rise, flooding - coastal",
    climate_hazard_effect: "Water damage",
    climate_risk_to_assets:
      "Coastal flooding exceeds the capacity of the port's drainage system and causes water damage to machinery and equipment",
    adaptation_measure: "Improved drainage systems / Increase resilience of machinery and equipment",
    adaptation_measure_description:
      "Extend existing or construct new protection structures (e.g. breakwaters) to shelter critical machinery and equipment by dissipating waves\nIncrease capacity of drainage system\nWaterproofing or increase elevation of critical machinery or equipment",
    response_and_recovery_measures:
      "Emergency repair or replacement of asset\nAllowing for flooding in less critical areas (i.e. accept risk)",
    prompts_assumptions_comments:
      "Where is (critical) machinery and equipment located?\nAre they located near to parts of the drainage systems?\nDoes your port have sufficient area to increase drainage capacity or are there land constraints?\nAre critical components of the machinery and equipment raised off the ground level/floor?",
    case_study_id: "25",
    relevant_case_studies: "Drainage systems - Resilient Florida Program",
    identified_cobenefits: "community, environmental",
  },
  {
    id: 89,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Machinery and equipment",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Storm damage",
    climate_risk_to_assets:
      "Operational downtime of machinery and equipment will increase due to high winds making crane operations unsafe, and potentially causing structural damage to the machinery and equipment. Storm conditions prevent maintenance activities from being undertaken",
    adaptation_measure: "Machinery and equipment upgrades / Flexibility of work schedules",
    adaptation_measure_description:
      "Strengthening and upgrading machinery and equipment to resist higher winds, for example investing in tie-down cranes\nImplement efficient work measures to handle a higher volume of cargo in a set time (e.g. constructing additional berths or increasing size of machinery and equipment to increase load/unloading rates)\nWeather forecasting to prepare for storm disruption\nReduce load carried by machinery and equipment",
    response_and_recovery_measures:
      "Maintenance to repair damaged machinery and equipment",
    prompts_assumptions_comments:
      "Where is the asset located? Are there limitations in the load that can be carried in high winds?\nConsider stopping lifting freight containers in 15 m/s wind speeds.\nWhat is the direction of wind and how steady is the wind?\nWhat is the design life and capacity of the cranes? Does this align with the required operating conditions?\nOperating threshold for cranes depends on wind direction and steadiness.",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 90,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Port support services",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Storm damage",
    climate_risk_to_assets:
      "Damage to storage buildings and infrastructure due to high wind forces",
    adaptation_measure: "Protective screens or barriers",
    adaptation_measure_description:
      "Protective screens or barriers in place to shelter storage buildings against high winds",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "How tall or large is the asset?\nIs it feasible to install screens or barriers around the building?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 91,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Port support services",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Extended periods of thermal stress can lead to broken rails from fractures, misalignment and buckling of rail-mounted machinery (e.g. cranes), posing safety and operational risks to rail infrastructure connected to the port",
    adaptation_measure: "Location specific design response",
    adaptation_measure_description:
      "Understand asset vulnerability to stress-free temperature based on regional climate data rather than UK-wide data (currently set at 27°C for UK wide)\nConsistency with rail sector for stress-free temperature and track alignment standards approach\nIntroduce nature-based solutions such as drought-resilient vegetation to reduce heat stress on track\nSpeed restrictions on overheated tracks to minimise derailment risks; temporary use of other vehicles to transfer required materials",
    response_and_recovery_measures: "",
    prompts_assumptions_comments:
      "What is the stress free temperature of this asset?\nWho is responsible for certain decisions and has this been effectively outlined?\nAre maintenance and degradation implications due to climate change clearly outlined in operating strategies?\nHow long would the track be resilient to high temperatures (e.g. 6 hours, 24 hours, 1 week) and do you have adequate response time?\nWhat is a trigger point for when a plan needs to be implemented?\nAre there interactions with other third-party asset owners of the rail assets?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 92,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Machinery and equipment",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Buckling of rails associated with rail-mounted machinery (e.g. cranes)",
    adaptation_measure: "Location specific design response / Trigger points",
    adaptation_measure_description:
      "Understand asset vulnerability to stress-free temperature based on regional climate data rather than UK-wide data\nConsistency with rail sector for stress-free temperature and track alignment standards approach\nIntroduce nature-based solutions such as drought-resilient vegetation to reduce heat stress on track\nEstablish maximum temperature thresholds (trigger points) for each specific asset and link these to operational changes and responses\nTrack real-time weather data for asset monitoring systems to allow for timely decision-making when trigger points are reached",
    response_and_recovery_measures:
      "Speed restrictions on overheated tracks to minimise derailment risks\nRepair asset",
    prompts_assumptions_comments:
      "What is the stress free temperature of this asset?\nWho is responsible for certain decisions and has this been effectively outlined?\nAre maintenance and degradation implications due to climate change clearly outlined in operating strategies?\nHow long would the track be resilient to high temperatures, and do you have adequate response time?\nWhat is a trigger point for when a plan needs to be implemented?",
    case_study_id: "11",
    relevant_case_studies: "Temperature Sensors - Deutsche Bahn",
    identified_cobenefits: "biodiversity, carbon reduction, decreased energy consumption",
  },
  {
    id: 93,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Port support services",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "High temperatures impact cargo in storage buildings and infrastructure",
    adaptation_measure: "Cooling, shading, ventilation, irrigation / Temperature controlled systems",
    adaptation_measure_description:
      "Temperature controlled systems in storage buildings",
    response_and_recovery_measures: "Compensation to cargo owners for damage",
    prompts_assumptions_comments:
      "What type of cargo is stored in warehouses and other storage infrastructure?\nAre areas appropriate for the stored cargo at a given port?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 94,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Port support services",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Storm damage",
    climate_risk_to_assets:
      "Impacts to stored containers due to high winds in the port in load and unload areas",
    adaptation_measure: "Install barriers/screens / Weather forecasting",
    adaptation_measure_description:
      "Install screens to protect/shelter against wind\nWeather forecasting to prepare for storm disruption\nLower stack height of containers",
    response_and_recovery_measures: "",
    prompts_assumptions_comments:
      "Is the asset in an exposed area?\nConsider limiting the stack height of containers.",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 95,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Dredged channels and berth-pockets",
    climate_hazard_cause: "Sea level rise",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Increased water depths due to sea level rise provides an opportunity for larger vessels to use the port, increasing economic revenue",
    adaptation_measure: "N/A - this is an opportunity",
    adaptation_measure_description:
      "Can an increased sea level mean decreased requirement for dredging?\nCould deeper ships now access the port under certain scenarios?\nIs the projected increase in sea level enough to result in material changes to ship depths that can enter the port?",
    response_and_recovery_measures: "",
    prompts_assumptions_comments: "",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "economic",
  },
  {
    id: 96,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Utilities and communication equipment",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Increased marine growth, including invasive plants and species, due to higher temperatures impacts the capacity of drainage systems and results in a higher risk of flooding",
    adaptation_measure: "Operational/maintenance adjustments",
    adaptation_measure_description:
      "Increase capacity of drainage system to account for marine growth blockages (e.g. increasing the diameter of pipes and culverts; use water storage/attenuation techniques such as balancing ponds)\nRegular maintenance to remove marine growth",
    response_and_recovery_measures: "Emergency maintenance to remove marine growth",
    prompts_assumptions_comments:
      "What is the current maintenance and monitoring regime for marine growth in the drainage system, and how might this need to change in future?\nDoes the design of the drainage system account for potential marine growth blockages?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 97,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Maritime port structures",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Changes to vegetation, including vegetation dieback and storm damage",
    climate_risk_to_assets:
      "Increased marine growth, including invasive plants and species, on port structures leads to structural damage",
    adaptation_measure: "Operational/maintenance adjustments / Strengthen port structures",
    adaptation_measure_description:
      "Regular maintenance to remove marine growth\nStrengthen port structures to resist loading of marine growth",
    response_and_recovery_measures: "Emergency removal activities",
    prompts_assumptions_comments:
      "What is the current maintenance and monitoring regime for marine growth on port structures (e.g. quay walls) and how might this need to change in future?\nDoes the design of port structures account for loading of marine growth?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "biodiversity",
  },
  {
    id: 98,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Port support services",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Wildfire",
    climate_risk_to_assets:
      "Damage to port support services, including storage infrastructure and connecting transport infrastructure, due to wildfires which causes operational disruption",
    adaptation_measure: "Firebreaks and vegetation management / Fire-resistant materials",
    adaptation_measure_description:
      "Create defensible space or fire breaks around buildings and infrastructure\nUse fire-resistant materials\nInstall fire extinguishing system in storage buildings and ensure suitable access around the port for emergency services",
    response_and_recovery_measures:
      "Emergency repair or replacement of asset\nUse of temporary sprinklers and firefighting equipment",
    prompts_assumptions_comments:
      "Is the port located in an area prone to wildfires?\nIs there sufficient fire fighting equipment available and access for emergency services?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 99,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Port support services",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Overheating including Urban Heat Island (UHI) effect",
    climate_risk_to_assets:
      "Overheating of maritime supporting technology such as traffic signalling, variable message signs and traffic monitoring equipment",
    adaptation_measure: "Cooling, shading, ventilation, irrigation / Asset temperature threshold considerations",
    adaptation_measure_description:
      "Upgrade operational technology with heat-resilient materials and improve ventilation to stop overheating\nAssess local future temperature projections\nPost-event assessment of why systems failed and incorporate findings into design standards; upgrade heat-sensitive systems",
    response_and_recovery_measures: "",
    prompts_assumptions_comments:
      "What are the thresholds the equipment can withstand?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 100,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Maritime port structures",
    climate_hazard_cause: "Drought",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Drought leads to lower water levels, impacting the ability to operate lock or tide gates",
    adaptation_measure: "Pumping system / Cross filling of locks / Water Saving Basins (WSBs) / Operational changes",
    adaptation_measure_description:
      "Pumping system to control water flow in/out of the lock system\nReusing water between the chambers of locks can help to reduce the amount of freshwater needed for each transit\nBasins designed to recycle water during the lockage process, which significantly reduces the amount of freshwater needed for each transit\nRestricting vessel drafts and daily transits, tandem lockages, minimising direction changes, addressing leaks, suspending special lockages and hydraulic assistance, reducing electricity generation",
    response_and_recovery_measures:
      "Use of pumping system, use of alternative berths without lock or tide gates, use of Water Saving Basins, cross-filling and operational changes",
    prompts_assumptions_comments:
      "Does the port have any lock or tide gates and what water levels do they require for operation?\nCan you consider cross-filling of locks or water saving basins which reduce the amount of freshwater needed for each transit?\nAre there any operational changes that could be made to respond to lower water levels?",
    case_study_id: "37",
    relevant_case_studies:
      "Water-savings basins in locks, Cross-filling in locks, Restrictions on draft and the maximum number of daily transits, Minimising direction changes at locks, Suspending special lockages and hydraulic assistance - Panama Canal Authority",
    identified_cobenefits: "community, environmental, biodiversity, economic",
  },
  {
    id: 101,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Canals and inland waterways, including inland ports",
    climate_hazard_cause: "Drought",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Drought leads to lower water levels in canals and inland waterways, reducing vessel access to inland ports",
    adaptation_measure: "Upgrade canals and inland waterways / Operational changes",
    adaptation_measure_description:
      "Deepening or widening of canals and inland waterways\nRestricting vessel drafts and daily transits, addressing leaks, reducing electricity generation",
    response_and_recovery_measures:
      "Reduction in vessel sizes accommodated by port and other operational changes",
    prompts_assumptions_comments:
      "What sizes of vessels does the port accommodate?\nAre there any operational changes that could be made to respond to lower water levels?",
    case_study_id: "437",
    relevant_case_studies:
      "Archimedes screws installed in pumping, Hydroelectric power stations - De Vlaamse Waterweg (Flemish Waterways)\nWater optimisation measures, Fresh water surcharge, Restrictions on draft and the maximum number of daily transits, Controlling and eliminating water leaks, Minimising electricity generation - Panama Canal Authority",
    identified_cobenefits: "community, environmental, biodiversity, economic",
  },
  {
    id: 102,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Dredged channels and berth-pockets",
    climate_hazard_cause: "Drought",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Drought leads to lower water levels in dredged channels and berth-pockets, reducing vessel access to and within ports",
    adaptation_measure: "Upgrade approach channels / Operational changes",
    adaptation_measure_description:
      "Deepening or widening of approach channels\nRestricting vessel drafts and daily transits, addressing leaks, reducing electricity generation",
    response_and_recovery_measures:
      "Reduction in vessel sizes accommodated by port and other operational changes",
    prompts_assumptions_comments:
      "What sizes of vessels does the port accommodate?\nAre there any operational changes that could be made to respond to lower water levels?",
    case_study_id: "437",
    relevant_case_studies:
      "Archimedes screws installed in pumping, Hydroelectric power stations - De Vlaamse Waterweg (Flemish Waterways)\nWater optimisation measures, Fresh water surcharge, Restrictions on draft and the maximum number of daily transits, Controlling and eliminating water leaks, Minimising electricity generation - Panama Canal Authority",
    identified_cobenefits: "community, environmental, biodiversity, economic",
  },
  {
    id: 103,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Utilities and communication equipment",
    climate_hazard_cause: "Storms and high winds",
    climate_hazard_effect: "Lightning strikes",
    climate_risk_to_assets:
      "Damage to electrical and communication systems due to lightning strike, causing operational disruption",
    adaptation_measure: "Resilience and protection of electrical system",
    adaptation_measure_description:
      "Ensure back-up electrical system is in place\nKeep electrical equipment enclosed within a casing",
    response_and_recovery_measures:
      "Emergency repair or replacement of asset\nConsideration of temporary communication systems",
    prompts_assumptions_comments:
      "Where is the electrical system located?\nIs it exposed, does it require protection?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 104,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Maritime port structures",
    climate_hazard_cause: "Heavy rainfall",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Port structures experience scour and weathering from frequent and intense rainfall events",
    adaptation_measure: "Material considerations / Protection structures",
    adaptation_measure_description:
      "Use of materials with consideration of climate change uplifts\nIncreased protection of port structures\nIncreased monitoring and observations of port structures",
    response_and_recovery_measures: "Emergency repair or replacement of asset",
    prompts_assumptions_comments:
      "Where is the asset located and are these structures susceptible to scour processes from heavy rainfall?\nWhat material is the asset made of and can this be replaced to structures that are more resistant to scouring?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 105,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Port support services",
    climate_hazard_cause: "Sea level rise, flooding - coastal",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Flooding and debris limits access to port buildings and services, causing operational disruption",
    adaptation_measure: "Appropriate design to account for climate change uplifts / Improve stormwater drainage system",
    adaptation_measure_description:
      "Appropriate height of protection structures (e.g. breakwaters and quay walls), raised buildings and services, drainage design to include climate uplift factor\nIncrease capacity of drainage system (e.g. increasing the diameter of pipes and culverts; use water storage/attenuation techniques such as balancing ponds)",
    response_and_recovery_measures:
      "Emergency removal of debris, slowing port operations until flooding subsides, stop non-critical port operations, strategic temporary pumps in critical port infrastructure areas",
    prompts_assumptions_comments:
      "Are there certain port services that can be ceased when it floods or debris impacts port operations?\nCan pumps be used to alleviate certain areas of flooding that are critical for port operations?",
    case_study_id: "25",
    relevant_case_studies: "Drainage systems - Resilient Florida Program",
    identified_cobenefits: "community, environmental",
  },
  {
    id: 106,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Machinery and equipment",
    climate_hazard_cause: "Snow and ice",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Global warming results in fewer snow and ice storms, reducing the risk of operational disruption for machinery and equipment",
    adaptation_measure: "N/A - this is an opportunity",
    adaptation_measure_description:
      "Does projected decreases in snow have implications for maintenance (i.e. will you be able to reduce maintenance activities associated with decreased snowfall)?",
    response_and_recovery_measures: "",
    prompts_assumptions_comments: "",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 107,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Port support services",
    climate_hazard_cause: "Flooding - surface water, flooding - fluvial",
    climate_hazard_effect: "Other",
    climate_risk_to_assets:
      "Flooding and debris limits access to port buildings and services, causing operational disruption",
    adaptation_measure: "Appropriate design to account for climate change uplifts",
    adaptation_measure_description:
      "Raised buildings and services, drainage design to include climate uplift factor, critical infrastructure placed above projected flood extents",
    response_and_recovery_measures:
      "Emergency removal of debris, slowing port operations until flooding subsides, stop non-critical port operations",
    prompts_assumptions_comments:
      "Can support services be built above the projected flood extent?\nIf not, can critical services be maintained throughout projected floods?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "",
  },
  {
    id: 108,
    transport_subsector: "Maritime",
    transport_assets: "Maritime - Port support services",
    climate_hazard_cause: "High temperatures",
    climate_hazard_effect: "Changes to distribution/behaviour of pests & diseases",
    climate_risk_to_assets:
      "Increased prevalence of pests on imported products due to high temperatures and habitat change",
    adaptation_measure: "Inspection and consideration of pests",
    adaptation_measure_description:
      "More rigorous inspection regimes for pests\nConsideration of habitat ranges for certain pests, and design of storage facilities to reduce optimal conditions for pest growth/colonisation",
    response_and_recovery_measures: "Compensation to cargo owners for damage",
    prompts_assumptions_comments:
      "What cargo is handled and stored in the port, and what types of pests could these bring?\nWhat are the optimal temperature and other conditions for these pests?",
    case_study_id: "",
    relevant_case_studies: "",
    identified_cobenefits: "biodiversity",
  },
];

/** ID-to-label maps for filter dropdowns */
export const SECTOR_MAP: Record<string, string> = {
  roads:    "Roads",
  rail:     "Rail",
  aviation: "Aviation",
  maritime: "Maritime",
};

export const HAZARD_MAP: Record<string, string> = {
  heat:     "High temperatures",
  rain:     "Heavy rainfall",
  flooding: "Flooding",
  storms:   "Storms and high winds",
  sealevel: "Sea level rise",
  drought:  "Drought",
  snow:     "Snow and ice",
  fog:      "Fog",
};

export const HAZARD_EFFECT_MAP: Record<string, string> = {
  overheating:  "Overheating including Urban Heat Island (UHI) effect",
  water_damage: "Water damage",
  debris:       "Leaf-fall / tree-fall / debris",
  coastal:      "Coastal erosion",
  rockfalls:    "Rockfalls, landslides, avalanches, scouring",
  storm_damage: "Storm damage",
  wildfire:     "Wildfire",
  lightning:    "Lightning strikes",
  subsidence:   "Subsidence / soil degradation / soil erosion",
  vegetation:   "Changes to vegetation, including vegetation dieback and storm damage",
  pests:        "Changes to distribution/behaviour of pests & diseases",
  other:        "Other",
};
