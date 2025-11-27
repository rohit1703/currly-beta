export interface Tool {
  id: number;
  notion_id: string;
  slug: string;
  name: string;
  description: string;
  website: string;
  image_url: string;
  main_category: string;
  pricing_model: string;
  launch_date: string;
  is_india_based: boolean; // Derived from Geographic Focus
  key_features?: string[];
  founder_name?: string;
  use_case?: string;
  // embeddings are usually not needed on the frontend
}

export interface Category {
  name: string;
  slug: string;
  icon?: any; // Lucide icon component
  count?: string;
}

export interface SearchResult {
  tools: Tool[];
  semanticQuery?: string; // The AI's interpretation of the search
}