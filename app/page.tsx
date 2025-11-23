'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, Sparkles, Users, ArrowRight, Shield, Brain, Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCountUp } from '@/hooks/useCountUp'; // IMPORT HOOK

// Sub-component for animated numbers
function StatItem({ value, label, suffix = "+" }: { value: number, label: string, suffix?: string }) {
  const count = useCountUp(value);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm text-center hover:shadow-md transition-all"
    >
      <div className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-2 flex justify-center">
        <motion.span>{count}</motion.span>{suffix}
      </div>
      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

export default function Home() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { scrollY } = useScroll();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push(`/dashboard?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-white font-sans transition-colors duration-500">
      
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold text-lg">C</div>
            <span className="text-xl font-bold tracking-tight">currly</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium hover:opacity-70">Login</Link>
            <Link href="/dashboard" className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full text-sm font-bold hover:opacity-80 transition-all">Sign up</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="pt-40 pb-20 px-4 text-center max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-full mb-8">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wide">India's First AI-Powered Platform</span>
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-extrabold mb-8 leading-tight tracking-tighter">
          Discover the Perfect <br/> AI Tool in Seconds
        </h1>

        <p className="text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          500+ tools curated by experts. Powered by AI. <br/> Validated by 350+ professionals.
        </p>

        {/* SEARCH */}
        <div className="max-w-3xl mx-auto mb-24">
          <form onSubmit={handleSearch} className="relative group">
            <div className="relative flex items-center gap-4 bg-white dark:bg-[#111] rounded-2xl p-3 shadow-2xl border border-gray-200 dark:border-white/10 transition-transform hover:scale-[1.01]">
              <Search className="w-6 h-6 text-gray-400 ml-3" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try: 'Best AI writing tool for content creators'"
                className="flex-1 text-lg bg-transparent border-none focus:ring-0 outline-none h-12"
              />
              <button type="submit" className="bg-[#0066FF] text-white px-8 py-4 rounded-xl font-bold transition-all hover:bg-blue-600 flex items-center gap-2">
                Search <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* ANIMATED STATS (The Fix) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatItem value={500} label="AI Tools Curated" />
           <StatItem value={350} label="Community Members" />
           <StatItem value={15} label="Tool Categories" />
        </div>
      </div>
    </div>
  );
}