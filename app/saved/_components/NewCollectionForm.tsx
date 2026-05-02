'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';

export default function NewCollectionForm({ asCard = false }: { asCard?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Failed to create.'); return; }
      setName('');
      setOpen(false);
      router.refresh();
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (asCard) {
    return open ? (
      <div className="w-full space-y-3" onClick={e => e.preventDefault()}>
        <input
          autoFocus
          type="text"
          placeholder="Collection name"
          value={name}
          maxLength={100}
          onChange={e => { setName(e.target.value); setError(null); }}
          onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
          className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-transparent focus:outline-none focus:border-[#0066FF] dark:text-white"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 py-2 text-sm font-bold bg-[#0066FF] text-white rounded-xl hover:bg-blue-600 disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Create'}
          </button>
          <button
            onClick={() => { setOpen(false); setError(null); setName(''); }}
            className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ) : (
      <button
        onClick={e => { e.preventDefault(); setOpen(true); }}
        className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[#0066FF] transition-colors w-full"
      >
        <Plus className="w-8 h-8" />
        <span className="text-sm font-semibold">New collection</span>
      </button>
    );
  }

  // Header button variant
  return open ? (
    <div className="flex items-center gap-2">
      <input
        autoFocus
        type="text"
        placeholder="Collection name"
        value={name}
        maxLength={100}
        onChange={e => { setName(e.target.value); setError(null); }}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
        className="text-sm px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] focus:outline-none focus:border-[#0066FF] dark:text-white w-48"
      />
      <button
        onClick={submit}
        disabled={loading}
        className="px-4 py-2 text-sm font-bold bg-[#0066FF] text-white rounded-xl hover:bg-blue-600 disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
      </button>
      <button
        onClick={() => { setOpen(false); setError(null); setName(''); }}
        className="px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
      >
        Cancel
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  ) : (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0066FF] text-white text-sm font-bold hover:bg-[#0052CC] transition-colors shadow-md shadow-blue-500/20"
    >
      <Plus className="w-4 h-4" /> New collection
    </button>
  );
}
