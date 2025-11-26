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

// --- MOBILE OPTIMIZED VARIANTS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 10 }, // Reduced movement for mobile
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // Faster stagger
      delayChildren: 0.1
    }
  }
};

// --- COMPONENTS ---

function StatItem({ value, label, suffix = "+" }: { value: number, label: string, suffix?: string }) {
  const count = useCountUp(value);
  return (
    <motion.div 
      variants={fadeInUp}
      className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm text-center"
    >
      <div className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-1 md:mb-2 flex justify-center">
        <motion.span>{count}</motion.span>{suffix}
      </div>
      <div className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</div>
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
    { name: "Marketing", icon: Zap, slug: "marketing" },
    { name: "Dev", icon: Code, slug: "coding" },
    { name: "Design", icon: PenTool, slug: "video" },
    { name: "Productivity", icon: LayoutGrid, slug: "productivity" },
  ];

  const hasTools = tools && tools.length > 0;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black text-gray-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* --- NAV --- */}
      <nav className={`fixed top-0 w-full z-50 px-4 md:px-6 py-3 md:py-4 transition-all duration-300 ${scrollY > 20 ? 'bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            <UserNav />
            <button 
              onClick={scrollToSearch}
              className="hidden md:block bg-[#0066FF] hover:bg-[#0052CC] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="pt-32 md:pt-40 relative z-10">
        
        {/* HERO & SEARCH */}
        <div className="px-4 text-center max-w-7xl mx-auto relative mb-20 md:mb-32">
          
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="relative z-10"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="relative inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-50 dark:bg-white/10 rounded-full mb-6 border border-blue-100 dark:border-white/10">
              <Globe className="w-3 h-3 md:w-4 md:h-4 text-[#0066FF] dark:text-white" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide text-[#0066FF] dark:text-white">The World's First AI Tools Search Engine</span>
            </motion.div>

            {/* Headline - Responsive Text Size */}
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.1] tracking-tighter text-gray-900 dark:text-white">
              Discover the Perfect <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-cyan-500">AI Tool in Seconds</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium px-4">
              Stop searching. Start building. <br className="hidden md:block"/>
              <span className="text-gray-900 dark:text-white font-bold">712+ tools</span> curated by experts.
            </motion.p>

            {/* SEARCH BAR - FIXED WIDTH FOR MOBILE */}
            <motion.div id="search-section" variants={fadeInUp} className="relative w-full max-w-3xl mx-auto z-10 px-2">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#0066FF] to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                <div className="relative flex items-center gap-2 md:gap-4 bg-white dark:bg-[#111] rounded-2xl p-2 md:p-3 shadow-2xl border border-gray-200 dark:border-white/10">
                  <Search className="w-5 h-5 text-gray-400 ml-2" />
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Describe your problem..."
                    className="flex-1 text-base md:text-lg bg-transparent border-none focus:ring-0 outline-none h-10 md:h-12 text-gray-900 dark:text-white placeholder-gray-400 w-full min-w-0"
                  />
                  <button type="submit" className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-4 md:px-8 py-2 md:py-4 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 whitespace-nowrap text-sm md:text-base">
                    Search
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </div>

        {/* CATEGORIES GRID (2 Col Mobile) */}
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 relative z-10 mb-20 md:mb-32"
        >
           <motion.p variants={fadeInUp} className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 text-center md:text-left">
             Explore by Category
           </motion.p>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {categories.map((cat, i) => (
                <motion.div 
                  key={i} 
                  variants={fadeInUp}
                  onClick={() => router.push(`/category/${cat.slug}`)} 
                  className="cursor-pointer bg-white dark:bg-[#111] p-4 md:p-6 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#0066FF] hover:shadow-lg transition-all group text-left active:scale-95"
                >
                   <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-[#0066FF] mb-3 group-hover:scale-110 transition-transform">
                     <cat.icon className="w-4 h-4 md:w-5 md:h-5" />
                   </div>
                   <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-white">{cat.name}</h3>
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
          className="max-w-7xl mx-auto px-4 relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 z-10 mb-20 md:mb-32"
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
               className="flex items-center justify-between mb-6 md:mb-8"
             >
               <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Recently Added</h2>
             </motion.div>
             
             <motion.div 
               variants={staggerContainer}
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, margin: "50px" }}
               className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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