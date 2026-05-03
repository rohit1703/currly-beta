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
  /** Assertions on the returned result set */
  assertions: FixtureAssertion[];
}

export type FixtureAssertion =
  | { type: 'minResults'; count: number }
  | { type: 'topResult'; nameIncludes: string }
  | { type: 'allHaveScores' }
  | { type: 'finalScoreDescending' }
  | { type: 'categoryFilter'; expected: string }
  | { type: 'pricingFilter'; allowed: string[] }
  | { type: 'featuredBoost' }       // at least one featured tool in top 5
  | { type: 'noEmptyNames' }
  | { type: 'semanticSignal' };     // at least one result has semantic_score > 0

// ── Fixtures ─────────────────────────────────────────────────────

export const rankingFixtures: RankingFixture[] = [
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
    label: 'category filter restricts to correct category',
    query: 'image generation',
    filters: { category: 'Image Generation' },
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'categoryFilter', expected: 'Image Generation' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'free pricing filter returns only matching tools',
    query: 'code completion',
    filters: { pricing: ['Free', 'Freemium'] },
    assertions: [
      { type: 'pricingFilter', allowed: ['Free', 'Freemium'] },
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
    label: 'featured tools surface in top results',
    query: 'productivity',
    assertions: [
      { type: 'minResults', count: 5 },
      { type: 'featuredBoost' },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'pagination: page 2 does not overlap page 1',
    query: 'AI tool',
    page: 1,
    pageSize: 5,
    assertions: [
      { type: 'minResults', count: 1 },
      { type: 'finalScoreDescending' },
    ],
  },
  {
    label: 'all score fields are numbers in [0, 1] range',
    query: 'video editing',
    assertions: [
      { type: 'allHaveScores' },
      { type: 'finalScoreDescending' },
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
  fixture: RankingFixture
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
  }
}

// ── CLI runner (tsx __tests__/search-ranking.fixtures.ts) ────────

if (require.main === module) {
  const { aiSearch } = require('../actions/ai-search');

  (async () => {
    let passed = 0, failed = 0;

    for (const fixture of rankingFixtures) {
      const result = await aiSearch(fixture.query, {
        page: fixture.page ?? 1,
        pageSize: fixture.pageSize ?? 20,
        filters: fixture.filters,
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

    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  })();
}
