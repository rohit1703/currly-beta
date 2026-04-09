import { createAdminClient } from '@/utils/supabase/admin';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, Check, X, Globe } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Metadata } from 'next';

const supabase = createAdminClient();

const COLS = 'id, name, slug, description, image_url, main_category, pricing_model, website, is_india_based, launch_date';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug1: string; slug2: string }>;
}): Promise<Metadata> {
  const { slug1, slug2 } = await params;
  const [{ data: t1 }, { data: t2 }] = await Promise.all([
    supabase.from('tools').select('name').eq('slug', slug1).single(),
    supabase.from('tools').select('name').eq('slug', slug2).single(),
  ]);
  if (!t1 || !t2) return { title: 'Compare AI Tools | Currly' };
  return {
    title: `${t1.name} vs ${t2.name} — AI Tool Comparison | Currly`,
    description: `Compare ${t1.name} and ${t2.name} side by side. Features, pricing, and more on Currly.`,
  };
}

function FeatureRow({
  label,
  v1,
  v2,
}: {
  label: string;
  v1: string | boolean | null | undefined;
  v2: string | boolean | null | undefined;
}) {
  const fmt = (v: string | boolean | null | undefined) => {
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'boolean') return v ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />;
    return <span>{v}</span>;
  };

  return (
    <div className="grid grid-cols-3 gap-4 py-4 border-b border-gray-100 dark:border-white/5 last:border-0">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">{label}</div>
      <div className="text-sm text-gray-800 dark:text-gray-200 font-medium flex items-center">{fmt(v1) ?? <span className="text-gray-300 dark:text-gray-600">—</span>}</div>
      <div className="text-sm text-gray-800 dark:text-gray-200 font-medium flex items-center">{fmt(v2) ?? <span className="text-gray-300 dark:text-gray-600">—</span>}</div>
    </div>
  );
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug1: string; slug2: string }>;
}) {
  const { slug1, slug2 } = await params;

  const [{ data: t1 }, { data: t2 }] = await Promise.all([
    supabase.from('tools').select(COLS).eq('slug', slug1).single(),
    supabase.from('tools').select(COLS).eq('slug', slug2).single(),
  ]);

  if (!t1 || !t2) return notFound();

  const tools = [t1, t2];

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-20 border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#0066FF] mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">
            {t1.name} <span className="text-gray-400 font-normal">vs</span> {t2.name}
          </h1>
          <p className="text-sm text-gray-500">Side-by-side comparison</p>
        </div>

        {/* Hero cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-8 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden mb-4">
                {tool.image_url ? (
                  <Image
                    src={tool.image_url}
                    alt={tool.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <span className="text-3xl font-bold text-gray-300">{tool.name[0]}</span>
                )}
              </div>
              <h2 className="text-xl font-bold mb-1">{tool.name}</h2>
              {tool.main_category && (
                <span className="text-xs text-[#0066FF] bg-blue-50 dark:bg-[#0066FF]/10 px-2.5 py-1 rounded-full font-medium mb-3">
                  {tool.main_category}
                </span>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-6">
                {tool.description}
              </p>
              <div className="flex gap-2 w-full">
                <Link
                  href={`/tool/${tool.slug}`}
                  className="flex-1 text-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold py-2.5 rounded-xl hover:border-[#0066FF] transition-colors"
                >
                  Details
                </Link>
                {tool.website && (
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-[#0066FF] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#0052CC] transition-colors"
                  >
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl p-6 md:p-8">
          <h2 className="text-lg font-bold mb-6">Feature Comparison</h2>

          {/* Header */}
          <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-200 dark:border-white/10 mb-2">
            <div />
            <div className="text-sm font-bold text-gray-900 dark:text-white">{t1.name}</div>
            <div className="text-sm font-bold text-gray-900 dark:text-white">{t2.name}</div>
          </div>

          <FeatureRow label="Category" v1={t1.main_category} v2={t2.main_category} />
          <FeatureRow label="Pricing" v1={t1.pricing_model} v2={t2.pricing_model} />
          <FeatureRow
            label="Made in India"
            v1={t1.is_india_based ?? false}
            v2={t2.is_india_based ?? false}
          />
          <FeatureRow
            label="Website"
            v1={t1.website ? new URL(t1.website).hostname : null}
            v2={t2.website ? new URL(t2.website).hostname : null}
          />
        </div>

        {/* Share this comparison */}
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400 mb-3">Share this comparison</p>
          <div className="inline-flex items-center gap-2 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm font-mono text-gray-600 dark:text-gray-400">
            <Globe className="w-4 h-4 shrink-0" />
            <span className="truncate max-w-xs">
              {`/compare/${slug1}/${slug2}`}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
