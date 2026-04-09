import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Bookmark, ExternalLink, BookmarkX } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserNav from '@/components/UserNav';
import SaveButton from '@/components/SaveButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Stack | Currly',
  description: 'Your saved AI tools on Currly.',
  robots: { index: false },
};

export default async function SavedPage() {
  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();

  if (!user) redirect('/login?redirectTo=/saved');

  const adminSupabase = createAdminClient();
  const { data: savedItems } = await adminSupabase
    .from('saved_tools')
    .select(`
      id,
      created_at,
      tools (
        id, name, slug, website, description, image_url,
        main_category, pricing_model, is_india_based
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const tools = ((savedItems || []).map((item: any) => item.tools).filter(Boolean)) as any[];

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'You';

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans">
      {/* Nav */}
      <nav className="w-full border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#0066FF] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 overflow-hidden shrink-0">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName[0].toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{displayName}'s Stack</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tools.length} {tools.length === 1 ? 'tool' : 'tools'} saved
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-[#0066FF] hover:underline shrink-0"
          >
            + Discover more tools
          </Link>
        </div>

        {/* Tools grid */}
        {tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <BookmarkX className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Nothing saved yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Hit "Save to Stack" on any tool to build your personal AI toolkit.
            </p>
            <Link
              href="/dashboard"
              className="bg-[#0066FF] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0052CC] transition-colors shadow-md shadow-blue-500/20"
            >
              Browse Tools
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="group bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Logo + pricing */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {tool.image_url ? (
                      <img src={tool.image_url} alt={tool.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">{tool.name[0]}</span>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-wide ${tool.pricing_model?.toLowerCase().includes('free') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 dark:bg-white/10 border-gray-200 dark:border-white/5 text-gray-500'}`}>
                    {tool.pricing_model || 'Paid'}
                  </span>
                </div>

                {/* Name + category */}
                <Link href={`/tool/${tool.slug}`} className="hover:text-[#0066FF] transition-colors">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-[#0066FF] transition-colors">
                    {tool.name}
                  </h3>
                </Link>
                {tool.main_category && (
                  <span className="text-xs text-[#0066FF] font-medium mb-3">{tool.main_category}</span>
                )}

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed flex-grow mb-5">
                  {tool.description || `AI tool in the ${tool.main_category || 'AI'} space.`}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <Link
                    href={`/tool/${tool.slug}`}
                    className="flex-1 text-center bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold py-2.5 rounded-xl hover:border-[#0066FF] transition-colors"
                  >
                    Details
                  </Link>
                  {tool.website ? (
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-[#0066FF] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#0052CC] transition-colors"
                    >
                      Visit <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}
                </div>

                {/* Unsave */}
                <div className="mt-3">
                  <SaveButton toolId={tool.id} initialSaved={true} isLoggedIn={true} />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
