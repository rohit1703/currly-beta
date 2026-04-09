-- Run this in Supabase Dashboard → SQL Editor
-- Required for semantic/vector search to work

-- 1. Enable the pgvector extension (if not already enabled)
create extension if not exists vector;

-- 2. Add the embedding column to the tools table (if it doesn't exist)
alter table tools add column if not exists embedding vector(1536);

-- 3. Create an index for fast vector similarity search
create index if not exists tools_embedding_idx
  on tools
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 4. Create the match_tools function used by smartSearch
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
