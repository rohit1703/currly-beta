-- =================================================================
-- Currly: api_usage schema additions
-- Idempotent — safe to run multiple times.
-- =================================================================

-- Make user_id nullable so anonymous endpoint calls can be logged
-- (search API is unauthenticated; generate API remains authenticated)
ALTER TABLE public.api_usage ALTER COLUMN user_id DROP NOT NULL;

-- Search context columns
ALTER TABLE public.api_usage ADD COLUMN IF NOT EXISTS query text;
ALTER TABLE public.api_usage ADD COLUMN IF NOT EXISTS mode  text;

-- Index for per-user rate-limit queries (used by /api/generate)
CREATE INDEX IF NOT EXISTS idx_api_usage_user_endpoint_time
  ON public.api_usage(user_id, endpoint, created_at DESC)
  WHERE user_id IS NOT NULL;
