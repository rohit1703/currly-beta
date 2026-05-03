# Currly Beta — Task Backlog

**Last updated:** 2026-05-03  
Format: `[ ]` open · `[x]` done · `[-]` deferred

---

## 🔴 P0 — Do now (blocking stability)

### Database

- [ ] **Verify GIN index on `tools.fts`**
  ```sql
  SELECT indexname FROM pg_indexes WHERE tablename = 'tools' AND indexdef LIKE '%gin%';
  -- Expected: idx_tools_fts
  -- If missing:
  CREATE INDEX IF NOT EXISTS idx_tools_fts ON public.tools USING gin(fts);
  ```

- [ ] **Verify HNSW index on `tools.embedding`**
  ```sql
  SELECT indexname FROM pg_indexes WHERE tablename = 'tools' AND indexdef LIKE '%hnsw%';
  -- If missing (search.sql handles this, but manual fallback):
  DROP INDEX IF EXISTS idx_tools_embedding_ivfflat;
  CREATE INDEX IF NOT EXISTS idx_tools_embedding_hnsw
    ON public.tools USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
  -- Note: ivfflat was replaced because its training phase requires O(rows × dim) memory,
  -- hitting Supabase's 32 MB maintenance_work_mem limit. HNSW is O(ef_construction × dim).
  ```

- [ ] **Verify required RPCs exist**
  ```sql
  SELECT routine_name FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN ('match_tools', 'fuzzy_search_tools', 'increment_search_count');
  -- Expected: 3 rows
  ```

- [ ] **Drop `saved_tools` table** (after confirming 48h stability with collections)
  ```sql
  -- Verify nothing reads from it first:
  -- grep -r "saved_tools" actions/ app/ components/ --include="*.ts" --include="*.tsx"
  DROP TABLE IF EXISTS public.saved_tools;
  ```

- [ ] **Run `supabase/user_profiles.sql`** — adds `onboarding_status` column, makes profile fields nullable, backfills existing rows to `'completed'`

- [ ] **Run `supabase/collections.sql`** — adds `collections_public_requires_token` CHECK constraint (cleanup of ghost-public rows included)

### Code

- [x] Fix `createAndAdd` response check in `CollectionPickerPopover.tsx`
- [x] Enforce `is_public` + `share_token` invariant (DB constraint + API + client)
- [x] Durable onboarding skip (`onboarding_status` in DB, no cookie)
- [x] Add missing analytics: `collection_created`, `collection_deleted`, `collection_share_link_generated`, `collection_share_link_revoked`, `icp_form_skipped`
- [ ] **Validate `toolId` as UUID in `DELETE /api/collections/[id]/tools/[toolId]`**
  ```typescript
  // app/api/collections/[id]/tools/[toolId]/route.ts
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(toolId)) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  ```
- [ ] **Remove legacy `actions/saved.ts`** — after `saved_tools` table is dropped

---

## 🟡 P1 — Search quality & unified API

### SQL / Indexes / Materialized Views

- [ ] **Create `supabase/search.sql`** — document FTS setup so it's reproducible:
  - `fts` tsvector generated column or trigger definition
  - GIN index
  - ivfflat index with tuned `lists` value
  - `pg_trgm` extension enable
  - `vector` extension enable
  - `match_tools` RPC
  - `fuzzy_search_tools` RPC
  - `increment_search_count` RPC

- [ ] **Tune ivfflat `lists` parameter**
  ```sql
  -- Rule of thumb: lists ≈ sqrt(row_count)
  -- Check current count:
  SELECT COUNT(*) FROM tools WHERE launch_status = 'Live';
  -- Rebuild index with appropriate lists value if needed
  ```

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

- [ ] **Create `POST /api/search` route**
  - Unifies `aiSearch` + `quickSearch` into one HTTP endpoint
  - Accepts `{ q: string, mode: 'hybrid' | 'quick' | 'autocomplete' }`
  - Returns `{ tools: Tool[], intent: SearchIntent | null, fuzzy: boolean }`
  - Applies same rate limit (30/min/IP) and caching (1h) as current server actions
  - Enables search from client components and edge functions

- [ ] **Add search route to API usage tracking** — log to `api_usage` table on each call

### Personalisation

- [ ] **ICP-aware result re-ranking**
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
