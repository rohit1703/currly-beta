export interface SearchScores {
  lexical: number;
  semantic: number;
  quality: number;
  freshness: number;
  behavior: number;
  final: number;
}

export interface ICPBoostDebug {
  pre_boost_final: number;
  multiplier: number;      // clamped value actually applied
  raw_multiplier: number;  // value before ceiling
  reasons: string[];       // e.g. ['use_case', 'pricing']
}

export interface Tool {
  id: string | number;
  notion_id?: string;
  slug: string;
  name: string;
  description: string;
  website: string;
  image_url: string;
  main_category: string;
  pricing_model: string;
  launch_date: string;
  is_india_based?: boolean;
  is_featured?: boolean;
  key_features?: string[];
  founder_name?: string;
  use_case?: string;
  embedding?: number[];
  website_url?: string;
  logo_url?: string;
  _scores?: SearchScores;
  _debug_icp?: ICPBoostDebug; // only populated in non-production when DEBUG_SEARCH=true
}

export interface Category {
  name: string;
  slug: string;
  icon?: any;
  count?: string;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  share_token?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  tool_count?: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  onboarding_status: 'not_started' | 'skipped' | 'completed';
  role: string | null;
  company_stage: string | null;
  team_size: string | null;
  region: string | null;
  monthly_budget_range: string | null;
  primary_use_case: string | null;
  created_at: string;
  updated_at: string;
}