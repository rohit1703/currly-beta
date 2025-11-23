'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Search, Sparkles, Users, Zap, ArrowRight, Shield, Database, Star, Layers, Terminal, Play } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  
  // PARALLAX LOGIC
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]); // Background moves slower
  const y2 = useTransform(scrollY, [0, 500], [0, -150]); // Foreground moves faster

  // V6 LOGIC: Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(query)}`);
    } else {
      router.push('/dashboard');
    }
  };

  // V5 CONTENT
  const stats = [
    { label: "AI Tools Curated", value: "1,100+" },
    { label: "Community Members", value: "350+" },
    { label: "Categories", value: "15+" },
  ];

  const testimonials = [
    { quote: "Saved me 10 hours of research. Currly's AI gave me 3 perfect options.", author: "Priya M.", role: "Founder" },
    { quote: "Finally, unbiased recommendations. Just tells me what works.", author: "Arjun K.", role: "Dev" },
    { quote: "The community makes it special. Real value.", author: "Sneha R.", role: "Marketing" },
    { quote: "Found tools I didn't know existed. Expert curation shows.", author: "Vikram S.", role: "Designer" },
  ];

  // Duplicated for infinite scroll
  const marquee = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-[#0066FF] selection:text-white">
      
      {/* --- NAVIGATION --- */}
      <motion.nav 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 px-6 py-4 bg-white/70 dark:bg-[#050505]/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-[#0066FF] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(0,102,255,0.3)] group-hover:scale-110 transition-transform">C</div>
              <span className="text-xl font-bold tracking-tight text-charcoal dark:text-white">currly</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
                <Link href="/feed" className="text-sm font-medium text-gray-500 hover:text-[#0066FF] dark:text-gray-400 dark:hover:text-white transition-colors">Community</Link>
                <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-[#0066FF] dark:text-gray-400 dark:hover:text-white transition-colors">Discovery</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#0066FF]">Login</Link>
            <Link href="/dashboard" className="bg-charcoal dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all shadow-lg">
              Join Beta
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        
        {/* PARALLAX ORBS (The "Alive" Background) */}
        <motion.div style={{ y: y1 }} className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-[#0066FF]/10 rounded-full blur-[120px] pointer-events-none" />
        <motion.div style={{ y: y2 }} className="absolute top-40 -left-20 w-[600px] h-[600px] bg-[#00D9FF]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-full mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#0066FF] animate-pulse" />
            <span className="text-xs font-bold text-[#0066FF] tracking-wide">INDIA'S FIRST AI-POWERED PLATFORM</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-[0.9] tracking-tighter text-charcoal dark:text-white"
          >
            Don't just find AI. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#00D9FF] to-[#0066FF] bg-[length:200%_auto] animate-gradient">Adopt it.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            <span className="text-charcoal dark:text-white font-semibold">1,100+ tools</span> curated by experts. <br className="hidden md:block"/>
            Search by use-case, compare by ROI, and validate with pros.
          </motion.p>

          {/* SEARCH BAR (The "Magnetic" Interaction) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="max-w-3xl mx-auto mb-24"
          >
            <form onSubmit={handleSearch} className="relative group">
                {/* Glowing backdrop */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#0066FF] to-[#00D9FF] rounded-2xl opacity-20 group-hover:opacity-50 blur-xl transition duration-500"></div>
                
                <div className="relative flex items-center gap-4 bg-white dark:bg-[#0A0A0A] rounded-2xl p-3 shadow-2xl border border-gray-100 dark:border-white/10 transition-transform duration-300 group-hover:scale-[1.01]">
                    <Search className="w-6 h-6 text-gray-400 ml-3" />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="I need a CRM for a dental clinic in India..."
                        className="flex-1 text-lg bg-transparent border-none focus:ring-0 text-charcoal dark:text-white placeholder-gray-400 outline-none h-12"
                    />
                    <button type="submit" className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 active:scale-95">
                        Search <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </form>
            
            {/* Popular Tags */}
            <div className="flex flex-wrap justify-center gap-3 mt-8 text-sm">
                <span className="text-gray-400 py-1">Popular:</span>
                {['Video Editing', 'CRM', 'Chatbots', 'SEO'].map((tag) => (
                    <button key={tag} onClick={() => setQuery(tag)} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-[#0066FF]/10 hover:text-[#0066FF] transition-colors">
                        {tag}
                    </button>
                ))}
            </div>
          </motion.div>

          {/* STATS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
             {stats.map((stat, i) => (
                 <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg hover:shadow-xl transition-all"
                 >
                    <div className="text-4xl font-bold text-[#0066FF] mb-2">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
                 </motion.div>
             ))}
          </div>

        </div>
      </div>

      {/* --- BENTO GRID SECTION --- */}
      <div className="py-24 bg-white dark:bg-[#050505]">
        <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 */}
                <motion.div whileHover={{ scale: 1.02 }} className="col-span-1 md:col-span-2 bg-cream dark:bg-[#0F0F0F] p-10 rounded-[2.5rem] border border-gray-200 dark:border-white/5 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mb-6 text-[#0066FF]"><Layers /></div>
                        <h3 className="text-3xl font-bold text-charcoal dark:text-white mb-2">Intelligent Compare</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8">Stop opening 10 tabs. Compare pricing, features, and India-availability side by side.</p>
                        <div className="bg-white dark:bg-black/50 p-4 rounded-xl border border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <span className="font-medium">Jasper AI</span>
                            <span className="text-red-500">$49/mo</span>
                        </div>
                        <div className="mt-2 bg-[#0066FF]/5 p-4 rounded-xl border border-[#0066FF]/20 flex justify-between items-center">
                            <span className="font-medium text-[#0066FF]">Copy.ai</span>
                            <span className="text-[#0066FF] font-bold">$0 (Free)</span>
                        </div>
                    </div>
                </motion.div>

                {/* Card 2 */}
                <motion.div whileHover={{ scale: 1.02 }} className="col-span-1 bg-charcoal dark:bg-[#1A1A1A] p-10 rounded-[2.5rem] border border-gray-800 relative overflow-hidden text-white">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 text-[#00D9FF]"><Terminal /></div>
                        <h3 className="text-3xl font-bold mb-2">Live Sandbox</h3>
                        <p className="text-gray-400 mb-8">Test tools without signing up.</p>
                        <div className="bg-black/50 p-4 rounded-xl font-mono text-xs text-green-400 border border-white/10">
                            <p>{'>'} npm install agent</p>
                            <p className="text-white">{'>'} Verifying...</p>
                            <p>{'>'} Success <span className="animate-pulse">_</span></p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
      </div>

      {/* --- TESTIMONIAL SCROLL (Infinite) --- */}
      <div className="py-20 overflow-hidden relative">
         <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
            <h2 className="text-3xl font-bold text-charcoal dark:text-white">Trusted by Builders</h2>
         </div>
         
         {/* Fade Edges */}
         <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[var(--background)] to-transparent z-20 pointer-events-none"></div>
         <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[var(--background)] to-transparent z-20 pointer-events-none"></div>
         
         <div className="flex w-max gap-8 animate-scroll hover:[animation-play-state:paused]">
            {marquee.map((t, i) => (
                <div key={i} className="w-[350px] flex-shrink-0 bg-white dark:bg-white/5 p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 italic mb-6 leading-relaxed">"{t.quote}"</p>
                    <div className="flex items-center gap-3 border-t border-gray-100 dark:border-white/5 pt-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0066FF] to-[#00D9FF] rounded-full flex items-center justify-center text-white font-bold text-xs">{t.author[0]}</div>
                        <div>
                            <div className="font-bold text-sm text-charcoal dark:text-white">{t.author}</div>
                            <div className="text-xs text-gray-500">{t.role}</div>
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </div>

      {/* --- CTA --- */}
      <div className="py-24 px-4 text-center">
         <motion.div 
            whileHover={{ scale: 1.02 }}
            className="max-w-5xl mx-auto bg-[#0066FF] rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-white shadow-2xl shadow-blue-900/50"
         >
            <div className="relative z-10">
                <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight">Ready to upgrade?</h2>
                <p className="text-blue-100 text-xl mb-12 max-w-xl mx-auto">Join 350+ professionals using Currly to find, validate, and choose the right AI tools.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/dashboard" className="bg-white text-[#0066FF] px-10 py-5 rounded-2xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-3 text-lg">
                        Browse Database <Database className="w-5 h-5" />
                    </Link>
                    <Link href="/login" className="bg-[#0052CC] text-white px-10 py-5 rounded-2xl font-bold hover:bg-[#0042A3] transition-colors flex items-center justify-center gap-3 text-lg">
                        Join Community <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
            
            {/* Abstract Shapes */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-50%] left-[-20%] w-[800px] h-[800px] border-[60px] border-white rounded-full animate-spin-[20s]"></div>
                <div className="absolute bottom-[-50%] right-[-20%] w-[600px] h-[600px] border-[40px] border-white rounded-full"></div>
            </div>
         </motion.div>
      </div>

    </div>
  );
}