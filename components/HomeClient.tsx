'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Search, ArrowRight, Code, PenTool, Globe, Zap, LayoutGrid } from 'lucide-react';
import ToolCard from '@/components/ToolCardItem';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';
import UserNav from '@/components/UserNav';
import { useCountUp } from '@/hooks/useCountUp';
import { Testimonials } from '@/components/TestimonialsSection';
import { Footer } from '@/components/FooterSection';

// --- ANIMATION VARIANTS ---

// 1. STATIC FADE (For Hero - No movement, feels planted)
const fadeInStatic: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

// 2. MICRO LIFT (For Content - Subtle rise)
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

// --- COMPONENTS ---

function StatItem({ value, label, suffix = "+" }: { value: number, label: string, suffix?: string }) {
  const count = useCountUp(value);
  return (
    <motion.div 
      variants={fadeInUp}
      className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-gray-200 dark:border-white/10 shadow-sm text-center hover:shadow-md transition-all hover:-translate-y-1"
    >
      <div className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-2 flex justify-center">
        <motion.span>{count}</motion.span>{suffix}
      </div>
      <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
}

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

  const scrollToSearch = () => {
    const element = document.getElementById('search-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = [
    { name: "Marketing & SEO", icon: Zap, tools: "120+", slug: "marketing" },
    { name: "Development", icon: Code, tools: "85+", slug: "coding" },
    { name: "Design & Video", icon: PenTool, tools: "94+", slug: "video" },
    { name: "Productivity", icon: LayoutGrid, tools: "200+", slug: "productivity" },
  ];

  const hasTools = tools && tools.length > 0;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* --- AMBIENT GLOW --- */}
      <motion.div 
        animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[800px] bg-[#0066FF] blur-[120px] rounded-full pointer-events-none z-0 opacity-5 dark:opacity-20" 
      />

      {/* --- NAV --- */}
      <nav className={`fixed top-0 w-full z-50 px-6 py-4 transition-all duration-300 ${scrollY > 20 ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/5' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
            <button 
              onClick={scrollToSearch}
              className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20 hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <main className="pt-40 relative z-10">
        
        {/* HERO & SEARCH */}
        <div className="px-4 text-center max-w-7xl mx-auto relative mb-32">
          
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="relative z-10"
          >
            {/* Badge (Static Fade) */}
            <motion.div variants={fadeInStatic} className="relative inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-white/10 rounded-full mb-8 border border-blue-100 dark:border-white/10">
              <Globe className="w-4 h-4 text-[#0066FF] dark:text-white" />
              <span className="text-xs font-bold uppercase tracking-wide text-[#0066FF] dark:text-white">The World's First AI Tools Search Engine</span>
            </motion.div>

            {/* Headline (Static Fade) */}
            <motion.h1 variants={fadeInStatic} className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[1.1] tracking-tighter text-gray-900 dark:text-white">
              Discover the Perfect <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-cyan-500">AI Tool in Seconds</span>
            </motion.h1>

            {/* Subtext (Static Fade) */}
            <motion.p variants={fadeInStatic} className="text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
              Stop searching. Start building. <br className="hidden md:block"/>
              <span className="text-gray-900 dark:text-white font-bold">712+ tools</span> curated by experts.
            </motion.p>

            {/* SEARCH BAR (Static Fade) */}
            <motion.div id="search-section" variants={fadeInStatic} className="relative max-w-3xl mx-auto z-10">
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
                  <button type="submit" className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 hover:scale-105">
                    Search <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
              
              {/* Quick Filters */}
              <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm">
                 <span className="text-gray-400 py-1">Trending:</span>
                 {['Video Editing', 'CRM', 'Chatbots'].map(t => (
                   <button key={t} onClick={() => setQuery(t)} className="px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-[#0066FF] hover:text-[#0066FF] transition-colors text-gray-600 dark:text-gray-300">
                     {t}
                   </button>
                 ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* CATEGORIES (Keep Lift) */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 relative z-10 mb-32"
        >
           <motion.p variants={fadeInUp} className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-8 text-center md:text-left">
             Explore by Category
           </motion.p>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat, i) => (
                <motion.div 
                  key={i} 
                  variants={fadeInUp}
                  onClick={() => router.push(`/category/${cat.slug}`)} 
                  className="cursor-pointer bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-200 dark:border-white/10 hover:border-[#0066FF] hover:shadow-lg transition-all group text-left hover:-translate-y-1"
                >
                   <div className="w-10 h-10 bg-blue-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-[#0066FF] mb-4 group-hover:scale-110 transition-transform">
                     <cat.icon className="w-5 h-5" />
                   </div>
                   <h3 className="font-bold text-gray-900 dark:text-white">{cat.name}</h3>
                   <p className="text-xs text-gray-500">{cat.tools} Tools</p>
                </motion.div>
              ))}
           </div>
        </motion.div>

        {/* STATS */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 relative grid grid-cols-1 md:grid-cols-3 gap-6 z-10 mb-32"
        >
           <StatItem value={712} label="AI Tools Curated" />
           <StatItem value={420} label="Active Members" />
           <StatItem value={15} label="Categories" />
        </motion.div>

        {/* LIVE DATA GRID */}
        {hasTools && (
          <div className="max-w-7xl mx-auto px-4 relative z-10 mb-24 text-left">
             <motion.div 
               initial={{ opacity: 0 }} 
               whileInView={{ opacity: 1 }} 
               viewport={{ once: true }}
               className="flex items-center justify-between mb-8"
             >
               <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recently Added</h2>
               {/* Hidden count */}
             </motion.div>
             
             <motion.div 
               variants={staggerContainer}
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, margin: "100px" }}
               className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
             >
              {tools.map((tool, i) => (
                <motion.div key={tool.id} variants={fadeInUp}>
                  <ToolCard 
                    title={tool.name || 'Untitled'}
                    description={tool.description || ''}
                    category={tool.main_category || 'General'}
                    pricing={tool.pricing_model || 'Unknown'} 
                    image={tool.image_url || ''}
                    url={tool.website || '#'}
                    slug={tool.slug}
                  />
                </motion.div>
              ))}
             </motion.div>
          </div>
        )}

        {/* TESTIMONIALS */}
        <Testimonials />
      </main>
      
      <Footer />
    </div>
  );
}