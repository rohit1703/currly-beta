import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { STACK_CONFIGS } from '@/lib/stack-templates';

export const metadata: Metadata = {
  title: 'Tool Stacks by Use Case | Currly',
  description: 'Curated AI tool stacks for every workflow — Outbound Sales, Inbound Marketing, Customer Support, and more.',
};

const USE_CASE_ICONS: Record<string, string> = {
  'Outbound Sales':    '📤',
  'Inbound Marketing': '📣',
  'Customer Support':  '💬',
  'Internal Ops':      '⚙️',
  'Product Development': '🚀',
  'Data Analysis':     '📊',
};

export default function StacksIndex() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans">
      <nav className="sticky top-0 z-20 border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <ThemeToggle />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Tool Stacks by Use Case</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Curated combinations of AI tools that work well together — sorted by budget.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STACK_CONFIGS.map(config => (
            <Link
              key={config.slug}
              href={`/stacks/${config.slug}`}
              className="group flex items-start gap-4 p-6 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl hover:border-[#0066FF]/50 hover:shadow-sm transition-all"
            >
              <span className="text-2xl shrink-0">{USE_CASE_ICONS[config.use_case] ?? '🔧'}</span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 dark:text-white group-hover:text-[#0066FF] transition-colors">
                  {config.use_case}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                  {config.subheadline}
                </p>
                <p className="text-xs text-[#0066FF] mt-2 font-semibold flex items-center gap-1">
                  {config.templates.length} stacks <ArrowRight className="w-3 h-3" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
