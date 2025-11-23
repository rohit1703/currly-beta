'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, Sparkles, Users, ArrowRight, Shield, Star, Zap, Brain, Database } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
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
    if (query.trim()) {
      router.push(`/dashboard?q=${encodeURIComponent(query)}`);
    }
  };

  // --- UPDATED STATS (420+) ---
  const stats = [
    { label: "Curated Tools", value: "1,102+" },
    { label: "Active Members", value: "420+" }, // Updated
    { label: "Categories", value: "15+" },
  ];

  const testimonials = [
    { 
      quote: "Saved me 10 hours of research. I needed a project management tool for my startup. Currly's AI gave me 3 perfect options in seconds with real pricing.", 
      author: "Priya Malhotra", 
      role: "Founder @ TechStart Labs" 
    },
    { 
      quote: "Finally, unbiased recommendations. Every other site wants me to click their affiliate links. Currly just tells me what actually works. That's rare.", 
      author: "Arjun Kumar", 
      role: "Full-Stack Developer" 
    },
    { 
      quote: "The community makes it special. The AI is great, but the network where we discuss tools and share experiences—that's the real value.", 
      author: "Sneha Reddy", 
      role: "Marketing Manager" 
    },
    { 
      quote: "India-first focus matters. Pricing in INR, tools available in India, and a community that understands our context. Perfect for Indian professionals.", 
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
      title: "Zero Affiliate Bias", 
      desc: "We don't earn commissions from recommendations. Our only metric is your success." 
    },
    { 
      icon: Users, 
      title: "Community Validated", 
      desc: "420+ professionals test and validate tools daily in our exclusive community." // Updated
    },
  ];

  // Triple duplication for smooth infinite scroll
  const marquee = [...testimonials, ...testimonials, ...testimonials];

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream dark:bg-[#050505] transition-colors duration-500 font-sans">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 bg-white/70 dark:bg-[#050505]/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(0,102,255,0.3)] group-hover:scale-110 transition-transform">C</div>
              <span className="text-xl font-bold tracking-tight text-charcoal dark:text-white">currly</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Login</Link>
            <Link href="/dashboard" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-blue-500/30">
              Join Beta
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-24 overflow-hidden">
        
        {/* Parallax Orbs */}
        <motion.div 
          className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        />
        <motion.div 
          className="absolute top-40 -left-20 w-[500px] h-[500px] bg-[#00D9FF]/10 rounded-full blur-[120px] pointer-events-none"
          style={{ transform: `translateY(${scrollY * 0.4}px)` }}
        />

        <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
          
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-full mb-8 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-bold text-primary tracking-wide uppercase">India's First AI-Powered Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-[1.1] tracking-tighter text-charcoal dark:text-white"
          >
            India's First <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#00D9FF] to-primary">AI Discovery Engine</span>
          </motion.h1>

          {/* Subheadline (Updated 420+) */}
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover the perfect AI tool in seconds. <br className="hidden md:block"/>
            <span className="text-charcoal dark:text-white font-semibold">1,100+ tools</span> curated by experts, powered by AI, and validated by <span className="text-charcoal dark:text-white font-semibold">420+ professionals</span>.
          </p>

          {/* SEARCH BAR */}
          <div className="max-w-3xl mx-auto mb-20">
            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-[#00D9FF] rounded-2xl opacity-20 group-hover:opacity-50 blur-xl transition duration-500"></div>
                <div className="relative flex items-center gap-4 bg-white dark:bg-[#0A0A0A] rounded-2xl p-3 shadow-2xl border border-gray-100 dark:border-white/10 transition-transform duration-300 group-hover:scale-[1.01]">
                    <Search className="w-6 h-6 text-gray-400 ml-3" />
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="I need a CRM for a dental clinic in India..."
                        className="flex-1 text-lg bg-transparent border-none focus:ring-0 text-charcoal dark:text-white placeholder-gray-400 outline-none h-12"
                    />
                    <button type="submit" className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2 active:scale-95">
                        Search <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </form>
            
            <div className="flex flex-wrap justify-center gap-3 mt-8 text-sm">
                <span className="text-gray-400 py-1">Try asking:</span>
                {['"Video editing for startups"', '"Cheap CRM"', '"Hindi SEO tools"'].map((tag) => (
                    <button key={tag} onClick={() => setQuery(tag.replace(/"/g, ''))} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors">
                        {tag}
                    </button>
                ))}
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
             {stats.map((stat, i) => (
                 <motion.div key={i} whileHover={{ y: -5 }} className="bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-lg hover:shadow-xl transition-all">
                    <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
                 </motion.div>
             ))}
          </div>
        </div>
      </div>

      {/* --- WHY CURRLY --- */}
      <div className="py-24 bg-white dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-charcoal dark:text-white mb-4">Why professionals trust Currly.</h2>
                <p className="text-gray-500 dark:text-gray-400 text-lg">We fixed tool discovery by adding the one thing missing: <span className="text-primary font-semibold">Truth.</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((f, i) => (
                    <motion.div 
                        key={i} 
                        whileHover={{ y: -5 }}
                        className="bg-cream dark:bg-[#111] p-10 rounded-[2rem] border border-gray-100 dark:border-white/5 relative overflow-hidden"
                    >
                        <div className="w-14 h-14 bg-white dark:bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-primary shadow-sm">
                            <f.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-charcoal dark:text-white mb-3">{f.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {f.desc}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>

      {/* --- TESTIMONIAL SCROLL (Updated Header) --- */}
      <div className="py-24 overflow-hidden relative bg-cream dark:bg-[#050505]">
         <div className="max-w-7xl mx-auto px-4 mb-12 text-center">
            <h2 className="text-3xl font-bold text-charcoal dark:text-white">Trusted by 420+ Builders</h2>
         </div>
         
         <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-cream dark:from-[#050505] to-transparent z-20 pointer-events-none"></div>
         <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-cream dark:from-[#050505] to-transparent z-20 pointer-events-none"></div>
         
         <div className="flex w-max gap-8 animate-scroll hover:[animation-play-state:paused]">
            {marquee.map((t, i) => (
                <div key={i} className="w-[400px] flex-shrink-0 bg-white dark:bg-[#111] p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex gap-1 mb-4">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-accent text-accent" />)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 italic mb-6 leading-relaxed text-lg">"{t.quote}"</p>
                    <div className="flex items-center gap-3 border-t border-gray-100 dark:border-white/5 pt-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-[#00D9FF] rounded-full flex items-center justify-center text-white font-bold text-xs">{t.author[0]}</div>
                        <div>
                            <div className="font-bold text-sm text-charcoal dark:text-white">{t.author}</div>
                            <div className="text-xs text-gray-500">{t.role}</div>
                        </div>
                    </div>
                </div>
            ))}
         </div>
      </div>

      {/* --- FINAL CTA --- */}
      <div className="py-24 px-4 text-center bg-white dark:bg-[#0A0A0A]">
         <motion.div 
            whileHover={{ scale: 1.01 }}
            className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-white shadow-2xl shadow-blue-900/50"
         >
            <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Stop searching.<br/>Start building.</h2>
                <p className="text-blue-100 text-xl mb-12 max-w-xl mx-auto">Join the 420+ professionals who found their stack on Currly.</p>
                <div className="flex justify-center">
                    <Link href="/dashboard" className="bg-white text-primary px-12 py-5 rounded-2xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-3 text-lg shadow-xl">
                        Start Discovery <ArrowRight className="w-5 h-5" />
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