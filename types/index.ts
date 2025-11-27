export interface Tool {
  id: string | number;
  notion_id: string;
  slug: string;
  name: string;
  description: string;
  website: string;
  image_url: string;
  main_category: string;
  pricing_model: string;
  launch_date: string;
  is_india_based?: boolean;
  key_features?: string[];
  founder_name?: string;
  use_case?: string;
  embedding?: number[];
}

export interface Category {
  name: string;
  slug: string;
  icon?: any;
  count?: string;
}