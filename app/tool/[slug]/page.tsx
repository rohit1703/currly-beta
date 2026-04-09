import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Globe, Tag, IndianRupee } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: tool } = await supabase.from('tools').select('name, description, image_url').eq('slug', slug).single();

  if (!tool) return { title: 'Tool Not Found' };

  return {
    title: `${tool.name} — AI Tool Review & Pricing | Currly`,
    description: tool.description?.substring(0, 160) || `Discover ${tool.name} on Currly — pricing, features, and alternatives.`,
    openGraph: {
      title: `${tool.name} on Currly`,
      description: tool.description?.substring(0, 200),
      images: tool.image_url ? [tool.image_url] : [],
    },
  };
}

function safeHostname(url?: string | null): string | null {
  if (!url) return null;
  try { return new URL(url).hostname; } catch { return null; }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: tool } = await supabase
    .from('tools')
    .select('id, name, slug, website, description, image_url, main_category, pricing_model, is_india_based, launch_date')
    .eq('slug', slug)
    .single();

  if (!tool) return notFound();

  const hostname = safeHostname(tool.website);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: tool.main_category || 'BusinessApplication',
    description: tool.description,
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav */}
      <nav className="w-full border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center text-white font-bold">C</div>
            currly
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-[#0066FF] transition-colors">
            ← Back to Search
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#0066FF] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Tools
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <div className="w-20 h-20 bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            {tool.image_url ? (
              <img src={tool.image_url} alt={tool.name} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-3xl font-bold text-gray-300 dark:text-gray-600">{tool.name[0]}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{tool.name}</h1>
              {tool.is_india_based && (
                <span className="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full border border-orange-100 dark:border-orange-800">
                  🇮🇳 Made in India
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {tool.main_category && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-[#0066FF]/10 text-[#0066FF] border border-blue-100 dark:border-[#0066FF]/20 font-medium">
                  <Tag className="w-3 h-3" /> {tool.main_category}
                </span>
              )}
              {tool.pricing_model && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 font-medium">
                  <IndianRupee className="w-3 h-3" /> {tool.pricing_model}
                </span>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6 text-base">
              {tool.description || 'No description available.'}
            </p>

            <div className="flex flex-wrap gap-3">
              {tool.website && (
                <a
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#0066FF] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0052CC] transition-colors shadow-md shadow-blue-500/20"
                >
                  Visit Website <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {tool.main_category && (
                <Link
                  href={`/category/${tool.main_category.toLowerCase()}`}
                  className="inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl font-bold text-sm hover:border-[#0066FF] transition-colors"
                >
                  More {tool.main_category} Tools
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Category</div>
            <div className="font-bold text-lg">{tool.main_category || '—'}</div>
          </div>
          <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Pricing</div>
            <div className="font-bold text-lg">{tool.pricing_model || '—'}</div>
          </div>
          <div className="bg-white dark:bg-[#111] p-5 rounded-2xl border border-gray-100 dark:border-white/5">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Website</div>
            {hostname ? (
              <a href={tool.website!} target="_blank" rel="noopener noreferrer" className="font-bold text-[#0066FF] hover:underline flex items-center gap-1">
                <Globe className="w-4 h-4" /> {hostname}
              </a>
            ) : (
              <div className="font-bold text-lg text-gray-400">—</div>
            )}
          </div>
        </div>

        {/* Description Block */}
        <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
          <h2 className="text-lg font-bold mb-4">About {tool.name}</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {tool.description || 'No detailed description available for this tool.'}
          </p>
        </div>
      </main>
    </div>
  );
}
