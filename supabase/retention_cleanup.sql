-- =================================================================
-- Currly: Telemetry Retention Cleanup
-- Enforces the retention windows documented in our Privacy Policy:
--   search_events  → 90 days
--   tool_clicks    → 90 days
--   api_usage      → 30 days
--   search_queries → 180 days (aggregate counts, lower sensitivity)
--
-- Option A — pg_cron (Supabase Pro+):
--   Run once to register the scheduled jobs. They execute automatically.
--
-- Option B — Manual / free tier:
--   Run the DELETE statements directly whenever you want to prune data.
-- =================================================================

-- ── Option A: pg_cron scheduled jobs ─────────────────────────────
-- Requires pg_cron extension (enabled by default on Supabase Pro).
-- Run this block once; jobs persist across restarts.

SELECT cron.schedule(
  'purge-search-events',
  '0 3 * * *',    -- daily at 03:00 UTC
  $$DELETE FROM search_events WHERE searched_at < NOW() - INTERVAL '90 days'$$
);

SELECT cron.schedule(
  'purge-tool-clicks',
  '0 3 * * *',
  $$DELETE FROM tool_clicks WHERE clicked_at < NOW() - INTERVAL '90 days'$$
);

SELECT cron.schedule(
  'purge-api-usage',
  '0 3 * * *',
  $$DELETE FROM api_usage WHERE created_at < NOW() - INTERVAL '30 days'$$
);

SELECT cron.schedule(
  'purge-search-queries',
  '0 4 * * 0',    -- weekly on Sunday at 04:00 UTC
  $$DELETE FROM search_queries WHERE last_searched_at < NOW() - INTERVAL '180 days'$$
);

-- To verify scheduled jobs:
-- SELECT jobid, jobname, schedule, command FROM cron.job;

-- To remove a job if needed:
-- SELECT cron.unschedule('purge-search-events');


-- ── Option B: Manual one-shot cleanup ────────────────────────────
-- Run these directly in the SQL Editor whenever you want to prune.

/*
DELETE FROM search_events  WHERE searched_at        < NOW() - INTERVAL '90 days';
DELETE FROM tool_clicks    WHERE clicked_at          < NOW() - INTERVAL '90 days';
DELETE FROM api_usage      WHERE created_at          < NOW() - INTERVAL '30 days';
DELETE FROM search_queries WHERE last_searched_at    < NOW() - INTERVAL '180 days';

-- Check row counts after cleanup:
SELECT
  'search_events'  AS table_name, COUNT(*) FROM search_events  UNION ALL
  SELECT 'tool_clicks',           COUNT(*) FROM tool_clicks     UNION ALL
  SELECT 'api_usage',             COUNT(*) FROM api_usage        UNION ALL
  SELECT 'search_queries',        COUNT(*) FROM search_queries;
*/
