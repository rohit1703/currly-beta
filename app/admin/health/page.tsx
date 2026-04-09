import { createAdminClient } from '@/utils/supabase/admin';

export default async function IndexHealth() {
  const supabase = createAdminClient();

  const [
    { count: totalTools },
    { count: withEmbedding },
    { count: noImage },
    { count: noDescription },
    { count: noWebsite },
    { data: categories },
  ] = await Promise.all([
    supabase.from('tools').select('*', { count: 'exact', head: true }),
    supabase.from('tools').select('*', { count: 'exact', head: true }).not('embedding', 'is', null),
    supabase.from('tools').select('*', { count: 'exact', head: true }).or('image_url.is.null,image_url.eq.'),
    supabase.from('tools').select('*', { count: 'exact', head: true }).or('description.is.null,description.eq.'),
    supabase.from('tools').select('*', { count: 'exact', head: true }).or('website.is.null,website.eq.'),
    supabase.from('admin_category_coverage').select('*'),
  ]);

  const dataScore = totalTools
    ? Math.round(((totalTools - (noImage ?? 0) - (noDescription ?? 0) - (noWebsite ?? 0)) / (totalTools * 3)) * 100)
    : 0;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Index Health</h1>
      <p className="text-gray-400 text-sm mb-8">Data quality and coverage across your tool database</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Tools', value: totalTools?.toLocaleString() ?? '0', good: true },
          { label: 'With Embeddings', value: `${withEmbedding ?? 0}/${totalTools ?? 0}`, good: withEmbedding === totalTools },
          { label: 'Missing Image', value: noImage?.toLocaleString() ?? '0', good: noImage === 0 },
          { label: 'Missing Description', value: noDescription?.toLocaleString() ?? '0', good: noDescription === 0 },
        ].map(s => (
          <div key={s.label} className="bg-white/5 rounded-xl p-5 border border-white/5">
            <div className={`text-2xl font-bold mb-1 ${s.good ? 'text-green-400' : 'text-amber-400'}`}>{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Data quality bar */}
      <div className="bg-white/5 rounded-xl p-5 border border-white/5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Overall Data Quality Score</h2>
          <span className="text-2xl font-bold text-[#0066FF]">{dataScore}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="bg-[#0066FF] h-2 rounded-full" style={{ width: `${dataScore}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-2">Based on tools having image, description, and website</p>
      </div>

      {/* Category Coverage */}
      <div className="bg-white/5 rounded-xl border border-white/5">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold">Coverage by Category</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Category</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Tools</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">With Description</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">With Image</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">With Website</th>
              </tr>
            </thead>
            <tbody>
              {(categories || []).map((c: any) => (
                <tr key={c.main_category} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-5 py-3 text-gray-200 font-medium">{c.main_category || 'Uncategorized'}</td>
                  <td className="px-5 py-3 text-right text-white font-bold">{c.tool_count}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={c.with_description === c.tool_count ? 'text-green-400' : 'text-amber-400'}>
                      {c.with_description}/{c.tool_count}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={c.with_image === c.tool_count ? 'text-green-400' : 'text-amber-400'}>
                      {c.with_image}/{c.tool_count}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={c.with_website === c.tool_count ? 'text-green-400' : 'text-amber-400'}>
                      {c.with_website}/{c.tool_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
