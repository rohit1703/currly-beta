'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/utils/supabase';
import { Zap, MapPin, Clock, ToggleLeft, ToggleRight, Search, Loader2, Users, LayoutGrid } from 'lucide-react';
import { DiscoveryCard } from '@/components/DiscoveryCard';
import AdoptionModal from '@/components/AdoptionModal';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);
  const [indiaOnly, setIndiaOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // ADOPTION STATE
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

  const handleTestDemo = (tool: any) => {
    setSelectedTool(tool);
    setIsAdoptionOpen(true);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans transition-colors duration-300">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className="w-64 border-r border-border p-6 flex flex-col gap-8 hidden md:flex bg-card/50">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-[#D4E6B5] to-[#A3C968] rounded flex items-center justify-center text-black font-bold">C</div>
          <span className="font-bold tracking-tight text-xl text-foreground">currly</span>
        </Link>

        <div className="space-y-1">
          {/* NAVIGATION SECTION */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Platform</p>
          
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-accent text-foreground font-medium">
            <LayoutGrid className="w-4 h-4" />
            Discovery
          </button>
          
          <Link href="/feed" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
            <Users className="w-4 h-4" />
            Community
          </Link>
        </div>

        <div className="space-y-6 mt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">Filters</p>
          <div>
            <label className="flex items-center justify-between cursor-pointer group p-2 hover:bg-accent/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">🇮🇳 India Only</span>
              <button onClick={() => setIndiaOnly(!indiaOnly)}>
                {indiaOnly ? <ToggleRight className="text-primary w-8 h-8 transition-all" /> : <ToggleLeft className="text-muted-foreground w-8 h-8 transition-all" />}
              </button>
            </label>
          </div>
          <div>
             <label className="flex items-center justify-between cursor-pointer group p-2 hover:bg-accent/50 rounded-lg transition-colors">
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors font-medium">🎡 Discovery Mode</span>
              <button onClick={() => setIsDiscoveryMode(!isDiscoveryMode)}>
                {isDiscoveryMode ? <ToggleRight className="text-primary w-8 h-8 transition-all" /> : <ToggleLeft className="text-muted-foreground w-8 h-8 transition-all" />}
              </button>
            </label>
          </div>
        </div>
        
        <div className="mt-auto bg-card p-4 rounded-xl border border-border shadow-sm">
           <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Database Status</p>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
             <span className="text-sm font-bold text-foreground">1,102 Tools Live</span>
           </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-background">
        
        <header className="h-20 border-b border-border flex items-center justify-between px-8 gap-4 bg-background/80 backdrop-blur z-10">
          <div className="flex items-center gap-4 flex-1">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search for 'Video AI' or 'CRM'..." 
              className="bg-transparent border-none outline-none text-lg text-foreground w-full placeholder:text-muted-foreground font-light"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <ThemeToggle /> 
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto p-8 ${isDiscoveryMode ? 'snap-y snap-mandatory scroll-smooth' : ''}`}>
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
              <p className="animate-pulse">Syncing with Supabase Brain...</p>
            </div>
          ) : (
            <>
             {filteredTools.length === 0 ? (
               <div className="text-center text-muted-foreground mt-20">
                 <p>No tools found matching "{searchQuery}"</p>
                 <button onClick={() => setSearchQuery('')} className="text-primary underline mt-2">Clear Search</button>
               </div>
             ) : (
                <div className={isDiscoveryMode ? "space-y-32 pb-32" : "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-32"}>
                  {filteredTools.map((tool, index) => (
                    isDiscoveryMode ? (
                      <div key={tool.id} className="snap-center h-full flex flex-col justify-center">
                        <DiscoveryCard tool={{
                            name: tool.name,
                            tagline: tool.tagline || tool.description?.substring(0, 80) + "...",
                            price: tool.pricing_type === 'free' ? 'Free' : `$${tool.starting_price_usd || '29'}`,
                            logo: tool.logo_url,
                            color: index % 2 === 0 ? '#D4E6B5' : '#E6B578'
                        }} index={index} />
                      </div>
                    ) : (
                      <div key={tool.id} className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-foreground font-bold shadow-inner border border-border overflow-hidden">
                              {tool.logo_url ? <img src={tool.logo_url} alt={tool.name} className="w-full h-full object-cover"/> : tool.name[0]}
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors truncate max-w-[160px]">{tool.name}</h3>
                              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                                {tool.is_india_based && <span className="text-orange-500 flex items-center gap-1 font-medium"><MapPin className="w-3 h-3" /> India</span>}
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tool.setup_time_minutes || 15}m</span>
                              </div>
                            </div>
                          </div>
                          <span className={`text-xs font-mono px-2.5 py-1 rounded border ${tool.pricing_type === 'free' ? 'bg-primary/10 text-primary-darker border-primary/20' : 'bg-secondary text-muted-foreground border-border'}`}>
                            {tool.pricing_type === 'free' ? 'FREE' : `$${tool.starting_price_usd || 'PAID'}`}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2 h-10 leading-relaxed">
                          {tool.description || "AI-powered tool for efficiency and automation."}
                        </p>
                        <div className="grid grid-cols-2 gap-3 mt-auto">
                          <button className="bg-secondary hover:bg-secondary/80 text-xs font-medium py-2.5 rounded-lg text-foreground border border-border transition-colors">Compare</button>
                          <button 
                            onClick={() => handleTestDemo(tool)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                          >
                            <Zap className="w-3.5 h-3.5" /> Test Demo
                          </button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
             )}
            </>
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
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-foreground">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}