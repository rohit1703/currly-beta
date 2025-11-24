'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/utils/supabase';
import { Zap, MapPin, Clock, Search, Loader2, LayoutGrid, Filter, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import AdoptionModal from '@/components/AdoptionModal';
import AISearchSummary from '@/components/AISearchSummary';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserNav from '@/components/UserNav';
import { Logo } from '@/components/Logo'; // IMPORTED NEW LOGO

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
      try {
        let url = tool.website_url;
        if (!url.startsWith('http')) {
            url = `https://${url}`;
        }
        const domain = new URL(url).hostname;
        return `https://logo.clearbit.com/${domain}`;
      } catch (e) { return null; }
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-cream dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans transition-colors duration-500">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 border-r border-gray-200/50 dark:border-white/10 p-8 flex flex-col gap-10 hidden md:flex bg-white/50 dark:bg-[#0A0A0A] backdrop-blur-xl">
        <Link href="/">
          {/* UPDATED: Using the Master Logo Component */}
          <Logo />
        </Link>

        <div className="space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 pl-2">Filters</div>
          <label className="flex items-center justify-between cursor-pointer group py-3 px-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-[#0066FF]/30 transition-all">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">🇮🇳 India Only</span>
            <button 
              onClick={() => setIndiaOnly(!indiaOnly)}
              className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${indiaOnly ? 'bg-[#0066FF]' : 'bg-gray-200 dark:bg-white/10'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${indiaOnly ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </label>
        </div>
        
        <div className="mt-auto p-5 bg-[#0066FF]/5 dark:bg-blue-900/10 rounded-2xl border border-[#0066FF]/10">
           <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <div className="text-xs text-[#0066FF] font-bold uppercase tracking-wider">Live Status</div>
           </div>
           <div className="text-lg font-bold text-[#1A1A1A] dark:text-white">712+ Tools</div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-cream dark:bg-[#050505]">
        
        <header className="h-24 border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between px-10 gap-6 bg-white/60 dark:bg-[#050505]/80 backdrop-blur-xl z-10 sticky top-0">
          <div className="flex items-center gap-4 flex-1 max-w-3xl bg-white dark:bg-[#111] p-3 rounded-2xl border border-gray-200 dark:border-white/10 focus-within:border-[#0066FF]/50 focus-within:shadow-lg transition-all shadow-sm">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input 
              type="text" 
              placeholder="Search 700+ tools..." 
              className="bg-transparent border-none outline-none text-lg text-[#1A1A1A] dark:text-white w-full placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <ThemeToggle />
             <UserNav />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 scroll-smooth">
          
          {/* AI SUMMARY */}
          {!loading && searchQuery && (
             <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
               <AISearchSummary query={searchQuery} tools={filteredTools} />
             </div>
          )}

          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#0066FF]" />
              <p>Syncing...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-32">
              {filteredTools.map((tool) => {
                const logo = getLogo(tool);
                return (
                  <div key={tool.id} className="group bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-[#FDFBF7] dark:bg-black rounded-2xl p-2 flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-inner overflow-hidden">
                        {logo ? (
                          <img src={logo} alt={tool.name} className="w-full h-full object-contain rounded-lg" onError={(e) => {e.currentTarget.style.display='none'}} />
                        ) : (
                          <span className="text-2xl font-bold text-gray-400">{tool.name[0]}</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-wide ${tool.pricing_type === 'free' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 dark:bg-white/10 border-gray-200 dark:border-white/5 text-gray-500'}`}>
                        {tool.pricing_type === 'free' ? 'FREE' : 'PAID'}
                      </span>
                    </div>

                    <h3 className="font-bold text-xl mb-2 text-[#1A1A1A] dark:text-white">{tool.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-4">
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tool.setup_time_minutes || 15}m setup</span>
                       {tool.is_india_based && <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded"><MapPin className="w-3 h-3" /> India</span>}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 line-clamp-2 leading-relaxed flex-grow">
                      {tool.description || "AI-powered tool for efficiency and automation."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <button className="bg-white dark:bg-black hover:bg-gray-50 border border-gray-200 dark:border-white/20 text-xs font-bold py-3 rounded-xl transition-colors text-[#1A1A1A] dark:text-white">
                        Compare
                      </button>
                      <button 
                        onClick={() => { setSelectedTool(tool); setIsAdoptionOpen(true); }}
                        className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                      >
                        Test Demo <Zap className="w-3 h-3" />
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
        demoUrl={selectedTool?.demo_video_url} 
      />
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<div className="flex h-screen items-center justify-center bg-[#FDFBF7] dark:bg-[#050505]">Loading...</div>}><DashboardContent /></Suspense>;
}