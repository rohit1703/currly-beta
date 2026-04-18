import { createAdminClient } from '@/utils/supabase/admin';
import Link from 'next/link';
import { deleteTool } from './actions';
import DeleteButton from '@/components/admin/DeleteButton';
import BackfillLogosButton from '@/components/admin/BackfillLogosButton';

export default async function ManageTools({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || '';
  const page = parseInt(params.page || '1');
  const pageSize = 50;

  const supabase = createAdminClient();

  let dbQuery = supabase
    .from('tools')
    .select('id, name, slug, main_category, pricing_model, launch_status, launch_date, website', { count: 'exact' })
    .order('launch_date', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (query) dbQuery = dbQuery.ilike('name', `%${query}%`);

  const { data: tools, count } = await dbQuery;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manage Tools</h1>
          <p className="text-gray-400 text-sm">{count?.toLocaleString()} tools total</p>
        </div>
        <div className="flex items-center gap-3">
          <BackfillLogosButton secret={process.env.ADMIN_SECRET || ''} />
          <Link href="/admin/manage/new" className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
            + Add Tool
          </Link>
        </div>
      </div>

      {/* Search */}
      <form className="mb-6">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search tools by name..."
          className="w-full max-w-sm bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#0066FF]"
        />
      </form>

      {/* Table */}
      <div className="bg-white/5 rounded-xl border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Name</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Category</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Pricing</th>
                <th className="text-left px-5 py-3 text-xs text-gray-400 font-medium">Status</th>
                <th className="text-right px-5 py-3 text-xs text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(tools || []).map((t: any) => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/3">
                  <td className="px-5 py-3">
                    <div className="text-gray-200 font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.slug}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{t.main_category}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{t.pricing_model}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      t.launch_status === 'Live'
                        ? 'bg-green-900/40 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {t.launch_status || 'Live'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {t.website && (
                        <a href={t.website} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white">Visit</a>
                      )}
                      <Link href={`/admin/manage/${t.id}`} className="text-xs text-[#0066FF] hover:underline">Edit</Link>
                      <DeleteButton
                        action={deleteTool.bind(null, t.id)}
                        confirmMessage={`Delete "${t.name}"?`}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
            <span className="text-xs text-gray-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`/admin/manage?q=${query}&page=${page - 1}`} className="text-xs text-[#0066FF] hover:underline">← Prev</Link>
              )}
              {page < totalPages && (
                <Link href={`/admin/manage?q=${query}&page=${page + 1}`} className="text-xs text-[#0066FF] hover:underline">Next →</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
