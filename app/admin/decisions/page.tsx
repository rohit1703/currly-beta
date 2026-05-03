import { createAdminClient } from '@/utils/supabase/admin';

export default async function DecisionsAdmin() {
  const supabase = createAdminClient();

  const [{ data: volume }, { data: recent }] = await Promise.all([
    supabase
      .from('admin_decision_volume')
      .select('*')
      .limit(30),
    supabase
      .from('decision_sessions')
      .select(`
        id, context, status, icp_domain, budget_band, source_path, created_at,
        tool_choices ( tool_id, confidence )
      `)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const totalSessions  = volume?.reduce((s, r: any) => s + Number(r.sessions), 0) ?? 0;
  const totalDecisions = volume?.reduce((s, r: any) => s + Number(r.decisions_made), 0) ?? 0;
  const avgRate        = totalSessions > 0 ? Math.round((totalDecisions / totalSessions) * 100) : 0;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Decision Capture</h1>
      <p className="text-gray-400 text-sm mb-8">What users actually chose after comparing tools</p>

      {/* KPI strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Sessions', value: totalSessions.toLocaleString() },
          { label: 'Decisions Made', value: totalDecisions.toLocaleString() },
          { label: 'Submit Rate', value: `${avgRate}%` },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white/5 rounded-xl border border-white/5 p-5">
            <p className="text-xs text-gray-400 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Daily volume table */}
      <div className="bg-white/5 rounded-xl border border-white/5 mb-8">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold">Daily Volume by ICP Domain</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Date</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">ICP Domain</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Sessions</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Decisions</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Submit %</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Avg Confidence</th>
              </tr>
            </thead>
            <tbody>
              {(volume || []).map((row: any, i: number) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-5 py-3 text-gray-300 text-xs">{row.date}</td>
                  <td className="px-5 py-3 text-gray-200">{row.icp_domain}</td>
                  <td className="px-5 py-3 text-right text-gray-300">{row.sessions}</td>
                  <td className="px-5 py-3 text-right text-gray-300">{row.decisions_made}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-medium ${Number(row.submit_rate_pct) >= 50 ? 'text-green-400' : Number(row.submit_rate_pct) >= 25 ? 'text-amber-400' : 'text-red-400'}`}>
                      {row.submit_rate_pct}%
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-300">
                    {row.avg_confidence ? Number(row.avg_confidence).toFixed(1) : '—'}
                  </td>
                </tr>
              ))}
              {!volume?.length && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500 text-sm">No decision data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent sessions */}
      <div className="bg-white/5 rounded-xl border border-white/5">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold">Recent Sessions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Time</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Context</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Status</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">ICP</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Confidence</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {(recent || []).map((row: any) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-full">{row.context}</span>
                  </td>
                  <td className="px-5 py-3">
                    {row.status === 'decided' ? (
                      <span className="text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">decided</span>
                    ) : (
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">undecided</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{row.icp_domain ?? '—'}</td>
                  <td className="px-5 py-3 text-right text-gray-300">
                    {row.tool_choices?.[0]?.confidence ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs max-w-xs truncate">{row.source_path ?? '—'}</td>
                </tr>
              ))}
              {!recent?.length && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500 text-sm">No sessions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
