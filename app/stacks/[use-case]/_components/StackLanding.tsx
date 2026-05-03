'use client';

import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink, GitCompare } from 'lucide-react';
import type { UseCaseConfig } from '@/lib/stack-templates';

type SlimTool = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  main_category: string;
  pricing_model: string;
  website: string | null;
  description: string | null;
};

type HydratedTemplate = {
  id: string;
  name: string;
  tagline: string;
  budget_tier: string;
  tools: SlimTool[];
  compare_pairs: [SlimTool, SlimTool][];
};

const BUDGET_COLORS: Record<string, string> = {
  '<$100':      'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  '$100–$500':  'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  '$500–$2K':   'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  '$2K–$10K':   'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  '$10K+':      'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};

export function StackLanding({
  config,
  templates,
}: {
  config: UseCaseConfig;
  templates: HydratedTemplate[];
}) {
  const posthog = usePostHog();

  useEffect(() => {
    posthog?.capture('stack_page_viewed', {
      use_case: config.use_case,
      slug: config.slug,
      template_count: templates.length,
    });
  }, []);

  function onToolClick(tool: SlimTool, templateId: string) {
    posthog?.capture('stack_tool_clicked', {
      use_case: config.use_case,
      template_id: templateId,
      tool_id: tool.id,
      tool_slug: tool.slug,
    });
  }

  function onCompareClick(t1: SlimTool, t2: SlimTool, templateId: string) {
    posthog?.capture('stack_compare_clicked', {
      use_case: config.use_case,
      template_id: templateId,
      tool_slug_1: t1.slug,
      tool_slug_2: t2.slug,
    });
  }

  function onSaveClick(templateId: string) {
    posthog?.capture('stack_save_clicked', {
      use_case: config.use_case,
      template_id: templateId,
    });
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-16 pb-10 text-center">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#0066FF] bg-blue-50 dark:bg-[#0066FF]/10 px-3 py-1 rounded-full mb-4">
          {config.use_case}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
          {config.headline}
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          {config.subheadline}
        </p>
      </div>

      {/* Templates */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onToolClick={onToolClick}
              onCompareClick={onCompareClick}
              onSaveClick={onSaveClick}
            />
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            Templates coming soon for this use case.
          </div>
        )}

        {/* Cross-sell */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-3">Not quite what you need?</p>
          <Link
            href={`/dashboard?category=Marketing+%26+Sales`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0066FF] hover:underline"
          >
            Browse all {config.use_case} tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  onToolClick,
  onCompareClick,
  onSaveClick,
}: {
  template: HydratedTemplate;
  onToolClick: (t: SlimTool, tid: string) => void;
  onCompareClick: (t1: SlimTool, t2: SlimTool, tid: string) => void;
  onSaveClick: (tid: string) => void;
}) {
  const budgetClass = BUDGET_COLORS[template.budget_tier] ?? BUDGET_COLORS['<$100'];

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-7 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="text-lg font-bold">{template.name}</h2>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${budgetClass}`}>
          {template.budget_tier}/mo
        </span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{template.tagline}</p>

      {/* Tool list */}
      <div className="flex flex-col gap-3 mb-6 flex-1">
        {template.tools.map(tool => (
          <Link
            key={tool.id}
            href={`/tool/${tool.slug}`}
            onClick={() => onToolClick(tool, template.id)}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-[#0066FF]/50 hover:bg-blue-50/50 dark:hover:bg-[#0066FF]/5 transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              {tool.image_url ? (
                <Image src={tool.image_url} alt={tool.name} width={36} height={36} className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-sm font-bold text-gray-400">{tool.name[0]}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#0066FF] transition-colors truncate">
                {tool.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{tool.pricing_model}</p>
            </div>
            {tool.website && (
              <ExternalLink className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-[#0066FF] transition-colors" />
            )}
          </Link>
        ))}

        {template.tools.length === 0 && (
          <p className="text-sm text-gray-400 italic py-4 text-center">Tools coming soon.</p>
        )}
      </div>

      {/* Compare CTAs */}
      {template.compare_pairs.map(([t1, t2]) => (
        <Link
          key={`${t1.slug}-${t2.slug}`}
          href={`/compare/${t1.slug}/${t2.slug}`}
          onClick={() => onCompareClick(t1, t2, template.id)}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:border-[#0066FF] hover:text-[#0066FF] transition-all mb-2"
        >
          <GitCompare className="w-4 h-4" />
          Compare {t1.name} vs {t2.name}
        </Link>
      ))}

      {/* Save CTA */}
      <Link
        href="/saved"
        onClick={() => onSaveClick(template.id)}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0066FF] text-white text-sm font-bold hover:bg-[#0052CC] transition-colors mt-1"
      >
        Save this stack
      </Link>
    </div>
  );
}
