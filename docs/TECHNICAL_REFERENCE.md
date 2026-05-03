# Currly — Technical Reference

**Last updated:** 2026-05-03  
**Purpose:** Exact logic, formulas, and references for every system in the platform. Code and SQL are quoted verbatim. Plain-English explanations follow each block.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema](#2-database-schema)
3. [Search Engine](#3-search-engine)
4. [Personalisation Engine](#4-personalisation-engine)
5. [Collections System](#5-collections-system)
6. [User Onboarding & Profiles](#6-user-onboarding--profiles)
7. [Decision Capture](#7-decision-capture)
8. [Outcome Collection & Flywheel](#8-outcome-collection--flywheel)
9. [API Reference](#9-api-reference)
10. [Caching Strategy](#10-caching-strategy)
11. [Rate Limiting](#11-rate-limiting)
12. [Analytics Events](#12-analytics-events)
13. [Performance Gates](#13-performance-gates)

---

## 1. Architecture Overview

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 App Router | Server Components, server actions, static generation, and route handlers in one model |
| Database | Supabase (PostgreSQL 15) | Managed Postgres with pgvector, RLS, RPCs, and Realtime out of the box |
| Vector search | pgvector (HNSW index) | Cosine similarity ANN on 1536-dim embeddings; no external vector DB needed |
| Auth | Supabase Auth (Google OAuth) | Session management via JWT; cookies handled by `@supabase/ssr` |
| AI | OpenAI gpt-4o-mini + text-embedding-3-small | Intent parsing (cheap, cached 24h) + embedding generation |
| Deployment | Vercel (Fluid Compute) | Edge-close server functions; Vercel CDN caches `unstable_cache` payloads |
| Analytics | PostHog | Product events; used for search funnel, decision funnel, and outcome funnel |
| Styling | Tailwind CSS | Utility-first; dark mode via `dark:` variants |

### Request Flow — Search

```
Browser
  └─> Server Action: personalizedSearch()        [actions/ai-search.ts]
        ├─> parseIntent()     [GPT-4o-mini, cached 24h]
        ├─> getEmbedding()    [text-embedding-3-small, cached 24h]
        └─> runRankedSearch() [unstable_cache 1h]
              └─> Supabase RPC: match_tools_ranked()
                    ├─> FTS candidates  (websearch_to_tsquery, GIN index)
                    ├─> Vector candidates (cosine distance, HNSW index)
                    ├─> Score assembly  (5 signals × weights)
                    └─> Pagination      (LIMIT / OFFSET)
        └─> applyICPBoost()   [in-process, no DB call]
        └─> applyOutcomeBoost() [reads outcome_signals, gated by env var]
```

### Supabase Client Types

Two clients are used. The choice matters for RLS:

```typescript
// utils/supabase/admin.ts
// Service-role key — bypasses RLS entirely. Only used in server-side API routes.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// utils/supabase/server.ts
// Anon key + user session cookie — RLS applies. Used to identify the current user.
export function createClient(cookieStore) { ... }
```

The pattern across all API routes is: use the server client only to call `auth.getUser()`, then switch to the admin client for all DB reads/writes. This ensures auth is validated by the JWT, while writes go through service role (avoiding RLS complexity for server-side code).

---

## 2. Database Schema

### 2.1 `tools` table (core catalog)

The central table. Not managed by application migrations — populated via the admin import pipeline.

Key columns relevant to search:

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | Primary key |
| `slug` | text | URL-safe identifier; used in all page routes |
| `name` | text | Display name; weight A in tsvector |
| `description` | text | Weight C in tsvector |
| `main_category` | text | One of 12 canonical categories; weight B in tsvector |
| `pricing_model` | text | Free-form string (e.g. "Freemium", "Paid", "Open Source") |
| `launch_status` | text | `'Live'` or `'Draft'`; all queries filter `= 'Live'` |
| `embedding` | vector(1536) | OpenAI text-embedding-3-small; NULL until backfill runs |
| `search_tsv` | tsvector GENERATED | Computed column; auto-maintained by Postgres |
| `is_featured` | boolean | Affects `quality_score` in ranking |
| `is_india_based` | boolean | Surfaced in UI; not used in ranking |
| `launch_date` | timestamptz | Used for `freshness_score` |

Generated column definition (from `supabase/search.sql`):

```sql
ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS search_tsv tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')),          'A') ||
    setweight(to_tsvector('english', coalesce(main_category, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')),   'C')
  ) STORED;
```

**Weight meaning:** `ts_rank_cd` multiplies term frequency by the weight letter's numeric value. Postgres default multipliers: A=1.0, B=0.4, C=0.2, D=0.1. A match in the tool name scores 5× more than a match in the description.

### 2.2 `user_profiles` table

One row per authenticated user. Created on first login or onboarding entry.

```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_status    text NOT NULL DEFAULT 'not_started'
                         CHECK (onboarding_status IN ('not_started', 'skipped', 'completed')),
  role                 text,          -- nullable; set during onboarding
  company_stage        text,          -- nullable
  team_size            text,          -- nullable
  region               text,          -- nullable
  monthly_budget_range text,          -- nullable; drives pricing boost in ICP
  primary_use_case     text,          -- nullable; drives use-case boost in ICP
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_profiles_user_id_key UNIQUE (user_id)
);
```

`onboarding_status` state machine:

```
not_started → completed   (user completes all 3 onboarding steps)
not_started → skipped     (user clicks "Skip" on onboarding page)
skipped     → completed   (user returns and completes later — not yet implemented)
```

The `set_updated_at()` trigger fires on every UPDATE and sets `updated_at = now()`. Defined once here, reused by `collections`.

### 2.3 `collections` table

```sql
CREATE TABLE IF NOT EXISTS public.collections (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description text CHECK (char_length(description) <= 500),
  share_token uuid UNIQUE,   -- NULL until explicitly generated via PATCH
  is_public   boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT collections_user_name_key UNIQUE (user_id, name),
  CONSTRAINT collections_public_requires_token
    CHECK (NOT (is_public = true AND share_token IS NULL))
);
```

**Key invariant:** `is_public = true` requires `share_token IS NOT NULL`. Enforced at three layers:
1. DB CHECK constraint (`collections_public_requires_token`)
2. API PATCH route logic (auto-generates token if `is_public=true` and token is missing)
3. RLS `public_read` policy (`WHERE is_public = true AND share_token IS NOT NULL`)

### 2.4 `collection_tools` junction table

```sql
CREATE TABLE IF NOT EXISTS public.collection_tools (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  tool_id       uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  added_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, tool_id)
);
```

A tool can belong to multiple collections. Deleting a collection cascades to remove all its `collection_tools` rows. Deleting a tool also cascades.

### 2.5 `decision_sessions` table

```sql
CREATE TABLE IF NOT EXISTS public.decision_sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable: anon allowed
  context     text NOT NULL CHECK (context IN ('compare', 'stack')),
  tool_ids    uuid[] NOT NULL,        -- all tools shown in the comparison
  icp_domain  text,                   -- snapshot of user's primary_use_case at decision time
  budget_band text,                   -- snapshot of monthly_budget_range at decision time
  source_path text,                   -- URL path where decision was made
  status      text NOT NULL DEFAULT 'decided'
              CHECK (status IN ('decided', 'undecided')),
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**Anonymous decisions:** `user_id` is nullable. Unauthenticated users can submit decisions (status=undecided or decided), stored with `user_id = NULL`. These cannot be linked to outcome check-ins (which require auth). Retained 90 days, then eligible for cleanup.

### 2.6 `tool_choices` table

```sql
CREATE TABLE IF NOT EXISTS public.tool_choices (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_session_id uuid NOT NULL REFERENCES public.decision_sessions(id) ON DELETE CASCADE,
  tool_id             uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  confidence          int  NOT NULL CHECK (confidence BETWEEN 1 AND 3),
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (decision_session_id, tool_id)
);
```

**Confidence encoding:**

| Value | Label | Meaning |
|-------|-------|---------|
| `3` | Definitely | High confidence; user is committing |
| `2` | Probably | Likely choice; still some uncertainty |
| `1` | Still evaluating | Soft choice; wants to revisit |

### 2.7 `tool_rejections` table

Symmetric to `tool_choices`. One row per non-chosen tool in a decided session.

```sql
CREATE TABLE IF NOT EXISTS public.tool_rejections (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_session_id uuid NOT NULL REFERENCES public.decision_sessions(id) ON DELETE CASCADE,
  tool_id             uuid NOT NULL REFERENCES public.tools(id) ON DELETE CASCADE,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (decision_session_id, tool_id)
);
```

### 2.8 `workflow_outcomes` table

```sql
CREATE TABLE IF NOT EXISTS public.workflow_outcomes (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_session_id uuid NOT NULL REFERENCES public.decision_sessions(id) ON DELETE CASCADE,
  user_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_day           int  NOT NULL CHECK (check_day IN (7, 30)),
  satisfaction        int  CHECK (satisfaction BETWEEN 1 AND 5),  -- nullable: skip writes null
  realized_cost       text,
  time_to_value       text CHECK (time_to_value IN (
                        '< 1 week', '1–4 weeks', '1–3 months',
                        'Still setting up', 'Not yet'
                      )),
  notes               text CHECK (char_length(notes) <= 500),
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (decision_session_id, check_day)
);
```

**Satisfaction scale:** 1–5 emoji:

| Value | Emoji | Label |
|-------|-------|-------|
| 1 | 😞 | Not useful |
| 2 | 😕 | Disappointing |
| 3 | 😐 | It's okay |
| 4 | 😊 | Pretty good |
| 5 | 🤩 | Love it |

A skipped check-in still writes a row (with `satisfaction = NULL`). This is important: it prevents the prompt from re-appearing for the same session+check_day combination.

### 2.9 `outcome_signals` materialized view

```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS public.outcome_signals AS
SELECT
  tc.tool_id,
  COUNT(*)                                                        AS outcome_count,
  ROUND(AVG(wo.satisfaction)::numeric, 2)                        AS avg_satisfaction,
  ROUND(
    COUNT(*) FILTER (WHERE wo.satisfaction >= 4)::numeric
    / NULLIF(COUNT(*), 0), 2
  )                                                               AS high_sat_rate,
  ROUND(((AVG(wo.satisfaction) - 1.0) / 4.0)::numeric, 3)::float AS outcome_score
FROM   public.workflow_outcomes wo
JOIN   public.tool_choices tc ON tc.decision_session_id = wo.decision_session_id
WHERE  wo.satisfaction IS NOT NULL
GROUP  BY tc.tool_id
HAVING COUNT(*) >= 3;
```

**Formula: `outcome_score`**

```
outcome_score = (AVG(satisfaction) − 1.0) / 4.0
```

Maps the 1–5 satisfaction scale linearly to [0, 1]:
- AVG satisfaction = 1.0 → outcome_score = 0.0 (worst)
- AVG satisfaction = 3.0 → outcome_score = 0.5
- AVG satisfaction = 5.0 → outcome_score = 1.0 (best)

**Minimum sample gate:** `HAVING COUNT(*) >= 3` — a tool needs at least 3 rated outcomes (non-null satisfaction) before it appears in this view. Prevents single-outcome tools from distorting rankings.

**Refresh:** Called via RPC after each outcome submission (fire-and-forget):

```sql
CREATE OR REPLACE FUNCTION public.refresh_outcome_signals()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.outcome_signals;
$$;
```

`SECURITY DEFINER` means this function runs with the privileges of the defining role (service role), not the caller. `CONCURRENTLY` means reads are not blocked during refresh (requires the unique index `idx_outcome_signals_tool`).

### 2.10 `admin_decision_volume` view

```sql
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
```

**Formula: `submit_rate_pct`**

```
submit_rate_pct = (decisions_made / sessions) × 100
```

Sessions with no `tool_choices` row (undecided or abandoned) count in the denominator but not the numerator. Target: > 15%.

### 2.11 Row Level Security policies

All user-facing tables use RLS. The admin client (service role key) bypasses RLS automatically — no explicit `BYPASS RLS` policy is needed.

| Table | Policy | Condition |
|-------|--------|-----------|
| `user_profiles` | `users_select_own_profile` | `auth.uid() = user_id` |
| `user_profiles` | `users_insert_own_profile` | `auth.uid() = user_id` |
| `user_profiles` | `users_update_own_profile` | `auth.uid() = user_id` |
| `collections` | `owner_all` | `auth.uid() = user_id` |
| `collections` | `public_read` | `is_public = true AND share_token IS NOT NULL` |
| `collection_tools` | `owner_all` | `collection_id IN (SELECT id FROM collections WHERE user_id = auth.uid())` |
| `collection_tools` | `public_read` | `collection_id IN (SELECT id FROM collections WHERE is_public = true AND share_token IS NOT NULL)` |
| `decision_sessions` | `owner_all` | `auth.uid() = user_id` |
| `tool_choices` | `owner_choices` | `decision_session_id IN (SELECT id FROM decision_sessions WHERE user_id = auth.uid())` |
| `tool_rejections` | `owner_rejections` | Same pattern as `owner_choices` |
| `workflow_outcomes` | `owner_all` | `auth.uid() = user_id` |

### 2.12 Indexes

| Index | Table | Type | Column(s) | Purpose |
|-------|-------|------|-----------|---------|
| `idx_tools_fts` | `tools` | GIN | `fts` | Legacy FTS (used by quickSearch) |
| `idx_tools_search_tsv` | `tools` | GIN | `search_tsv` | Weighted FTS (used by match_tools_ranked) |
| `idx_tools_embedding_hnsw` | `tools` | HNSW | `embedding vector_cosine_ops` | ANN vector search |
| `idx_tools_launch_status` | `tools` | B-tree | `launch_status` | Filter predicate on all searches |
| `idx_tools_main_category` | `tools` | B-tree | `main_category` | Category filter |
| `idx_search_queries_query` | `search_queries` | B-tree (text_pattern_ops) | `query` | Autocomplete prefix match |
| `idx_tool_clicks_tool_id` | `tool_clicks` | B-tree | `tool_id` | Behavioral score join |
| `idx_tool_clicks_query` | `tool_clicks` | B-tree | `query` | Zero-result query detection |
| `idx_tool_clicks_time` | `tool_clicks` | B-tree | `clicked_at DESC` | 30-day window filter |
| `idx_collections_user_id` | `collections` | B-tree | `user_id` | User collection list |
| `idx_collections_share_token` | `collections` | B-tree (partial) | `share_token` WHERE NOT NULL | Public share page lookup |
| `idx_collection_tools_collection` | `collection_tools` | B-tree | `collection_id` | Tool listing per collection |
| `idx_collection_tools_tool` | `collection_tools` | B-tree | `tool_id` | Which collections contain this tool |
| `idx_outcome_signals_tool` | `outcome_signals` | Unique B-tree | `tool_id` | Required for CONCURRENTLY refresh |
| `idx_decision_sessions_user` | `decision_sessions` | Partial B-tree | `user_id` WHERE NOT NULL | Outcome pending lookup |
| `idx_decision_sessions_created` | `decision_sessions` | B-tree | `created_at DESC` | Admin dashboard sort |
| `idx_decision_sessions_icp` | `decision_sessions` | Partial B-tree | `icp_domain, created_at DESC` | Admin ICP breakdown |

**HNSW parameters:**
```sql
CREATE INDEX IF NOT EXISTS idx_tools_embedding_hnsw
  ON public.tools USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

- `m = 16`: number of bidirectional links per node (higher = better recall, more memory)
- `ef_construction = 64`: candidate list size during index build (higher = better recall, slower build)
- Standard defaults; revisit if recall degrades at > 100k rows

---

## 3. Search Engine

The search engine has two modes: **quick** (text-only, sub-100ms) and **hybrid** (AI-powered, 200–400ms). Hybrid is the default for the main search bar.

### 3.1 Quick Search (`getCachedTextSearch`)

File: `actions/search.ts`

Three-step fallback chain:

```
1. FTS via websearch_to_tsquery on tools.fts column
   → if results: return immediately
2. ilike on name and description (OR across all extracted keywords)
   → if results: return
3. pg_trgm trigram fuzzy_search_tools() RPC (catches typos)
   → return whatever matches (fuzzy: true flag)
```

**Stop-word stripping:** before FTS, natural language is reduced to keywords:

```typescript
const STOP_WORDS = new Set([
  'i', 'a', 'an', 'the', 'for', 'to', 'and', 'or', 'is', 'are', 'want',
  'need', 'looking', 'find', 'get', 'can', 'will', 'do', 'that', 'this',
  'with', 'in', 'on', 'at', 'by', 'from', 'of', 'it', 'my', 'me', 'we',
  'best', 'good', 'some', 'any', 'help', 'use', 'make', 'build', 'create',
  'tool', 'tools', 'app', 'software', 'ai', 'platform'
]);

function extractKeywords(query: string): string {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => !STOP_WORDS.has(word) && word.length > 2)
    .join(' ');
}
```

Result: "I need a free tool for image editing" → `"free image editing"` (but `free` is still there — it's not a stop word).

Cache key: `['text-search']`, TTL: 3600s, tags: `['tools']`

### 3.2 Hybrid Search — Intent Parsing

File: `actions/ai-search.ts`

GPT-4o-mini parses the query into structured intent. Cached 24h per unique query string.

```typescript
const parseIntent = unstable_cache(
  async (query: string): Promise<SearchIntent> => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const categoryNames = CATEGORIES.map(c => c.name).join(', ');

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You extract search intent for an AI tool discovery platform. Return only JSON.
Categories available: ${categoryNames}
Pricing options: free, freemium, paid, open source

Return: {"terms": string[], "category": string|null, "pricing": string[]|null, "summary": string}
- terms: 3-6 specific keywords including synonyms and related concepts (expand the query)
- category: exact category name from the list if clearly implied, else null
- pricing: array of relevant pricing types if mentioned, else null
- summary: ≤8 words describing what the user wants`,
        },
        { role: 'user', content: query },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 150,
      temperature: 0,
    });
    ...
  },
  ['search-intent'],
  { revalidate: 86400 }
);
```

Output type:
```typescript
export interface SearchIntent {
  terms: string[];        // 3–6 expanded keywords
  category: string | null; // exact category name or null
  pricing: string[] | null; // e.g. ['free', 'freemium'] or null
  summary: string;        // ≤8 word description
}
```

### 3.3 Embedding Generation

Model: `text-embedding-3-small` (1536 dimensions). Cached 24h per query string.

```typescript
const getEmbedding = unstable_cache(
  async (q: string): Promise<number[] | null> => {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: q,
      encoding_format: 'float',
    });
    return res.data[0].embedding;
  },
  ['search-embedding'],
  { revalidate: 86400 }
);
```

If `OPENAI_API_KEY` is missing, returns `null`. The RPC accepts `NULL` for `query_embedding` and disables vector candidates gracefully.

### 3.4 FTS Query Construction

**Critical detail:** the `match_tools_ranked` RPC uses `websearch_to_tsquery`, not `to_tsquery`. The two use different OR syntax:

| Function | OR syntax | AND syntax |
|----------|-----------|------------|
| `to_tsquery` | `\|` (pipe) | `&` |
| `websearch_to_tsquery` | `OR` (keyword) | space or `AND` |

`websearch_to_tsquery` strips `|` as punctuation. Using `|` as a separator turns an OR query into an AND query — requiring all terms to appear in one document simultaneously. This caused a critical search regression where queries with 5 expanded terms returned near-zero results.

Correct construction:

```typescript
// FTS query: websearch_to_tsquery uses "OR" keyword, not "|" (which it strips as punctuation)
const ftsQuery = intent.terms.join(' OR ');
```

Example: terms `['research', 'academic', 'knowledge', 'study', 'literature']` → `"research OR academic OR knowledge OR study OR literature"` → `websearch_to_tsquery` parses this as a 5-way OR.

### 3.5 The `match_tools_ranked` RPC

Full SQL in `supabase/search.sql`. This is the core ranking engine.

**Inputs:**

| Parameter | Type | Purpose |
|-----------|------|---------|
| `query_embedding` | vector(1536) | For semantic candidates; NULL disables vector path |
| `query_fts` | text | websearch_to_tsquery input string |
| `match_mode` | text | `'search'` (default) or `'browse'` |
| `filter_category` | text | Exact match on `main_category`; NULL = no filter |
| `filter_pricing` | text[] | `pricing_model = ANY(filter_pricing)`; NULL = no filter |
| `page_number` | int | 1-indexed; OFFSET = (page_number - 1) × page_size |
| `page_size` | int | LIMIT |

**Pipeline stages:**

**Stage 1 — Candidate selection**

```sql
-- FTS candidates: up to 100 tools
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

-- Vector candidates: above 0.20 cosine similarity threshold, up to 100 tools
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

-- Union: all candidates from either signal (no RRF — direct union and unified scoring)
candidate_ids AS (
  SELECT id FROM fts_hits
  UNION
  SELECT id FROM vec_hits
  UNION
  SELECT id FROM base WHERE NOT (_has_fts OR _has_vec)  -- browse mode
)
```

Cosine similarity: `1.0 - (embedding <=> query_embedding)`. The `<=>` operator is the pgvector cosine distance operator (returns 0 for identical, 2 for opposite). Threshold `> 0.20` means tools must be at least 20% similar to the query embedding to be candidates.

**Stage 2 — Signal scoring**

```sql
scored AS (
  SELECT
    -- Lexical: ts_rank_cd with normalization option 4 (divide by mean harmonic distance)
    COALESCE(fh.lex_raw, 0.0) AS lexical_score,

    -- Semantic: cosine similarity, 0.0 if not a vector candidate
    COALESCE(vh.sem_raw, 0.0) AS semantic_score,

    -- Quality: binary; 1.0 if featured, 0.3 otherwise
    (CASE WHEN t.is_featured THEN 1.0 ELSE 0.3 END)::float AS quality_score,

    -- Freshness: exponential decay, 1-year half-life
    EXP(
      -GREATEST(0.0,
        EXTRACT(EPOCH FROM (now() - COALESCE(t.launch_date, now()::timestamptz)))
      ) / 31536000.0
    )::float AS freshness_score,

    -- Behavior: log-normalized 30-day click count
    (LN(1.0 + COALESCE(cc.cnt, 0.0)) / LN(1.0 + _max_clicks))::float AS behavior_score
  ...
)
```

**Freshness formula explained:**

```
freshness_score = e^(−age_seconds / 31_536_000)
```

`31_536_000` = seconds in a year. This is a continuous exponential decay:
- Tool launched today → freshness = 1.0
- Tool launched 1 year ago → freshness = e^−1 ≈ 0.368
- Tool launched 2 years ago → freshness = e^−2 ≈ 0.135
- Tool launched 3 years ago → freshness = e^−3 ≈ 0.050

Tools with no `launch_date` are treated as launched `now()`, receiving a freshness of 1.0 (benefit of the doubt).

**Behavior formula explained:**

```
behavior_score = ln(1 + clicks_30d) / ln(1 + max_clicks_30d)
```

Log normalization prevents a single popular tool from dominating. If the most-clicked tool has 1000 clicks and a tool has 10 clicks:
- Raw score: 10/1000 = 0.01 (linear — heavy penalty)
- Log score: ln(11)/ln(1001) ≈ 2.40/6.91 ≈ 0.347 (much more equitable)

`_max_clicks` is computed once per RPC call as the maximum click count across all candidates in the 30-day window.

**Stage 3 — Weight blending**

```sql
ranked AS (
  SELECT s.*,
    CASE match_mode
      WHEN 'browse' THEN
        s.quality_score   * 0.50 +
        s.freshness_score * 0.30 +
        s.behavior_score  * 0.20
      ELSE  -- 'search' (default)
        s.lexical_score   * 0.35 +
        s.semantic_score  * 0.40 +
        s.quality_score   * 0.15 +
        s.freshness_score * 0.05 +
        s.behavior_score  * 0.05
    END AS final_score
  FROM scored s
)
```

**Weight rationale:**

| Mode | Signal | Weight | Why |
|------|--------|--------|-----|
| search | semantic | 0.40 | Most accurate signal for intent-based queries |
| search | lexical | 0.35 | Fast, reliable; catches exact term matches |
| search | quality | 0.15 | Featured tools deserve visibility |
| search | freshness | 0.05 | Tie-breaker; avoids surfacing very old tools |
| search | behavior | 0.05 | Tie-breaker; rewards real-world interest |
| browse | quality | 0.50 | No query context; surface best/featured tools |
| browse | freshness | 0.30 | Newer tools appear prominently in feed |
| browse | behavior | 0.20 | Reward what users actually click |

### 3.6 Fallback Chain (application layer)

After the RPC, `runRankedSearch` applies two more fallbacks if zero results are returned:

```typescript
// Fallback 1: ilike on expanded terms
if (tools.length === 0) {
  const fallbackQuery = intent.terms
    .map(t => `name.ilike.%${t}%,description.ilike.%${t}%`)
    .join(',');
  const { data } = await supabase
    .from('tools')
    .select(COLUMNS)
    .eq('launch_status', 'Live')
    .or(fallbackQuery)
    .limit(pageSize);
  tools = (data || []) as Tool[];
}

// Fallback 2: trigram fuzzy search
if (tools.length === 0) {
  const { data } = await supabase.rpc('fuzzy_search_tools', {
    search_query: query,
    match_count: pageSize,
  });
  tools = (data as Tool[]) || [];
}
```

**Trigram fuzzy search** (`fuzzy_search_tools` RPC):

```sql
SELECT id, name, ...
FROM   public.tools
WHERE  launch_status = 'Live'
  AND  (name % search_query OR description % search_query)
ORDER  BY GREATEST(
  similarity(name, search_query),
  similarity(description, search_query)
) DESC
LIMIT match_count;
```

`%` is the pg_trgm similarity operator (default threshold: 0.3). `similarity()` returns a value in [0,1]. Tools are ordered by the maximum of name-similarity or description-similarity.

### 3.7 Autocomplete / Suggestions

Source: `actions/search.ts → getSuggestions()`

Returns up to 6 suggestions — a mix of past query strings and tool name matches:

```typescript
const [{ data: pastQueries }, { data: toolNames }] = await Promise.all([
  supabase.from('search_queries').select('query')
    .ilike('query', `%${query}%`)
    .order('count', { ascending: false })
    .limit(4),
  supabase.from('tools').select('name')
    .ilike('name', `%${query}%`)
    .limit(4),
]);
```

Deduplicates by lowercased string before returning. Past queries are ordered by frequency (`count` column in `search_queries`).

### 3.8 Search Logging

Two tables track search behavior:

**`search_queries`** — query-level frequency table:
```typescript
// On new query: insert with count=1
// On duplicate (error code 23505): call increment_search_count() RPC
await supabase.rpc('increment_search_count', { search_query: normalized });
```

**`tool_clicks`** — individual click events:
```typescript
await supabase.from('tool_clicks').insert({
  tool_id: toolId,
  query: query?.trim().toLowerCase() || null,
  clicked_at: new Date().toISOString(),
});
```

`tool_clicks` feeds the 30-day behavioral score in `match_tools_ranked`.

### 3.9 Legacy Vector RPC (`match_tools`)

Retained for backward compatibility. Not used by the main search pipeline.

```sql
SELECT ... 1 - (embedding <=> query_embedding) AS similarity
FROM   public.tools
WHERE  launch_status = 'Live'
  AND  embedding IS NOT NULL
  AND  1 - (embedding <=> query_embedding) > match_threshold
ORDER  BY embedding <=> query_embedding
LIMIT  match_count;
```

`match_threshold` was 0.3 in `smartSearch()`. The newer `match_tools_ranked` uses 0.20 for broader candidate recall.

---

## 4. Personalisation Engine

Personalisation applies only when `onboarding_status = 'completed'`. It consists of two sequential boosts applied after the core ranked search returns results.

### 4.1 ICP Boost

File: `lib/icp-boost.ts`

**Step 1 — Category affinity maps**

```typescript
const USE_CASE_CATEGORIES: Record<string, string[]> = {
  'Outbound Sales':      ['Marketing & Sales', 'AI Agents & Assistants'],
  'Inbound Marketing':   ['Marketing & Sales', 'Content & Creative'],
  'Customer Support':    ['Customer Support',  'AI Agents & Assistants'],
  'Internal Ops':        ['Productivity & Automation', 'HR & Recruitment'],
  'Product Development': ['Development & Engineering', 'AI Agents & Assistants'],
  'Data Analysis':       ['Data & Analytics',  'Productivity & Automation'],
};

const ROLE_CATEGORIES: Record<string, string[]> = {
  'Developer':       ['Development & Engineering', 'Data & Analytics'],
  'Marketer':        ['Marketing & Sales',          'Content & Creative'],
  'Sales':           ['Marketing & Sales',          'AI Agents & Assistants'],
  'Operations':      ['Productivity & Automation',  'HR & Recruitment'],
  'Product Manager': ['AI Agents & Assistants',     'Productivity & Automation'],
  'Founder':         ['Marketing & Sales',           'AI Agents & Assistants'],
};
```

**Step 2 — Multiplier calculation per tool**

```typescript
let multiplier = 1.0;

if (useCaseCats.has(tool.main_category)) {
  multiplier *= 1.2;    // primary use-case match: +20%
} else if (roleCats.has(tool.main_category)) {
  multiplier *= 1.1;    // role affinity match: +10%
}

if (prefersLowBudget && FREE_PRICING.has(tool.pricing_model?.toLowerCase() ?? '')) {
  multiplier *= 1.1;    // pricing preference match: +10%
}
```

Budget ranges that trigger the pricing boost:
```typescript
const LOW_BUDGET = new Set(['<$100', '$100–$500']);
const FREE_PRICING = new Set(['free', 'freemium', 'open source']);
```

**Maximum combined multiplier:** ×1.2 × ×1.1 = ×1.32 (use-case match + low-budget free pricing)

Note: use-case and role boosts are mutually exclusive (else-if), so a tool matching both a use-case category and a role category only gets the larger ×1.2 boost.

**Step 3 — Apply to `_scores.final` and re-sort**

```typescript
return {
  ...tool,
  _scores: tool._scores
    ? { ...tool._scores, final: tool._scores.final * multiplier }
    : undefined,
};
// ...then:
return boosted.sort((a, b) => (b._scores?.final ?? 0) - (a._scores?.final ?? 0));
```

The boost is applied directly to `final_score`. Tools with no `_scores` (e.g. from a fallback path) are not moved.

### 4.2 Candidate Window Sizing

Personalised search fetches `pageSize × 3` candidates before boosting, then slices to the requested page:

```typescript
const candidateSize = pageSize * 3;
const { tools: candidates, intent } = await runRankedSearch(
  query, category, pricing, 1, candidateSize
);
// ...boost...
const start = (page - 1) * pageSize;
return { tools: reranked.slice(start, start + pageSize), intent };
```

**Why 3×:** A tool originally ranked at position 45 (outside a 20-result page) can be boosted to position 3. Without a wider window, the boost would have no effect on lower-ranked tools. The 3× factor allows up to 2 full pages of promotion movement.

### 4.3 Outcome Boost

File: `lib/outcome-boost.ts`

Gated by `ENABLE_OUTCOME_RANKING=true` environment variable. Off by default until D30 data accumulates.

```typescript
export function applyOutcomeBoost(tools: Tool[], signals: Record<string, number>): Tool[] {
  if (!tools.length || !Object.keys(signals).length) return tools;
  return tools
    .map(t => {
      const outScore = signals[String(t.id)] ?? 0;
      if (outScore === 0 || !t._scores) return t;
      const boostedFinal = t._scores.final * (1 + outScore * 0.10);
      return { ...t, _scores: { ...t._scores, final: boostedFinal } };
    })
    .sort((a, b) => (b._scores?.final ?? 0) - (a._scores?.final ?? 0));
}
```

**Formula:**

```
boosted_final = final_score × (1 + outcome_score × 0.10)
```

`outcome_score` is in [0, 1] from the materialized view. Maximum lift: ×1.10 (10%). A tool with `outcome_score = 0.75` (avg satisfaction 4.0) gets ×1.075.

### 4.4 Full Re-Ranking Pipeline Order

```
1. runRankedSearch()        → raw ranked results from SQL (final_score from 5-signal blend)
2. applyICPBoost()          → multipliers based on use_case + role + budget (always runs for completed profiles)
3. applyOutcomeBoost()      → multiplier based on outcome_signals mat view (gated by ENABLE_OUTCOME_RANKING)
4. slice(start, end)        → paginate the re-ranked candidates
```

All three operations run in the Next.js server process — no extra DB round-trips beyond the initial `runRankedSearch` call and the `getOutcomeSignals` call (itself cached 1h).

---

## 5. Collections System

### 5.1 Data Model

- One `collections` row per named list (e.g. "My Stack", "Q3 Tools")
- One `collection_tools` row per (collection, tool) pair
- A tool can belong to multiple collections
- Max 50 collections per user (enforced in API, not DB)

### 5.2 Share Token Mechanics

A collection is private by default (`is_public = false`, `share_token = NULL`).

To share:
1. Client sends `PATCH { generate_share_token: true }` (or `{ is_public: true }`)
2. API generates `crypto.randomUUID()` and sets `share_token`
3. Public URL becomes `/s/[token]`
4. `public_read` RLS policy allows SELECT for any caller if `is_public = true AND share_token IS NOT NULL`

To revoke:
1. Client sends `PATCH { revoke_share_token: true }`
2. API sets `share_token = null` AND `is_public = false`
3. Old `/s/[old-token]` returns 404 immediately (no row matches)

**Server-side auto-repair:** if a PATCH sets `is_public = true` without a token (e.g. direct API call bypassing the client):
```typescript
const finalIsPublic = 'is_public' in updates ? updates.is_public : collection.is_public;
const finalToken    = 'share_token' in updates ? updates.share_token : collection.share_token;
if (finalIsPublic === true && !finalToken) {
  updates.share_token = crypto.randomUUID();  // auto-generate to satisfy invariant
}
```

### 5.3 Business Rules

| Rule | Where enforced |
|------|---------------|
| Max 50 collections per user | API: `POST /api/collections` checks count before insert |
| Cannot delete last collection | API: `DELETE /api/collections/[id]` checks count ≥ 2 before delete |
| Name unique per user | DB: `UNIQUE (user_id, name)`; API returns 409 on code `23505` |
| is_public requires share_token | DB CHECK constraint + API auto-repair |
| Collection ID must be valid UUID | API: regex guard before any DB query |
| tool_id must be valid UUID | API: Zod `z.string().uuid()` + regex in DELETE |

### 5.4 Tool-to-Collection State in UI

The `CollectionPickerPopover` component (client-side) uses optimistic updates:

- **Check (add):** optimistically add `collection.id` to local `toolCollectionIds` → `POST /api/collections/[id]/tools` → revert on error
- **Uncheck (remove):** optimistically remove → `DELETE /api/collections/[id]/tools/[toolId]` → revert on error
- **+ New collection:** inline `<input>` → `POST /api/collections` → then `POST .../tools` → add both IDs to local state

The Save button icon is filled/blue when `toolCollectionIds.length > 0`.

---

## 6. User Onboarding & Profiles

### 6.1 Onboarding Steps

Three steps, each with two fields:

```typescript
export const ONBOARDING_STEPS = [
  { label: 'Your Role',      fields: ['role', 'company_stage'] },
  { label: 'Your Team',      fields: ['team_size', 'region'] },
  { label: 'Budget & Goals', fields: ['monthly_budget_range', 'primary_use_case'] },
];
```

### 6.2 Valid Values

```typescript
export const ROLES = ['Founder', 'Product Manager', 'Developer', 'Marketer', 'Sales', 'Operations', 'Other'];

export const COMPANY_STAGES = ['Pre-revenue', 'Pre-seed', 'Seed', 'Series A', 'Series B+', 'Bootstrapped', 'Enterprise'];

export const TEAM_SIZES = ['1', '2–5', '6–15', '16–50', '51–200', '200+'];

export const REGIONS = ['North America', 'Europe', 'Asia-Pacific', 'South Asia', 'Latin America', 'Middle East & Africa', 'Other'];

export const BUDGET_RANGES = ['<$100', '$100–$500', '$500–$2K', '$2K–$10K', '$10K+'];

export const USE_CASES = ['Outbound Sales', 'Inbound Marketing', 'Customer Support', 'Internal Ops', 'Product Development', 'Data Analysis', 'Other'];
```

### 6.3 Profile Completeness Gate

The personalisation engine reads `onboarding_status` before applying any boost:

```typescript
if (!profile || profile.onboarding_status !== 'completed') {
  return runRankedSearch(query, category, pricing, page, pageSize);
}
```

Skipped or not-started profiles get the plain ranked results with no personalisation. This is a deliberate design choice: we don't want to personalise based on partial data.

### 6.4 Profile fields used for personalisation

Only two fields drive ranking:
- `primary_use_case` → `USE_CASE_CATEGORIES` lookup → category affinity set
- `monthly_budget_range` → LOW_BUDGET check → pricing boost eligibility

`role` drives a weaker secondary affinity (×1.1 vs ×1.2 for use-case). `company_stage`, `team_size`, and `region` are stored but not currently used in ranking.

---

## 7. Decision Capture

### 7.1 Session Lifecycle

```
User views compare page
  ↓
DecisionPrompt mounts → fires `decision_started` PostHog event (once, via useRef)
  ↓
Step 1 — "Which one are you going with?"
  [Tool A]   [Tool B]   [Still deciding]
  ↓
  If "Still deciding":
    POST /api/decisions { chosen_tool_id: null, status: 'undecided' }
    → fires `decision_submitted` with status=undecided
    → step = 'done'
  
  If Tool A or Tool B chosen:
    → step = 'confidence'
    ↓
Step 2 — "How confident are you?"
  [Definitely] [Probably] [Still evaluating]
    ↓
    POST /api/decisions { chosen_tool_id, confidence, status: 'decided' }
    → fires `decision_submitted` with status=decided, confidence
    → step = 'done'

If user navigates away before completing:
  → beforeunload fires `decision_abandoned` PostHog event
```

### 7.2 API Write Logic

`POST /api/decisions` — session is created first, then choices/rejections in parallel:

```typescript
// Session insert
await admin.from('decision_sessions').insert({
  user_id:     userId,            // null if anonymous
  context,                        // 'compare' or 'stack'
  tool_ids,                       // all tools in the comparison
  icp_domain:  icpDomain,         // snapshot from user_profiles.primary_use_case
  budget_band: budgetBand,        // snapshot from user_profiles.monthly_budget_range
  source_path: source_path ?? null,
  status:      chosen_tool_id ? 'decided' : 'undecided',
});

// Parallel write: choice + rejections
const rejectedIds = tool_ids.filter(id => id !== chosen_tool_id);
await Promise.all([
  admin.from('tool_choices').insert({
    decision_session_id: session.id,
    tool_id:             chosen_tool_id,
    confidence,
  }),
  admin.from('tool_rejections').insert(
    rejectedIds.map(id => ({ decision_session_id: session.id, tool_id: id }))
  ),
]);
```

**ICP snapshot rationale:** `icp_domain` and `budget_band` are copied at decision time (not joined at query time). This preserves the user's profile as it was when they made the decision, even if they update their profile later. Critical for accurate retrospective analysis.

### 7.3 Admin View Formulas

`admin_decision_volume` view (see §2.10):

- `submit_rate_pct = decisions_made / sessions × 100` — percentage of compare-page visitors who made a decision
- `avg_confidence` — mean of `tool_choices.confidence` values (1–3 scale); target ≥ 2.0

Performance target: `submit_rate_pct > 15` — if fewer than 15% of compare-page visitors make a decision, the prompt design needs revisiting.

---

## 8. Outcome Collection & Flywheel

### 8.1 Check-In Window Definitions

Two check-in days per decision: D7 (one week later) and D30 (one month later). Each has a ±2-day tolerance window to avoid relying on the user visiting on exactly the right day.

```typescript
const DAY_MS = 86_400_000;
const windows = [
  { check_day: 7,  from: new Date(now - 8 * DAY_MS), to: new Date(now - 6 * DAY_MS) },
  { check_day: 30, from: new Date(now - 31 * DAY_MS), to: new Date(now - 29 * DAY_MS) },
];
```

| Check | Window open | Window close |
|-------|-------------|--------------|
| D7 | decision_date + 6 days | decision_date + 8 days |
| D30 | decision_date + 29 days | decision_date + 31 days |

### 8.2 Pending Check-In Algorithm

`GET /api/outcomes/pending` runs this algorithm on every dashboard load (client-side, non-blocking):

```
For D7, then D30:
  1. Find decided sessions in this user's check window (created_at BETWEEN from AND to)
     Limit 5 — we only care about the first unanswered one
  2. Find any existing workflow_outcomes rows for these sessions at this check_day
  3. Subtract: sessions not yet covered by an outcome row
  4. Take the first uncovered session
  5. Fetch the tool_choices row for that session → get tool_id
  6. Fetch the tool details (id, name, slug, image_url)
  7. Return { session_id, check_day, tool }
  
If no session found in D7, proceed to D30.
If no session found in either window, return null.
```

A `null` return means the prompt does not render. Skipped check-ins (satisfaction = NULL) still produce a row, so they count as "covered" and prevent re-prompting.

### 8.3 Non-Blocking Dashboard Load

The `OutcomePrompt` component fetches its own data client-side via `useEffect`:

```typescript
useEffect(() => {
  fetch('/api/outcomes/pending')
    .then(r => r.json())
    .then(({ pending: p }) => { setPending(p ?? null); })
    .catch(() => setPending(null));
}, []);
```

The dashboard server component (`app/dashboard/page.tsx`) does not wait for outcome data. The prompt renders only after the page is already interactive. If the API call fails, the prompt silently stays hidden.

### 8.4 Outcome Boost Activation Criteria

The outcome boost (`ENABLE_OUTCOME_RANKING=true`) should be activated only when:
1. Enough D30 data exists for `outcome_signals` to have ≥ 3 outcomes per tool (minimum sample gate)
2. At least 6 weeks have passed since Decision Capture launched (D30 check-ins require 30 days after a decision)

Target activation: mid-June 2026 (≈6 weeks after the 2026-05-03 launch).

### 8.5 Flywheel Loop

```
User makes a decision on /compare
    ↓ (7 days later)
OutcomePrompt appears on dashboard
    ↓
User rates their satisfaction (1–5)
    ↓
POST /api/outcomes writes workflow_outcomes row
    ↓ (fire-and-forget)
refresh_outcome_signals() refreshes mat view
    ↓
outcome_signals.outcome_score updated for that tool
    ↓
Next search: applyOutcomeBoost() reads cached signals
    ↓
High-satisfaction tools rank slightly higher
    ↓
Better search results → more decisions → more outcomes → repeat
```

---

## 9. API Reference

All routes are in `app/api/`. All routes use the pattern: server client for auth, admin client for DB writes.

### 9.1 `POST /api/search`

| Property | Value |
|----------|-------|
| Auth | None (anonymous) |
| Rate limit | 30 req/min per IP |
| Cache | Delegates to `runRankedSearch` (1h) |

**Request schema:**
```typescript
{
  q:        string (1–500 chars),
  mode:     'hybrid' | 'quick' | 'autocomplete' (default: 'hybrid'),
  page:     integer 1–100 (default: 1),
  pageSize: integer 1–50 (default: 20),
  filters?: {
    category?: string | null,
    pricing?:  string[] | null,
  }
}
```

**Response:**
```typescript
{
  tools:       Tool[],
  intent:      SearchIntent | null,  // null for quick/autocomplete modes
  fuzzy:       boolean,              // true if trigram fallback was used
  suggestions: Suggestion[],         // only for autocomplete mode
}
```

Side effect: fire-and-forget insert to `api_usage` table (non-blocking).

### 9.2 `GET /api/collections`

| Auth | Rate limit |
|------|-----------|
| Required (401 if missing) | None |

Returns all collections for the authenticated user with `tool_count` computed from a join.

### 9.3 `POST /api/collections`

| Auth | Rate limit |
|------|-----------|
| Required | 20 req/min per user ID |

**Request:**
```typescript
{ name: string (1–100 chars), description?: string (max 500) }
```

Business rules: max 50 collections checked before insert. Returns 409 on duplicate name.

### 9.4 `PATCH /api/collections/[id]`

| Auth | Rate limit |
|------|-----------|
| Required + owner | 20 req/min per user ID |

**Request:**
```typescript
{
  name?:                 string (1–100),
  description?:          string (max 500),
  is_public?:            boolean,
  generate_share_token?: boolean,  // sets share_token = crypto.randomUUID()
  revoke_share_token?:   boolean,  // sets share_token = null, is_public = false
}
```

Ownership check: `eq('user_id', userId)` — returns 404 if collection not found or not owned.

### 9.5 `DELETE /api/collections/[id]`

| Auth | Rate limit |
|------|-----------|
| Required + owner | 20 req/min per user ID |

Returns 400 if this is the user's last collection. On success, `collection_tools` rows cascade-delete automatically.

### 9.6 `POST /api/collections/[id]/tools`

| Auth | Rate limit |
|------|-----------|
| Required + owner | 20 req/min per user ID |

**Request:** `{ tool_id: UUID }`

Uses upsert with `onConflict: 'collection_id,tool_id'` — idempotent. Clicking "add" twice does not error.

### 9.7 `DELETE /api/collections/[id]/tools/[toolId]`

| Auth | Rate limit |
|------|-----------|
| Required + owner | 20 req/min per user ID |

Both `id` and `toolId` are validated as UUIDs via regex before any DB call.

### 9.8 `GET /api/collections/share/[token]`

| Auth | Rate limit |
|------|-----------|
| None (public) | None |

Queries by `share_token` with RLS `public_read` policy. Returns 404 if token not found or collection not public. Omits the token value from the response.

### 9.9 `POST /api/decisions`

| Auth | Rate limit |
|------|-----------|
| Optional (anonymous allowed) | 10 req/min per IP |

**Request schema:**
```typescript
{
  tool_ids:       UUID[] (2–10 items),
  chosen_tool_id: UUID | null,   // null = undecided
  confidence?:    1 | 2 | 3,    // required if chosen_tool_id is non-null
  context:        'compare' | 'stack',
  source_path?:   string (max 500),
}
```

**Validation rules:**
- If `chosen_tool_id` is non-null, it must appear in `tool_ids`
- If `chosen_tool_id` is non-null, `confidence` is required

**Writes (when a choice is made):**
1. `decision_sessions` row (always)
2. `tool_choices` row (chosen tool with confidence)
3. `tool_rejections` rows (all other tools)

Steps 2 and 3 run in parallel via `Promise.all`.

### 9.10 `POST /api/outcomes`

| Auth | Rate limit |
|------|-----------|
| Required (401 if missing) | 10 req/min per IP |

**Request schema:**
```typescript
{
  decision_session_id: UUID,
  check_day:           7 | 30,
  satisfaction?:       integer 1–5,
  realized_cost?:      string (max 100),
  time_to_value?:      '< 1 week' | '1–4 weeks' | '1–3 months' | 'Still setting up' | 'Not yet',
  notes?:              string (max 500),
}
```

Uses upsert with `onConflict: 'decision_session_id,check_day'`. Submitting again overwrites.

If `satisfaction` is provided, fires `refresh_outcome_signals()` RPC as fire-and-forget.

Session ownership check: `eq('user_id', user.id)` before write.

### 9.11 `GET /api/outcomes/pending`

| Auth | Rate limit |
|------|-----------|
| Optional (returns null if unauthed) | None |

Returns first unanswered check-in for the authenticated user. Algorithm described in §8.2.

### 9.12 `DELETE /api/user/delete`

| Auth | Rate limit |
|------|-----------|
| Required | None |

Sequence:
1. Delete all `collections` (cascades to `collection_tools`)
2. Delete all `saved_tools` (legacy table — to be dropped)
3. Delete all `api_usage` rows for this user
4. Call `admin.auth.admin.deleteUser(user.id)` — irreversible

Steps 1–3 run in parallel via `Promise.all`. Step 4 only runs if all three succeed.

---

## 10. Caching Strategy

All caching uses Next.js `unstable_cache`. Results are stored in the Vercel data cache and re-used across requests.

| Cache key | Function | TTL | Tags | Notes |
|-----------|----------|-----|------|-------|
| `['search-intent']` | `parseIntent(query)` | 86400s (24h) | — | GPT-4o-mini call; same query always yields same intent |
| `['search-embedding']` | `getEmbedding(query)` | 86400s (24h) | — | OpenAI embedding; same input → same vector |
| `['ranked-search-v2']` | `runRankedSearch(q, cat, pricing, page, pageSize)` | 3600s (1h) | `['tools']` | Version suffix busts stale cache from `ranked-search` key |
| `['outcome-signals']` | `getOutcomeSignals()` | 3600s (1h) | `['tools']` | Reads from materialized view; refreshed after each rated outcome |
| `['text-search']` | `getCachedTextSearch(q)` | 3600s (1h) | `['tools']` | Quick search path |
| `['query-embedding']` | `getCachedEmbedding(q)` (legacy) | 86400s (24h) | — | Used by `smartSearch()`; kept for compatibility |

**Tag invalidation:** `revalidateTag('tools')` invalidates all caches tagged `['tools']` immediately. Used when tool data changes (new imports, status changes). Not currently wired to an automatic trigger — must be called manually or from the admin import action.

**Per-request deduplication:** `getSessionProfile` uses React `cache()` (not `unstable_cache`):

```typescript
const getSessionProfile = cache(async (): Promise<UserProfile | null> => { ... });
```

`cache()` deduplicates within a single server request but does not persist across requests. This prevents double DB calls if both `personalizedSearch` and the page component need the user's profile in the same render.

**Cache key versioning:** The suffix `-v2` in `['ranked-search-v2']` was added to immediately invalidate all results cached under the old key `['ranked-search']` after the FTS `|` → `OR` bug fix. Without the key bump, the 1-hour TTL would have continued serving broken results from the cache.

---

## 11. Rate Limiting

File: `lib/rate-limit.ts`

Implementation: in-memory sliding window counter using a `Map`. One entry per key, reset after the window expires.

```typescript
const requests = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  cleanup();  // purge expired entries every 60s
  const now = Date.now();
  const record = requests.get(key);

  if (!record || now > record.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return true;  // first request in window
  }

  if (record.count >= limit) return false;  // over limit
  record.count++;
  return true;
}
```

**Limits per endpoint:**

| Endpoint | Key pattern | Limit | Window |
|----------|------------|-------|--------|
| `POST /api/search` | `search:{ip}` | 30 | 60,000ms |
| `aiSearch()` server action | `search:{ip}` | 30 | 60,000ms |
| `personalizedSearch()` server action | `search:{ip}` | 30 | 60,000ms |
| `POST /api/decisions` | `decisions:{ip}` | 10 | 60,000ms |
| `POST /api/outcomes` | `outcomes:{ip}` | 10 | 60,000ms |
| `GET/POST /api/collections` | `collections:{userId}` | 20 | 60,000ms |
| `PATCH/DELETE /api/collections/[id]` | `collections:{userId}` | 20 | 60,000ms |
| `POST /api/collections/[id]/tools` | `collections:{userId}` | 20 | 60,000ms |

**Known limitation:** The `Map` lives in the Node.js process memory. Vercel runs multiple function instances concurrently — each has its own `Map`. A user hitting 3 instances in 60 seconds could make 90 requests before being blocked. This is acceptable for the current scale. Migration path: replace with Upstash Redis using `INCR` + `EXPIRE` for global rate limiting.

Performance target: rate-limit hit rate < 1% of all requests.

---

## 12. Analytics Events

All events are fired via PostHog. The client is initialized in `components/posthog-provider.tsx`.

### Search Events

| Event | When | Properties |
|-------|------|-----------|
| `search_performed` | User submits a search | `query`, `result_count`, `mode` |
| `tool_clicked` | User clicks a tool from search results | `tool_id`, `tool_slug`, `position`, `query` |

### Decision Capture Events

| Event | When | Properties |
|-------|------|-----------|
| `decision_started` | `DecisionPrompt` mounts (once, via useRef) | `tool_ids`, `context`, `source_path` |
| `decision_abandoned` | beforeunload fires before step = 'done' | `tool_ids`, `context` |
| `decision_submitted` | POST /api/decisions returns 201 | `session_id`, `chosen_tool_id`, `status`, `confidence`, `context` |

### Outcome Events

| Event | When | Properties |
|-------|------|-----------|
| `outcome_prompt_shown` | Pending check-in found and rendered | `session_id`, `check_day`, `tool_slug` |
| `outcome_submitted` | User rates and submits | `session_id`, `check_day`, `tool_slug`, `satisfaction`, `time_to_value` |
| `outcome_skipped` | User clicks X or "Skip" | `session_id`, `check_day`, `tool_slug`, `satisfaction: null` |

### Collection Events

| Event | When | Properties |
|-------|------|-----------|
| `collection_created` | POST /api/collections succeeds | `collection_id` |
| `collection_deleted` | DELETE /api/collections/[id] succeeds | `collection_id` |
| `collection_share_link_generated` | PATCH with generate_share_token | `collection_id` |
| `collection_share_link_revoked` | PATCH with revoke_share_token | `collection_id` |
| `collection_picker_opened` | User opens CollectionPickerPopover | `tool_id`, `compact` |
| `tool_added_to_collection` | Tool check in popover | `tool_id`, `collection_id` |
| `tool_removed_from_collection` | Tool uncheck in popover | `tool_id`, `collection_id` |
| `collection_created_inline` | "+ New collection" in popover | `tool_id` |

### Onboarding Events

| Event | When | Properties |
|-------|------|-----------|
| `icp_form_skipped` | User clicks "Skip" on onboarding page | `step` |
| `onboarding_completed` | User completes all 3 steps | `role`, `primary_use_case`, `monthly_budget_range` |

### Stack Page Events

| Event | When | Properties |
|-------|------|-----------|
| `stack_page_viewed` | StackLanding mounts | `use_case`, `slug` |
| `stack_tool_clicked` | User clicks a tool card | `tool_slug`, `template_id`, `use_case` |
| `stack_compare_clicked` | User clicks "Compare X vs Y" | `slug1`, `slug2`, `template_id` |
| `stack_save_clicked` | User clicks "Save this stack" | `template_id`, `use_case` |

---

## 13. Performance Gates

Hard targets agreed 2026-05-03. Source: `docs/ROADMAP.md`.

| Signal | Gate | Data Source |
|--------|------|------------|
| p95 search latency | < 400 ms | `api_usage.duration_ms` |
| Zero-result rate | < 8% of searches | `admin_zero_click_queries` view |
| Search CTR | > 20% of searches result in a click | `admin_query_performance` view |
| Decision submit rate | > 15% of compare-page sessions | `admin_decision_volume.submit_rate_pct` |
| Avg decision confidence | ≥ 2.0 (Probably) | `admin_decision_volume.avg_confidence` |
| API error rate | < 0.5% of requests | Vercel function error logs |
| Rate-limit hit rate | < 1% of requests | 429 response count |

**Alert threshold:** if any gate breaches for 2+ consecutive days.
**Escalation threshold:** if any gate breaches for 5+ consecutive days, halt growth campaigns until resolved.

### Runbook

1. **Latency breach:** check `api_usage` for slow queries; run `EXPLAIN ANALYZE` on `match_tools_ranked`; check HNSW recall at current row count
2. **Zero-result spike:** check `admin_zero_click_queries` for new query patterns; add missing tools or synonyms to description
3. **Low CTR:** check if search results are visually rendering correctly; check if top results are actually relevant via manual test queries
4. **Low submit rate:** check PostHog decision funnel (`decision_started` → `decision_submitted`); consider prompt copy changes
5. **Low confidence:** high `Still evaluating` rate may indicate the tool pairs shown aren't direct alternatives

---

## 14. Tool Catalog Categories

The 12 canonical categories (single source of truth in `lib/categories.ts`):

| Name | Slug |
|------|------|
| AI Agents & Assistants | `ai-agents-assistants` |
| Content & Creative | `content-creative` |
| Customer Support | `customer-support` |
| Data & Analytics | `data-analytics` |
| Development & Engineering | `development-engineering` |
| Education & Learning | `education-learning` |
| Finance & Legal | `finance-legal` |
| Health & Wellness | `health-wellness` |
| HR & Recruitment | `hr-recruitment` |
| Marketing & Sales | `marketing-sales` |
| Productivity & Automation | `productivity-automation` |
| Specialized Industry | `specialized-industry` |

**Slug generation:**
```typescript
export function categoryToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // strip & and other punctuation
    .trim()
    .replace(/\s+/g, '-');
}
```

Example: `"Development & Engineering"` → strip `&` → `"development  engineering"` → collapse spaces → `"development-engineering"`.

---

*End of Technical Reference. All formulas and code quoted from source files as of 2026-05-03.*
