import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Bookmark, Globe, Lock, Plus } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserNav from '@/components/UserNav';
import NewCollectionForm from './_components/NewCollectionForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Collections | Currly',
  robots: { index: false },
};

export default async function SavedPage() {
  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/saved');

  const admin = createAdminClient();
  const { data: collections } = await admin
    .from('collections')
    .select('id, name, description, is_public, share_token, created_at, collection_tools(count)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  const cols = (collections || []).map((c: any) => ({
    ...c,
    tool_count: c.collection_tools?.[0]?.count ?? 0,
  }));

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans">
      <nav className="w-full border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Collections</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {cols.length} {cols.length === 1 ? 'collection' : 'collections'}
            </p>
          </div>
          <NewCollectionForm />
        </div>

        {cols.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
              <Bookmark className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">No collections yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              Create a collection to organise your AI tools — like &quot;My sales stack&quot; or &quot;Design tools.&quot;
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
            {cols.map((col: any, i: number) => (
              <Link
                key={col.id}
                href={`/saved/${col.id}`}
                className="group bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Icon + badges */}
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0 shadow-lg ${i === 0 ? 'bg-[#0066FF] shadow-blue-500/20' : 'bg-gray-200 dark:bg-white/10'}`}>
                    {i === 0 ? '★' : col.name[0].toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {col.is_public ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                        <Globe className="w-3 h-3" /> Public
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-50 dark:bg-white/5 text-gray-500 border border-gray-100 dark:border-white/10">
                        <Lock className="w-3 h-3" /> Private
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-1 group-hover:text-[#0066FF] transition-colors">
                  {col.name}
                </h3>
                {col.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {col.description}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-auto pt-3 border-t border-gray-100 dark:border-white/5">
                  {col.tool_count} {col.tool_count === 1 ? 'tool' : 'tools'}
                </p>
              </Link>
            ))}

            {/* Add new collection card */}
            <div className="border-2 border-dashed border-gray-200 dark:border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center hover:border-[#0066FF] transition-colors cursor-pointer group">
              <NewCollectionForm asCard />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
