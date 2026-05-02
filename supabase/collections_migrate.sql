-- =================================================================
-- Currly: Collections migration from saved_tools
-- Run ONCE after collections.sql has been applied.
-- Creates a "My Stack" collection for every user that has saved_tools
-- and migrates their existing saves into collection_tools.
-- =================================================================

WITH new_collections AS (
  INSERT INTO public.collections (user_id, name)
  SELECT DISTINCT user_id, 'My Stack'
  FROM public.saved_tools
  ON CONFLICT (user_id, name) DO NOTHING
  RETURNING id, user_id
)
INSERT INTO public.collection_tools (collection_id, tool_id, added_at)
SELECT nc.id, st.tool_id, st.created_at
FROM new_collections nc
JOIN public.saved_tools st ON st.user_id = nc.user_id
ON CONFLICT (collection_id, tool_id) DO NOTHING;

-- Verify row counts:
-- SELECT COUNT(DISTINCT user_id) AS users_with_saves FROM saved_tools;
-- SELECT COUNT(*) AS collections_created FROM collections WHERE name = 'My Stack';
-- SELECT COUNT(*) AS tools_migrated FROM collection_tools;
--
-- Do NOT drop saved_tools until all code references are updated and
-- the deployment has been stable for 48 hours.
