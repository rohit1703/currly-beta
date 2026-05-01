-- =================================================================
-- Currly: ICP / Use-case Profile
-- Idempotent — safe to run multiple times.
-- =================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role                 text NOT NULL,
  company_stage        text NOT NULL,
  team_size            text NOT NULL,
  region               text NOT NULL,
  monthly_budget_range text NOT NULL,
  primary_use_case     text NOT NULL,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)
);

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
