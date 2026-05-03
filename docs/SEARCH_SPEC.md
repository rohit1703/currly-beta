# Search Architecture Spec — Currly Beta

**Last updated:** 2026-05-03  
**Status:** Implemented (hybrid search live in production)

---

## Overview

Currly search is entirely Supabase-native. There is no external search service (no Typesense, no Algolia, no Elastic). Lexical relevance comes from Postgres Full-Text Search (FTS); semantic relevance comes from pgvector. Both signals are merged at query time using Reciprocal Rank Fusion (RRF).

---

## Data Flow

```
User query
    │
    ├─► Intent parser (gpt-4o-mini, cached 24h)
    │       └─► { terms[], category, pricing, summary }
    │
    ├─► Query embedding (text-embedding-3-small, cached 24h)
    │       └─► float[] vector (1536 dims)
    │
    └─► Postgres (parallel)
            ├─► FTS on tsvector column `fts`
            │       textSearch(type='websearch', config='english')
            │       optional: .eq('main_category', intent.category)
            │
            └─► pgvector match_tools RPC
                    match_threshold = 0.25
                    match_count     = 20
                    index: ivfflat (cosine)

Both result lists → RRF merge (k=60) → top 20 tools
Post-filter: pricing if intent.pricing set

Fallback chain (when both lists empty):
  1. ilike on expanded terms (name, description)
  2. fuzzy_search_tools RPC (pg_trgm, trigram similarity)
```

---

## Lexical Source — Postgres FTS Ranking

The `fts` column on the `tools` table is a pre-computed `tsvector` maintained by a Postgres trigger (or generated column). It concatenates:

| Field | Weight |
|-------|--------|
| `name` | A (highest) |
| `main_category` | B |
| `description` | C |
| `use_case` | C |

Queries use `websearch` mode, which supports natural-language operators (`"exact phrase"`, `-exclude`, `OR`) without requiring users to know tsquery syntax.

**There is no external lexical index.** All FTS operations happen inside the same Postgres instance that stores the tool data.

---

## Semantic Source — pgvector

Tool embeddings are stored in the `embedding` column (`vector(1536)`) on the `tools` table, generated with OpenAI `text-embedding-3-small`. Query embeddings are generated on demand and cached 24h via `unstable_cache`.

The `match_tools` SQL function computes cosine distance and returns rows above `match_threshold`.

---

## Index Strategy

### FTS — GIN index

```sql
CREATE INDEX IF NOT EXISTS idx_tools_fts
  ON public.tools USING gin(fts);
```

Required for `@@` tsvector matching to be fast. Without it, every search is a full table scan.

### Vector — HNSW

```sql
-- HNSW (current) — better recall than ivfflat; memory is O(ef_construction × dim) not O(rows)
CREATE INDEX IF NOT EXISTS idx_tools_embedding_hnsw
  ON public.tools USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

ivfflat was dropped: its k-means training phase requires O(rows × dim) memory which exceeds Supabase's 32 MB `maintenance_work_mem` cap once the tools table has more than a few thousand rows. HNSW builds incrementally and has no such constraint.

### Supporting indexes

```sql
CREATE INDEX IF NOT EXISTS idx_tools_launch_status ON public.tools(launch_status);
CREATE INDEX IF NOT EXISTS idx_tools_main_category  ON public.tools(main_category);
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON public.search_queries(query);
CREATE INDEX IF NOT EXISTS idx_tool_clicks_tool_id  ON public.tool_clicks(tool_id);
```

---

## API Contract

### Current entry points

| Function | File | When used |
|----------|------|-----------|
| `aiSearch(query)` | `actions/ai-search.ts` | Dashboard: all non-category queries |
| `quickSearch(query)` | `actions/search.ts` | Autocomplete / instant results |
| `getSuggestions(query)` | `actions/search.ts` | `SearchAutocomplete` dropdown |
| `getToolsByCategory(cat)` | `actions/search.ts` | Category filter active |
| `getLatestTools(limit)` | `actions/search.ts` | Default browse (no query) |

### Planned `/api/search` route (P1)

Consolidate `aiSearch` and `quickSearch` into a single HTTP endpoint so search can be called from client components and non-server contexts without requiring a server action.

```
POST /api/search
Content-Type: application/json

{ "q": string, "mode": "hybrid" | "quick" | "autocomplete" }

→ 200 { tools: Tool[], intent: SearchIntent | null, fuzzy: boolean }
→ 429 { error: "Too many requests." }
```

Rate limit: 30 req/min per IP (existing in-memory limiter).  
Cache: responses cached 1h (`hybrid`), 1h (`quick`) by query string.

---

## Caching Strategy

| Layer | Mechanism | TTL |
|-------|-----------|-----|
| Intent parse | `unstable_cache` (tag: `search-intent`) | 24h |
| Query embedding | `unstable_cache` (tag: `search-embedding`) | 24h |
| Full hybrid search result | `unstable_cache` (tag: `tools`) | 1h |
| Quick text search result | `unstable_cache` (tag: `tools`) | 1h |
| Tool catalog invalidation | `revalidateTag('tools')` on tool create/update | — |

All caches are Vercel Data Cache. On cache miss the full pipeline runs; on hit only the merge/filter step runs client-side.

---

## Autocomplete

`getSuggestions(query)` combines two sources in parallel:

1. `search_queries` table — popular past queries matching the prefix (ordered by `count DESC`)
2. `tools.name` — direct tool name prefix matches

Returns up to 6 suggestions, deduped. Used by `SearchAutocomplete` component.

---

## Search Logging

All search events are stored anonymously (no user_id linkage):

| Table | What it stores | Purpose |
|-------|---------------|---------|
| `search_events` | raw query + timestamp | Usage volume |
| `search_queries` | normalized query + count + last_searched_at | Autocomplete feed, trending |
| `tool_clicks` | tool_id + query + timestamp | Click-through relevance signal |

---

## Operational Requirements

- **Postgres extensions:** `pg_trgm` (fuzzy search), `vector` (pgvector) — both must be enabled in Supabase
- **GIN index on `fts`:** required before go-live; table scan on search is unacceptable
- **ivfflat index on `embedding`:** required; rebuild with higher `lists` parameter as tool count grows
- **`match_tools` RPC:** must exist in Supabase (SQL function doing `<=>` cosine distance)
- **`fuzzy_search_tools` RPC:** must exist (uses `%` trigram similarity from `pg_trgm`)
- **`increment_search_count` RPC:** must exist (atomic counter increment on `search_queries`)
- **OpenAI API key:** `OPENAI_API_KEY` env var required for semantic search and intent parsing; app degrades gracefully to FTS-only if absent
- **No external search service:** zero dependency on Typesense, Algolia, Elastic, or similar

---

## Degradation Behaviour

| Condition | Behaviour |
|-----------|-----------|
| `OPENAI_API_KEY` missing | Falls back to FTS-only; intent terms = raw query tokens |
| FTS returns 0 results | Falls to ilike on expanded terms |
| ilike returns 0 results | Falls to trigram fuzzy search via `fuzzy_search_tools` |
| All sources return 0 | Returns empty array; no error shown |
| Rate limit exceeded | Returns empty array silently (UX: no results) |
| pgvector RPC error | Logged to console; FTS result used alone |

---

## Known Gaps (next sprint)

1. No unified `/api/search` HTTP route — search only callable via server actions
2. `fts` tsvector column generation not documented in migration SQL (relies on trigger or manual backfill)
3. ivfflat index `lists` parameter not tuned to current tool count
4. No search relevance feedback loop — `tool_clicks` data collected but not fed back into ranking
5. Autocomplete has no debounce floor enforced server-side (relies on client)
