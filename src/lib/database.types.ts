/**
 * Hand-rolled types for the `app` schema on the DetectLead Supabase project.
 * Covers the phase-1 + phase-2 tables Island reads from. Regenerate with
 * `supabase gen types typescript --schema app` once Supabase CLI is set up.
 */

export type ContaminantRow = {
  id: number;
  name: string;
  cas_number: string | null;
  category: string;
  aliases: string[] | null;
  symbol: string | null;
  description: string | null;
  health_effects: string | null;
  is_carcinogen: boolean | null;
  is_reproductive_toxicant: boolean | null;
  source_notes: string | null;
  created_at: string;
};

export type ContaminantLimitRow = {
  id: number;
  contaminant_id: number;
  agency: string;
  agency_full: string | null;
  jurisdiction: string;
  limit_type: string;
  context: string;
  amount: number;
  unit: string;
  notes: string | null;
  citation_url: string | null;
  effective_date: string | null;
  source_dataset: string;
  ingested_at: string;
};

export type RecallRow = {
  id: number;
  source: string;
  external_id: string;
  classification: string | null;
  status: string | null;
  recall_date: string | null;
  report_date: string | null;
  termination_date: string | null;
  recalling_firm: string | null;
  product_name: string | null;
  product_description: string | null;
  reason_for_recall: string | null;
  hazard_terms: string[] | null;
  voluntary_mandated: string | null;
  initial_firm_notification: string | null;
  distribution_pattern: string | null;
  state: string | null;
  country: string | null;
  product_quantity: string | null;
  code_info: string | null;
  raw_data: unknown;
  ingested_at: string;
};

export type BllByStateRow = {
  id: number;
  state: string;
  year: number;
  geo_level: string;
  geo_id: string | null;
  geo_name: string | null;
  threshold_ugdl: number;
  children_tested: number | null;
  children_ebll: number | null;
  ebll_pct: number | null;
  age_range: string | null;
  source: string;
  source_url: string | null;
  notes: string | null;
  ingested_at: string;
};

export type ContaminantLimitsWideRow = {
  contaminant_id: number;
  contaminant: string;
  symbol: string | null;
  category: string;
  epa_drinking_water: number | null;
  epa_drinking_water_unit: string | null;
  fda_baby_food_ppb: number | null;
  fda_juice_ppb: number | null;
  prop65_nsrl_ugday: number | null;
  prop65_madl_ugday: number | null;
  atsdr_mrl: number | null;
  efsa_limit: number | null;
  efsa_unit: string | null;
  who_limit: number | null;
  cdc_blrv_ugdl: number | null;
};

export type Database = {
  app: {
    Tables: {
      contaminants: {
        Row: ContaminantRow;
        Insert: Partial<ContaminantRow>;
        Update: Partial<ContaminantRow>;
        Relationships: [];
      };
      contaminant_limits: {
        Row: ContaminantLimitRow;
        Insert: Partial<ContaminantLimitRow>;
        Update: Partial<ContaminantLimitRow>;
        Relationships: [];
      };
      recalls: {
        Row: RecallRow;
        Insert: Partial<RecallRow>;
        Update: Partial<RecallRow>;
        Relationships: [];
      };
      bll_by_state: {
        Row: BllByStateRow;
        Insert: Partial<BllByStateRow>;
        Update: Partial<BllByStateRow>;
        Relationships: [];
      };
    };
    Views: {
      contaminant_limits_wide: { Row: ContaminantLimitsWideRow; Relationships: [] };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
