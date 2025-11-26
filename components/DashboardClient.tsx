'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// FIX: Added missing icons (Code, PenTool, BarChart3, MessageSquare, Edit) to imports
import { Search, CheckSquare, Square, X, ArrowRight, Filter, Zap, MapPin, Clock, Loader2, Globe, Sparkles, LayoutGrid, Code, PenTool, BarChart3, MessageSquare, Edit } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserNav from '@/components/UserNav';
import MobileMenu from '@/components/MobileMenu';
import ToolCard from '@/components/ToolCardItem';
import AISearchSummary from '@/components/AISearchSummary';
import AdoptionModal from '@/components/AdoptionModal';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardClient({ 
  initialTools, 
  searchQuery 
}: { 
  initialTools: any[], 
  searchQuery: string 
}) {
  // FILTER STATE
  const [indiaOnly, setIndiaOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // INTERACTION STATE
  const [compareList, setCompareList] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [isAdoptionOpen, setIsAdoptionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'browse'>('search');

  // LOADING ANIMATION STATE
  const [isSearching, setIsSearching] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingTexts = ["Analyzing intent...", "Vectorizing query...", "Scanning 1,700+ tools...", "Ranking by relevance..."];

  // Cycle through loading texts
  useEffect(() => {
    if (isSearching) {
      const interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingTexts.length);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isSearching]);

  // Stop loading when new data arrives (initialTools changes)
  useEffect(() => {
    setIsSearching(false);
  }, [initialTools]);

  const handleSearchSubmit = () => {
    // Trigger visual loading
    setIsSearching(true);
  };

  // Client-side filtering
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

  const toggleCompare = (tool: any) => {
    if (compareList.find(t => t.id === tool.id)) {
      setCompareList(compareList.filter(t => t.id !== tool.id));
    } else {
      if (compareList.length < 3) setCompareList([...compareList, tool]);
      else alert("You can only compare up to 3 tools.");
    }
  };

  // REUSABLE SIDEBAR CONTENT
  const SidebarContent = () => (
    <div className="space-y-8">
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
      
      <div className="mt-8 p-5 bg-[#0066FF]/5 dark:bg-blue-900/10 rounded-2xl border border-[#0066FF]/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="text-xs text-[#0066FF] font-bold uppercase tracking-wider">Live Status</div>
          </div>
          <div className="text-lg font-bold text-[#1A1A1A] dark:text-white">1,702 Tools</div>
       </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F5F5F7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans transition-colors duration-500">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 border-r border-gray-200/50 dark:border-white/10 p-6 flex flex-col gap-8 hidden md:flex bg-white/50 dark:bg-[#0A0A0A] backdrop-blur-xl overflow-y-auto">
        <Link href="/">
          <Logo />
        </Link>
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-[#F5F5F7] dark:bg-[#050505]">
        
        {/* HEADER */}
        <header className="h-auto min-h-[80px] border-b border-gray-200/50 dark:border-white/10 flex flex-col justify-center px-4 md:px-10 gap-4 bg-white/60 dark:bg-[#050505]/80 backdrop-blur-xl z-10 sticky top-0 pt-4 pb-2">
          <div className="flex items-center justify-between w-full">
             {/* Mobile Menu Trigger */}
             <div className="md:hidden"><MobileMenu><SidebarContent /></MobileMenu></div>
             
             <div className="flex items-center gap-4 ml-auto">
                <ThemeToggle />
                <UserNav />
             </div>
          </div>

          {/* SEARCH TABS */}
          <div className="flex justify-center gap-6 mb-2 text-sm font-medium w-full">
             <button 
               onClick={() => setActiveTab('search')}
               className={`pb-3 border-b-2 transition-colors px-2 ${activeTab === 'search' ? 'border-[#0066FF] text-[#0066FF]' : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'}`}
             >
               <Search className="w-4 h-4 inline mr-2" /> Search Tools
             </button>
             <button 
               onClick={() => setActiveTab('browse')}
               className={`pb-3 border-b-2 transition-colors px-2 ${activeTab === 'browse' ? 'border-[#0066FF] text-[#0066FF]' : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'}`}
             >
               <LayoutGrid className="w-4 h-4 inline mr-2" /> Browse Categories
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth">
          
          {/* --- SEARCH TAB CONTENT --- */}
          {activeTab === 'search' && (
            <>
              <div className="max-w-2xl mx-auto relative mb-10 mt-4">
                 <form action="/dashboard" onSubmit={handleSearchSubmit} className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0066FF] to-cyan-500 rounded-full opacity-20 blur"></div>
                    <div className="relative flex items-center bg-white dark:bg-[#111] rounded-full shadow-lg p-1 pl-5">
                       <Search className="w-5 h-5 text-gray-400 mr-3" />
                       <input 
                         name="q"
                         type="text" 
                         defaultValue={searchQuery}
                         placeholder="Describe your problem (e.g. 'I need to automate invoices')..."
                         className="flex-1 bg-transparent border-none outline-none text-base text-[#1A1A1A] dark:text-white placeholder-gray-400 h-12"
                       />
                       <button type="submit" className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-6 py-2.5 rounded-full font-bold transition-all">
                         Search
                       </button>
                    </div>
                 </form>
                 
                 <AnimatePresence>
                   {isSearching && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }} 
                       animate={{ opacity: 1, y: 0 }} 
                       exit={{ opacity: 0 }}
                       className="absolute top-full left-0 w-full mt-4 flex justify-center"
                     >
                        <div className="bg-black/80 text-white px-6 py-3 rounded-full flex items-center gap-3 backdrop-blur-md text-sm font-medium shadow-xl">
                           <Loader2 className="w-4 h-4 animate-spin text-[#0066FF]" />
                           <motion.span
                             key={loadingStep}
                             initial={{ opacity: 0, y: 5 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: -5 }}
                           >
                             {loadingTexts[loadingStep]}
                           </motion.span>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              {!isSearching && searchQuery && (
                 <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                   <AISearchSummary query={searchQuery} tools={filteredTools} />
                 </div>
              )}

              {!isSearching && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-32">
                  {filteredTools.map((tool) => {
                      const logo = getLogo(tool);
                      const isSelected = compareList.find(t => t.id === tool.id);
                      return (
                        <div key={tool.id} className={`group bg-white dark:bg-[#111] border ${isSelected ? 'border-[#0066FF] ring-1 ring-[#0066FF]' : 'border-gray-100 dark:border-white/5'} rounded-[2rem] p-6 md:p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col`}>
                          <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-[#FDFBF7] dark:bg-black rounded-2xl p-2 flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-inner overflow-hidden">
                              <img src={logo || `https://api.dicebear.com/7.x/initials/svg?seed=${tool.name}`} className="w-full h-full object-contain rounded-lg" onError={(e) => {e.currentTarget.style.display='none'}} />
                            </div>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-wide ${tool.pricing_model?.toLowerCase().includes('free') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 dark:bg-white/10 border-gray-200 dark:border-white/5 text-gray-500'}`}>
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
                      );
                  })}
                </div>
              )}
            </>
          )}

          {/* --- BROWSE TAB CONTENT --- */}
          {activeTab === 'browse' && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
               <h2 className="text-2xl font-bold mb-8 text-center text-[#1A1A1A] dark:text-white">Browse by Category</h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Marketing", icon: Zap, count: "120+" },
                    { name: "Development", icon: Code, count: "85+" },
                    { name: "Design", icon: PenTool, count: "94+" },
                    { name: "Productivity", icon: LayoutGrid, count: "200+" },
                    { name: "Analytics", icon: BarChart3, count: "45+" },
                    { name: "Chatbots", icon: MessageSquare, count: "60+" },
                    { name: "Writing", icon: Edit, count: "70+" },
                    { name: "Video", icon: Globe, count: "50+" },
                  ].map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => {
                         setCategoryFilter(cat.name);
                         setActiveTab('search'); 
                      }}
                      className="flex flex-col items-center justify-center p-8 rounded-[2rem] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 hover:border-[#0066FF] hover:shadow-lg transition-all group"
                    >
                       <div className="w-12 h-12 bg-blue-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-[#0066FF] mb-4 group-hover:scale-110 transition-transform">
                         <cat.icon className="w-6 h-6" />
                       </div>
                       <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{cat.name}</h3>
                       <p className="text-xs text-gray-500">{cat.count}</p>
                    </button>
                  ))}
               </div>
            </div>
          )}

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