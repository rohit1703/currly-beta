import { createAdminClient } from '@/utils/supabase/admin';

export default async function UsersPage() {
  const supabase = createAdminClient();

  const [
    { data: { users } },
    { data: topSearchers },
    { data: recentSignups },
  ] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase
      .from('search_events')
      .select('user_id')
      .not('user_id', 'is', null),
    supabase.auth.admin.listUsers({ perPage: 10 }),
  ]);

  // Count searches per user
  const searchCountMap: Record<string, number> = {};
  for (const e of (topSearchers || [])) {
    if (e.user_id) searchCountMap[e.user_id] = (searchCountMap[e.user_id] || 0) + 1;
  }
  const topUsers = Object.entries(searchCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([userId, count]) => ({
      userId,
      count,
      user: users?.find(u => u.id === userId),
    }));

  const sortedUsers = [...(users || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 10);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Users</h1>
      <p className="text-gray-400 text-sm mb-8">Signups and search activity</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white/5 rounded-xl p-5 border border-white/5">
          <div className="text-2xl font-bold mb-1">{users?.length ?? 0}</div>
          <div className="text-xs text-gray-400">Total Users</div>
        </div>
        <div className="bg-white/5 rounded-xl p-5 border border-white/5">
          <div className="text-2xl font-bold mb-1">
            {users?.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 86400000)).length ?? 0}
          </div>
          <div className="text-xs text-gray-400">New This Week</div>
        </div>
        <div className="bg-white/5 rounded-xl p-5 border border-white/5">
          <div className="text-2xl font-bold mb-1">{Object.keys(searchCountMap).length}</div>
          <div className="text-xs text-gray-400">Users Who Searched</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Searchers */}
        <div className="bg-white/5 rounded-xl border border-white/5">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold">Power Users</h2>
          </div>
          <div className="divide-y divide-white/5">
            {topUsers.map(({ userId, count, user }) => (
              <div key={userId} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-sm text-gray-200">{user?.email ?? userId.slice(0, 12) + '...'}</div>
                </div>
                <span className="text-xs font-bold text-[#0066FF]">{count} searches</span>
              </div>
            ))}
            {!topUsers.length && <p className="px-5 py-8 text-xs text-gray-500 text-center">No logged-in searches yet</p>}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="bg-white/5 rounded-xl border border-white/5">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold">Recent Signups</h2>
          </div>
          <div className="divide-y divide-white/5">
            {sortedUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between px-5 py-3">
                <div className="text-sm text-gray-200">{user.email}</div>
                <span className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            ))}
            {!sortedUsers.length && <p className="px-5 py-8 text-xs text-gray-500 text-center">No users yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
