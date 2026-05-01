export const ROLES = [
  'Founder',
  'Product Manager',
  'Developer',
  'Marketer',
  'Sales',
  'Operations',
  'Other',
] as const;

export const COMPANY_STAGES = [
  'Pre-revenue',
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B+',
  'Bootstrapped',
  'Enterprise',
] as const;

export const TEAM_SIZES = [
  '1',
  '2–5',
  '6–15',
  '16–50',
  '51–200',
  '200+',
] as const;

export const REGIONS = [
  'North America',
  'Europe',
  'Asia-Pacific',
  'South Asia',
  'Latin America',
  'Middle East & Africa',
  'Other',
] as const;

export const BUDGET_RANGES = [
  '<$100',
  '$100–$500',
  '$500–$2K',
  '$2K–$10K',
  '$10K+',
] as const;

export const USE_CASES = [
  'Outbound Sales',
  'Inbound Marketing',
  'Customer Support',
  'Internal Ops',
  'Product Development',
  'Data Analysis',
  'Other',
] as const;

export const ONBOARDING_STEPS = [
  { label: 'Your Role',      fields: ['role', 'company_stage'] as const },
  { label: 'Your Team',      fields: ['team_size', 'region'] as const },
  { label: 'Budget & Goals', fields: ['monthly_budget_range', 'primary_use_case'] as const },
] as const;

export type Role            = typeof ROLES[number];
export type CompanyStage    = typeof COMPANY_STAGES[number];
export type TeamSize        = typeof TEAM_SIZES[number];
export type Region          = typeof REGIONS[number];
export type BudgetRange     = typeof BUDGET_RANGES[number];
export type UseCase         = typeof USE_CASES[number];
