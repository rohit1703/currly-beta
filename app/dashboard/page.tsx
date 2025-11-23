'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/utils/supabase';
import { Zap, MapPin, Clock, Search, Loader2 } from 'lucide-react';
import { DiscoveryCard } from '@/components/DiscoveryCard';
import AdoptionModal from '@/components/AdoptionModal';
import AISearchSummary from '@/components/AISearchSummary'; // NEW AI COMPONENT
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [indiaOnly, setIndiaOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [isAdoptionOpen, setIsAdoptionOpen] = useState(false);

  useEffect(() => {
    async function fetchTools() {
      try {
        setLoading(true);
        let query = supabase.from('tools').select('*');
        if (indiaOnly) query = query.eq('is_india_based', true);
        const { data, error } = await query.limit(100);
        if (error) throw error;
        setTools(data || []);
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTools();
  }, [indiaOnly]); 

  const filteredTools = tools.filter(tool => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = tool.name?.toLowerCase() || '';
    const desc = tool.description?.toLowerCase() || '';
    return name.includes(query) || desc.includes(query);
  });

  const getLogo = (tool: any) => {
    if (tool.logo_url) return tool.logo_url;
    if (tool.website_url) {
      try { return `https://logo.clearbit.com/${new URL(tool.website_url).hostname}`; } catch (e) { return null; }
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-cream dark:bg-[#050505] text-charcoal dark:text-white overflow-hidden font-sans transition-colors duration-500">
      
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-gray-200 dark:border-white/10 p-8 flex flex-col gap-10 hidden md:flex bg-white/50 dark:bg-[#0A0A0A]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">C</div>
          <span className="font-bold tracking-tight text-xl">currly</span>
        </Link>
        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Filters</div>
          <label className="flex items-center justify-between cursor-pointer group py-2">
            <span className="text-sm font-medium">🇮🇳 India Only</span>
            <button onClick={() => setIndiaOnly(!indiaOnly)} className={`w-10 h-6 rounded-full transition-colors flex items-center p-1 ${indiaOnly ? 'bg-primary' : 'bg-gray-300 dark:bg-white/10'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${indiaOnly ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </label>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-cream dark:bg-[#050505]">
        <header className="h-24 border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-10 gap-6 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1 max-w-3xl bg-gray-100 dark:bg-[#111] p-3 rounded-2xl border border-transparent focus-within:border-primary/50 transition-all">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input type="text" placeholder="Search 1,100+ tools..." className="bg-transparent border-none outline-none text-lg text-charcoal dark:text-white w-full placeholder-gray-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <ThemeToggle />
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          
          {/* --- AI SUMMARY BLOCK --- */}
          {/* Only show if user is searching and not loading */}
          {!loading && searchQuery && (
             <AISearchSummary query={searchQuery} tools={filteredTools} />
          )}

          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
              <p>Syncing...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-32">
              {filteredTools.map((tool) => {
                const logo = getLogo(tool);
                return (
                  <div key={tool.id} className="group bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-[2rem] p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-black rounded-2xl p-2 flex items-center justify-center border border-gray-100 dark:border-white/5">
                        {logo ? <img src={logo} alt={tool.name} className="w-full h-full object-contain rounded-lg" onError={(e) => {e.currentTarget.style.display='none'}} /> : <span className="text-2xl font-bold text-gray-400">{tool.name[0]}</span>}
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-wide ${tool.pricing_type === 'free' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 dark:bg-white/10 border-gray-200 dark:border-white/5'}`}>{tool.pricing_type === 'free' ? 'FREE' : 'PAID'}</span>
                    </div>
                    <h3 className="font-bold text-xl mb-2">{tool.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-4">
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tool.setup_time_minutes || 15}m setup</span>
                       {tool.is_india_based && <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded"><MapPin className="w-3 h-3" /> India</span>}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 line-clamp-2 leading-relaxed flex-grow">{tool.description || "AI-powered tool for efficiency and automation."}</p>
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <button className="bg-white dark:bg-black hover:bg-gray-50 border border-gray-200 dark:border-white/20 text-xs font-bold py-3 rounded-xl transition-colors">Compare</button>
                      <button onClick={() => { setSelectedTool(tool); setIsAdoptionOpen(true); }} className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20">Test Demo <Zap className="w-3 h-3" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <AdoptionModal isOpen={isAdoptionOpen} onClose={() => setIsAdoptionOpen(false)} toolName={selectedTool?.name || 'AI Tool'} demoUrl={selectedTool?.demo_video_url} />
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<div>Loading...</div>}><DashboardContent /></Suspense>;
}