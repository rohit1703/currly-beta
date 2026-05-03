import type { Tool } from '@/types';

/**
 * Applies a multiplicative boost to tool final scores based on aggregated
 * satisfaction data from workflow_outcomes → outcome_signals view.
 *
 * signals: map of tool_id → outcome_score (already normalised to [0,1] in SQL)
 *
 * Boost formula: final = final × (1 + outcome_score × 0.10)
 *   - outcome_score = 0 (no data or avg_sat=1): no change
 *   - outcome_score = 0.75 (avg_sat=4):         +7.5% lift
 *   - outcome_score = 1.0  (avg_sat=5):         +10% lift
 *
 * Only applied when ENABLE_OUTCOME_RANKING=true — the mat view starts
 * empty and requires ≥3 rated outcomes per tool before contributing.
 */
export function applyOutcomeBoost(
  tools: Tool[],
  signals: Record<string, number>
): Tool[] {
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
