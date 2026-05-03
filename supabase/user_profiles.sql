-- =================================================================
-- Currly: ICP / Use-case Profile
-- Idempotent — safe to run multiple times.
-- =================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_status    text NOT NULL DEFAULT 'not_started'
                         CONSTRAINT user_profiles_status_check
                         CHECK (onboarding_status IN ('not_started', 'skipped', 'completed')),
  role                 text,
  company_stage        text,
  team_size            text,
  region               text,
  monthly_budget_range text,
  primary_use_case     text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)
);

-- ── Idempotent schema evolution (for existing deployments) ────────────
ALTER TABLE public.user_profiles ALTER COLUMN role          DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN company_stage DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN team_size     DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN region        DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN monthly_budget_range DROP NOT NULL;
ALTER TABLE public.user_profiles ALTER COLUMN primary_use_case    DROP NOT NULL;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS onboarding_status text NOT NULL DEFAULT 'not_started'
  CONSTRAINT user_profiles_status_check
  CHECK (onboarding_status IN ('not_started', 'skipped', 'completed'));

-- Back-fill rows that have profile data to 'completed'
UPDATE public.user_profiles
  SET onboarding_status = 'completed'
  WHERE onboarding_status = 'not_started' AND role IS NOT NULL;

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
CREATE POLICY "users_select_own_profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
CREATE POLICY "users_insert_own_profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_update_own_profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role (admin client) bypasses RLS automatically — no extra policy needed.
-- DELETE is handled by CASCADE from auth.users — no separate policy required.
