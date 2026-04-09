import { createAdminClient } from '@/utils/supabase/admin';

export default async function SearchIntelligence() {
  const supabase = createAdminClient();

  const [{ data: queryPerf }, { data: zeroClick }, { data: daily }] = await Promise.all([
    supabase.from('admin_query_performance').select('*').order('searches', { ascending: false }).limit(50),
    supabase.from('admin_zero_click_queries').select('*').order('searches', { ascending: false }).limit(20),
    supabase.from('admin_daily_searches').select('*').limit(30),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Search Intelligence</h1>
      <p className="text-gray-400 text-sm mb-8">Query performance, CTR, and gaps</p>

      {/* Query Performance Table */}
      <div className="bg-white/5 rounded-xl border border-white/5 mb-8">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold">Query Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Query</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Searches</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Clicks</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">CTR</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Last Searched</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(queryPerf || []).map((q: any) => (
                <tr key={q.query} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-5 py-3 text-gray-200 max-w-xs truncate">{q.query}</td>
                  <td className="px-5 py-3 text-right text-gray-300">{q.searches}</td>
                  <td className="px-5 py-3 text-right text-gray-300">{q.clicks}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-medium ${q.ctr >= 30 ? 'text-green-400' : q.ctr >= 10 ? 'text-amber-400' : 'text-red-400'}`}>
                      {q.ctr}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-500 text-xs">
                    {q.last_searched ? new Date(q.last_searched).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {q.ctr === 0 ? (
                      <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full">Fix</span>
                    ) : q.ctr >= 30 ? (
                      <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">Good</span>
                    ) : (
                      <span className="text-xs bg-amber-900/40 text-amber-400 px-2 py-0.5 rounded-full">Improve</span>
                    )}
                  </td>
                </tr>
              ))}
              {!queryPerf?.length && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500 text-sm">No search data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zero Click Queries */}
      <div className="bg-white/5 rounded-xl border border-white/5">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Zero-Click Queries</h2>
          <span className="text-xs text-gray-400">Searched but nobody clicked anything — bad results</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Query</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Searches</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {(zeroClick || []).map((q: any) => (
                <tr key={q.query} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-5 py-3 text-gray-200">{q.query}</td>
                  <td className="px-5 py-3 text-right text-gray-300">{q.searches}</td>
                  <td className="px-5 py-3 text-right">
                    <a
                      href={`/admin/manage/new?prefill=${encodeURIComponent(q.query)}`}
                      className="text-xs text-[#0066FF] hover:underline"
                    >
                      Add tool →
                    </a>
                  </td>
                </tr>
              ))}
              {!zeroClick?.length && (
                <tr><td colSpan={3} className="px-5 py-8 text-center text-gray-500 text-sm">No zero-click queries — great!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
