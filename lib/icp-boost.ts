import { Tool, UserProfile, ICPBoostDebug } from '@/types';

// Maps ICP use-case → tool categories that are most relevant
const USE_CASE_CATEGORIES: Record<string, string[]> = {
  'Outbound Sales':      ['Marketing & Sales', 'AI Agents & Assistants'],
  'Inbound Marketing':   ['Marketing & Sales', 'Content & Creative'],
  'Customer Support':    ['Customer Support',  'AI Agents & Assistants'],
  'Internal Ops':        ['Productivity & Automation', 'HR & Recruitment'],
  'Product Development': ['Development & Engineering', 'AI Agents & Assistants'],
  'Data Analysis':       ['Data & Analytics',  'Productivity & Automation'],
};

// Maps role → secondary category affinity (weaker signal than use-case)
const ROLE_CATEGORIES: Record<string, string[]> = {
  'Developer':       ['Development & Engineering', 'Data & Analytics'],
  'Marketer':        ['Marketing & Sales',         'Content & Creative'],
  'Sales':           ['Marketing & Sales',          'AI Agents & Assistants'],
  'Operations':      ['Productivity & Automation',  'HR & Recruitment'],
  'Product Manager': ['AI Agents & Assistants',     'Productivity & Automation'],
  'Founder':         ['Marketing & Sales',           'AI Agents & Assistants'],
};

// Budget ranges where free/freemium tools get a pricing boost
const LOW_BUDGET  = new Set(['<$100', '$100–$500']);
const FREE_PRICING = new Set(['free', 'freemium', 'open source']);

// Hard ceiling on combined ICP multiplier.
// Prevents stacking (use-case × pricing × future signals) from compounding unboundedly.
// Range: [1.0, ∞). Current practical max without ceiling: 1.2 × 1.1 = 1.32.
// Set at 1.40 to allow slight headroom for future signals while keeping base relevance intact.
export const MAX_ICP_MULTIPLIER = 1.40;

/**
 * Re-ranks tools using soft multipliers derived from the user's ICP profile.
 * Only active when onboarding_status === 'completed'.
 * Returns a new sorted array; does not mutate the input.
 *
 * @param debug  When true, attaches _debug_icp to each boosted tool.
 *               Pass process.env.NODE_ENV !== 'production' at call site.
 */
export function applyICPBoost(tools: Tool[], profile: UserProfile, debug = false): Tool[] {
  if (profile.onboarding_status !== 'completed') return tools;

  const useCaseCats = new Set(
    profile.primary_use_case ? (USE_CASE_CATEGORIES[profile.primary_use_case] ?? []) : []
  );
  const roleCats = new Set(
    profile.role ? (ROLE_CATEGORIES[profile.role] ?? []) : []
  );
  const prefersLowBudget = !!profile.monthly_budget_range && LOW_BUDGET.has(profile.monthly_budget_range);

  const boosted = tools.map(tool => {
    let multiplier = 1.0;
    const reasons: string[] = [];

    if (useCaseCats.has(tool.main_category)) {
      multiplier *= 1.2;          // primary use-case match: +20%
      reasons.push('use_case');
    } else if (roleCats.has(tool.main_category)) {
      multiplier *= 1.1;          // role affinity (weaker signal): +10%
      reasons.push('role');
    }

    if (prefersLowBudget && FREE_PRICING.has(tool.pricing_model?.toLowerCase() ?? '')) {
      multiplier *= 1.1;          // pricing preference match: +10%
      reasons.push('pricing');
    }

    if (multiplier === 1.0) return tool;

    const rawMultiplier    = multiplier;
    const clampedMultiplier = Math.min(multiplier, MAX_ICP_MULTIPLIER);

    const updatedTool: Tool = {
      ...tool,
      _scores: tool._scores
        ? { ...tool._scores, final: tool._scores.final * clampedMultiplier }
        : undefined,
    };

    if (debug && tool._scores) {
      const meta: ICPBoostDebug = {
        pre_boost_final: tool._scores.final,
        multiplier:      clampedMultiplier,
        raw_multiplier:  rawMultiplier,
        reasons,
      };
      updatedTool._debug_icp = meta;
    }

    return updatedTool;
  });

  return boosted.sort((a, b) => (b._scores?.final ?? 0) - (a._scores?.final ?? 0));
}
