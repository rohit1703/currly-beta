'use client';

import React, { useState } from 'react';
import { Search, Layers, Terminal, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle'; 

export default function Home() {
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(searchValue)}`);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden relative flex flex-col transition-colors duration-300">
      
      {/* BACKGROUND GLOW */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#D4E6B5] opacity-[0.08] dark:opacity-[0.08] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#E6B578] opacity-[0.05] dark:opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />

      {/* --- NAVIGATION BAR --- */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 relative z-10 flex justify-between items-center">
        
        {/* LEFT: LOGO + LINKS */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-[#D4E6B5] to-[#A3C968] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(212,230,181,0.3)]">
              <span className="font-bold text-black text-lg">C</span>
            </div>
            <span className="text-xl font-bold tracking-tight">currly</span>
          </Link>

          {/* NEW COMMUNITY LINK */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/feed" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Community
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Discovery
            </Link>
          </div>
        </div>
        
        {/* RIGHT: ACTIONS GROUP */}
        <div className="flex items-center gap-6">
          <div className="border-r border-border pr-6">
             <ThemeToggle />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              Login
            </Link>
            <Link href="/dashboard" className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-lg">
              Join Beta
            </Link>
          </div>
        </div>
      </nav>

      {/* MAIN HERO */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-6 relative z-10 pb-20">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4E6B5]/10 border border-[#D4E6B5]/20 text-[#D4E6B5] text-xs font-medium mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4E6B5] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4E6B5]"></span>
          </span>
          Indexing 1,102+ AI Tools
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] max-w-4xl text-foreground">
          Don’t just find AI. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4E6B5] via-[#E6E1B5] to-[#E6B578]">
            Adopt it.
          </span>
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
          The first context-aware discovery engine. Search by use-case, compare by ROI, 
          and validate with India's fastest-growing AI community.
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-2xl relative group mb-20">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#D4E6B5] to-[#E6B578] rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
          <div className="relative bg-card border border-border rounded-xl p-2 flex items-center shadow-2xl">
            <Search className="w-5 h-5 text-muted-foreground ml-3 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="I need a CRM for a dental clinic in India under ₹5k..." 
              className="w-full bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground px-4 py-3 text-base outline-none"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button type="submit" className="hidden md:flex items-center gap-2 bg-[#D4E6B5] hover:bg-[#c2d6a1] text-black px-5 py-2.5 rounded-lg font-semibold text-sm transition-transform active:scale-95">
              Search
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full text-left opacity-90">
          <div className="col-span-1 md:col-span-2 bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-sm hover:border-[#D4E6B5]/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-[#5C7A29] dark:text-[#D4E6B5]">
                <Layers className="w-5 h-5" />
                <span className="font-semibold">Intelligent Compare</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-border">
                <span className="text-sm text-foreground">Jasper AI</span>
                <span className="text-sm text-red-500 dark:text-red-400">$49/mo</span>
              </div>
              <div className="flex items-center justify-between bg-[#D4E6B5]/20 dark:bg-[#D4E6B5]/10 p-3 rounded-lg border border-[#D4E6B5]/30">
                <span className="text-sm text-foreground">Copy.ai</span>
                <span className="text-sm text-[#5C7A29] dark:text-[#D4E6B5]">$0 (Free Tier)</span>
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-sm hover:border-[#E6B578]/50 transition-colors">
             <div className="flex items-center gap-2 text-[#B38036] dark:text-[#E6B578] mb-4">
                <Terminal className="w-5 h-5" />
                <span className="font-semibold">Live Sandbox</span>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 font-mono text-xs text-muted-foreground border border-border h-24 overflow-hidden relative">
                <p>{'>'} npm install agent-cli</p>
                <p className="text-[#B38036] dark:text-[#E6B578]">{'>'} Success</p>
                <p className="animate-pulse">_</p>
              </div>
          </div>
        </div>
      </main>
    </div>
  );
}