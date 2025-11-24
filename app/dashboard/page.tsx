'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/utils/supabase';
import { Zap, MapPin, Clock, Search, Loader2, CheckSquare, Square, X, ArrowRight, Filter } from 'lucide-react';
import AdoptionModal from '@/components/AdoptionModal';
import AISearchSummary from '@/components/AISearchSummary';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserNav from '@/components/UserNav';
import { Logo } from '@/components/Logo';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // DATA STATE
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FILTER STATE
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [indiaOnly, setIndiaOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'All');

  // INTERACTION STATE
  const [compareList, setCompareList] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [isAdoptionOpen, setIsAdoptionOpen] = useState(false);

  // 1. FETCH DATA
  useEffect(() => {
    async function fetchTools() {
      try {
        setLoading(true);
        let query = supabase.from('tools').select('*');
        
        if (indiaOnly) query = query.eq('is_india_based', true);
        
        // Fetching 300 tools to allow for robust client-side filtering
        // In production (Sprint 3), we will move filtering to the Supabase query for speed.
        const { data, error } = await query.limit(300);
        
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

  // 2. SMART FILTERING LOGIC
  const filteredTools = tools.filter(tool => {
    // Text Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches = tool.name?.toLowerCase().includes(q) || tool.description?.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // Category Filter (Smart Keyword Match)
    if (categoryFilter !== 'All') {
      const cat = categoryFilter.toLowerCase();
      const matchesCat = tool.description?.toLowerCase().includes(cat) || tool.name?.toLowerCase().includes(cat);
      if (!matchesCat) return false;
    }

    // Pricing Filter
    if (priceFilter.length > 0) {
      const isFree = tool.pricing_type === 'free' || tool.pricing_type === 'freemium';
      if (priceFilter.includes('Free') && !isFree) return false;
      if (priceFilter.includes('Paid') && isFree) return false;
    }

    return true;
  });

  // 3. LOGO HELPER (Smart Fetch)
  const getLogo = (tool: any) => {
    if (tool.logo_url) return tool.logo_url;
    if (tool.website_url) {
      try {
        let url = tool.website_url;
        if (!url.startsWith('http')) url = `https://${url}`;
        return `https://logo.clearbit.com/${new URL(url).hostname}`;
      } catch (e) { return null; }
    }
    return null;
  };

  // 4. COMPARISON LOGIC
  const toggleCompare = (tool: any) => {
    if (compareList.find(t => t.id === tool.id)) {
      setCompareList(compareList.filter(t => t.id !== tool.id));
    } else {
      if (compareList.length < 3) setCompareList([...compareList, tool]);
      else alert("You can compare up to 3 tools at a time.");
    }
  };

  return (
    <div className="flex h-screen bg-cream dark:bg-[#050505] text-charcoal dark:text-white font-sans transition-colors duration-500">
      
      {/* --- SIDEBAR FILTERS --- */}
      <aside className="w-72 border-r border-gray-200/50 dark:border-white/10 p-6 flex flex-col gap-8 hidden md:flex bg-white/50 dark:bg-[#0A0A0A] backdrop-blur-xl overflow-y-auto">
        <Link href="/">
          <Logo />
        </Link>

        <div className="space-y-8">
          
          {/* REGION FILTER */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Region</div>
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

          {/* PRICING FILTER */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Pricing Model</div>
            <div className="space-y-2">
              {['Free', 'Paid'].map(type => (
                <div 
                  key={type} 
                  onClick={() => {
                    if (priceFilter.includes(type)) setPriceFilter(priceFilter.filter(p => p !== type));
                    else setPriceFilter([...priceFilter, type]);
                  }}
                  className="flex items-center gap-3 px-2 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg cursor-pointer"
                >
                   {priceFilter.includes(type) ? <CheckSquare className="w-5 h-5 text-[#0066FF]" /> : <Square className="w-5 h-5 text-gray-300" />}
                   <span className="text-sm text-gray-700 dark:text-gray-300">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORY FILTER */}
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Categories</div>
            <div className="space-y-1">
              {['All', 'Marketing', 'Development', 'Design', 'Productivity', 'Video', 'Finance'].map(cat => (
                 <button 
                   key={cat}
                   onClick={() => setCategoryFilter(cat)}
                   className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categoryFilter === cat ? 'bg-[#0066FF]/10 text-[#0066FF]' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                 >
                   {cat}
                 </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-5 bg-[#0066FF]/5 dark:bg-blue-900/10 rounded-2xl border border-[#0066FF]/10">
           <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <div className="text-xs text-[#0066FF] font-bold uppercase tracking-wider">Live Status</div>
           </div>
           <div className="text-lg font-bold text-charcoal dark:text-white">712+ Tools</div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-cream dark:bg-[#050505]">
        
        <header className="h-24 border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between px-10 gap-6 bg-white/60 dark:bg-[#050505]/80 backdrop-blur-xl z-10 sticky top-0">
          <div className="flex items-center gap-4 flex-1 max-w-3xl bg-white dark:bg-[#111] p-3 rounded-2xl border border-gray-200 dark:border-white/10 focus-within:border-[#0066FF]/50 focus-within:shadow-lg transition-all shadow-sm">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <input 
              type="text" 
              placeholder={`Search ${categoryFilter !== 'All' ? categoryFilter : ''} tools...`}
              className="bg-transparent border-none outline-none text-lg text-charcoal dark:text-white w-full placeholder-gray-400"
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
          
          {/* AI SUMMARY (Perplexity Style) */}
          {!loading && searchQuery && (
             <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
               <AISearchSummary query={searchQuery} tools={filteredTools} />
             </div>
          )}

          {/* DISCOVERY MODE LANES (When search is empty) */}
          {!loading && !searchQuery && categoryFilter === 'All' && (
             <div className="mb-12">
                <h2 className="text-xl font-bold mb-6 text-charcoal dark:text-white">Curated Collections</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {['Top Marketing Tools', 'Made in India', 'Startup Essentials'].map(c => (
                      <div key={c} className="h-32 rounded-[2rem] bg-gradient-to-br from-[#0066FF] to-[#00D9FF] p-6 flex items-end text-white font-bold text-lg cursor-pointer hover:scale-[1.02] transition-transform shadow-lg">
                        {c}
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* TOOL GRID */}
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#0066FF]" />
              <p>Syncing...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-32">
              {filteredTools.map((tool) => {
                const logo = getLogo(tool);
                const isSelected = compareList.find(t => t.id === tool.id);

                return (
                  <div key={tool.id} className={`group bg-white dark:bg-[#111] border ${isSelected ? 'border-[#0066FF] ring-1 ring-[#0066FF]' : 'border-gray-100 dark:border-white/5'} rounded-[2rem] p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col`}>
                    
                    <div className="flex justify-between items-start mb-6">
                      {/* LOGO */}
                      <div className="w-16 h-16 bg-cream dark:bg-black rounded-2xl p-2 flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-inner overflow-hidden">
                        {logo ? (
                          <img src={logo} alt={tool.name} className="w-full h-full object-contain rounded-lg" onError={(e) => {e.currentTarget.style.display='none'}} />
                        ) : (
                          <span className="text-2xl font-bold text-gray-400">{tool.name[0]}</span>
                        )}
                      </div>
                      
                      {/* PRICING BADGE */}
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-wide ${tool.pricing_type === 'free' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 dark:bg-white/10 border-gray-200 dark:border-white/5 text-gray-500'}`}>
                        {tool.pricing_type === 'free' ? 'FREE' : 'PAID'}
                      </span>
                    </div>

                    <h3 className="font-bold text-xl mb-2 text-charcoal dark:text-white">{tool.name}</h3>
                    
                    {/* METADATA CHIPS */}
                    <div className="flex flex-wrap gap-2 mb-4">
                       <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                          <Clock className="w-3 h-3" /> {tool.setup_time_minutes || 15}m setup
                       </div>
                       {tool.is_india_based && (
                         <div className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                            <MapPin className="w-3 h-3" /> India
                         </div>
                       )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 line-clamp-2 leading-relaxed flex-grow">
                      {tool.description || "AI-powered tool for efficiency and automation."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      {/* COMPARE BUTTON */}
                      <button 
                        onClick={() => toggleCompare(tool)}
                        className={`flex items-center justify-center gap-2 text-xs font-bold py-3 rounded-xl transition-colors border ${isSelected ? 'bg-blue-50 text-[#0066FF] border-blue-100' : 'bg-white dark:bg-black hover:bg-gray-50 border-gray-200 dark:border-white/20 text-gray-600 dark:text-gray-300'}`}
                      >
                        {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        Compare
                      </button>
                      
                      {/* DEMO BUTTON */}
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
        
        {/* FLOATING COMPARE DOCK (Linear Style) */}
        {compareList.length > 0 && (
           <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 border border-white/10">
              <div className="flex -space-x-2">
                {compareList.map(t => (
                   <div key={t.id} className="w-8 h-8 rounded-full bg-gray-800 border border-black flex items-center justify-center text-[10px] font-bold overflow-hidden">
                      {t.logo_url ? <img src={t.logo_url} className="w-full h-full object-cover" /> : t.name[0]}
                   </div>
                ))}
              </div>
              <span className="font-bold text-sm">{compareList.length} Selected</span>
              <div className="h-6 w-px bg-white/20"></div>
              <button className="text-sm font-bold hover:text-[#0066FF] transition-colors flex items-center gap-1">
                Compare Now <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setCompareList([])} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
           </div>
        )}

      </main>

      <AdoptionModal isOpen={isAdoptionOpen} onClose={() => setIsAdoptionOpen(false)} toolName={selectedTool?.name} demoUrl={selectedTool?.demo_video_url} />
    </div>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<div className="flex h-screen items-center justify-center bg-cream dark:bg-[#050505]">Loading...</div>}><DashboardContent /></Suspense>;
}