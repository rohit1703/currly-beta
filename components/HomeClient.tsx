'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Code, PenTool, Globe, Zap, LayoutGrid } from 'lucide-react';
import ToolCard from '@/components/ToolCardItem'; // Using your card component

// Assuming these exist. If not, remove the imports and the components below.
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';
import UserNav from '@/components/UserNav';
import { useCountUp } from '@/hooks/useCountUp'; // If this hook is missing, remove the StatItem usage

function StatItem({ value, label, suffix = "+" }: { value: number, label: string, suffix?: string }) {
  // Simple fallback if hook is missing
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm text-center hover:shadow-md transition-all"
    >
      <div className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-2 flex justify-center">
        <span>{value}</span>{suffix}
      </div>
      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

// Receive tools as a prop
export default function HomeClient({ tools }: { tools: any[] }) {
  const [query, setQuery] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/dashboard?q=${encodeURIComponent(query)}`);
  };

  const categories = [
    { name: "Marketing & SEO", icon: Zap, tools: "120+", slug: "marketing" },
    { name: "Development", icon: Code, tools: "85+", slug: "coding" },
    { name: "Design & Video", icon: PenTool, tools: "94+", slug: "video" },
    { name: "Productivity", icon: LayoutGrid, tools: "200+", slug: "productivity" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* --- NAV --- */}
      <nav className={`fixed top-0 w-full z-50 px-6 py-4 transition-all ${scrollY > 50 ? 'bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
             {/* If Logo is missing, just use text */}
            <span className="font-bold text-xl">Currly</span>
          </Link>
          <div className="flex items-center gap-4">
             {/* Comment out if components are missing */}
            {/* <ThemeToggle /> */}
            {/* <UserNav /> */}
            <Link href="/dashboard" className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="pt-40 pb-20 px-4 text-center max-w-7xl mx-auto relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/5 dark:bg-white/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-white/10 rounded-full mb-8 border border-blue-100 dark:border-white/10">
          <Globe className="w-4 h-4 text-[#0066FF] dark:text-white" />
          <span className="text-xs font-bold uppercase tracking-wide text-[#0066FF] dark:text-white">The World's First AI Tools Search Engine</span>
        </motion.div>

        <h1 className="relative text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.1] tracking-tighter text-gray-900 dark:text-white">
          Discover the Perfect <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-cyan-500">AI Tool in Seconds</span>
        </h1>

        <p className="relative text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
          <span className="text-gray-900 dark:text-white font-bold">712+ tools</span> curated by experts.
        </p>

        {/* SEARCH */}
        <div className="relative max-w-3xl mx-auto mb-24 z-10">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#0066FF] to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
            <div className="relative flex items-center gap-4 bg-white dark:bg-[#111] rounded-2xl p-3 shadow-2xl border border-gray-200 dark:border-white/10">
              <Search className="w-6 h-6 text-gray-400 ml-3" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describe your problem (e.g. 'I need to automate invoices')..."
                className="flex-1 text-lg bg-transparent border-none focus:ring-0 outline-none h-12 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button type="submit" className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2">
                Search <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* --- LIVE DATA GRID (Merged Here) --- */}
        <div className="relative z-10 mb-24 text-left">
           <div className="flex items-center justify-between mb-8 px-4">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Added</h2>
             <span className="text-sm text-gray-500">{tools?.length || 0} tools indexed</span>
           </div>
           
           <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4">
            {tools?.map((tool) => (
              <ToolCard 
                key={tool.id}
                title={tool.name || 'Untitled'}
                description={tool.description || ''}
                category={tool.main_category || 'General'}
                pricing={tool.pricing_model || 'Unknown'} 
                image={tool.image_url || ''}
                url={tool.website || '#'}
                slug={tool.slug}
              />
            ))}
           </div>
        </div>

        {/* STATS */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 z-10 px-4">
           <StatItem value={712} label="AI Tools Curated" />
           <StatItem value={420} label="Active Members" />
           <StatItem value={15} label="Categories" />
        </div>
      </div>
    </div>
  );
}