import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Globe, Tag, IndianRupee, GitCompare } from 'lucide-react';
import SaveButton from '@/components/SaveButton';
import ShareButtons from '@/components/ShareButtons';
import UpvoteButton from '@/components/UpvoteButton';
import ReviewSection from '@/components/ReviewSection';
import CommentSection from '@/components/CommentSection';
import { categoryToSlug } from '@/lib/categories';
import { getUpvoteState } from '@/actions/upvote';

const supabase = createAdminClient();

// #7 — Pre-build all Live tool pages at build time
export async function generateStaticParams() {
  const { data } = await supabase
    .from('tools')
    .select('slug')
    .eq('launch_status', 'Live');
  return (data || []).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: tool } = await supabase.from('tools').select('name, description, image_url, pricing_model, main_category').eq('slug', slug).single();
  if (!tool) return { title: 'Tool Not Found' };
  const fallbackDesc = `${tool.name} is a${tool.pricing_model ? ` ${tool.pricing_model.toLowerCase()}` : 'n'} AI tool${tool.main_category ? ` for ${tool.main_category.toLowerCase()}` : ''}. Discover features, pricing, and alternatives on Currly.`;
  const description = tool.description?.substring(0, 160) || fallbackDesc;
  return {
    title: `${tool.name} — AI Tool Review & Pricing | Currly`,
    description,
    openGraph: {
      title: `${tool.name} on Currly`,
      description: tool.description?.substring(0, 200) || fallbackDesc,
      images: tool.image_url ? [tool.image_url] : [],
    },
  };
}

function safeHostname(url?: string | null): string | null {
  if (!url) return null;
  try { return new URL(url).hostname; } catch { return null; }
}

export default async function ToolPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const { from } = await searchParams;

  const backHref = from ? `/dashboard?q=${encodeURIComponent(from)}` : '/dashboard';
  const backLabel = from ? `← Back to "${from}"` : '← Back to Search';

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://currly-beta.vercel.app';

  // Get user session + tool data in parallel
  const userSupabase = createClient(await cookies());
  const [{ data: { user } }, { data: tool }] = await Promise.all([
    userSupabase.auth.getUser(),
    supabase
      .from('tools')
      .select('id, name, slug, website, description, image_url, main_category, pricing_model, is_india_based, launch_date, is_featured')
      .eq('slug', slug)
      .single(),
  ]);

  if (!tool) return notFound();

  // Get saved state + upvote state + related tools + reviews + comments in parallel
  const [savedResult, upvoteState, { data: relatedTools }, { data: reviews }, { data: comments }] = await Promise.all([
    user
      ? userSupabase.from('saved_tools').select('id').eq('user_id', user.id).eq('tool_id', tool.id).maybeSingle()
      : Promise.resolve({ data: null }),
    getUpvoteState(tool.id),
    supabase
      .from('tools')
      .select('id, name, slug, description, image_url, pricing_model')
      .eq('main_category', tool.main_category)
      .eq('launch_status', 'Live')
      .neq('id', tool.id)
      .limit(4),
    supabase
      .from('tool_reviews')
      .select('id, rating, body, created_at, user_id')
      .eq('tool_id', tool.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tool_comments')
      .select('id, body, created_at, user_id')
      .eq('tool_id', tool.id)
      .order('created_at', { ascending: false }),
  ]);

  const isSaved = !!savedResult.data;

  // Compute average rating
  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
    : 0;

  // Find current user's review
  const userReview = user && reviews
    ? reviews.find((r: any) => r.user_id === user.id) || null
    : null;

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
          <Link href={backHref} className="text-sm font-medium text-gray-500 hover:text-[#0066FF] transition-colors truncate max-w-[200px]">
            {backLabel}
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <Link href={backHref} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#0066FF] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {from ? `Results for "${from}"` : 'All Tools'}
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <div className="w-20 h-20 bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            {tool.image_url ? (
              <Image src={tool.image_url} alt={tool.name} width={80} height={80} className="w-full h-full object-contain p-2" />
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
              {tool.launch_date && (Date.now() - new Date(tool.launch_date).getTime()) < 7 * 24 * 60 * 60 * 1000 && (
                <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-100 dark:border-emerald-800">
                  ✦ New this week
                </span>
              )}
              {tool.is_featured && (
                <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-100 dark:border-amber-800 flex items-center gap-1">
                  ★ Editor's Pick
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {tool.main_category && (
                <Link
                  href={`/category/${categoryToSlug(tool.main_category)}`}
                  className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-[#0066FF]/10 text-[#0066FF] border border-blue-100 dark:border-[#0066FF]/20 font-medium hover:bg-blue-100 transition-colors"
                >
                  <Tag className="w-3 h-3" /> {tool.main_category}
                </Link>
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

            <div className="flex flex-wrap gap-3 items-center">
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
              <SaveButton toolId={tool.id} initialSaved={isSaved} isLoggedIn={!!user} redirectTo={`/tool/${tool.slug}`} />
              <UpvoteButton
                toolId={tool.id}
                initialUpvoted={upvoteState.upvoted}
                initialCount={upvoteState.count}
                isLoggedIn={!!user}
                redirectTo={`/tool/${tool.slug}`}
              />
            </div>

            <div className="mt-4">
              <ShareButtons url={`${baseUrl}/tool/${tool.slug}`} title={tool.name} />
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
              <a href={tool.website!} target="_blank" rel="noopener noreferrer" className="font-bold text-[#0066FF] hover:underline flex items-center gap-1 text-sm">
                <Globe className="w-4 h-4" /> {hostname}
              </a>
            ) : (
              <div className="font-bold text-lg text-gray-400">—</div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm mb-12">
          <h2 className="text-lg font-bold mb-4">About {tool.name}</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {tool.description || 'No detailed description available for this tool.'}
          </p>
        </div>

        {/* Alternatives / Related Tools */}
        {relatedTools && relatedTools.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Alternatives to {tool.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">Other {tool.main_category} tools you might like</p>
              </div>
              <Link
                href={`/category/${categoryToSlug(tool.main_category ?? '')}`}
                className="text-sm text-[#0066FF] hover:underline shrink-0"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedTools.map((r) => (
                <Link
                  key={r.id}
                  href={`/tool/${r.slug}${from ? `?from=${encodeURIComponent(from)}` : ''}`}
                  className="flex items-start gap-4 bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-[#0066FF]/40 transition-colors group"
                >
                  <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {r.image_url ? (
                      <Image src={r.image_url} alt={r.name} width={40} height={40} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-sm font-bold text-gray-400">{r.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm group-hover:text-[#0066FF] transition-colors truncate">{r.name}</h3>
                      <span className="text-xs text-gray-400 shrink-0">{r.pricing_model}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{r.description}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Compare CTA */}
            {relatedTools.length >= 1 && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-[#0066FF]/10 rounded-2xl border border-blue-100 dark:border-[#0066FF]/20 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Compare side by side</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">See how {tool.name} stacks up against alternatives</p>
                </div>
                <Link
                  href={`/compare/${tool.slug}/${relatedTools[0].slug}`}
                  className="inline-flex items-center gap-1.5 bg-[#0066FF] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#0052CC] transition-colors shrink-0"
                >
                  <GitCompare className="w-3.5 h-3.5" /> Compare
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        <div className="mt-12">
          <ReviewSection
            toolId={tool.id}
            toolSlug={tool.slug}
            reviews={(reviews || []) as any}
            userReview={userReview as any}
            isLoggedIn={!!user}
            avgRating={avgRating}
          />
        </div>

        {/* Comments */}
        <div className="mt-6">
          <CommentSection
            toolId={tool.id}
            toolSlug={tool.slug}
            comments={(comments || []) as any}
            currentUserId={user?.id || null}
            isLoggedIn={!!user}
          />
        </div>
      </main>
    </div>
  );
}
