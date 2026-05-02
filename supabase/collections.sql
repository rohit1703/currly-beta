-- =================================================================
-- Currly: Collections / Stacks
-- Idempotent — safe to run multiple times.
-- Run BEFORE collections_migrate.sql.
-- =================================================================

-- ── collections ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description text CHECK (char_length(description) <= 500),
  share_token uuid UNIQUE,          -- NULL until explicitly generated
  is_public   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT collections_user_name_key UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_collections_user_id
  ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_share_token
  ON public.collections(share_token) WHERE share_token IS NOT NULL;

-- ── collection_tools ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.collection_tools (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  tool_id       uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  added_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_collection_tools_collection
  ON public.collection_tools(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_tools_tool
  ON public.collection_tools(tool_id);

-- ── updated_at trigger ───────────────────────────────────────────
-- Reuses set_updated_at() from user_profiles.sql
DROP TRIGGER IF EXISTS trg_collections_updated_at ON public.collections;
CREATE TRIGGER trg_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ──────────────────────────────────────────────────────────
ALTER TABLE public.collections      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_tools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_all"   ON public.collections;
DROP POLICY IF EXISTS "public_read" ON public.collections;

CREATE POLICY "owner_all" ON public.collections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "public_read" ON public.collections FOR SELECT
  USING (is_public = true AND share_token IS NOT NULL);

DROP POLICY IF EXISTS "owner_all"   ON public.collection_tools;
DROP POLICY IF EXISTS "public_read" ON public.collection_tools;

CREATE POLICY "owner_all" ON public.collection_tools FOR ALL
  USING (
    collection_id IN (SELECT id FROM public.collections WHERE user_id = auth.uid())
  )
  WITH CHECK (
    collection_id IN (SELECT id FROM public.collections WHERE user_id = auth.uid())
  );

CREATE POLICY "public_read" ON public.collection_tools FOR SELECT
  USING (
    collection_id IN (
      SELECT id FROM public.collections WHERE is_public = true AND share_token IS NOT NULL
    )
  );

-- Service role (admin client) bypasses RLS automatically.
