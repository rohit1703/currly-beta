'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/utils/supabase';
import { Zap, MapPin, Clock, Search, Loader2, LayoutGrid } from 'lucide-react';
import AdoptionModal from '@/components/AdoptionModal';
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

  // Helper to get logo (DB > Clearbit > Fallback)
  const getLogo = (tool: any) => {
    if (tool.logo_url) return tool.logo_url;
    if (tool.website_url) {
      try {
        const domain = new URL(tool.website_url).hostname;
        return `https://logo.clearbit.com/${domain}`;
      } catch (e) { return null; }
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-cream dark:bg-[#050505] text-charcoal dark:text-white overflow-hidden font-sans transition-colors duration-500">
      
      {/* --- SIDEBAR (Consistent Design) --- */}
      <aside className="w-64 border-r border-gray-200 dark:border-white/10 p-6 flex flex-col gap-8 hidden md:flex bg-white/50 dark:bg-[#0A0A0A]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">C</div>
          <span className="font-bold tracking-tight text-xl">currly</span>
        </Link>

        <div className="space-y-6 mt-4">
          <div>
            <label className="flex items-center justify-between cursor-pointer group p-3 hover:bg-white dark:hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">🇮🇳 India Only</span>
              <button 
                onClick={() => setIndiaOnly(!indiaOnly)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center p-1 ${indiaOnly ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${indiaOnly ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
            </label>
          </div>
        </div>
        
        <div className="mt-auto bg-white dark:bg-[#111] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
           <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Database Status</p>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span className="text-sm font-bold">1,102 Tools Live</span>
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-cream dark:bg-[#050505]">
        
        {/* Header */}
        <header className="h-20 border-b border-gray-200 dark:border-white/10 flex items-center justify-between px-8 gap-4 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4 flex-1 max-w-2xl bg-gray-100 dark:bg-[#111] p-2.5 rounded-xl border border-transparent focus-within:border-primary/50 transition-colors">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input 
              type="text" 
              placeholder="Search 1,100+ tools..." 
              className="bg-transparent border-none outline-none text-lg text-charcoal dark:text-white w-full placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <ThemeToggle /> 
          </div>
        </header>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
              <p>Syncing with Brain...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-32">
              {filteredTools.map((tool, index) => {
                const logo = getLogo(tool);
                return (
                  <div key={tool.id} className="group relative bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-3xl p-6 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                    
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-4">
                        {/* LOGO DISPLAY - V5 STYLE */}
                        <div className="w-14 h-14 bg-white dark:bg-black rounded-2xl p-2 flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
                          {logo ? (
                            <img src={logo} alt={tool.name} className="w-full h-full object-contain" onError={(e) => {e.currentTarget.style.display='none'}} />
                          ) : (
                            <span className="text-xl font-bold text-primary">{tool.name[0]}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-charcoal dark:text-white text-lg leading-tight">{tool.name}</h3>
                          <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
                            {tool.is_india_based && <span className="text-accent flex items-center gap-1 font-medium"><MapPin className="w-3 h-3" /> India</span>}
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tool.setup_time_minutes || 15}m</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${tool.pricing_type === 'free' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 dark:bg-white/10 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-white/10'}`}>
                        {tool.pricing_type === 'free' ? 'FREE' : `$${tool.starting_price_usd || 'PAID'}`}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 leading-relaxed flex-grow">
                      {tool.description || "AI-powered tool for efficiency and automation."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <button className="bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-xs font-bold py-3 rounded-xl text-gray-700 dark:text-gray-300 transition-colors">Compare</button>
                      <button 
                        onClick={() => { setSelectedTool(tool); setIsAdoptionOpen(true); }}
                        className="bg-primary hover:bg-primary-hover text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                      >
                        <Zap className="w-3.5 h-3.5" /> Test Demo
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <AdoptionModal 
        isOpen={isAdoptionOpen} 
        onClose={() => setIsAdoptionOpen(false)} 
        toolName={selectedTool?.name || 'AI Tool'}
        demoUrl={selectedTool?.demo_video_url || "https://arcade.software/embed/demo"} 
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-cream dark:bg-[#050505]">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}