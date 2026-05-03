'use client';

import React, { useState, useEffect, useTransition, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ToolLogo from '@/components/ToolLogo';
import {
  Search, CheckSquare, Square, X, MapPin,
  Clock, Loader2, LayoutGrid, ExternalLink, Star,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserNav from '@/components/UserNav';
import MobileMenu from '@/components/MobileMenu';
import AISearchSummary from '@/components/AISearchSummary';
import { motion, AnimatePresence } from 'framer-motion';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import { logToolClick, loadMoreTools } from '@/actions/search';
import CompareModal from '@/components/CompareModal';
import SaveButton from '@/components/SaveButton';
import { OutcomePrompt } from '@/components/OutcomePrompt';
import { getCategoryIcon, categoryToSlug } from '@/lib/categories';
import type { SearchIntent } from '@/actions/ai-search';


export default function DashboardClient({
  initialTools,
  searchQuery,
  searchIntent = null,
  allCategories = [],
  totalCount = 0,
  isLoggedIn = false,
  userCollections = [],
  savedToolMap = {},
  initialCategory = '',
}: {
  initialTools: any[];
  searchQuery: string;
  searchIntent?: SearchIntent | null;
  allCategories?: { name: string; count: number }[];
  totalCount?: number;
  isLoggedIn?: boolean;
  userCollections?: { id: string; name: string }[];
  savedToolMap?: Record<string, string[]>;
  initialCategory?: string;
}) {
  const router = useRouter();
  // --- STATE ---
  const [tools, setTools] = useState(initialTools);

  // FILTER STATE
  const [indiaOnly, setIndiaOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  // initialCategory comes from ?category= URL param (server-side filter already applied)
  const [categoryFilter, setCategoryFilter] = useState(initialCategory || 'All');

  // INTERACTION STATE
  const [compareList, setCompareList] = useState<any[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'browse'>('search');
  const [isSearching, setIsSearching] = useState(false);

  // PAGINATION
  const [hasMore, setHasMore] = useState(initialTools.length >= 50);
  const [isLoadingMore, startLoadMore] = useTransition();

  // Ref to block re-renders while user is hovering a card
  const hoveringRef = useRef(false);
  // Ref to the sidebar category scroll container for auto-scroll on selection
  const categoryListRef = useRef<HTMLDivElement>(null);

  // Sync tools when server sends new results (e.g. after navigation)
  useEffect(() => {
    setTools(initialTools);
    setIsSearching(false);
  }, [initialTools]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const input = form.elements.namedItem('q') as HTMLInputElement;
    // Only navigate if there is a query — let the native form action handle it
    if (!input?.value?.trim()) {
      e.preventDefault();
      return;
    }
    setIsSearching(true);
    // Let the native form GET action proceed so Enter and click both work
  };

  // Navigate to /dashboard?category=X so the server fetches the full category set
  const selectCategory = useCallback((name: string) => {
    if (name === 'All') {
      router.push('/dashboard');
    } else {
      router.push(`/dashboard?category=${encodeURIComponent(name)}`);
    }
  }, [router]);

  // Scroll the sidebar category list so the selected item is visible
  const scrollCategoryIntoView = useCallback((name: string) => {
    if (!categoryListRef.current) return;
    const item = categoryListRef.current.querySelector(`[data-cat="${CSS.escape(name)}"]`);
    if (item) (item as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, []);

  // --- FILTERING ---
  // Client-side filtering (Applied to the CURRENT tools state)
  const filteredTools = tools.filter(tool => {
    if (indiaOnly && !tool.is_india_based) return false;
    
    if (categoryFilter !== 'All') {
      const matchesCat = tool.main_category?.toLowerCase() === categoryFilter.toLowerCase();
      if (!matchesCat) return false;
    }

    if (priceFilter.length > 0) {
      const m = tool.pricing_model?.toLowerCase() || '';
      const matches = priceFilter.some(p => {
        if (p === 'Free') return m === 'free';
        if (p === 'Freemium') return m.includes('freemium');
        if (p === 'Paid') return m === 'paid' || m === 'saas' || m === 'api-based';
        if (p === 'Open Source') return m.includes('open source');
        return false;
      });
      if (!matches) return false;
    }

    return true;
  });

  // --- HELPERS ---
  const getLogo = (tool: any) => tool.image_url || null;

  const toggleCompare = (tool: any) => {
    if (compareList.find(t => t.id === tool.id)) {
      setCompareList(compareList.filter(t => t.id !== tool.id));
    } else {
      if (compareList.length < 3) setCompareList([...compareList, tool]);
      else alert("You can only compare up to 3 tools.");
    }
  };

  const handleLoadMore = () => {
    startLoadMore(async () => {
      const more = await loadMoreTools(tools.length);
      setTools(prev => [...prev, ...more]);
      setHasMore(more.length >= 24);
    });
  };

  // --- SIDEBAR COMPONENT ---
  const SidebarContent = () => (
    <div className="space-y-6">

      {/* Results count */}
      <div className="p-4 bg-[#0066FF]/5 dark:bg-blue-900/10 rounded-2xl border border-[#0066FF]/10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <div className="text-xs text-[#0066FF] font-bold uppercase tracking-wider">Results</div>
        </div>
        <div className="text-lg font-bold text-[#1A1A1A] dark:text-white">
          {filteredTools.length.toLocaleString()} <span className="text-sm font-normal text-gray-400">of {totalCount.toLocaleString()}</span>
        </div>
        {(indiaOnly || priceFilter.length > 0 || categoryFilter !== 'All') && (
          <button onClick={() => { selectCategory('All'); setIndiaOnly(false); setPriceFilter([]); }}
            className="text-xs text-[#0066FF] hover:underline mt-1">Clear filters</button>
        )}
      </div>

      {/* Category */}
      <div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Category</div>
        <div ref={categoryListRef} className="space-y-0.5 max-h-52 overflow-y-auto pr-1">
          <div
            data-cat="All"
            onClick={() => selectCategory('All')}
            className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm transition-colors ${categoryFilter === 'All' ? 'bg-[#0066FF] text-white' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}
          >
            <span className="font-medium">All categories</span>
            <span className={`text-xs ${categoryFilter === 'All' ? 'text-white/70' : 'text-gray-400'}`}>{totalCount}</span>
          </div>
          {allCategories.map(cat => (
            <div
              key={cat.name}
              data-cat={cat.name}
              onClick={() => {
                selectCategory(cat.name === categoryFilter ? 'All' : cat.name);
                scrollCategoryIntoView(cat.name);
              }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer text-sm transition-colors ${categoryFilter === cat.name ? 'bg-[#0066FF] text-white' : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'}`}
            >
              <span className="truncate">{cat.name}</span>
              <span className={`text-xs shrink-0 ml-2 ${categoryFilter === cat.name ? 'text-white/70' : 'text-gray-400'}`}>{cat.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Pricing</div>
        <div className="space-y-0.5">
          {['Free', 'Freemium', 'Paid', 'Open Source'].map(type => (
            <div
              key={type}
              onClick={() => setPriceFilter(prev =>
                prev.includes(type) ? prev.filter(p => p !== type) : [...prev, type]
              )}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl cursor-pointer"
            >
              {priceFilter.includes(type)
                ? <CheckSquare className="w-4 h-4 text-[#0066FF] shrink-0" />
                : <Square className="w-4 h-4 text-gray-300 shrink-0" />}
              <span className={`text-sm ${priceFilter.includes(type) ? 'text-[#0066FF] font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Region */}
      <div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Region</div>
        <label className="flex items-center justify-between cursor-pointer group py-3 px-4 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-[#0066FF]/30 transition-all">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">🇮🇳 India Made</span>
          <button
            onClick={() => setIndiaOnly(!indiaOnly)}
            className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${indiaOnly ? 'bg-[#0066FF]' : 'bg-gray-200 dark:bg-white/10'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${indiaOnly ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </label>
      </div>

    </div>
  );

  // --- RENDER ---
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
          <div className="flex justify-center gap-1 mb-2 text-sm font-medium w-full">
             <button
               onClick={() => setActiveTab('search')}
               className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors min-h-[44px] ${activeTab === 'search' ? 'border-[#0066FF] text-[#0066FF]' : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'}`}
             >
               <Search className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">Search Tools</span>
             </button>
             <button
               onClick={() => setActiveTab('browse')}
               className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors min-h-[44px] ${activeTab === 'browse' ? 'border-[#0066FF] text-[#0066FF]' : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'}`}
             >
               <LayoutGrid className="w-4 h-4 shrink-0" /> <span className="whitespace-nowrap">Browse Categories</span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth">
          {isLoggedIn && <OutcomePrompt />}

          {/* --- SEARCH TAB CONTENT --- */}
          {activeTab === 'search' && (
            <>
              <div className="max-w-2xl mx-auto relative mb-10 mt-4">
                 <SearchAutocomplete
                   defaultValue={searchQuery}
                   placeholder="Describe your problem (e.g. 'I need to automate invoices')..."
                   onSubmit={handleSearchSubmit}
                 />
                 
                 {/* LEGACY LOADING (Full screen blocking) */}
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
                           <span>Searching...</span>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>

              </div>

              {/* #4 — Active filter chips */}
              {(indiaOnly || priceFilter.length > 0 || categoryFilter !== 'All') && !isSearching && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {categoryFilter !== 'All' && (
                    <button
                      onClick={() => selectCategory('All')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20 hover:bg-[#0066FF]/20 transition-colors"
                    >
                      {categoryFilter} <X className="w-3 h-3" />
                    </button>
                  )}
                  {indiaOnly && (
                    <button
                      onClick={() => setIndiaOnly(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition-colors"
                    >
                      🇮🇳 India Only <X className="w-3 h-3" />
                    </button>
                  )}
                  {priceFilter.map(p => (
                    <button
                      key={p}
                      onClick={() => setPriceFilter(priceFilter.filter(x => x !== p))}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-200 transition-colors"
                    >
                      {p} <X className="w-3 h-3" />
                    </button>
                  ))}
                  <button
                    onClick={() => { selectCategory('All'); setIndiaOnly(false); setPriceFilter([]); }}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-2 py-1.5 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {!isSearching && searchQuery && searchIntent?.summary && (
                <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-gray-400">Interpreted as:</span>
                  <span className="font-medium text-[#0066FF]">{searchIntent.summary}</span>
                  {searchIntent.category && (
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-[#0066FF] rounded-full text-xs font-medium border border-blue-100 dark:border-blue-800">
                      {searchIntent.category}
                    </span>
                  )}
                  {searchIntent.pricing?.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-100 dark:border-green-800 capitalize">
                      {p}
                    </span>
                  ))}
                </div>
              )}

              {!isSearching && searchQuery && (
                 <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                   <AISearchSummary query={searchQuery} tools={filteredTools} />
                 </div>
              )}

              {!isSearching && filteredTools.length === 0 && searchQuery && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No tools found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                    Try a different search — describe what you want to do, like <span className="text-[#0066FF] font-medium">"automate invoices"</span> or <span className="text-[#0066FF] font-medium">"edit videos"</span>.
                  </p>
                </div>
              )}

              {!isSearching && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                  {filteredTools.map((tool) => {
                      const logo = getLogo(tool);
                      const isSelected = compareList.find(t => t.id === tool.id);
                      const isNew = tool.launch_date
                        ? (Date.now() - new Date(tool.launch_date).getTime()) < 7 * 24 * 60 * 60 * 1000
                        : false;
                      const isFeatured = !!tool.is_featured;
                      return (
                        <div
                          key={tool.id}
                          onClick={() => {
                            logToolClick(tool.id, searchQuery);
                            router.push(`/tool/${tool.slug}${searchQuery ? `?from=${encodeURIComponent(searchQuery)}` : ''}`);
                          }}
                          onPointerEnter={() => { hoveringRef.current = true; }}
                          onPointerLeave={() => { hoveringRef.current = false; }}
                          className={`group bg-white dark:bg-[#111] border ${isSelected ? 'border-[#0066FF] ring-1 ring-[#0066FF]' : 'border-gray-100 dark:border-white/5'} rounded-[2rem] p-6 md:p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col relative cursor-pointer`}>

                          <div className="absolute top-5 left-5 flex gap-1.5 z-10">
                            {isNew && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white tracking-wide">
                                NEW
                              </span>
                            )}
                            {isFeatured && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-white tracking-wide flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5" /> PICK
                              </span>
                            )}
                          </div>

                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className="w-14 h-14 bg-[#FDFBF7] dark:bg-black rounded-2xl p-2 flex items-center justify-center border border-gray-100 dark:border-white/5 shadow-inner overflow-hidden">
                              <ToolLogo src={logo} name={tool.name} size={56} className="w-full h-full object-contain rounded-lg" />
                            </div>
                            <div className="flex items-center gap-2">
                              {/* stopPropagation so saving doesn't trigger card navigation */}
                              <div onClick={(e) => e.stopPropagation()}>
                                <SaveButton
                                  toolId={tool.id}
                                  initialSaved={(savedToolMap[tool.id]?.length ?? 0) > 0}
                                  isLoggedIn={isLoggedIn}
                                  userCollections={isLoggedIn ? userCollections : undefined}
                                  toolCollectionIds={isLoggedIn ? (savedToolMap[tool.id] ?? []) : undefined}
                                  compact
                                />
                              </div>
                              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border tracking-wide ${tool.pricing_model?.toLowerCase().includes('free') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 dark:bg-white/10 border-gray-200 dark:border-white/5 text-gray-500'}`}>
                                {tool.pricing_model || 'PAID'}
                              </span>
                            </div>
                          </div>

                          <h3 className="font-bold text-lg md:text-xl mb-2 text-[#1A1A1A] dark:text-white group-hover:text-[#0066FF] transition-colors relative z-10">{tool.name}</h3>
                          <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-4 relative z-10">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 15m setup</span>
                            {tool.is_india_based && <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-0.5 rounded"><MapPin className="w-3 h-3" /> India</span>}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8 line-clamp-2 leading-relaxed flex-grow relative z-10">{tool.description}</p>
                          <div className="grid grid-cols-2 gap-3 mt-auto relative z-10">
                            <button onClick={(e) => { e.stopPropagation(); toggleCompare(tool); }} className="bg-white dark:bg-black hover:bg-gray-50 border border-gray-200 dark:border-white/20 text-xs font-bold py-3 rounded-xl transition-colors text-[#1A1A1A] dark:text-white">Compare</button>
                            <a href={tool.website || '#'} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.stopPropagation(); logToolClick(tool.id, searchQuery); }} className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20">Visit <ExternalLink className="w-3 h-3" /></a>
                          </div>
                        </div>
                      );
                  })}
                </div>
              )}

              {!isSearching && !searchQuery && hasMore && filteredTools.length > 0 && (
                <div className="text-center pb-32 pt-4">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-full font-bold text-sm hover:border-[#0066FF] hover:text-[#0066FF] transition-colors disabled:opacity-60 flex items-center gap-2 mx-auto"
                  >
                    {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoadingMore ? 'Loading...' : 'Load more tools'}
                  </button>
                </div>
              )}
            </>
          )}

          {/* --- BROWSE TAB CONTENT --- */}
          {activeTab === 'browse' && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
               <h2 className="text-2xl font-bold mb-8 text-center text-[#1A1A1A] dark:text-white">Browse by Category</h2>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {allCategories.map((cat) => {
                    const Icon = getCategoryIcon(cat.name);
                    return (
                      <button
                        key={cat.name}
                        onClick={() => router.push(`/category/${categoryToSlug(cat.name)}`)}
                        className="flex flex-col items-center justify-center p-6 rounded-[2rem] bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 hover:border-[#0066FF] hover:shadow-lg transition-all group text-center"
                      >
                        <div className="w-12 h-12 bg-blue-50 dark:bg-white/5 rounded-2xl flex items-center justify-center text-[#0066FF] mb-3 group-hover:scale-110 transition-transform shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1 leading-tight">{cat.name}</h3>
                        <p className="text-xs text-gray-500">{cat.count} tools</p>
                      </button>
                    );
                  })}
               </div>
            </div>
          )}

          {compareList.length > 0 && (
             <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-10 border border-white/10 w-[90%] md:w-auto justify-between md:justify-start">
                <span className="font-bold text-sm">{compareList.length} of 3 selected</span>
                <button
                  onClick={() => setIsCompareOpen(true)}
                  className="text-sm font-bold hover:text-[#0066FF] transition-colors"
                >
                  Compare Now →
                </button>
                <button onClick={() => setCompareList([])}><X className="w-4 h-4" /></button>
             </div>
          )}

          {isCompareOpen && compareList.length > 0 && (
            <CompareModal tools={compareList} onClose={() => setIsCompareOpen(false)} searchQuery={searchQuery} />
          )}
        </div>
      </main>
    </div>
  );
}