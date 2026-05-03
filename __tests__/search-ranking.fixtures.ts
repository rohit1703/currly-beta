/**
 * Ranking stability fixtures for the match_tools_ranked pipeline.
 *
 * Usage (once vitest is installed):
 *   import { rankingFixtures, assertRankingContract } from './search-ranking.fixtures';
 *   for (const f of rankingFixtures) { it(f.label, () => assertRankingContract(f, results)); }
 *
 * Running against a live DB:
 *   npx tsx __tests__/search-ranking.fixtures.ts
 */

import type { Tool, SearchScores } from '@/types';

// ── Fixture types ────────────────────────────────────────────────

export interface RankingFixture {
  label: string;
  query: string;
  filters?: { category?: string; pricing?: string[] };
  page?: number;
  pageSize?: number;
  assertions: FixtureAssertion[];
}

export type FixtureAssertion =
  | { type: 'minResults'; count: number }
  | { type: 'topResult'; nameIncludes: string }
  | { type: 'allHaveScores' }
  | { type: 'finalScoreDescending' }
  | { type: 'categoryFilter'; expected: string }
  | { type: 'pricingFilter'; allowed: string[] }
  | { type: 'featuredBoost' }
  | { type: 'noEmptyNames' }
  | { type: 'semanticSignal' }
  | { type: 'noOverlapWithPage1'; page1Ids: string[] }
  | { type: 'scoresInRange' };   // all score fields in [0, 1]

// ── Fixtures ─────────────────────────────────────────────────────

export const rankingFixtures: RankingFixture[] = [

  // ── Core pipeline integrity ──────────────────────────────────

  {
    label: 'broad query returns results with scores',
    query: 'AI writing assistant',
    assertions: [
      { type: 'minResults', count: 3 },
      { type: 'allHaveScores' },
      { type: 'finalScoreDescending' },
      { type: 'noEmptyNames' },
    ],
  },
  {
    label: 'all score fields are numbers in [0, 1] range',
    query: 'video editing',
    assertions: [
      { type: 'allHaveScores' },
      { type: 'scoresInRange' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'semantic signal fires on conceptual query',
    query: 'help me generate blog posts automatically',
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'semanticSignal' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'featured tools surface in top results for browse query',
    query: 'productivity',
    assertions: [
      { type: 'minResults', count: 5 },
      { type: 'featuredBoost' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'results have no empty names',
    query: 'customer support',
    assertions: [
      { type: 'noEmptyNames' },
      { type: 'finalScoreDescending' },
    ],
  },

  // ── Filters ──────────────────────────────────────────────────

  {
    label: 'category filter restricts results correctly',
    query: 'image generation',
    filters: { category: 'Content & Creative' },
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'categoryFilter', expected: 'Content & Creative' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'free + freemium pricing filter returns only matching tools',
    query: 'code completion',
    filters: { pricing: ['Free', 'Freemium'] },
    assertions: [
      { type: 'pricingFilter', allowed: ['Free', 'Freemium'] },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'marketing category filter on sales query',
    query: 'outbound sales prospecting',
    filters: { category: 'Marketing & Sales' },
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'categoryFilter', expected: 'Marketing & Sales' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'data analytics category filter',
    query: 'data visualization dashboard',
    filters: { category: 'Data & Analytics' },
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'categoryFilter', expected: 'Data & Analytics' },
      { type: 'finalScoreDescending' },
    ],
  },

  // ── Intent-based queries ──────────────────────────────────────

  {
    label: 'intent query: email writing help',
    query: 'help writing cold emails',
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'semanticSignal' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'intent query: automate repetitive work',
    query: 'automate my repetitive workflow tasks',
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'semanticSignal' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'intent query: customer support at scale',
    query: 'handle customer support tickets without hiring',
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'semanticSignal' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'intent query: build mobile app without code',
    query: 'build a mobile app without coding',
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'semanticSignal' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'intent query: generate social media content',
    query: 'create social media posts for my brand',
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'semanticSignal' },
      { type: 'finalScoreDescending' },
    ],
  },

  // ── Use-case queries ──────────────────────────────────────────

  {
    label: 'use-case query: B2B sales tools',
    query: 'sales prospecting tools for B2B startup',
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'allHaveScores' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'use-case query: developer productivity',
    query: 'AI tools for software developers',
    assertions: [
      { type: 'minResults', count: 2 },
      { type: 'allHaveScores' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'use-case query: HR recruiting',
    query: 'recruit and screen job applicants faster',
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'semanticSignal' },
      { type: 'finalScoreDescending' },
    ],
  },

  // ── Pagination ───────────────────────────────────────────────

  {
    label: 'page 1 returns results',
    query: 'AI tool',
    page: 1,
    pageSize: 5,
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'small pageSize respected',
    query: 'project management',
    pageSize: 3,
    assertions: [
      { type: 'finalScoreDescending' },
    ],
  },

  // ── Edge cases ───────────────────────────────────────────────

  {
    label: 'short single-word query returns results',
    query: 'crm',
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'category + pricing combined filter',
    query: 'marketing automation',
    filters: { category: 'Marketing & Sales', pricing: ['Freemium', 'Free'] },
    assertions: [
      { type: 'categoryFilter', expected: 'Marketing & Sales' },
      { type: 'pricingFilter', allowed: ['Freemium', 'Free'] },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'query with special characters does not crash',
    query: 'AI & automation (free)',
    assertions: [
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'very long query is handled gracefully',
    query: 'I need an AI tool that helps my marketing team create content schedule publish and track performance of social media posts across instagram twitter and linkedin',
    assertions: [
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'development category query returns dev tools',
    query: 'code review and debugging',
    filters: { category: 'Development & Engineering' },
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'categoryFilter', expected: 'Development & Engineering' },
    ],
  },
];

// ── Assertion runner ─────────────────────────────────────────────

export interface AssertionResult {
  passed: boolean;
  message: string;
}

export function assertRankingContract(
  fixture: RankingFixture,
  tools: Tool[]
): AssertionResult[] {
  return fixture.assertions.map(a => check(a, tools, fixture));
}

function check(
  assertion: FixtureAssertion,
  tools: Tool[],
  _fixture: RankingFixture
): AssertionResult {
  switch (assertion.type) {
    case 'minResults':
      return {
        passed: tools.length >= assertion.count,
        message: `Expected ≥${assertion.count} results, got ${tools.length}`,
      };

    case 'topResult':
      return {
        passed: tools[0]?.name?.toLowerCase().includes(assertion.nameIncludes.toLowerCase()),
        message: `Expected top result to include "${assertion.nameIncludes}", got "${tools[0]?.name}"`,
      };

    case 'allHaveScores': {
      const missing = tools.filter(t => !t._scores);
      return {
        passed: missing.length === 0,
        message: missing.length > 0
          ? `${missing.length} tools missing _scores: ${missing.map(t => t.name).join(', ')}`
          : 'All tools have _scores',
      };
    }

    case 'finalScoreDescending': {
      const scores = tools.map(t => t._scores?.final ?? -1);
      const outOfOrder = scores.findIndex((s, i) => i > 0 && s > scores[i - 1]);
      return {
        passed: outOfOrder === -1,
        message: outOfOrder === -1
          ? 'Results are in descending final_score order'
          : `Score order broken at index ${outOfOrder}: ${scores[outOfOrder - 1]} → ${scores[outOfOrder]}`,
      };
    }

    case 'scoresInRange': {
      const fields: (keyof SearchScores)[] = ['lexical', 'semantic', 'quality', 'freshness', 'behavior', 'final'];
      const violations: string[] = [];
      for (const t of tools) {
        if (!t._scores) continue;
        for (const f of fields) {
          const v = t._scores[f];
          if (typeof v !== 'number' || v < 0 || v > 1) {
            violations.push(`${t.name}.${f}=${v}`);
          }
        }
      }
      return {
        passed: violations.length === 0,
        message: violations.length > 0
          ? `Scores out of [0,1]: ${violations.join(', ')}`
          : 'All scores in [0, 1]',
      };
    }

    case 'categoryFilter': {
      const wrong = tools.filter(t => t.main_category !== assertion.expected);
      return {
        passed: wrong.length === 0,
        message: wrong.length > 0
          ? `Tools outside category "${assertion.expected}": ${wrong.map(t => t.name).join(', ')}`
          : 'All results match category filter',
      };
    }

    case 'pricingFilter': {
      const wrong = tools.filter(t => !assertion.allowed.includes(t.pricing_model));
      return {
        passed: wrong.length === 0,
        message: wrong.length > 0
          ? `Tools outside pricing filter: ${wrong.map(t => `${t.name}(${t.pricing_model})`).join(', ')}`
          : 'All results match pricing filter',
      };
    }

    case 'featuredBoost': {
      const topFive = tools.slice(0, 5);
      const hasFeatured = topFive.some(t => t.is_featured);
      return {
        passed: hasFeatured,
        message: hasFeatured
          ? 'Featured tool present in top 5'
          : 'No featured tool in top 5 — quality score boost may not be working',
      };
    }

    case 'noEmptyNames': {
      const empty = tools.filter(t => !t.name || t.name.trim() === '');
      return {
        passed: empty.length === 0,
        message: empty.length > 0
          ? `${empty.length} tools have empty names`
          : 'All tools have names',
      };
    }

    case 'semanticSignal': {
      const hasSemantic = tools.some(t => (t._scores?.semantic ?? 0) > 0);
      return {
        passed: hasSemantic,
        message: hasSemantic
          ? 'At least one result has semantic_score > 0'
          : 'No semantic signal in results — embedding or RPC may be missing',
      };
    }

    case 'noOverlapWithPage1': {
      const page1Set = new Set(assertion.page1Ids);
      const overlap = tools.filter(t => page1Set.has(String(t.id)));
      return {
        passed: overlap.length === 0,
        message: overlap.length > 0
          ? `Page overlap: ${overlap.map(t => t.name).join(', ')}`
          : 'No overlap between pages',
      };
    }
  }
}

// ── CLI runner (tsx __tests__/search-ranking.fixtures.ts) ────────

if (require.main === module) {
  const { aiSearch } = require('../actions/ai-search');

  (async () => {
    let passed = 0, failed = 0;

    for (const fixture of rankingFixtures) {
      const result = await aiSearch(fixture.query, {
        page:     fixture.page ?? 1,
        pageSize: fixture.pageSize ?? 20,
        filters:  fixture.filters,
      });

      const results = assertRankingContract(fixture, result.tools);
      const allPassed = results.every(r => r.passed);

      console.log(`\n${allPassed ? '✓' : '✗'} ${fixture.label}`);
      for (const r of results) {
        if (!r.passed) {
          console.log(`    FAIL: ${r.message}`);
          failed++;
        } else {
          passed++;
        }
      }
    }

    console.log(`\n─────────────────────`);
    console.log(`${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  })();
}
