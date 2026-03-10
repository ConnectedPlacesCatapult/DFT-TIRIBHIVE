export interface Article {
  seq: number;
  id: number;
  id_: string;
  adaptation_measure_title: string;
  adaptation_measure: string;
  risk: string;
  risk_in_p1_table: string | null;
  asset_owner_operator: string | null;
  type_of_adaptation_measure: string | null;
  country: string | null;
  start_year: string | null;
  end_year: string | null;
  summary_of_challenge_specific_risk: string | null;
  case_study: string | null;
  primary_transport_subsector: string | null;
  secondary_transport_subsector: string | null;
  asset: string | null;
  subasset: string | null;
  subasset2: string | null;
  subasset3: string | null;
  subasset4: string | null;
  source_url: string | null;
  page: string | null;
  title: string | null;
  image: string | null;
  cloudfree_days: string | null;
  drought: string | null;
  flooding_coastal: string | null;
  flooding_fluvial: string | null;
  flooding_surface_water: string | null;
  heavy_rainfall: string | null;
  high_temperatures: string | null;
  low_temperatures: string | null;
  sea_level_rise: string | null;
  storms_and_high_winds: string | null;
  air_pollution_dust: string | null;
  coastal_erosion: string | null;
  pests_and_diseases: string | null;
  rockfall_landslides_avalanches: string | null;
  storm_damage: string | null;
  urban_heat_island_uhi_effect: string | null;
  vegetation_dieback: string | null;
  water_damage: string | null;
  wildfire: string | null;
  funding: string | null;
  initial_costs: string | null;
  ongoing_costs: string | null;
  avoided_costs: string | null;
  community: string | null;
  environmental: string | null;
  biodiversity: string | null;
  carbon_reduction: string | null;
  decreased_energy_consumption: string | null;
  economic: string | null;
  evaluation_of_adaptation_measure: string | null;
  challenges: string | null;
  other_options_considered: string | null;
  lessons_learned: string | null;
  innovation_opportunities: string | null;
  stakeholder_interview: string | null;
  [key: string]: string | number | null | undefined;
}

export interface Option {
  transport_subsector: string;
  transport_assets: string;
  climate_hazard_cause: string;
  climate_hazard_effect: string;
  climate_risk_to_assets: string;
  adaptation_measure: string;
  adaptation_measure_description: string;
  response_and_recovery_measures: string;
  prompts_assumptions_comments: string;
  case_study_id: string;
  relevant_case_studies: string;
  identified_cobenefits: string;
  id: number;
}

export interface FilterMaps {
  allRisks: string[];
  allAssets: string[];
  riskToAssetMap: Record<string, string[]>;
  assetToRiskMap: Record<string, string[]>;
}

/** Handbook filter option lists (sector/effect from live site when not in data). */
export interface HandbookFilterOptions {
  sectors: string[];
  effects: string[];
}
