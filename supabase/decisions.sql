-- =================================================================
-- Currly: Decision Capture
-- Idempotent — safe to run multiple times.
-- See docs/DECISION_SPEC.md for full entity definitions.
-- =================================================================

-- ── Tables ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.decision_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  context     text NOT NULL CHECK (context IN ('compare', 'stack')),
  tool_ids    uuid[] NOT NULL,
  icp_domain  text,
  budget_band text,
  source_path text,
  status      text NOT NULL DEFAULT 'decided'
              CHECK (status IN ('decided', 'undecided')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tool_choices (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_session_id uuid NOT NULL
    REFERENCES public.decision_sessions(id) ON DELETE CASCADE,
  tool_id             uuid NOT NULL
    REFERENCES public.tools(id) ON DELETE CASCADE,
  confidence          int  NOT NULL CHECK (confidence BETWEEN 1 AND 3),
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (decision_session_id, tool_id)
);

CREATE TABLE IF NOT EXISTS public.tool_rejections (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_session_id uuid NOT NULL
    REFERENCES public.decision_sessions(id) ON DELETE CASCADE,
  tool_id             uuid NOT NULL
    REFERENCES public.tools(id) ON DELETE CASCADE,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (decision_session_id, tool_id)
);

-- ── Indexes ──────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_decision_sessions_user
  ON public.decision_sessions(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_decision_sessions_created
  ON public.decision_sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_decision_sessions_icp
  ON public.decision_sessions(icp_domain, created_at DESC)
  WHERE icp_domain IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tool_choices_session
  ON public.tool_choices(decision_session_id);

CREATE INDEX IF NOT EXISTS idx_tool_choices_tool
  ON public.tool_choices(tool_id);

CREATE INDEX IF NOT EXISTS idx_tool_rejections_session
  ON public.tool_rejections(decision_session_id);

CREATE INDEX IF NOT EXISTS idx_tool_rejections_tool
  ON public.tool_rejections(tool_id);

-- ── RLS ──────────────────────────────────────────────────────────

ALTER TABLE public.decision_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_choices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tool_rejections    ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own sessions; anon rows have no RLS owner
DROP POLICY IF EXISTS "owner_all" ON public.decision_sessions;
CREATE POLICY "owner_all" ON public.decision_sessions
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Anonymous inserts allowed (user_id IS NULL path handled by service role in API)
DROP POLICY IF EXISTS "owner_choices" ON public.tool_choices;
CREATE POLICY "owner_choices" ON public.tool_choices
  FOR ALL USING (
    decision_session_id IN (
      SELECT id FROM public.decision_sessions WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "owner_rejections" ON public.tool_rejections;
CREATE POLICY "owner_rejections" ON public.tool_rejections
  FOR ALL USING (
    decision_session_id IN (
      SELECT id FROM public.decision_sessions WHERE user_id = auth.uid()
    )
  );

-- ── Admin view ────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.admin_decision_volume AS
SELECT
  date_trunc('day', ds.created_at)::date          AS date,
  COALESCE(ds.icp_domain, 'Unknown')              AS icp_domain,
  COUNT(DISTINCT ds.id)                            AS sessions,
  COUNT(DISTINCT tc.decision_session_id)           AS decisions_made,
  ROUND(
    100.0 * COUNT(DISTINCT tc.decision_session_id)
    / NULLIF(COUNT(DISTINCT ds.id), 0)
  )                                                AS submit_rate_pct,
  ROUND(AVG(tc.confidence)::numeric, 1)           AS avg_confidence
FROM   public.decision_sessions ds
LEFT JOIN public.tool_choices tc ON tc.decision_session_id = ds.id
GROUP  BY 1, 2
ORDER  BY 1 DESC, 3 DESC;

-- ── Retention cleanup (add to retention_cleanup.sql separately) ──
-- Anonymous decision sessions → 90 days
-- Authenticated sessions → retained indefinitely (user-owned data)
