import type { BudgetRange } from './onboarding-constants';

export interface StackTemplate {
  id: string;
  name: string;
  tagline: string;
  budget_tier: BudgetRange;
  tool_slugs: string[];
  compare_pairs: [string, string][];
}

export interface UseCaseConfig {
  use_case: string;
  slug: string;
  headline: string;
  subheadline: string;
  templates: StackTemplate[];
}

export const STACK_CONFIGS: UseCaseConfig[] = [
  {
    use_case: 'Outbound Sales',
    slug: 'outbound-sales',
    headline: 'The Outbound Sales Stack',
    subheadline: 'Tools chosen by sales teams to build pipeline faster — from first touch to closed deal.',
    templates: [
      {
        id: 'lean-outbound',
        name: 'Lean Outbound',
        tagline: 'Get from zero to pipeline without the enterprise price tag.',
        budget_tier: '<$100',
        tool_slugs: ['apollo', 'instantly', 'hubspot'],
        compare_pairs: [['apollo', 'instantly']],
      },
      {
        id: 'full-stack-outbound',
        name: 'Full-Stack Outbound',
        tagline: 'Data enrichment, multichannel sequences, and conversation intelligence.',
        budget_tier: '$500–$2K',
        tool_slugs: ['apollo', 'clay', 'lemlist', 'gong'],
        compare_pairs: [['apollo', 'clay']],
      },
    ],
  },
  {
    use_case: 'Inbound Marketing',
    slug: 'inbound-marketing',
    headline: 'The Inbound Marketing Stack',
    subheadline: 'From content creation to conversion — tools that compound over time.',
    templates: [
      {
        id: 'content-first',
        name: 'Content-First Stack',
        tagline: 'Create and distribute content without an agency or a big budget.',
        budget_tier: '<$100',
        tool_slugs: ['notion', 'beehiiv', 'plausible'],
        compare_pairs: [['beehiiv', 'convertkit']],
      },
      {
        id: 'growth-marketing',
        name: 'Growth Marketing Stack',
        tagline: 'SEO, email automation, and attribution in one cohesive workflow.',
        budget_tier: '$100–$500',
        tool_slugs: ['ahrefs', 'convertkit', 'webflow', 'hotjar'],
        compare_pairs: [['ahrefs', 'semrush']],
      },
    ],
  },
  {
    use_case: 'Customer Support',
    slug: 'customer-support',
    headline: 'The Customer Support Stack',
    subheadline: 'Resolve faster, escalate less, and turn support into your retention engine.',
    templates: [
      {
        id: 'lean-support',
        name: 'Lean Support Stack',
        tagline: 'Handle high ticket volume with a small, nimble team.',
        budget_tier: '<$100',
        tool_slugs: ['intercom', 'notion', 'slack'],
        compare_pairs: [['intercom', 'zendesk']],
      },
      {
        id: 'ai-first-support',
        name: 'AI-First Support Stack',
        tagline: 'Deflect the majority of tickets before they reach a human.',
        budget_tier: '$100–$500',
        tool_slugs: ['intercom', 'zendesk', 'freshdesk', 'linear'],
        compare_pairs: [['intercom', 'zendesk']],
      },
    ],
  },
  {
    use_case: 'Internal Ops',
    slug: 'internal-ops',
    headline: 'The Internal Ops Stack',
    subheadline: 'Automate the work that slows every team down before it compounds.',
    templates: [
      {
        id: 'no-code-ops',
        name: 'No-Code Ops Stack',
        tagline: 'Connect your tools and automate repetitive work — no engineering required.',
        budget_tier: '<$100',
        tool_slugs: ['zapier', 'notion', 'airtable'],
        compare_pairs: [['zapier', 'make']],
      },
      {
        id: 'power-ops',
        name: 'Power Ops Stack',
        tagline: 'Structured processes, real-time data, and cross-team automation at scale.',
        budget_tier: '$100–$500',
        tool_slugs: ['make', 'airtable', 'retool', 'linear'],
        compare_pairs: [['make', 'zapier']],
      },
    ],
  },
  {
    use_case: 'Product Development',
    slug: 'product-development',
    headline: 'The Product Development Stack',
    subheadline: 'Ship faster, break less — the tools that top product teams run on.',
    templates: [
      {
        id: 'lean-product',
        name: 'Lean Product Stack',
        tagline: 'Validate fast and ship an MVP without slowing down your team.',
        budget_tier: '<$100',
        tool_slugs: ['linear', 'figma', 'vercel'],
        compare_pairs: [['linear', 'jira']],
      },
      {
        id: 'full-product',
        name: 'Full Product Stack',
        tagline: 'Research, design, build, and measure in one cohesive workflow.',
        budget_tier: '$100–$500',
        tool_slugs: ['linear', 'figma', 'mixpanel', 'github'],
        compare_pairs: [['linear', 'jira']],
      },
    ],
  },
  {
    use_case: 'Data Analysis',
    slug: 'data-analysis',
    headline: 'The Data Analysis Stack',
    subheadline: 'Go from raw data to confident decisions — no data engineering team required.',
    templates: [
      {
        id: 'analyst-starter',
        name: 'Analyst Starter Stack',
        tagline: 'SQL, visualisation, and sharing — everything a solo analyst needs.',
        budget_tier: '<$100',
        tool_slugs: ['metabase', 'dbt', 'google-sheets'],
        compare_pairs: [['metabase', 'tableau']],
      },
      {
        id: 'modern-data-stack',
        name: 'Modern Data Stack',
        tagline: 'Warehouse-native analytics with automated pipelines and governed metrics.',
        budget_tier: '$500–$2K',
        tool_slugs: ['dbt', 'fivetran', 'snowflake', 'looker'],
        compare_pairs: [['fivetran', 'airbyte']],
      },
    ],
  },
];

export function getStackConfig(slug: string): UseCaseConfig | undefined {
  return STACK_CONFIGS.find(c => c.slug === slug);
}

export const STACK_SLUGS = STACK_CONFIGS.map(c => c.slug);
