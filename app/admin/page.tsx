import { createAdminClient } from '@/utils/supabase/admin';

export default async function AdminOverview() {
  const supabase = createAdminClient();

  const [
    { count: totalTools },
    { data: searches7d },
    { data: clicks7d },
    { data: topQueries },
    { data: recentSearches },
    { data: dailyChart },
  ] = await Promise.all([
    supabase.from('tools').select('*', { count: 'exact', head: true }),
    supabase.from('search_events').select('id', { count: 'exact' }).gte('searched_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from('tool_clicks').select('id', { count: 'exact' }).gte('clicked_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from('admin_query_performance').select('query, searches, clicks, ctr').limit(5),
    supabase.from('search_events').select('query, searched_at').order('searched_at', { ascending: false }).limit(10),
    supabase.from('admin_daily_searches').select('day, searches').limit(7),
  ]);

  const totalSearches = (searches7d as any)?.length ?? 0;
  const totalClicks = (clicks7d as any)?.length ?? 0;
  const avgCtr = totalSearches > 0 ? Math.round((totalClicks / totalSearches) * 100) : 0;
  const chartMax = Math.max(...(dailyChart || []).map((d: any) => d.searches), 1);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Overview</h1>
      <p className="text-gray-400 text-sm mb-8">Last 7 days</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Tools', value: totalTools?.toLocaleString() ?? '—' },
          { label: 'Searches (7d)', value: totalSearches.toLocaleString() },
          { label: 'Clicks (7d)', value: totalClicks.toLocaleString() },
          { label: 'Avg CTR', value: `${avgCtr}%` },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-xl p-5 border border-white/5">
            <div className="text-2xl font-bold mb-1">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Search volume chart */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/5">
          <h2 className="text-sm font-semibold mb-4 text-gray-300">Search Volume (7d)</h2>
          <div className="flex items-end gap-2 h-24">
            {[...(dailyChart || [])].reverse().map((d: any) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[#0066FF] rounded-sm"
                  style={{ height: `${Math.round((d.searches / chartMax) * 80)}px` }}
                />
                <span className="text-[9px] text-gray-500">
                  {new Date(d.day).toLocaleDateString('en', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top queries */}
        <div className="bg-white/5 rounded-xl p-5 border border-white/5">
          <h2 className="text-sm font-semibold mb-4 text-gray-300">Top Queries</h2>
          <div className="space-y-2">
            {(topQueries || []).map((q: any) => (
              <div key={q.query} className="flex items-center justify-between text-sm">
                <span className="text-gray-300 truncate max-w-[60%]">{q.query}</span>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{q.searches} searches</span>
                  <span className={q.ctr >= 30 ? 'text-green-400' : 'text-amber-400'}>{q.ctr}% CTR</span>
                </div>
              </div>
            ))}
            {!topQueries?.length && <p className="text-xs text-gray-500">No searches yet</p>}
          </div>
        </div>
      </div>

      {/* Recent searches */}
      <div className="bg-white/5 rounded-xl p-5 border border-white/5">
        <h2 className="text-sm font-semibold mb-4 text-gray-300">Recent Searches</h2>
        <div className="space-y-1">
          {(recentSearches || []).map((s: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0">
              <span className="text-gray-300">{s.query}</span>
              <span className="text-xs text-gray-500">{new Date(s.searched_at).toLocaleTimeString()}</span>
            </div>
          ))}
          {!recentSearches?.length && <p className="text-xs text-gray-500">No searches yet</p>}
        </div>
      </div>
    </div>
  );
}
