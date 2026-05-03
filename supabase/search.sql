-- =================================================================
-- Currly: Full-Text + Semantic Search Setup
-- Revision: 2  (2026-05-03)
-- Changes: annotated all tunable weights; added version block;
--   noted TypeScript-layer signals (ICP, outcome) not present here.
-- Revision: 1  (2026-04-09)
--   Initial: pg_trgm + vector extensions, search_tsv generated column,
--   GIN + HNSW indexes, match_tools_ranked RPC, fuzzy_search_tools RPC.
--
-- Idempotent — safe to run multiple times.
-- Run AFTER user_profiles.sql and collections.sql.
--
-- SIGNAL ARCHITECTURE OVERVIEW
-- ─────────────────────────────
-- Signals applied in SQL (this file):
--   lexical   — ts_rank_cd on weighted tsvector (name:A, category:B, description:C)
--   semantic  — cosine similarity via pgvector (HNSW index, 1536-dim embeddings)
--   quality   — is_featured flag (binary; extend with avg_rating when available)
--   freshness — exponential decay from launch_date (1-year half-life)
--   behavior  — log-normalised 30-day click count from tool_clicks
--
-- Signals applied AFTER this RPC returns (in TypeScript, actions/ai-search.ts):
--   ICP boost      — use-case/role/budget multipliers (lib/icp-boost.ts)
--   Outcome boost  — satisfaction-derived multiplier (lib/outcome-boost.ts)
--
-- Cross-reference: docs/SEARCH_SPEC.md for full architecture.
-- =================================================================

-- ── Extensions ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- fuzzy_search_tools (typo tolerance)
CREATE EXTENSION IF NOT EXISTS vector;   -- pgvector cosine similarity

-- ── Weighted tsvector column ─────────────────────────────────────
-- name:A (highest weight), main_category/use_case:B, description:C.
-- Postgres default multipliers: A=1.0, B=0.4, C=0.2.
-- A name match scores 5× more than a description match.
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
-- m=16: bidirectional links per node. Range [4,64]. Higher = better recall, more memory.
--   Decrease if Supabase reports index build OOM. Increase only if recall is poor at scale.
-- ef_construction=64: candidate list during index build. Range [4,∞). Higher = better recall,
--   slower build. Tuning guide: ef_construction ≥ 2×m. Current ratio: 64/16=4× (conservative).
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

-- fuzzy_search_tools
-- Trigram similarity fallback. Fires only when both FTS and ilike return 0 results.
-- The '%' operator uses pg_trgm with default similarity threshold 0.3.
-- To raise/lower the threshold: SET pg_trgm.similarity_threshold = 0.4;
-- (session-level; can be added as a SET inside this function if needed)
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

-- increment_search_count
-- Atomic counter update on search_queries (called on duplicate insert conflict).
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

-- match_tools (legacy)
-- Vector-similarity RPC kept for backward compatibility with smartSearch().
-- Not used by the main search pipeline (match_tools_ranked supersedes it).
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

-- match_tools_ranked
-- ─────────────────────────────────────────────────────────────────
-- Unified multi-signal ranking pipeline. Called from runRankedSearch()
-- in actions/ai-search.ts after per-request ICP boost is applied in TypeScript.
--
-- Pipeline:
--   1. base   — live tools passing hard filters (launch_status, category, pricing)
--   2. fts_hits  — up to 100 FTS candidates with lexical score
--   3. vec_hits  — up to 100 vector candidates above similarity threshold
--   4. candidate_ids — union of fts + vec (or all base tools in browse mode)
--   5. click_counts  — 30-day behavioral signal per candidate
--   6. scored  — assemble 5 signals per candidate
--   7. ranked  — apply weight blend, produce final_score
--   8. return  — ORDER BY final_score DESC, LIMIT/OFFSET for pagination
--
-- TUNABLE WEIGHTS — search mode:
--   lexical   0.35  range [0.20, 0.50] — raise if users complain semantic is too loose
--   semantic  0.40  range [0.25, 0.55] — raise if embedding recall is high quality
--   quality   0.15  range [0.05, 0.25] — raise to surface featured tools more aggressively
--   freshness 0.05  range [0.00, 0.10] — lower to 0 if new tools have poor content
--   behavior  0.05  range [0.00, 0.10] — raise only when tool_clicks volume is statistically meaningful
--   SUM MUST EQUAL 1.0
--
-- TUNABLE WEIGHTS — browse mode (no query):
--   quality   0.50  — featured tools dominate when there's no query intent
--   freshness 0.30  — newer tools appear prominently in feed/explore views
--   behavior  0.20  — reward real-world interest without query context
--   SUM MUST EQUAL 1.0
--
-- TUNABLE THRESHOLDS:
--   semantic similarity floor: 0.20 — tools below this are too distant to be relevant
--     lower to 0.15 for broader recall; raise to 0.30 for stricter precision
--   FTS candidate cap: 100 — raise if precision is good but recall suffers at high traffic
--   vector candidate cap: 100 — same as FTS cap reasoning
--   freshness half-life: 31_536_000s (1 year) — halve to 0.5yr if new tools should surface faster
--   behavior window: 30 days — adjust to 7 or 90 days in tool_clicks WHERE clause
--
-- NOTE: After this RPC returns, TypeScript applies two additional signals:
--   1. ICP boost (lib/icp-boost.ts): ×1.1–1.2 per profile match; ceiling MAX_ICP_MULTIPLIER=1.40
--   2. Outcome boost (lib/outcome-boost.ts): up to ×1.10 for high-satisfaction tools
--      (gated by ENABLE_OUTCOME_RANKING env var; off until D30 data accumulates, ~mid-June 2026)
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
  -- Parse FTS query; guard against malformed input from websearch_to_tsquery
  IF _has_fts THEN
    BEGIN
      _fts_q := websearch_to_tsquery('english', query_fts);
      IF _fts_q IS NULL THEN _has_fts := false; END IF;
    EXCEPTION WHEN others THEN
      _has_fts := false;
    END;
  END IF;

  -- Denominator for log-normalizing behavior scores across this request.
  -- Using max across all candidates (not all tools) prevents global outliers
  -- from collapsing scores to near-zero.
  SELECT COALESCE(MAX(cnt)::float, 1.0) INTO _max_clicks
  FROM (
    SELECT COUNT(*) AS cnt
    FROM   public.tool_clicks
    WHERE  clicked_at >= now() - interval '30 days'  -- TUNABLE: window duration
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
  -- FTS candidates: up to 100 tools matching the text query with lexical score.
  -- ts_rank_cd normalization option 4: divides by 1 + log(document length).
  -- Prevents long descriptions from dominating purely because they're verbose.
  fts_hits AS (
    SELECT t.id,
           ts_rank_cd(t.search_tsv, _fts_q, 4)::float AS lex_raw
    FROM   public.tools t
    JOIN   base b ON b.id = t.id
    WHERE  _has_fts
      AND  t.search_tsv @@ _fts_q
    ORDER  BY lex_raw DESC
    LIMIT  100  -- TUNABLE: FTS candidate cap
  ),
  -- Vector candidates: up to 100 tools above similarity threshold.
  -- <=> is cosine distance; 1 - distance = cosine similarity.
  -- Threshold 0.20 gives broad recall; raise to 0.30 for stricter precision.
  vec_hits AS (
    SELECT t.id,
           GREATEST(0.0, 1.0 - (t.embedding <=> query_embedding))::float AS sem_raw
    FROM   public.tools t
    JOIN   base b ON b.id = t.id
    WHERE  _has_vec
      AND  t.embedding IS NOT NULL
      AND  (1.0 - (t.embedding <=> query_embedding)) > 0.20  -- TUNABLE: similarity floor
    ORDER  BY t.embedding <=> query_embedding
    LIMIT  100  -- TUNABLE: vector candidate cap
  ),
  -- Union of all candidate IDs.
  -- In search mode: union of FTS + vector (empty if neither signal produces results).
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
    WHERE  clicked_at >= now() - interval '30 days'  -- TUNABLE: matches _max_clicks window above
      AND  tool_id IN (SELECT id FROM candidate_ids)
    GROUP  BY tool_id
  ),
  -- Assemble all five signals for each candidate
  scored AS (
    SELECT
      t.id, t.name, t.slug, t.description, t.main_category,
      t.pricing_model, t.image_url, t.is_india_based, t.website,
      t.launch_date, t.is_featured,

      -- LEXICAL: ts_rank_cd; higher = better text match; range [0, ~1]
      COALESCE(fh.lex_raw, 0.0)                                            AS lexical_score,

      -- SEMANTIC: cosine similarity; range [0, 1]; 0 = unrelated, 1 = identical
      COALESCE(vh.sem_raw, 0.0)                                            AS semantic_score,

      -- QUALITY: binary for now; 1.0 if featured, 0.3 otherwise.
      -- 0.3 floor prevents completely zeroing non-featured tools under browse mode.
      -- Extend: replace 1.0/0.3 with a normalized avg_rating when ratings are available.
      (CASE WHEN t.is_featured THEN 1.0 ELSE 0.3 END)::float              AS quality_score,

      -- FRESHNESS: exponential decay, half-life = 1 year (31_536_000 seconds).
      -- Formula: e^(-age_seconds / half_life_seconds)
      -- Today = 1.0; 1yr ago ≈ 0.368; 2yr ago ≈ 0.135; 3yr ago ≈ 0.050.
      -- Tools with NULL launch_date are treated as launched now (score = 1.0).
      -- TUNABLE: change 31_536_000 to 15_768_000 for a 6-month half-life.
      EXP(
        -GREATEST(0.0,
          EXTRACT(EPOCH FROM (now() - COALESCE(t.launch_date, now()::timestamptz)))
        ) / 31536000.0  -- TUNABLE: half-life in seconds
      )::float                                                             AS freshness_score,

      -- BEHAVIOR: log-normalised click count.
      -- Formula: ln(1 + clicks) / ln(1 + max_clicks_in_window)
      -- Log prevents a single viral tool from collapsing all other scores to near-zero.
      -- Example: max=1000 clicks, tool has 10 clicks → ln(11)/ln(1001) ≈ 0.35 (not 0.01).
      (LN(1.0 + COALESCE(cc.cnt, 0.0)) / LN(1.0 + _max_clicks))::float  AS behavior_score
    FROM   public.tools t
    JOIN   candidate_ids ci ON ci.id = t.id
    LEFT JOIN fts_hits    fh ON fh.id      = t.id
    LEFT JOIN vec_hits    vh ON vh.id      = t.id
    LEFT JOIN click_counts cc ON cc.tool_id = t.id
  ),
  -- Apply mode-specific weight blend to produce final_score.
  -- TUNABLE: adjust weights per signal comments above. Sum must equal 1.0.
  ranked AS (
    SELECT
      s.*,
      CASE match_mode
        WHEN 'browse' THEN
          s.quality_score   * 0.50 +  -- TUNABLE: browse quality weight
          s.freshness_score * 0.30 +  -- TUNABLE: browse freshness weight
          s.behavior_score  * 0.20    -- TUNABLE: browse behavior weight
        ELSE  -- 'search' (default)
          s.lexical_score   * 0.35 +  -- TUNABLE: search lexical weight
          s.semantic_score  * 0.40 +  -- TUNABLE: search semantic weight
          s.quality_score   * 0.15 +  -- TUNABLE: search quality weight
          s.freshness_score * 0.05 +  -- TUNABLE: search freshness weight
          s.behavior_score  * 0.05    -- TUNABLE: search behavior weight
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

-- =================================================================
-- SAMPLE INVOCATIONS FOR LOCAL VERIFICATION
-- Run these in the Supabase SQL Editor to verify behavior.
-- Replace the embedding vector with a real one from the API for semantic tests.
-- =================================================================

/*
-- 1. Basic hybrid search (FTS + semantic)
SELECT name, main_category, pricing_model,
       round(lexical_score::numeric,3)   AS lex,
       round(semantic_score::numeric,3)  AS sem,
       round(quality_score::numeric,3)   AS qual,
       round(freshness_score::numeric,3) AS fresh,
       round(behavior_score::numeric,3)  AS behav,
       round(final_score::numeric,3)     AS final
FROM match_tools_ranked(
  query_embedding  := NULL,          -- omit for FTS-only test
  query_fts        := 'email outreach OR cold email OR sales automation',
  match_mode       := 'search',
  filter_category  := NULL,
  filter_pricing   := NULL,
  page_number      := 1,
  page_size        := 10
);

-- 2. Category-filtered browse (no query)
SELECT name, main_category, round(final_score::numeric,3) AS final
FROM match_tools_ranked(
  query_embedding  := NULL,
  query_fts        := NULL,
  match_mode       := 'browse',
  filter_category  := 'Customer Support',
  filter_pricing   := NULL,
  page_number      := 1,
  page_size        := 20
);

-- 3. Pricing filter + FTS
SELECT name, pricing_model, round(final_score::numeric,3) AS final
FROM match_tools_ranked(
  query_embedding  := NULL,
  query_fts        := 'image generation OR text to image',
  match_mode       := 'search',
  filter_category  := NULL,
  filter_pricing   := ARRAY['free', 'freemium'],
  page_number      := 1,
  page_size        := 10
);

-- 4. Edge case: query with no FTS match (forces vector-only or fallback)
SELECT name, round(lexical_score::numeric,3) AS lex, round(semantic_score::numeric,3) AS sem
FROM match_tools_ranked(
  query_embedding  := NULL,
  query_fts        := 'zzz_no_match_xyz',
  match_mode       := 'search',
  page_number      := 1,
  page_size        := 5
);

-- 5. Pagination (verify OFFSET works correctly)
-- Page 1:
SELECT name, round(final_score::numeric,3) AS final
FROM match_tools_ranked(query_fts := 'AI assistant', page_number := 1, page_size := 5);
-- Page 2 (should not overlap with page 1):
SELECT name, round(final_score::numeric,3) AS final
FROM match_tools_ranked(query_fts := 'AI assistant', page_number := 2, page_size := 5);

-- 6. Check freshness decay for a specific tool
SELECT name, launch_date,
  round(EXP(-GREATEST(0.0, EXTRACT(EPOCH FROM (now() - launch_date))) / 31536000.0)::numeric, 3)
  AS freshness
FROM tools
WHERE launch_status = 'Live'
ORDER BY launch_date DESC NULLS LAST
LIMIT 20;
*/
