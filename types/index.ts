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
  role: string;
  company_stage: string;
  team_size: string;
  region: string;
  monthly_budget_range: string;
  primary_use_case: string;
  created_at: string;
  updated_at: string;
}