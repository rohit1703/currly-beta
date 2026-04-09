import { createAdminClient } from '@/utils/supabase/admin';

export default async function ToolAnalytics() {
  const supabase = createAdminClient();

  const [{ data: topTools }, { data: deadTools }] = await Promise.all([
    supabase.from('admin_tool_performance').select('*').order('total_clicks', { ascending: false }).limit(30),
    supabase.from('admin_dead_tools').select('*').limit(30),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Tool Analytics</h1>
      <p className="text-gray-400 text-sm mb-8">Which tools users actually use</p>

      {/* Top Tools */}
      <div className="bg-white/5 rounded-xl border border-white/5 mb-8">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold">Top Clicked Tools</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Tool</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Category</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Clicks</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">From Queries</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Last Clicked</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Edit</th>
              </tr>
            </thead>
            <tbody>
              {(topTools || []).map((t: any) => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {t.image_url && <img src={t.image_url} className="w-6 h-6 rounded object-cover" />}
                      <span className="text-gray-200 font-medium">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{t.main_category}</td>
                  <td className="px-5 py-3 text-right font-bold text-white">{t.total_clicks}</td>
                  <td className="px-5 py-3 text-right text-gray-400">{t.from_queries}</td>
                  <td className="px-5 py-3 text-right text-gray-500 text-xs">
                    {t.last_clicked ? new Date(t.last_clicked).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <a href={`/admin/manage/${t.id}`} className="text-xs text-[#0066FF] hover:underline">Edit</a>
                  </td>
                </tr>
              ))}
              {!topTools?.length && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500 text-sm">No clicks recorded yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dead Tools */}
      <div className="bg-white/5 rounded-xl border border-white/5">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Dead Tools</h2>
          <span className="text-xs text-gray-400">In database, never clicked — consider removing or improving</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Tool</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Category</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Pricing</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Added</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Edit</th>
              </tr>
            </thead>
            <tbody>
              {(deadTools || []).map((t: any) => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-5 py-3 text-gray-200 font-medium">{t.name}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{t.main_category}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{t.pricing_model}</td>
                  <td className="px-5 py-3 text-right text-gray-500 text-xs">
                    {t.launch_date ? new Date(t.launch_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <a href={`/admin/manage/${t.id}`} className="text-xs text-[#0066FF] hover:underline">Edit</a>
                  </td>
                </tr>
              ))}
              {!deadTools?.length && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500 text-sm">No dead tools — all tools have been clicked!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
