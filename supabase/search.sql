-- =================================================================
-- Currly: Full-Text + Semantic Search Setup
-- Idempotent — safe to run multiple times.
-- Run AFTER user_profiles.sql and collections.sql.
-- =================================================================

-- ── Extensions ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Weighted tsvector column ─────────────────────────────────────
-- name:A (highest), main_category/use_case:B, description:C
-- Backfills automatically for all existing rows on first run.
ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS search_tsv tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')),          'A') ||
    setweight(to_tsvector('english', coalesce(main_category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')),   'C')
  ) STORED;

-- ── Indexes ───────────────────────────────────────────────────────
-- GIN on legacy fts column (used by quickSearch / Supabase .textSearch())
CREATE INDEX IF NOT EXISTS idx_tools_fts
  ON public.tools USING gin(fts);

-- GIN on new weighted search_tsv (used by match_tools_ranked)
CREATE INDEX IF NOT EXISTS idx_tools_search_tsv
  ON public.tools USING gin(search_tsv);

-- HNSW ANN index — builds incrementally so memory is O(ef_construction × dim), not O(rows).
-- Better recall than ivfflat at all scales; no need to retune as the catalog grows.
-- m=16 and ef_construction=64 are the standard defaults.
DROP INDEX IF EXISTS idx_tools_embedding_ivfflat;
CREATE INDEX IF NOT EXISTS idx_tools_embedding_hnsw
  ON public.tools USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Supporting B-tree indexes for filter predicates
CREATE INDEX IF NOT EXISTS idx_tools_launch_status  ON public.tools(launch_status);
CREATE INDEX IF NOT EXISTS idx_tools_main_category  ON public.tools(main_category);
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON public.search_queries(query text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_tool_clicks_tool_id  ON public.tool_clicks(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_clicks_query    ON public.tool_clicks(query);
CREATE INDEX IF NOT EXISTS idx_tool_clicks_time     ON public.tool_clicks(clicked_at DESC);

-- ── RPCs ─────────────────────────────────────────────────────────

-- fuzzy_search_tools: pg_trgm trigram similarity fallback for typos / zero-FTS results
DROP FUNCTION IF EXISTS public.fuzzy_search_tools(text, integer);
CREATE OR REPLACE FUNCTION public.fuzzy_search_tools(
  search_query text,
  match_count  int DEFAULT 20
)
RETURNS TABLE (
  id             uuid,
  name           text,
  slug           text,
  description    text,
  main_category  text,
  pricing_model  text,
  image_url      text,
  is_india_based boolean,
  website        text,
  launch_date    timestamptz,
  is_featured    boolean
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT id, name, slug, description, main_category, pricing_model,
         image_url, is_india_based, website, launch_date, is_featured
  FROM   public.tools
  WHERE  launch_status = 'Live'
    AND  (name % search_query OR description % search_query)
  ORDER  BY GREATEST(similarity(name, search_query), similarity(description, search_query)) DESC
  LIMIT  match_count;
$$;

-- increment_search_count: atomic counter update on search_queries (called on duplicate insert)
CREATE OR REPLACE FUNCTION public.increment_search_count(search_query text)
RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  UPDATE public.search_queries
  SET    count            = count + 1,
         last_searched_at = now()
  WHERE  query = search_query;
$$;

-- match_tools: legacy vector-similarity RPC (kept for backward compatibility)
CREATE OR REPLACE FUNCTION public.match_tools(
  query_embedding vector(1536),
  match_threshold float,
  match_count     int
)
RETURNS TABLE (
  id             uuid,
  name           text,
  slug           text,
  description    text,
  main_category  text,
  pricing_model  text,
  image_url      text,
  is_india_based boolean,
  website        text,
  launch_date    timestamptz,
  similarity     float
)
LANGUAGE sql STABLE
SET search_path = public, extensions
AS $$
  SELECT id, name, slug, description, main_category, pricing_model,
         image_url, is_india_based, website, launch_date,
         1 - (embedding <=> query_embedding) AS similarity
  FROM   public.tools
  WHERE  launch_status = 'Live'
    AND  embedding IS NOT NULL
    AND  1 - (embedding <=> query_embedding) > match_threshold
  ORDER  BY embedding <=> query_embedding
  LIMIT  match_count;
$$;

-- match_tools_ranked: unified multi-signal ranking pipeline
--
-- Merges lexical (FTS) and semantic (pgvector) candidates in SQL,
-- scores each tool across five signals, and returns a weighted final_score.
--
-- Score signals:
--   lexical  — ts_rank_cd on search_tsv (name:A, category/use_case:B, description:C)
--   semantic — cosine similarity from pgvector embedding
--   quality  — is_featured flag (extend with avg_rating when available)
--   freshness — exponential decay from launch_date (1-year half-life)
--   behavior — log-normalized 30-day click count from tool_clicks
--
-- Weight blends by mode:
--   search: lex*0.35 + sem*0.40 + qual*0.15 + fresh*0.05 + behav*0.05
--   browse: qual*0.50 + fresh*0.30 + behav*0.20
CREATE OR REPLACE FUNCTION public.match_tools_ranked(
  query_embedding  vector(1536) DEFAULT NULL,
  query_fts        text         DEFAULT NULL,
  match_mode       text         DEFAULT 'search',
  filter_category  text         DEFAULT NULL,
  filter_pricing   text[]       DEFAULT NULL,
  page_number      int          DEFAULT 1,
  page_size        int          DEFAULT 20
)
RETURNS TABLE (
  id              uuid,
  name            text,
  slug            text,
  description     text,
  main_category   text,
  pricing_model   text,
  image_url       text,
  is_india_based  boolean,
  website         text,
  launch_date     timestamptz,
  is_featured     boolean,
  lexical_score   float,
  semantic_score  float,
  quality_score   float,
  freshness_score float,
  behavior_score  float,
  final_score     float
)
LANGUAGE plpgsql STABLE
SET search_path = public, extensions
AS $$
DECLARE
  _offset     int     := (COALESCE(page_number, 1) - 1) * COALESCE(page_size, 20);
  _limit      int     := COALESCE(page_size, 20);
  _max_clicks float   := 1.0;
  _has_fts    boolean := (query_fts IS NOT NULL AND length(trim(query_fts)) > 0);
  _has_vec    boolean := (query_embedding IS NOT NULL);
  _fts_q      tsquery;
BEGIN
  -- Parse FTS query; guard against malformed input
  IF _has_fts THEN
    BEGIN
      _fts_q := websearch_to_tsquery('english', query_fts);
      IF _fts_q IS NULL THEN _has_fts := false; END IF;
    EXCEPTION WHEN others THEN
      _has_fts := false;
    END;
  END IF;

  -- Denominator for log-normalizing behavior scores across this request
  SELECT COALESCE(MAX(cnt)::float, 1.0) INTO _max_clicks
  FROM (
    SELECT COUNT(*) AS cnt
    FROM   public.tool_clicks
    WHERE  clicked_at >= now() - interval '30 days'
    GROUP  BY tool_id
  ) _sub;

  RETURN QUERY
  WITH
  -- Live tools matching hard filters (category, pricing)
  base AS (
    SELECT t.id
    FROM   public.tools t
    WHERE  t.launch_status = 'Live'
      AND  (filter_category IS NULL OR t.main_category = filter_category)
      AND  (filter_pricing  IS NULL OR t.pricing_model = ANY(filter_pricing))
  ),
  -- FTS candidates: up to 100 tools matching the text query with lexical score
  fts_hits AS (
    SELECT t.id,
           ts_rank_cd(t.search_tsv, _fts_q, 4)::float AS lex_raw
    FROM   public.tools t
    JOIN   base b ON b.id = t.id
    WHERE  _has_fts
      AND  t.search_tsv @@ _fts_q
    ORDER  BY lex_raw DESC
    LIMIT  100
  ),
  -- Vector candidates: up to 100 tools above similarity threshold with semantic score
  vec_hits AS (
    SELECT t.id,
           GREATEST(0.0, 1.0 - (t.embedding <=> query_embedding))::float AS sem_raw
    FROM   public.tools t
    JOIN   base b ON b.id = t.id
    WHERE  _has_vec
      AND  t.embedding IS NOT NULL
      AND  (1.0 - (t.embedding <=> query_embedding)) > 0.20
    ORDER  BY t.embedding <=> query_embedding
    LIMIT  100
  ),
  -- Union of all candidate IDs.
  -- In search mode: union of FTS + vector hits (empty if neither signal has results).
  -- In browse mode (no query): all live tools matching filters.
  candidate_ids AS (
    SELECT id FROM fts_hits
    UNION
    SELECT id FROM vec_hits
    UNION
    SELECT id FROM base WHERE NOT (_has_fts OR _has_vec)
  ),
  -- 30-day click counts per candidate for behavioral signal
  click_counts AS (
    SELECT tool_id,
           COUNT(*)::float AS cnt
    FROM   public.tool_clicks
    WHERE  clicked_at >= now() - interval '30 days'
      AND  tool_id IN (SELECT id FROM candidate_ids)
    GROUP  BY tool_id
  ),
  -- Assemble all five signals for each candidate
  scored AS (
    SELECT
      t.id, t.name, t.slug, t.description, t.main_category,
      t.pricing_model, t.image_url, t.is_india_based, t.website,
      t.launch_date, t.is_featured,
      COALESCE(fh.lex_raw, 0.0)                                            AS lexical_score,
      COALESCE(vh.sem_raw, 0.0)                                            AS semantic_score,
      (CASE WHEN t.is_featured THEN 1.0 ELSE 0.3 END)::float              AS quality_score,
      EXP(
        -GREATEST(0.0,
          EXTRACT(EPOCH FROM (now() - COALESCE(t.launch_date, now()::timestamptz)))
        ) / 31536000.0
      )::float                                                             AS freshness_score,
      (LN(1.0 + COALESCE(cc.cnt, 0.0)) / LN(1.0 + _max_clicks))::float  AS behavior_score
    FROM   public.tools t
    JOIN   candidate_ids ci ON ci.id = t.id
    LEFT JOIN fts_hits    fh ON fh.id      = t.id
    LEFT JOIN vec_hits    vh ON vh.id      = t.id
    LEFT JOIN click_counts cc ON cc.tool_id = t.id
  ),
  -- Apply mode-specific weight blend to produce final_score
  ranked AS (
    SELECT
      s.*,
      CASE match_mode
        WHEN 'browse' THEN
          s.quality_score   * 0.50 +
          s.freshness_score * 0.30 +
          s.behavior_score  * 0.20
        ELSE
          s.lexical_score   * 0.35 +
          s.semantic_score  * 0.40 +
          s.quality_score   * 0.15 +
          s.freshness_score * 0.05 +
          s.behavior_score  * 0.05
      END AS final_score
    FROM scored s
  )
  SELECT
    r.id, r.name, r.slug, r.description, r.main_category,
    r.pricing_model, r.image_url, r.is_india_based, r.website,
    r.launch_date, r.is_featured,
    r.lexical_score, r.semantic_score, r.quality_score,
    r.freshness_score, r.behavior_score, r.final_score
  FROM ranked r
  ORDER BY r.final_score DESC
  LIMIT _limit OFFSET _offset;
END;
$$;
