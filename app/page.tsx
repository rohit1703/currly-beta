'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, Sparkles, Users, ArrowRight, Shield, Brain, Zap, Star } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCountUp } from '@/hooks/useCountUp';
import UserNav from '@/components/UserNav'; // IMPORTED

// Animated Number Component
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

  // V5 CONTENT
  const stats = [
    { label: "Curated Tools", value: 1102 },
    { label: "Active Members", value: 420 },
    { label: "Categories", value: 15 },
  ];

  const testimonials = [
    { 
      quote: "Saved me 10 hours of research. Currly's AI gave me 3 perfect options in seconds.", 
      author: "Priya Malhotra", 
      role: "Founder @ TechStart" 
    },
    { 
      quote: "Finally, unbiased recommendations. No affiliate links, just honest data.", 
      author: "Arjun Kumar", 
      role: "Developer" 
    },
    { 
      quote: "The community makes it special. Real discussions, real value.", 
      author: "Sneha Reddy", 
      role: "Marketing Manager" 
    },
    { 
      quote: "India-first pricing and tools. Exactly what I needed.", 
      author: "Rahul Mehta", 
      role: "Content Creator" 
    }
  ];

  const features = [
    { 
      icon: Shield, 
      title: "Expert Curation", 
      desc: "Every tool is personally tested by founders Rohit & Ashish. No auto-generated junk." 
    },
    { 
      icon: Brain, 
      title: "Zero Bias", 
      desc: "We don't earn commissions from recommendations. Our only metric is your success." 
    },
    { 
      icon: Users, 
      title: "Community Validated", 
      desc: "420+ professionals test and validate tools daily in our exclusive community." 
    },
  ];

  const marquee = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* --- NAV --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-[#0066FF] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(0,102,255,0.3)] group-hover:scale-110 transition-transform">C</div>
            <span className="text-xl font-bold tracking-tight text-[#1A1A1A] dark:text-white">currly</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* REPLACED LOGIN LINK WITH USERNAV */}
            <UserNav />
            <Link href="/dashboard" className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20">
              Join Beta
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="pt-40 pb-20 px-4 text-center max-w-7xl mx-auto relative">
        {/* Background Blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/5 dark:bg-white/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-white/10 rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-white" />
          <span className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-white">India's First AI-Powered Platform</span>
        </motion.div>

        <h1 className="relative text-6xl md:text-8xl font-extrabold mb-8 leading-tight tracking-tighter text-gray-900 dark:text-white">
          Discover the Perfect <br/> AI Tool in Seconds
        </h1>

        <p className="relative text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          500+ tools curated by experts. Powered by AI. <br/> Validated by 420+ professionals.
        </p>

        {/* SEARCH */}
        <div className="relative max-w-3xl mx-auto mb-24 z-10">
          <form onSubmit={handleSearch} className="relative group">
            <div className="relative flex items-center gap-4 bg-white dark:bg-[#111] rounded-2xl p-3 shadow-2xl border border-gray-200 dark:border-white/10 transition-transform hover:scale-[1.01]">
              <Search className="w-6 h-6 text-gray-400 ml-3" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try: 'Best AI writing tool for content creators'"
                className="flex-1 text-lg bg-transparent border-none focus:ring-0 outline-none h-12 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button type="submit" className="bg-[#0066FF] text-white px-8 py-4 rounded-xl font-bold transition-all hover:bg-blue-600 flex items-center gap-2">
                Search <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* ANIMATED STATS */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
           <StatItem value={stats[0].value} label={stats[0].label} />
           <StatItem value={stats[1].value} label={stats[1].label} />
           <StatItem value={stats[2].value} label={stats[2].label} />
        </div>
      </div>

      {/* --- FEATURES / WHY US --- */}
      <div className="py-24 bg-white dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Why professionals trust Currly.</h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg">We fixed tool discovery by adding the one thing missing: <span className="text-[#0066FF] font-bold">Truth.</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((f, i) => (
                    <div key={i} className="bg-neutral-50 dark:bg-[#111] p-10 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-blue-200 transition-colors">
                        <div className="w-14 h-14 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-[#0066FF] shadow-sm">
                            <f.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{f.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* --- TESTIMONIALS --- */}
      <div className="py-24 overflow-hidden relative bg-neutral-50 dark:bg-black">
         <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Trusted by 420+ Builders</h2>
         </div>
         
         {/* Fade Edges */}
         <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-neutral-50 dark:from-black to-transparent z-20 pointer-events-none"></div>
         <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-neutral-50 dark:from-black to-transparent z-20 pointer-events-none"></div>
         
         <div className="flex w-max gap-8 animate-scroll hover:[animation-play-state:paused]">
            {marquee.map((t, i) => (
                <div key={i} className="w-[400px] flex-shrink-0 bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm">
                    <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed text-lg">"{t.quote}"</p>
                    <div className="flex items-center gap-3 border-t border-gray-100 dark:border-white/10 pt-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xs">{t.author[0]}</div>
                        <div>
                            <div className="font-bold text-sm text-gray-900 dark:text-white">{t.author}</div>
                            <div className="text-xs text-gray-500">{t.role}</div>
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </div>

      {/* --- FINAL CTA --- */}
      <div className="py-24 px-4 text-center bg-white dark:bg-[#050505]">
         <div className="max-w-5xl mx-auto bg-[#0066FF] rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-white shadow-2xl shadow-blue-900/50">
            <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Stop searching.<br/>Start building.</h2>
                <p className="text-blue-100 text-xl mb-12 max-w-xl mx-auto">Join the 420+ professionals who found their stack on Currly.</p>
                <div className="flex justify-center">
                    <Link href="/dashboard" className="bg-white text-[#0066FF] px-12 py-5 rounded-2xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-3 text-lg shadow-xl">
                        Start Discovery <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
         </div>
      </div>

    </div>
  );
}