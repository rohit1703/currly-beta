# Decision Capture Spec — Currly Beta

**Last updated:** 2026-05-03  
**Status:** Implementing (compare-page prompt v1)

---

## Purpose

Capture which tool a user actually chose after comparing alternatives.
This turns Currly from a discovery tool into a source of proprietary decision data:
- "Users in Outbound Sales who compared Apollo vs Clay chose Clay 73% of the time"
- Decision data feeds back into ranking quality signals and ICP-aware recommendations

---

## Entities

### `decision_sessions`

One row per submitted decision event. Written only when the user interacts with the prompt.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid nullable | FK → auth.users; null for unauthenticated |
| `context` | text | `'compare'` or `'stack'` |
| `tool_ids` | uuid[] | All tools in scope at decision time |
| `icp_domain` | text nullable | Snapshot of `user_profiles.primary_use_case` at decision time |
| `budget_band` | text nullable | Snapshot of `user_profiles.monthly_budget_range` |
| `source_path` | text nullable | URL path where decision was captured |
| `status` | text | `'decided'` (tool chosen) · `'undecided'` (skipped / neither) |
| `created_at` | timestamptz | |

### `tool_choices`

The tool the user actively selected. Absent for `status = 'undecided'` sessions.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `decision_session_id` | uuid | FK → decision_sessions |
| `tool_id` | uuid | FK → tools |
| `confidence` | int | 1 = Still evaluating · 2 = Probably · 3 = Definitely |
| `created_at` | timestamptz | |

### `tool_rejections`

The tool(s) explicitly not chosen (present when `status = 'decided'`).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `decision_session_id` | uuid | FK → decision_sessions |
| `tool_id` | uuid | FK → tools |
| `created_at` | timestamptz | |

---

## API

### `POST /api/decisions`

Auth: optional (anonymous decisions stored with `user_id = null`).

**Request:**
```json
{
  "tool_ids": ["uuid-a", "uuid-b"],
  "chosen_tool_id": "uuid-a",
  "confidence": 3,
  "context": "compare",
  "source_path": "/compare/notion/linear"
}
```

Set `chosen_tool_id: null` and omit `confidence` for undecided submissions.

**Response:** `201 { "session_id": "uuid" }`  
**Error:** `400` on invalid input · `429` on rate limit (10/min/IP)

---

## Analytics Events (PostHog)

| Event | When | Properties |
|-------|------|-----------|
| `decision_started` | Prompt component mounts | `context`, `tool_ids`, `source_path` |
| `decision_submitted` | API call succeeds | `session_id`, `status`, `chosen_tool_id`, `confidence`, `icp_domain` |
| `decision_abandoned` | Page unload after started, before submitted | `context`, `tool_ids`, `time_on_page_ms` |

---

## Admin View: `admin_decision_volume`

Daily decision volume segmented by ICP domain. Powers `/admin/decisions`.

```sql
SELECT date, icp_domain, sessions, decisions_made, submit_rate_pct, avg_confidence
FROM admin_decision_volume
ORDER BY date DESC;
```

`submit_rate_pct` = `decisions_made / sessions × 100` — primary health metric.

---

## UX — Compare Page Prompt

Positioned as a card directly below the feature comparison table (not a modal).
Appears for all users; auth is not required to submit.

**Step 1 — Choice:**
> "Which one are you going with?"
> [Tool A] · [Tool B] · [Still deciding]

**Step 2 — Confidence** (only if a tool was chosen):
> "How confident?"
> [Definitely] · [Probably] · [Still evaluating]
> [Back] [Submit]

**Step 3 — Confirmation:**
> "Decision recorded. Thanks for sharing."

---

## Privacy

- Decision sessions tied to `user_id` are included in DSAR export and account deletion.
- Anonymous sessions (`user_id = null`) are retained for 90 days then purged.
- No personally identifiable information is stored beyond the user_id FK.

---

## Future: Outcome Collection (Initiative 2)

D7/D30 check-ins will reference `decision_session_id` to ask about realized cost,
time-to-value, and satisfaction. Schema designed to accommodate this join.
`workflow_outcomes` table will FK to `decision_sessions.id`.
