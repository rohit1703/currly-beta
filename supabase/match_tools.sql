-- Run this in Supabase Dashboard → SQL Editor
-- Fixes: "operator does not exist: extensions.vector <=> extensions.vector"

create or replace function match_tools (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  name text,
  slug text,
  description text,
  main_category text,
  pricing_model text,
  image_url text,
  is_india_based boolean,
  website text,
  launch_date timestamptz,
  similarity float
)
language sql stable
set search_path = public, extensions
as $$
  select
    id,
    name,
    slug,
    description,
    main_category,
    pricing_model,
    image_url,
    is_india_based,
    website,
    launch_date,
    1 - (embedding <=> query_embedding) as similarity
  from tools
  where
    embedding is not null
    and 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding asc
  limit match_count;
$$;
