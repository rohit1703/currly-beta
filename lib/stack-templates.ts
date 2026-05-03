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
        tool_slugs: ['anybiz', 'instantly-ai-sales-agent', 'leadverse'],
        compare_pairs: [['anybiz', 'instantly-ai-sales-agent']],
      },
      {
        id: 'full-stack-outbound',
        name: 'Full-Stack Outbound',
        tagline: 'Data enrichment, multichannel sequences, and revenue intelligence.',
        budget_tier: '$500–$2K',
        tool_slugs: ['jeeva-ai', 'leadbay', 'rox-revenue-agent'],
        compare_pairs: [['jeeva-ai', 'rox-revenue-agent']],
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
        tool_slugs: ['canva', 'aiseo', 'gamma'],
        compare_pairs: [['aiseo', 'canva']],
      },
      {
        id: 'growth-marketing',
        name: 'Growth Marketing Stack',
        tagline: 'SEO-optimised content, email automation, and AI video — in one workflow.',
        budget_tier: '$100–$500',
        tool_slugs: ['mailmodo', 'fraseio', 'creatify-ai'],
        compare_pairs: [['mailmodo', 'creatify-ai']],
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
        tool_slugs: ['heyy', 'super-intern', 'vega'],
        compare_pairs: [['heyy', 'super-intern']],
      },
      {
        id: 'ai-first-support',
        name: 'AI-First Support Stack',
        tagline: 'Deflect the majority of tickets before they reach a human.',
        budget_tier: '$100–$500',
        tool_slugs: ['decagon', 'parahelp', 'heyy'],
        compare_pairs: [['decagon', 'parahelp']],
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
        tool_slugs: ['beedone', 'basedash', 'automat'],
        compare_pairs: [['beedone', 'automat']],
      },
      {
        id: 'power-ops',
        name: 'Power Ops Stack',
        tagline: 'AI agents, data visibility, and cross-team automation at scale.',
        budget_tier: '$100–$500',
        tool_slugs: ['abacus-ai-deepagent', 'automat', 'basedash'],
        compare_pairs: [['abacus-ai-deepagent', 'automat']],
      },
    ],
  },
  {
    use_case: 'Product Development',
    slug: 'product-development',
    headline: 'The Product Development Stack',
    subheadline: 'Ship faster, break less — the AI tools that top product teams run on.',
    templates: [
      {
        id: 'lean-product',
        name: 'Lean Product Stack',
        tagline: 'Validate fast and ship an MVP with AI-assisted code and design.',
        budget_tier: '<$100',
        tool_slugs: ['codeium', 'bolt-v2', 'framer'],
        compare_pairs: [['codeium', 'bolt-v2']],
      },
      {
        id: 'full-product',
        name: 'Full Product Stack',
        tagline: 'AI planning, code review, and visual development in one cohesive workflow.',
        budget_tier: '$100–$500',
        tool_slugs: ['cursor-plan-mode', 'coderabbit', 'framer'],
        compare_pairs: [['cursor-plan-mode', 'coderabbit']],
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
        tagline: 'Scrape, research, and visualise data — everything a solo analyst needs.',
        budget_tier: '<$100',
        tool_slugs: ['browse-ai', 'answerthis', 'adaim'],
        compare_pairs: [['browse-ai', 'answerthis']],
      },
      {
        id: 'modern-data-stack',
        name: 'Modern Data Stack',
        tagline: 'Enterprise-grade AI agents and analytics pipelines with full data governance.',
        budget_tier: '$500–$2K',
        tool_slugs: ['captain', 'abacus-ai-deepagent', 'browse-ai'],
        compare_pairs: [['captain', 'abacus-ai-deepagent']],
      },
    ],
  },
];

export function getStackConfig(slug: string): UseCaseConfig | undefined {
  return STACK_CONFIGS.find(c => c.slug === slug);
}

export const STACK_SLUGS = STACK_CONFIGS.map(c => c.slug);
