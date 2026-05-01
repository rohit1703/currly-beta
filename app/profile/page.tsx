import { createAdminClient } from '@/utils/supabase/admin';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Bookmark, Calendar, ExternalLink, ChevronRight, Download, Trash2, Shield, User } from 'lucide-react';
import ProfileActions from '@/components/ProfileActions';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserNav from '@/components/UserNav';
import SignOutButton from '@/components/SignOutButton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile | Currly',
  robots: { index: false },
};

export default async function ProfilePage() {
  const userSupabase = createClient(await cookies());
  const { data: { user } } = await userSupabase.auth.getUser();

  if (!user) redirect('/login?redirectTo=/profile');

  const adminSupabase = createAdminClient();

  // Fetch ICP profile + saved tools in parallel
  const [{ data: userProfile }, { data: savedItems, count: savedCount }] = await Promise.all([
    adminSupabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    adminSupabase
      .from('saved_tools')
      .select(`
        id,
        created_at,
        tools (
          id, name, slug, website, image_url, main_category, pricing_model
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6),
  ]);

  const recentTools = ((savedItems || []).map((item: any) => item.tools).filter(Boolean)) as any[];

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const memberSince = new Date(user.created_at).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });
  const lastSaved = savedItems?.[0]?.created_at
    ? new Date(savedItems[0].created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '—';

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans">
      {/* Nav */}
      <nav className="w-full border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-6">

        {/* Profile card */}
        <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#0066FF] flex items-center justify-center text-white font-bold text-3xl overflow-hidden shrink-0 shadow-lg shadow-blue-500/20">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                displayName[0].toUpperCase()
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold mb-1">{displayName}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{user.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Member since {memberSince}
                </span>
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" /> {savedCount || 0} tools saved
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
            <div className="text-3xl font-bold text-[#0066FF] mb-1">{savedCount || 0}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Tools saved</div>
          </div>
          <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
            <div className="text-3xl font-bold text-[#0066FF] mb-1">{lastSaved}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Last saved</div>
          </div>
        </div>

        {/* Saved tools preview */}
        <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg">My Stack</h2>
            {(savedCount || 0) > 0 && (
              <Link href="/saved" className="text-sm text-[#0066FF] hover:underline flex items-center gap-1">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {recentTools.length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-4">No tools saved yet.</p>
              <Link href="/dashboard" className="text-sm font-semibold text-[#0066FF] hover:underline">
                Browse tools →
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTools.map((tool) => (
                <div key={tool.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {tool.image_url ? (
                      <img src={tool.image_url} alt={tool.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <span className="text-sm font-bold text-gray-400">{tool.name[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/tool/${tool.slug}`} className="font-semibold text-sm group-hover:text-[#0066FF] transition-colors truncate block">
                      {tool.name}
                    </Link>
                    <p className="text-xs text-gray-400 truncate">{tool.main_category}{tool.pricing_model ? ` · ${tool.pricing_model}` : ''}</p>
                  </div>
                  {tool.website && (
                    <a href={tool.website} target="_blank" rel="noopener noreferrer" className="shrink-0 text-gray-300 hover:text-[#0066FF] transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account actions */}
        <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
          <Link href="/saved" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">Saved Stack</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link href="/dashboard" className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <ExternalLink className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium">Discover Tools</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <SignOutButton />
        </div>

        {/* ICP Profile */}
        <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <h2 className="font-bold text-base">My Profile</h2>
            </div>
            <Link
              href="/onboarding"
              className="text-xs font-semibold text-[#0066FF] hover:underline"
            >
              {userProfile ? 'Edit' : 'Complete profile →'}
            </Link>
          </div>

          {userProfile ? (
            <div className="flex flex-wrap gap-2">
              {[
                userProfile.role,
                userProfile.company_stage,
                userProfile.team_size + ' person' + (userProfile.team_size === '1' ? '' : 's'),
                userProfile.region,
                userProfile.monthly_budget_range + '/mo',
                userProfile.primary_use_case,
              ].map((val, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300"
                >
                  {val}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Complete your profile so we can surface the right tools for your stage and goals.
            </p>
          )}
        </div>

        {/* Data & Privacy */}
        <div className="bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-4 h-4 text-gray-400" />
            <h2 className="font-bold text-base">Data &amp; Privacy</h2>
          </div>
          <ProfileActions />
          <p className="text-xs text-gray-400 mt-4">
            Search queries are stored anonymously and cannot be linked to your account.{' '}
            <Link href="/privacy" className="text-[#0066FF] hover:underline">Privacy Policy</Link>
          </p>
        </div>

      </main>
    </div>
  );
}
