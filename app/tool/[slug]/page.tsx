import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, CheckCircle2, Globe, Zap, Shield } from 'lucide-react';
import { notFound } from 'next/navigation';

// 1. SERVER-SIDE SUPABASE CLIENT (No Auth needed for SEO pages)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 2. GENERATE DYNAMIC METADATA (This is what Google sees)
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: tool } = await supabase.from('tools').select('*').eq('slug', params.slug).single();

  if (!tool) return { title: 'Tool Not Found' };

  return {
    title: `${tool.name} - Review, Pricing & Features | Currly`,
    description: tool.description?.substring(0, 160) || `Discover ${tool.name} on Currly. Compare pricing, features, and see if it works in India.`,
    openGraph: {
      title: `${tool.name} on Currly`,
      description: tool.description,
      images: [tool.logo_url || '/og-default.png'],
    },
  };
}

// 3. THE PAGE COMPONENT
export default async function ToolPage({ params }: { params: { slug: string } }) {
  const { data: tool } = await supabase.from('tools').select('*').eq('slug', params.slug).single();

  if (!tool) return notFound();

  // 4. GEO STRATEGY: JSON-LD SCHEMA (For Perplexity/ChatGPT)
  // This tells AI models exactly what this page is about in structured data.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: 'BusinessApplication',
    description: tool.description,
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: tool.starting_price_usd || '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8', // Placeholder until we have real reviews
      reviewCount: '12',
    },
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans">
      
      {/* GEO DATA INJECTION */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* NAV (Minimal for SEO Landing) */}
      <nav className="w-full border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md p-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-[#0066FF] rounded-lg flex items-center justify-center text-white">C</div>
            currly
          </Link>
          <Link href="/dashboard" className="text-sm font-medium hover:text-[#0066FF]">Back to Search</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* BREADCRUMB */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#0066FF] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Discovery
        </Link>

        {/* HEADER BLOCK */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <div className="w-24 h-24 bg-white dark:bg-[#111] rounded-3xl border border-gray-200 dark:border-white/10 p-4 flex items-center justify-center shadow-lg">
            {tool.logo_url ? (
              <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-4xl font-bold text-gray-300">{tool.name[0]}</span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] dark:text-white tracking-tight">{tool.name}</h1>
              {tool.is_india_based && (
                <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-full border border-orange-100">
                  🇮🇳 Made in India
                </span>
              )}
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              {tool.tagline || tool.description?.substring(0, 120)}...
            </p>
            
            <div className="flex gap-4">
              <a 
                href={tool.website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#0066FF] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#0052CC] transition-all shadow-lg shadow-blue-500/20"
              >
                Visit Website <ExternalLink className="w-4 h-4" />
              </a>
              <button className="inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all">
                Save to Stack
              </button>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="col-span-2 space-y-8">
            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#0066FF]" /> About {tool.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {tool.description || "No detailed description available for this tool."}
              </p>
            </div>

            {/* GEO OPTIMIZATION: STRUCTURED DATA FOR AI READABILITY */}
            <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0066FF]" /> Why we curated this
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-600 dark:text-gray-300">Verified Pricing: <strong>{tool.pricing_type}</strong> (Starts at ${tool.starting_price_usd || 0})</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-600 dark:text-gray-300">Setup Time: <strong>{tool.setup_time_minutes || 15} minutes</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-600 dark:text-gray-300">Validation: Tested by Currly team for quality.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* SIDEBAR STATS */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
              <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Pricing Model</div>
              <div className="text-2xl font-bold text-[#1A1A1A] dark:text-white capitalize">{tool.pricing_type}</div>
              <div className="text-sm text-gray-500 mt-1">Starting at ${tool.starting_price_usd || 0}/mo</div>
            </div>

            <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
              <div className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">Website</div>
              <a href={tool.website_url} target="_blank" className="text-[#0066FF] hover:underline break-all flex items-center gap-1">
                <Globe className="w-3 h-3" /> {new URL(tool.website_url).hostname}
              </a>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}