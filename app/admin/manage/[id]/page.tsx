import { createAdminClient } from '@/utils/supabase/admin';
import { updateTool, deleteTool } from '../actions';
import { notFound } from 'next/navigation';

const CATEGORIES = ['Coding', 'Design', 'Writing', 'Marketing', 'Productivity', 'Video', 'Audio', 'Image', 'Data', 'Finance', 'HR', 'Legal', 'Sales', 'Support', 'Other'];
const PRICING = ['Free', 'Freemium', 'Paid', 'Free (Teams $15/seat/mo)', 'API-based', 'SaaS', 'Open Source'];

export default async function EditTool({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('id', id)
    .single();

  if (!tool) notFound();

  const update = updateTool.bind(null, id);

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Edit Tool</h1>
        <form action={deleteTool.bind(null, id)}>
          <button
            type="submit"
            onClick={(e) => { if (!confirm(`Delete "${tool.name}"? This cannot be undone.`)) e.preventDefault(); }}
            className="text-sm text-red-400 hover:text-red-300 border border-red-400/30 px-4 py-2 rounded-xl transition-colors"
          >
            Delete Tool
          </button>
        </form>
      </div>
      <p className="text-gray-400 text-sm mb-8">/{tool.slug}</p>

      <form action={update} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Name *</label>
            <input name="name" required defaultValue={tool.name}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Website</label>
            <input name="website" type="url" defaultValue={tool.website}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Description</label>
          <textarea name="description" rows={3} defaultValue={tool.description}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF] resize-none" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Image URL</label>
          <div className="flex gap-3">
            {tool.image_url && (
              <img src={tool.image_url} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
            )}
            <input name="image_url" type="url" defaultValue={tool.image_url}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Category</label>
            <select name="main_category" defaultValue={tool.main_category}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Pricing</label>
            <select name="pricing_model" defaultValue={tool.pricing_model}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]">
              {PRICING.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Status</label>
            <select name="launch_status" defaultValue={tool.launch_status || 'Live'}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]">
              <option value="Live">Live</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">India Based</label>
            <select name="is_india_based" defaultValue={tool.is_india_based ? 'true' : 'false'}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]">
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors">
            Save Changes
          </button>
          <a href="/admin/manage" className="text-sm text-gray-400 hover:text-white px-4 py-2.5 transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
