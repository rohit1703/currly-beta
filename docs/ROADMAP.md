# Currly Beta — Product Roadmap

**Last updated:** 2026-05-03

---

## Current State (shipped)

| Area | Status |
|------|--------|
| Tool discovery — browse + category filter | ✅ Live |
| Hybrid search (FTS + pgvector + RRF) | ✅ Live |
| AI intent parsing (gpt-4o-mini) | ✅ Live |
| Autocomplete / suggestions | ✅ Live |
| Tool detail pages with reviews + comments | ✅ Live |
| Tool comparison (`/compare/[a]/[b]`) | ✅ Live |
| Collections / Stacks (save, organise, share) | ✅ Live |
| Public share links (`/s/[token]`) | ✅ Live |
| ICP onboarding (role, stage, budget, use-case) | ✅ Live |
| User profile + data export + account deletion | ✅ Live |
| Auth (Google OAuth via Supabase) | ✅ Live |

---

## P0 — Stability & Data Integrity (this sprint)

These are non-negotiable before any growth push.

| Milestone | Owner | Notes |
|-----------|-------|-------|
| Confirm GIN index exists on `tools.fts` | DB | Table scan on search is unacceptable at scale |
| Confirm ivfflat index exists on `tools.embedding` | DB | Vector search requires ANN index |
| Verify `fuzzy_search_tools`, `match_tools`, `increment_search_count` RPCs exist | DB | Search degrades silently if missing |
| Drop `saved_tools` table (48h post-collections launch) | DB | Stale table; collections is the source of truth |
| Remove legacy `actions/saved.ts` server actions | Code | Dead code referencing dropped table |
| Fix `createAndAdd` response check in `CollectionPickerPopover` | Code | ✅ Done |
| Enforce `is_public` + `share_token` invariant (DB constraint + API) | Code | ✅ Done |
| Onboarding skip — durable DB flag, no redirect loop | Code | ✅ Done |
| Missing analytics events (collection lifecycle, skip) | Code | ✅ Done |
| Validate `toolId` UUID in DELETE tools route | Code | Quick 2-line fix |

---

## P1 — Search Quality & Unified API (next 2 sprints)

| Milestone | Notes |
|-----------|-------|
| Unified `POST /api/search` HTTP route | Consolidates `aiSearch` + `quickSearch` server actions into a single callable endpoint; enables client-component search |
| `fts` column generation documented in SQL migration | Write `supabase/search.sql` with trigger or generated-column definition so it's reproducible |
| Tune ivfflat `lists` parameter to current tool count | Benchmark: rule of thumb is `sqrt(row_count)`; document in `SEARCH_SPEC.md` |
| Materialized view for search ranking signals | Pre-compute `click_through_rate` per tool from `tool_clicks`; join into search results |
| ICP-aware personalised ranking | Use `user_profiles` (role, use_case, budget) to re-rank search results for logged-in users |
| Search relevance feedback loop | Feed `tool_clicks` CTR back into FTS ranking weight or pgvector threshold |

---

## P2 — Growth & Monetisation (backlog)

| Milestone | Notes |
|-----------|-------|
| "Stack Builder" AI assistant | Conversational flow: user describes goal → AI recommends 3–5 tools → one-click save to collection |
| Tool submission portal | Founder-facing form to submit tools for review; admin approval queue |
| Featured / sponsored placements | Paid tier for tool visibility; must not pollute organic results |
| Email digest — "New tools this week" | Personalised by ICP role + use_case; Resend or Postmark integration |
| Public profile pages (`/u/[username]`) | Show public collections; opt-in; requires username claim |
| Compare page SEO (`/compare/[a]/[b]`) | Static generation for top tool pairs; structured data for search snippets |
| Search analytics dashboard (admin) | Trending queries, zero-result queries, click-through by position |
| HNSW index tuning | Already on HNSW; revisit m/ef_construction parameters if recall degrades at scale |

---

---

## Performance Gates (must hold before each growth push)

Hard numbers agreed 2026-05-03. Alert if any gate breaches for 2+ consecutive days.

| Signal | Gate | Source |
|--------|------|--------|
| p95 search latency | < 400 ms | `api_usage.duration_ms` |
| Zero-result rate | < 8% of searches | `admin_zero_click_queries` |
| Search CTR | > 20% avg | `admin_query_performance` |
| Decision submit rate | > 15% of compare-page sessions | `admin_decision_volume.submit_rate_pct` |
| Avg decision confidence | ≥ 2.0 (Probably) | `admin_decision_volume.avg_confidence` |
| API error rate | < 0.5% of requests | server logs / Vercel function errors |
| Rate-limit hit rate | < 1% of requests | 429 response count |

### Runbook — gate breach

1. Check `admin_decision_volume` and `admin_query_performance` views for the affected date range.
2. For latency: inspect `api_usage` for slow queries; check HNSW recall with `EXPLAIN ANALYZE` on `match_tools_ranked`.
3. For zero-result spikes: check `admin_zero_click_queries` for new query patterns → add tools or synonyms.
4. For submit-rate drops: check `decision_started` vs `decision_submitted` events in PostHog funnel.
5. Escalation threshold: if any gate breaches for **5+ consecutive days**, halt growth campaigns until resolved.

---

## Not On The Roadmap

These were considered and explicitly rejected or deferred indefinitely:

| Item | Reason |
|------|--------|
| Typesense / Algolia / external search service | Supabase FTS + pgvector meets current needs with zero operational overhead; revisit only if Postgres query latency exceeds 200ms p95 |
| Separate search microservice | Over-engineering for current scale |
| Multi-language search | English-only corpus for now |
| Real-time collaborative collections | Supabase Realtime possible but no demand signal yet |
