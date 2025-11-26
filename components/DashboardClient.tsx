'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Loader2, CheckSquare, Square, X, ArrowRight, Filter, Zap, MapPin, Clock } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserNav from '@/components/UserNav';
import MobileMenu from '@/components/MobileMenu';
import ToolCard from '@/components/ToolCardItem';
import AISearchSummary from '@/components/AISearchSummary';
import AdoptionModal from '@/components/AdoptionModal';

export default function DashboardClient({ 
  initialTools, 
  searchQuery 
}: { 
  initialTools: any[], 
  searchQuery: string 
}) {
  const [indiaOnly, setIndiaOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [compareList, setCompareList] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [isAdoptionOpen, setIsAdoptionOpen] = useState(false);

  // Client-side filtering (Region/Price) on top of Server results
  const filteredTools = initialTools.filter(tool => {
    if (indiaOnly && !tool.is_india_based) return false;
    
    if (categoryFilter !== 'All') {
      const cat = categoryFilter.toLowerCase();
      const matchesCat = tool.description?.toLowerCase().includes(cat) || tool.main_category?.toLowerCase().includes(cat);
      if (!matchesCat) return false;
    }

    if (priceFilter.length > 0) {
      const isFree = tool.pricing_model?.toLowerCase().includes('free');
      if (priceFilter.includes('Free') && !isFree) return false;
      if (priceFilter.includes('Paid') && isFree) return false;
    }

    return true;
  });

  const toggleCompare = (tool: any) => {
    if (compareList.find(t => t.id === tool.id)) {
      setCompareList(compareList.filter(t => t.id !== tool.id));
    } else {
      if (compareList.length < 3) setCompareList([...compareList, tool]);
      else alert("You can only compare up to 3 tools.");
    }
  };

  const SidebarContent = () => (
    <div className="space-y-8">
      {/* REGION */}
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

      {/* PRICING */}
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

      {/* CATEGORIES */}
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
      
       <div className="mt-8 p-5 bg-[#0066FF]/5 dark:bg-blue-900/10 rounded-2xl border border-[#0066FF]/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-xs text-[#0066FF] font-bold uppercase tracking-wider">Live Status</div>
          </div>
          <div className="text-lg font-bold text-[#1A1A1A] dark:text-white">712+ Tools</div>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans transition-colors duration-500">
      
      <aside className="w-72 border-r border-gray-200/50 dark:border-white/10 p-6 flex flex-col gap-8 hidden md:flex bg-white/50 dark:bg-[#0A0A0A] backdrop-blur-xl overflow-y-auto">
        <Link href="/">
          <Logo />
        </Link>
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative bg-[#FDFBF7] dark:bg-[#050505]">
        
        <header className="h-20 md:h-24 border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between px-4 md:px-10 gap-4 bg-white/60 dark:bg-[#050505]/80 backdrop-blur-xl z-10 sticky top-0">
          <MobileMenu>
             <SidebarContent />
          </MobileMenu>

          <div className="flex items-center gap-4 flex-1 max-w-3xl bg-white dark:bg-[#111] p-2 md:p-3 rounded-2xl border border-gray-200 dark:border-white/10 focus-within:border-[#0066FF]/50 focus-within:shadow-lg transition-all shadow-sm">
            <Search className="w-5 h-5 text-gray-400 ml-2" />
            <form action="/dashboard" className="w-full">
                <input 
                name="q"
                type="text" 
                placeholder="Search for 'video editor'..." 
                defaultValue={searchQuery}
                className="bg-transparent border-none outline-none text-base md:text-lg text-[#1A1A1A] dark:text-white w-full placeholder-gray-400"
                />
            </form>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
             <ThemeToggle />
             <UserNav />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth">
          
          {searchQuery && (
             <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
               <AISearchSummary query={searchQuery} tools={filteredTools} />
             </div>
          )}

          {!searchQuery && categoryFilter === 'All' && (
             <div className="mb-12 hidden md:block">
                <h2 className="text-xl font-bold mb-6 text-[#1A1A1A] dark:text-white">Curated Collections</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {['Top Marketing Tools', 'Made in India', 'Startup Essentials'].map(c => (
                      <div key={c} className="h-32 rounded-[2rem] bg-gradient-to-br from-[#0066FF] to-[#00D9FF] p-6 flex items-end text-white font-bold text-lg cursor-pointer hover:scale-[1.02] transition-transform shadow-lg">
                        {c}
                      </div>
                   ))}
                </div>
             </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-32">
            {filteredTools.map((tool) => (
                <div key={tool.id} className="group bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-[2rem] p-6 md:p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-[#FDFBF7] dark:bg-black rounded-2xl p-2 flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-inner overflow-hidden">
                      <img src={tool.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${tool.name}`} className="w-full h-full object-contain rounded-lg" />
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full border tracking-wide bg-gray-50 dark:bg-white/10 border-gray-200 dark:border-white/5 text-gray-500">
                      {tool.pricing_model || 'PAID'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg md:text-xl mb-2 text-[#1A1A1A] dark:text-white">{tool.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-4">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 15m setup</span>
                      {tool.is_india_based && <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded"><MapPin className="w-3 h-3" /> India</span>}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 line-clamp-2 leading-relaxed flex-grow">{tool.description}</p>
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button onClick={() => toggleCompare(tool)} className="bg-white dark:bg-black hover:bg-gray-50 border border-gray-200 dark:border-white/20 text-xs font-bold py-3 rounded-xl transition-colors text-[#1A1A1A] dark:text-white">Compare</button>
                    <button onClick={() => { setSelectedTool(tool); setIsAdoptionOpen(true); }} className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20">Test Demo <Zap className="w-3 h-3" /></button>
                  </div>
                </div>
            ))}
          </div>

          {/* Floating Compare */}
          {compareList.length > 0 && (
             <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 border border-white/10 w-[90%] md:w-auto justify-between md:justify-start">
                <span className="font-bold text-sm">{compareList.length} Selected</span>
                <button className="text-sm font-bold hover:text-[#0066FF]">Compare Now</button>
                <button onClick={() => setCompareList([])}><X className="w-4 h-4" /></button>
             </div>
          )}
        </div>

        <AdoptionModal isOpen={isAdoptionOpen} onClose={() => setIsAdoptionOpen(false)} toolName={selectedTool?.name} demoUrl={selectedTool?.demo_video_url} />
      </main>
    </div>
  );
}