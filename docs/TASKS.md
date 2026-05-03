# Currly Beta — Task Backlog

**Last updated:** 2026-05-03 (Decision Capture shipped)  
Format: `[ ]` open · `[x]` done · `[-]` deferred

---

## 🔴 P0 — Do now (blocking stability)

### Database

- [x] **Verify GIN index on `tools.fts`** — created by search.sql
- [x] **Verify HNSW index on `tools.embedding`** — created by search.sql (replaced ivfflat)
- [x] **Verify required RPCs exist** — match_tools, fuzzy_search_tools, increment_search_count, match_tools_ranked created by search.sql
- [x] **Run `supabase/user_profiles.sql`** — onboarding_status column live, profile fields nullable, existing rows backfilled to 'completed'
- [x] **Run `supabase/collections.sql`** — collections_public_requires_token CHECK constraint live

- [ ] **Drop `saved_tools` table** (after confirming 48h stability — due 2026-05-05)
  ```sql
  DROP TABLE IF EXISTS public.saved_tools;
  ```

### Code

- [x] Fix `createAndAdd` response check in `CollectionPickerPopover.tsx`
- [x] Enforce `is_public` + `share_token` invariant (DB constraint + API + client)
- [x] Durable onboarding skip (`onboarding_status` in DB, no cookie)
- [x] Add missing analytics: `collection_created`, `collection_deleted`, `collection_share_link_generated`, `collection_share_link_revoked`, `icp_form_skipped`
- [x] **Validate `toolId` as UUID in `DELETE /api/collections/[id]/tools/[toolId]`**
  ```typescript
  // app/api/collections/[id]/tools/[toolId]/route.ts
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(toolId)) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  ```
- [ ] **Remove legacy `actions/saved.ts`** — after `saved_tools` table is dropped

---

## 🟡 P1 — Search quality & unified API

### SQL / Indexes / Materialized Views

- [x] **Create `supabase/search.sql`** — idempotent migration: pg_trgm + vector extensions, search_tsv generated column, GIN index, HNSW index (m=16, ef_construction=64), match_tools_ranked RPC, fuzzy_search_tools RPC, increment_search_count RPC

- [-] ~~Tune ivfflat `lists` parameter~~ — HNSW replaced ivfflat; no lists parameter needed

- [ ] **Materialized view: `tool_search_signals`**
  ```sql
  -- Pre-compute click-through rate per tool for ranking boost
  CREATE MATERIALIZED VIEW IF NOT EXISTS public.tool_search_signals AS
  SELECT
    tool_id,
    COUNT(*) AS total_clicks,
    COUNT(DISTINCT query) AS unique_queries,
    MAX(clicked_at) AS last_clicked_at
  FROM public.tool_clicks
  GROUP BY tool_id;

  CREATE UNIQUE INDEX ON public.tool_search_signals(tool_id);
  -- Refresh: REFRESH MATERIALIZED VIEW CONCURRENTLY public.tool_search_signals;
  -- Schedule as a nightly cron or trigger on tool_clicks insert.
  ```

- [ ] **Supporting indexes** (if not already present):
  ```sql
  CREATE INDEX IF NOT EXISTS idx_tools_launch_status ON public.tools(launch_status);
  CREATE INDEX IF NOT EXISTS idx_tools_main_category  ON public.tools(main_category);
  CREATE INDEX IF NOT EXISTS idx_search_queries_query ON public.search_queries(query text_pattern_ops);
  CREATE INDEX IF NOT EXISTS idx_tool_clicks_tool_id  ON public.tool_clicks(tool_id);
  CREATE INDEX IF NOT EXISTS idx_tool_clicks_query    ON public.tool_clicks(query);
  ```

### API

- [x] **Create `POST /api/search` route**
  - Unifies `aiSearch` + `quickSearch` into one HTTP endpoint
  - Accepts `{ q: string, mode: 'hybrid' | 'quick' | 'autocomplete' }`
  - Returns `{ tools: Tool[], intent: SearchIntent | null, fuzzy: boolean }`
  - Applies same rate limit (30/min/IP) and caching (1h) as current server actions
  - Enables search from client components and edge functions

- [x] **Add search route to API usage tracking** — log to `api_usage` table on each call (run supabase/api_usage.sql first)

### Personalisation

- [x] **ICP-aware result re-ranking**
  - After RRF merge, apply a soft boost to tools matching the logged-in user's `primary_use_case` and `main_category` preference
  - Boost factor: `× 1.2` for matching use_case, `× 1.1` for matching pricing preference
  - Only apply when `user_profiles.onboarding_status = 'completed'`

---

## 🟢 P2 — Growth features (backlog)

### Stack Builder

- [ ] Conversational AI endpoint `POST /api/stack/recommend`
  - Input: goal description (free text)
  - Output: 3–5 recommended tools with rationale
  - Uses Claude for recommendation, pgvector for candidate retrieval
- [ ] `StackBuilder` UI component (sidebar panel or modal)
- [ ] One-click "Add all to collection" action

### Tool Submission

- [ ] Founder submission form at `/submit`
  - Fields: name, URL, category, description, pricing, founder email
  - Writes to `tool_submissions` table (separate from live `tools`)
- [ ] Admin review queue at `/admin/submissions`
- [ ] Promote to live: `INSERT INTO tools SELECT ... FROM tool_submissions WHERE id = ?`

### SEO & Structured Data

- [ ] Static generation for top 50 comparison pairs (`/compare/[a]/[b]`)
  - Derive pairs from `tool_clicks` co-occurrence data
- [ ] JSON-LD `ItemList` on category pages
- [ ] Sitemap generation (`/sitemap.xml`) including all live tool slugs and public `/s/[token]` pages

### Outcome Collection (Initiative 2)

- [x] **`supabase/outcomes.sql`** — `workflow_outcomes` table, `outcome_signals` mat view, `refresh_outcome_signals()` RPC, admin view; **run in Supabase**
- [x] **`app/api/outcomes/route.ts`** — POST endpoint; upsert outcome; triggers mat view refresh on rated submissions
- [x] **`app/api/outcomes/pending/route.ts`** — GET endpoint; returns first pending D7/D30 check for authenticated user
- [x] **`components/OutcomePrompt.tsx`** — dismissible inline card on dashboard; loads client-side so it never blocks page render; fires `outcome_prompt_shown`, `outcome_submitted`, `outcome_skipped`
- [x] **Run `supabase/outcomes.sql`** in Supabase SQL Editor — run 2026-05-03

### Ranking Flywheel (Initiative 4)

- [x] **`lib/outcome-boost.ts`** — `applyOutcomeBoost()`: multiplicative lift up to +10% for tools with avg_satisfaction ≥ 4
- [x] **`actions/ai-search.ts`** — `ENABLE_OUTCOME_RANKING=true` env var gates outcome boost after ICP re-rank; `getOutcomeSignals()` cached 1h from mat view
- [x] **`__tests__/search-ranking.fixtures.ts`** — expanded from 7 to 25 fixtures: pipeline integrity, filters, intent queries, use-case queries, pagination, edge cases; added `scoresInRange` and `noOverlapWithPage1` assertion types

### Performance Gates (Initiative 5)

- [x] **Hard targets written into `ROADMAP.md`** — p95 latency < 400ms, submit rate > 15%, zero-result < 8%, CTR > 20%, error rate < 0.5%; runbook included

### Beachhead Landing Pages (Initiative 3)

- [x] **`lib/stack-templates.ts`** — 6 use-case configs, 2 templates each, with tool slugs + compare pairs
- [x] **`app/stacks/[use-case]/page.tsx`** — statically generated per use case; fetches live tools by slug; passes to client
- [x] **`app/stacks/[use-case]/_components/StackLanding.tsx`** — full page UI with 4 PostHog events (page_viewed, tool_clicked, compare_clicked, save_clicked)
- [x] **`app/stacks/page.tsx`** — index listing all use cases

### Decision Capture (Initiative 1)

- [x] **`docs/DECISION_SPEC.md`** — full spec written
- [x] **`supabase/decisions.sql`** — decision_sessions, tool_choices, tool_rejections + admin_decision_volume view; run 2026-05-03
- [x] **`app/api/decisions/route.ts`** — POST endpoint, optional auth, 10/min rate limit
- [x] **`DecisionPrompt.tsx`** — 3-step compare-page prompt (choice → confidence → confirmation)
- [x] **`app/admin/decisions/page.tsx`** — admin dashboard: KPI strip + daily volume by ICP + recent sessions

### Analytics

- [ ] Admin search dashboard at `/admin/search`
  - Top 20 queries by volume (from `search_queries`)
  - Zero-result queries (queries with no `tool_clicks` within 30s)
  - Click-through rate by search position
- [ ] Weekly "zero results" report — queries that consistently return nothing → content gaps

### Infrastructure

- [-] ~~Migrate to HNSW~~ — already on HNSW (ivfflat dropped; it exceeded 32 MB maintenance_work_mem)
- [ ] Move rate limiter to Redis/Upstash (current in-memory limiter is per-instance)
- [ ] Add vitest + `@testing-library/react` — no test runner currently installed

---

## Explicitly Off The Table

| Task | Reason |
|------|--------|
| Typesense provisioning / sync / index management | Not used; Supabase FTS + pgvector is the search stack |
| Typesense API key management | Not used |
| Typesense collection schema definition | Not used |
| Webhook to sync tools → Typesense on insert/update | Not used; `revalidateTag('tools')` invalidates Next.js cache instead |
| Algolia / Elastic integration | Same reason as Typesense |
