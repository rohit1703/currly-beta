-- =================================================================
-- Currly: Outcome Collection (Initiative 2)
-- D7 / D30 post-decision check-ins.
-- Idempotent — safe to run multiple times.
-- =================================================================

-- ── Table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.workflow_outcomes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_session_id uuid NOT NULL
    REFERENCES public.decision_sessions(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL
    REFERENCES auth.users(id) ON DELETE CASCADE,
  check_day           int  NOT NULL CHECK (check_day IN (7, 30)),
  satisfaction        int  CHECK (satisfaction BETWEEN 1 AND 5),
  realized_cost       text,
  time_to_value       text CHECK (time_to_value IN (
                        '< 1 week', '1–4 weeks', '1–3 months',
                        'Still setting up', 'Not yet'
                      )),
  notes               text CHECK (char_length(notes) <= 500),
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (decision_session_id, check_day)
);

-- ── Indexes ───────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_workflow_outcomes_user
  ON public.workflow_outcomes(user_id);

CREATE INDEX IF NOT EXISTS idx_workflow_outcomes_session
  ON public.workflow_outcomes(decision_session_id);

-- ── RLS ───────────────────────────────────────────────────────────

ALTER TABLE public.workflow_outcomes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_all" ON public.workflow_outcomes;
CREATE POLICY "owner_all" ON public.workflow_outcomes
  FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Outcome signals materialized view (Initiative 4) ─────────────
-- Aggregates satisfaction scores per tool from workflow_outcomes.
-- Requires minimum 3 outcomes before a tool gets a signal.
-- Refresh: call refresh_outcome_signals() nightly (or post-write).

CREATE MATERIALIZED VIEW IF NOT EXISTS public.outcome_signals AS
SELECT
  tc.tool_id,
  COUNT(*)                                                        AS outcome_count,
  ROUND(AVG(wo.satisfaction)::numeric, 2)                        AS avg_satisfaction,
  ROUND(
    COUNT(*) FILTER (WHERE wo.satisfaction >= 4)::numeric
    / NULLIF(COUNT(*), 0), 2
  )                                                               AS high_sat_rate,
  -- Normalised score in [0, 1]: avg_satisfaction mapped from [1,5] → [0,1]
  ROUND(((AVG(wo.satisfaction) - 1.0) / 4.0)::numeric, 3)::float AS outcome_score
FROM   public.workflow_outcomes wo
JOIN   public.tool_choices tc ON tc.decision_session_id = wo.decision_session_id
WHERE  wo.satisfaction IS NOT NULL
GROUP  BY tc.tool_id
HAVING COUNT(*) >= 3;

CREATE UNIQUE INDEX IF NOT EXISTS idx_outcome_signals_tool
  ON public.outcome_signals(tool_id);

-- ── Refresh helper RPC ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.refresh_outcome_signals()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.outcome_signals;
$$;

-- ── Admin view ────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.admin_outcome_quality AS
SELECT
  t.name                  AS tool_name,
  t.slug,
  t.main_category,
  os.outcome_count,
  os.avg_satisfaction,
  os.high_sat_rate,
  os.outcome_score
FROM   public.outcome_signals os
JOIN   public.tools t ON t.id = os.tool_id
ORDER  BY os.outcome_score DESC;

-- ── Retention note ────────────────────────────────────────────────
-- workflow_outcomes follow the same retention as decision_sessions:
--   authenticated → kept indefinitely (user-owned data, DSAR-exportable)
--   anonymous     → N/A (auth required for outcomes)
