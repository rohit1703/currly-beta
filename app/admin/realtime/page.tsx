'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RealtimePage() {
  const [searches, setSearches] = useState<any[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    // Load recent data on mount
    const load = async () => {
      const [{ data: s }, { data: c }] = await Promise.all([
        supabase.from('search_events').select('query, searched_at').order('searched_at', { ascending: false }).limit(20),
        supabase.from('tool_clicks').select('tool_id, query, clicked_at').order('clicked_at', { ascending: false }).limit(20),
      ]);
      if (s) setSearches(s);
      if (c) setClicks(c);
    };
    load();

    // Subscribe to new searches
    const searchSub = supabase
      .channel('realtime-searches')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'search_events' }, payload => {
        setSearches(prev => [payload.new, ...prev].slice(0, 20));
        setActiveUsers(n => n + 1);
        setTimeout(() => setActiveUsers(n => Math.max(0, n - 1)), 30000);
      })
      .subscribe();

    // Subscribe to new clicks
    const clickSub = supabase
      .channel('realtime-clicks')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tool_clicks' }, payload => {
        setClicks(prev => [payload.new, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(searchSub);
      supabase.removeChannel(clickSub);
    };
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-2xl font-bold">Real-time</h1>
        <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          Live
        </span>
      </div>
      <p className="text-gray-400 text-sm mb-8">Live searches and clicks happening right now</p>

      {/* Active users */}
      <div className="bg-white/5 rounded-xl p-5 border border-white/5 mb-8 flex items-center gap-4">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        <div>
          <div className="text-2xl font-bold">{activeUsers}</div>
          <div className="text-xs text-gray-400">Users active in last 30s</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Live searches */}
        <div className="bg-white/5 rounded-xl border border-white/5">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Searches</h2>
            <span className="text-xs text-gray-400">{searches.length} recent</span>
          </div>
          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
            {searches.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-gray-200 truncate max-w-[70%]">{s.query}</span>
                <span className="text-xs text-gray-500">{new Date(s.searched_at).toLocaleTimeString()}</span>
              </div>
            ))}
            {!searches.length && <p className="px-5 py-8 text-xs text-gray-500 text-center">Waiting for searches...</p>}
          </div>
        </div>

        {/* Live clicks */}
        <div className="bg-white/5 rounded-xl border border-white/5">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Tool Clicks</h2>
            <span className="text-xs text-gray-400">{clicks.length} recent</span>
          </div>
          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
            {clicks.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div>
                  <span className="text-sm text-gray-200 block">{c.query || 'Direct click'}</span>
                  <span className="text-xs text-gray-500">{c.tool_id?.slice(0, 8)}...</span>
                </div>
                <span className="text-xs text-gray-500">{new Date(c.clicked_at).toLocaleTimeString()}</span>
              </div>
            ))}
            {!clicks.length && <p className="px-5 py-8 text-xs text-gray-500 text-center">Waiting for clicks...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
