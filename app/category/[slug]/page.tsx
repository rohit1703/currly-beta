import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import ToolLogo from '@/components/ToolLogo';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserNav from '@/components/UserNav';
import { Logo } from '@/components/Logo';
import SaveButton from '@/components/SaveButton';
import { CATEGORIES, categoryToSlug, slugToCategory, getCategoryIcon } from '@/lib/categories';
import type { Metadata } from 'next';

const supabase = createAdminClient();

export async function generateStaticParams() {
  return CATEGORIES.map(cat => ({ slug: categoryToSlug(cat.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = slugToCategory(slug) || slug.replace(/-/g, ' ');
  return {
    title: `Best ${categoryName} AI Tools (2025) | Currly`,
    description: `Discover top-rated AI tools for ${categoryName}. Curated, tested, and reviewed by experts on Currly.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryName = slugToCategory(slug);
  if (!categoryName) return notFound();

  const userSupabase = createClient(await cookies());
  const [{ data: { user } }, { data: tools }] = await Promise.all([
    userSupabase.auth.getUser(),
    supabase
      .from('tools')
      .select('id, name, slug, description, image_url, main_category, pricing_model, website, is_india_based')
      .eq('main_category', categoryName)
      .eq('launch_status', 'Live')
      .order('launch_date', { ascending: false }),
  ]);

  if (!tools || tools.length === 0) return notFound();

  // Collections + saved tool map
  let userCollections: { id: string; name: string }[] = [];
  let savedToolMap: Record<string, string[]> = {};
  if (user) {
    const { data: cols } = await supabase
      .from('collections')
      .select('id, name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    userCollections = (cols || []).map((c: any) => ({ id: c.id, name: c.name }));
    if (userCollections.length > 0) {
      const { data: ctRows } = await supabase
        .from('collection_tools')
        .select('tool_id, collection_id')
        .in('collection_id', userCollections.map(c => c.id));
      for (const row of ctRows || []) {
        (savedToolMap[(row as any).tool_id] ??= []).push((row as any).collection_id);
      }
    }
  }

  const Icon = getCategoryIcon(categoryName);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans">

      {/* Nav */}
      <nav className="sticky top-0 z-20 border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-12">

        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#0066FF] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Tools
        </Link>

        {/* Header */}
        <div className="flex items-center gap-5 mb-10">
          <div className="w-14 h-14 bg-[#0066FF]/10 dark:bg-[#0066FF]/20 rounded-2xl flex items-center justify-center text-[#0066FF] shrink-0">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{categoryName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {tools.length} {tools.length === 1 ? 'tool' : 'tools'} curated
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="group bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Logo + pricing */}
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  <ToolLogo src={tool.image_url} name={tool.name} size={48} />
                </div>
                <div className="flex items-center gap-2">
                  <SaveButton
                    toolId={tool.id}
                    initialSaved={(savedToolMap[tool.id]?.length ?? 0) > 0}
                    isLoggedIn={!!user}
                    redirectTo={`/tool/${tool.slug}`}
                    userCollections={user ? userCollections : undefined}
                    toolCollectionIds={user ? (savedToolMap[tool.id] ?? []) : undefined}
                    compact
                  />
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-wide ${tool.pricing_model?.toLowerCase().includes('free') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 dark:bg-white/10 border-gray-200 dark:border-white/5 text-gray-500'}`}>
                    {tool.pricing_model || 'Paid'}
                  </span>
                </div>
              </div>

              {/* Name + description */}
              <Link href={`/tool/${tool.slug}`} className="group-hover:text-[#0066FF] transition-colors">
                <h3 className="font-bold text-lg mb-1">{tool.name}</h3>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed flex-grow mb-5">
                {tool.description || `An AI tool in the ${categoryName} space.`}
              </p>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <Link href={`/tool/${tool.slug}`} className="flex-1 text-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold py-2.5 rounded-xl hover:border-[#0066FF] transition-colors">
                  Details
                </Link>
                {tool.website && (
                  <a href={tool.website} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-[#0066FF] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#0052CC] transition-colors">
                    Visit <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
