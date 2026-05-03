import { Tool, UserProfile } from '@/types';

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
const LOW_BUDGET = new Set(['<$100', '$100–$500']);
const FREE_PRICING = new Set(['free', 'freemium', 'open source']);

/**
 * Re-ranks tools using soft multipliers derived from the user's ICP profile.
 * Only active when onboarding_status === 'completed'.
 * Returns a new sorted array; does not mutate the input.
 */
export function applyICPBoost(tools: Tool[], profile: UserProfile): Tool[] {
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

    if (useCaseCats.has(tool.main_category)) {
      multiplier *= 1.2;                            // primary use-case match
    } else if (roleCats.has(tool.main_category)) {
      multiplier *= 1.1;                            // role affinity (weaker)
    }

    if (prefersLowBudget && FREE_PRICING.has(tool.pricing_model?.toLowerCase() ?? '')) {
      multiplier *= 1.1;                            // pricing preference
    }

    if (multiplier === 1.0) return tool;

    return {
      ...tool,
      _scores: tool._scores
        ? { ...tool._scores, final: tool._scores.final * multiplier }
        : undefined,
    };
  });

  return boosted.sort((a, b) => (b._scores?.final ?? 0) - (a._scores?.final ?? 0));
}
