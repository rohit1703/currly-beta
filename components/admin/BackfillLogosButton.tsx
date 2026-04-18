'use client';

import { useState } from 'react';
import { ImageIcon, Loader2, CheckCircle } from 'lucide-react';

export default function BackfillLogosButton({ secret }: { secret: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<{ updated: number; total: number } | null>(null);

  const run = async () => {
    setState('loading');
    try {
      const res = await fetch(`/api/backfill-logos?secret=${encodeURIComponent(secret)}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data);
      setState('done');
    } catch (e: any) {
      console.error(e);
      setState('error');
    }
  };

  return (
    <button
      onClick={run}
      disabled={state === 'loading' || state === 'done'}
      className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors disabled:opacity-50"
    >
      {state === 'loading' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {state === 'done' && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
      {state === 'idle' || state === 'error' ? <ImageIcon className="w-3.5 h-3.5" /> : null}
      {state === 'idle' && 'Backfill missing logos'}
      {state === 'loading' && 'Fetching logos...'}
      {state === 'done' && `Done — ${result?.updated}/${result?.total} updated`}
      {state === 'error' && 'Failed — retry'}
    </button>
  );
}
