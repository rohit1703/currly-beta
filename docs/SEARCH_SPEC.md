# Search Architecture Spec — Currly Beta

**Last updated:** 2026-05-03 (Revision 2)
**Status:** Hybrid search + personalised re-ranking live in production

---

## Overview

Currly search is entirely Supabase-native. There is no external search service (no Typesense, no Algolia, no Elastic). Five signals are blended at query time inside a single Postgres RPC (`match_tools_ranked`). Two additional signals are applied in TypeScript after the RPC returns.

Signal summary:

| Signal | Layer | Type |
|--------|-------|------|
| Lexical (`ts_rank_cd` on weighted tsvector) | SQL | Relevance |
| Semantic (cosine similarity via pgvector) | SQL | Relevance |
| Quality (`is_featured` flag) | SQL | Editorial |
| Freshness (exponential decay from `launch_date`) | SQL | Temporal |
| Behavior (log-normalised 30-day click count) | SQL | Engagement |
| ICP boost (use-case / role / budget multipliers) | TypeScript | Personalisation |
| Outcome boost (satisfaction-derived multiplier) | TypeScript | Flywheel |

---

## Data Flow

### Anonymous / non-personalised path

```
User query
    │
    ├─► Intent parser (gpt-4o-mini, cached 24h)
    │       └─► { terms[], category, pricing, summary }
    │
    ├─► Query embedding (text-embedding-3-small, cached 24h)
    │       └─► float[1536] vector
    │
    └─► match_tools_ranked RPC
            ├─► FTS: up to 100 candidates via weighted tsvector @@ websearch_to_tsquery
            ├─► Vector: up to 100 candidates via cosine similarity (threshold 0.20)
            ├─► Union → assemble 5 signals per candidate
            ├─► Weight blend → final_score
            └─► ORDER BY final_score DESC, LIMIT/OFFSET
```

### Authenticated + personalised path (`personalizedSearch`)

Same pipeline, then in TypeScript:

```
match_tools_ranked result (3× candidate window)
    │
    ├─► applyICPBoost(candidates, profile, debugMode)
    │       Multipliers: ×1.2 use-case match, ×1.1 role match, ×1.1 budget match
    │       Ceiling: MAX_ICP_MULTIPLIER = 1.40
    │
    ├─► applyOutcomeBoost(reranked, outcomeSignals)          [if ENABLE_OUTCOME_RANKING=true]
    │       Multiplier: 1 + outcome_score × 0.10
    │
    ├─► injectExplorationSlot(reranked, preBoostOrder)
    │       Pins highest base-ranked tool not in top 4 to slot 5
    │
    └─► slice(start, start + pageSize)
```

Fallback chain (fires when `match_tools_ranked` returns 0 results):

```
1. ilike on expanded intent terms (name OR description)
2. fuzzy_search_tools RPC — trigram similarity (pg_trgm, threshold 0.3)
3. Empty array (no error shown to user)
```

---

## SQL Scoring Signals

All signal formulas live in `supabase/search.sql`. The annotated SQL is the authoritative source for thresholds and tuning guidance.

### Lexical

```sql
ts_rank_cd(search_tsv, websearch_to_tsquery('english', query_fts), 4)
```

`search_tsv` is a generated `tsvector` column:

| Field | Weight | Postgres multiplier |
|-------|--------|---------------------|
| `name` | A | 1.0 |
| `main_category` | B | 0.4 |
| `description` | C | 0.2 |

Normalisation option `4` divides by `1 + log(document length)`, preventing verbose descriptions from dominating.

**Critical:** the FTS query string uses `OR` as the boolean operator (`intent.terms.join(' OR ')`). `websearch_to_tsquery` strips `|` as punctuation — using `|` instead of `OR` silently converts the query to AND, collapsing recall.

### Semantic

```sql
GREATEST(0.0, 1.0 - (t.embedding <=> query_embedding)) AS sem_raw
```

- `<=>` is cosine distance (pgvector)
- `1 - distance` = cosine similarity; range [0, 1]
- Threshold: `similarity > 0.20` (lower → broader recall; raise to 0.30 for stricter precision)
- Embeddings: `text-embedding-3-small`, 1536 dimensions

### Quality

```sql
CASE WHEN t.is_featured THEN 1.0 ELSE 0.3 END
```

Binary for now. The `0.3` floor prevents non-featured tools from scoring zero under browse-mode weighting. Extend with a normalised average rating when ratings are available.

### Freshness

```sql
EXP(-GREATEST(0.0, EXTRACT(EPOCH FROM (now() - COALESCE(t.launch_date, now())))) / 31536000.0)
```

Exponential decay with a 1-year half-life (31 536 000 seconds):

| Age | Score |
|-----|-------|
| Today | 1.000 |
| 6 months | ≈ 0.607 |
| 1 year | ≈ 0.368 |
| 2 years | ≈ 0.135 |
| 3 years | ≈ 0.050 |

Tools with `NULL launch_date` score 1.0 (treated as launched now).

### Behavior

```sql
LN(1.0 + COALESCE(cc.cnt, 0.0)) / LN(1.0 + _max_clicks)
```

Log-normalised 30-day click count. The logarithm prevents a single viral tool from collapsing all other behavior scores to near-zero.

Example: max 1000 clicks in window, tool has 10 clicks → `ln(11) / ln(1001) ≈ 0.35` (not 0.01).

`_max_clicks` is computed across the current candidate set, not all tools, so global outliers don't distort per-request scoring.

---

## Weight Blends

### Search mode (query present)

| Signal | Weight | Notes |
|--------|--------|-------|
| Semantic | 0.40 | Dominant — embedding recall is high quality |
| Lexical | 0.35 | Strong — exact/phrase matches matter |
| Quality | 0.15 | Moderate — editorial signal |
| Freshness | 0.05 | Weak — recency tie-breaker |
| Behavior | 0.05 | Weak — meaningful only with statistically significant click volume |

### Browse mode (no query)

| Signal | Weight | Notes |
|--------|--------|-------|
| Quality | 0.50 | Featured tools dominate the discovery feed |
| Freshness | 0.30 | New tools surface prominently |
| Behavior | 0.20 | Reward real-world interest |

Weights are annotated `-- TUNABLE:` in `supabase/search.sql`. Sum must equal 1.0 within each mode.

---

## TypeScript Post-Processing

Applied in `actions/ai-search.ts` after `match_tools_ranked` returns. None of these signals are visible in the SQL layer.

### ICP Boost (`lib/icp-boost.ts`)

Soft multipliers derived from the authenticated user's onboarding profile. Only active when `onboarding_status === 'completed'`.

| Match type | Multiplier | Mapping source |
|------------|------------|---------------|
| `primary_use_case` → tool category | ×1.2 | `USE_CASE_CATEGORIES` map |
| `role` → tool category | ×1.1 | `ROLE_CATEGORIES` map |
| Low budget + free/freemium/open-source tool | ×1.1 | `monthly_budget_range` in `LOW_BUDGET` set |

Hard ceiling: `Math.min(rawMultiplier, MAX_ICP_MULTIPLIER)` where `MAX_ICP_MULTIPLIER = 1.40`.
Maximum practical stack: ×1.2 × ×1.1 = ×1.32 (stays under ceiling).

### Outcome Boost (`lib/outcome-boost.ts`)

Applies `final × (1 + outcome_score × 0.10)` using data from the `outcome_signals` materialized view. Gated by `ENABLE_OUTCOME_RANKING=true`. Off by default; enable when ~90 days of outcome data are available (target: mid-June 2026).

### Exploration Slot

Pins position 5 (index 4, `EXPLORATION_SLOT = 4`) to the highest base-ranked tool not already in the top 4. This preserves at least one serendipitous result per page that is unaffected by personalisation boosting.

```
preBoostOrder = [...candidates].sort(by base final_score)
find first candidate in preBoostOrder whose id is not in boosted[0..3]
if that candidate was pushed past slot 5 by boosting → move it to slot 5
```

---

## Candidate Window

When ICP boost is active, `personalizedSearch` fetches `pageSize × 3` candidates from `match_tools_ranked` before re-ranking. This ensures that tools promoted by personalisation are not arbitrarily cut off by the pagination boundary.

The final slice for the page is applied after all TypeScript signals:
```typescript
const start = (page - 1) * pageSize;
return { tools: reranked.slice(start, start + pageSize), intent, variant };
```

---

## Personalisation Entry Points

| Function | File | When to use |
|----------|------|-------------|
| `aiSearch(query, options)` | `actions/ai-search.ts` | Non-personalised; public or unauthenticated callers |
| `personalizedSearch(query, options)` | `actions/ai-search.ts` | Authenticated user pages (dashboard, search results) |
| `runRankedSearch(...)` | `actions/ai-search.ts` | Exported; called by `/api/search` after its own rate-limit |

---

## Feature Flags

All flags default to preserving existing production behaviour when unset.

| Env var | Default | Effect |
|---------|---------|--------|
| `ICP_RERANK_V1_ENABLED` | `'true'` (on) | Set `'false'` to kill-switch all ICP boosting immediately |
| `ICP_AB_TEST_ENABLED` | `'false'` (off) | Set `'true'` to route 50% of users to control (no ICP) |
| `ENABLE_OUTCOME_RANKING` | unset (off) | Set `'true'` to apply outcome signal boost |

### A/B Test Mechanics

When `ICP_AB_TEST_ENABLED=true`, variant assignment is deterministic per `user_id` using a djb2 hash:

```typescript
function getSearchVariant(userId: string): 'control' | 'treatment' {
  let hash = 5381;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) + hash) ^ userId.charCodeAt(i);
    hash |= 0; // keep as 32-bit integer
  }
  return Math.abs(hash) % 2 === 0 ? 'control' : 'treatment';
}
```

No DB write required. Same `userId` always maps to the same variant. `variant` is returned in the `AISearchResult` payload so PostHog can segment results.

---

## Debug Mode

When `process.env.NODE_ENV !== 'production'`, `_debug_icp` is attached to each boosted tool:

```typescript
interface ICPBoostDebug {
  pre_boost_final: number;  // final_score before multiplier
  multiplier: number;       // clamped value actually applied
  raw_multiplier: number;   // value before MAX_ICP_MULTIPLIER ceiling
  reasons: string[];        // e.g. ['use_case', 'pricing']
}
```

This field is always `undefined` in production. Inspect it in browser devtools or server logs during local development.

---

## API Routes

### `/api/search` (live)

```
GET /api/search?q=<query>&category=<cat>&pricing=<p1,p2>&page=<n>&pageSize=<n>
POST /api/search
Content-Type: application/json
{ "q": string, "category"?: string, "pricing"?: string[], "page"?: number, "pageSize"?: number }

→ 200 { tools: Tool[], intent: SearchIntent }
→ 400 { error: "Query required." }
→ 429 { error: "Too many requests." }
```

Rate limit: 30 req/min per IP (reuses `rateLimit` from `lib/rate-limit.ts`).
Cache: `runRankedSearch` result cached 1h via `unstable_cache` (tag: `tools`).

---

## Caching Strategy

| Layer | Mechanism | TTL | Key |
|-------|-----------|-----|-----|
| Intent parse | `unstable_cache` | 24h | `search-intent` + query string |
| Query embedding | `unstable_cache` | 24h | `search-embedding` + query string |
| Ranked search result | `unstable_cache` | 1h | `ranked-search-v2` + (query, category, pricing, page, pageSize) |
| Outcome signals | `unstable_cache` | 1h | `outcome-signals`; invalidated by `revalidateTag('tools')` |
| Tool catalog invalidation | `revalidateTag('tools')` | — | On tool create/update/publish |
| Session profile | React `cache()` | Per-request | Dedups concurrent `getSessionProfile` calls |

All caches are Vercel Data Cache. The `ranked-search-v2` key was bumped from `ranked-search` on 2026-04-09 to force cold cache after the critical OR-vs-pipe FTS regression fix.

---

## Autocomplete

`getSuggestions(query)` in `actions/search.ts` combines two sources in parallel:

1. `search_queries` table — popular past queries matching the prefix (ordered by `count DESC`)
2. `tools.name` — direct tool name prefix matches

Returns up to 6 suggestions, deduped. Used by `SearchAutocomplete` component.

---

## Search Logging

| Table | What it stores | Purpose |
|-------|---------------|---------|
| `search_events` | raw query + timestamp | Usage volume |
| `search_queries` | normalised query + count + `last_searched_at` | Autocomplete feed, trending |
| `tool_clicks` | `tool_id` + query + `clicked_at` | Behavioral signal feed |

No user_id linkage on search events (anonymous). Click events are anonymised; `tool_clicks` feeds the behavior signal in `match_tools_ranked` (30-day window).

---

## Index Strategy

### FTS — two GIN indexes

```sql
-- Legacy column (used by quickSearch / .textSearch())
CREATE INDEX idx_tools_fts ON public.tools USING gin(fts);

-- Weighted generated column (used by match_tools_ranked)
CREATE INDEX idx_tools_search_tsv ON public.tools USING gin(search_tsv);
```

### Vector — HNSW

```sql
CREATE INDEX idx_tools_embedding_hnsw
  ON public.tools USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

`ivfflat` was dropped: its k-means training requires O(rows × dim) memory that exceeds Supabase's 32 MB `maintenance_work_mem` once the tool catalog grows beyond a few thousand rows. HNSW builds incrementally and has no such constraint.

Tuning reference (from `search.sql`):
- `m = 16`: bidirectional links per node; range [4, 64]; decrease on OOM, increase only if recall is poor at scale
- `ef_construction = 64`: candidate list during build; current ratio 64/16 = 4× (conservative upper bound recommended: 2×m)

### Supporting B-tree indexes

```sql
idx_tools_launch_status   ON tools(launch_status)
idx_tools_main_category   ON tools(main_category)
idx_search_queries_query  ON search_queries(query text_pattern_ops)
idx_tool_clicks_tool_id   ON tool_clicks(tool_id)
idx_tool_clicks_query     ON tool_clicks(query)
idx_tool_clicks_time      ON tool_clicks(clicked_at DESC)
```

---

## Operational Requirements

- **Extensions:** `pg_trgm` and `vector` must be enabled in Supabase
- **`search_tsv` column:** generated column on `tools`; populated automatically on insert/update
- **GIN indexes:** `idx_tools_fts` and `idx_tools_search_tsv` must exist before go-live
- **HNSW index:** `idx_tools_embedding_hnsw` must exist; no retraining required as catalog grows
- **RPCs:** `match_tools_ranked`, `fuzzy_search_tools`, `increment_search_count`, `match_tools` (legacy) must all be deployed
- **Materialized view:** `outcome_signals` with columns `(tool_id, outcome_score)` must exist; can be empty until outcome data accumulates
- **`OPENAI_API_KEY`:** required for semantic search and intent parsing; app degrades gracefully to FTS-only if absent
- **No external search service:** zero dependency on Typesense, Algolia, Elastic, or similar

---

## Degradation Behaviour

| Condition | Behaviour |
|-----------|-----------|
| `OPENAI_API_KEY` missing | FTS-only; intent terms = raw query tokens; no embeddings |
| `ICP_RERANK_V1_ENABLED=false` | `personalizedSearch` behaves like `aiSearch`; no multipliers applied |
| `ICP_AB_TEST_ENABLED=true`, user in control arm | `personalizedSearch` returns base ranking, `variant='control'` in payload |
| `ENABLE_OUTCOME_RANKING` unset | Outcome boost skipped silently |
| `match_tools_ranked` returns 0 | Falls to ilike on expanded terms |
| ilike returns 0 | Falls to trigram `fuzzy_search_tools` |
| All sources return 0 | Empty array; no error shown |
| Rate limit exceeded (30 req/min per IP) | Empty array returned silently |
| RPC error | Logged to console; empty result treated as 0 candidates |
| `outcome_signals` view empty | `getOutcomeSignals` returns `{}`; outcome boost has no effect |

---

## Known Gaps

1. `_debug_icp` data not logged server-side even in non-production; a `LOG_ICP_BOOSTS=true` env var to write boost decisions to stdout would help validate production ICP behaviour
2. PostHog events do not yet include the `variant` field — A/B test analysis requires adding `{ variant }` to `search_completed` and related events
3. No Supabase view joining variant assignment to decision outcomes; needed to compare control vs treatment conversion in SQL
4. Autocomplete has no server-side debounce floor (client-side only)
5. `outcome_signals` materialized view requires a scheduled `REFRESH MATERIALIZED VIEW` job; not yet scheduled (target: mid-June 2026 when D30 data is meaningful)
6. Category diversity guardrail (checking top-N for same-category clustering) deferred until PostHog data shows filter-bubble signal
