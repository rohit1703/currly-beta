import { createTool } from '../actions';

const CATEGORIES = ['Coding', 'Design', 'Writing', 'Marketing', 'Productivity', 'Video', 'Audio', 'Image', 'Data', 'Finance', 'HR', 'Legal', 'Sales', 'Support', 'Other'];
const PRICING = ['Free', 'Freemium', 'Paid', 'Free (Teams $15/seat/mo)', 'API-based', 'SaaS', 'Open Source'];

export default async function NewTool({
  searchParams,
}: {
  searchParams: Promise<{ prefill?: string; error?: string }>;
}) {
  const params = await searchParams;
  const prefill = params.prefill || '';
  const error = params.error || '';

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">Add New Tool</h1>
      <p className="text-gray-400 text-sm mb-8">Fill in the details to add a tool to Currly</p>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-900/30 border border-red-700/50 rounded-xl text-sm text-red-300">
          {error}
        </div>
      )}

      <form action={createTool} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Name *</label>
            <input name="name" required defaultValue={prefill}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Website</label>
            <input name="website" type="url" placeholder="https://"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Description</label>
          <textarea name="description" rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF] resize-none" />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1.5">
            Image URL
          </label>
          <input name="image_url" type="url" placeholder="https://... or leave blank for auto logo"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]" />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Category</label>
            <select name="main_category"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Pricing</label>
            <select name="pricing_model"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]">
              {PRICING.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Status</label>
            <select name="launch_status"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]">
              <option value="Live">Live</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">India Based</label>
            <select name="is_india_based"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#0066FF]">
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit"
            className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors">
            Add Tool
          </button>
          <a href="/admin/manage" className="text-sm text-gray-400 hover:text-white px-4 py-2.5 transition-colors">
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
