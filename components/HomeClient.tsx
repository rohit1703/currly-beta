'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import SearchAutocomplete from '@/components/SearchAutocomplete';
import ToolCard from '@/components/ToolCardItem';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';
import UserNav from '@/components/UserNav';
import { useCountUp } from '@/hooks/useCountUp';
import { Testimonials } from '@/components/TestimonialsSection';
import { Footer } from '@/components/FooterSection';
import { getCategoryIcon, categoryToSlug } from '@/lib/categories';

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

function StatItem({ value, label, suffix = "+", onClick, active }: { value: number, label: string, suffix?: string, onClick?: () => void, active?: boolean }) {
  const count = useCountUp(value);
  return (
    <motion.div
      variants={fadeInUp}
      onClick={onClick}
      className={`bg-white dark:bg-neutral-900 p-6 rounded-2xl border shadow-sm text-center transition-colors ${onClick ? 'cursor-pointer' : ''} ${active ? 'border-[#0066FF] dark:border-[#0066FF]' : 'border-gray-200 dark:border-white/10'} ${onClick ? 'hover:border-[#0066FF]/60' : ''}`}
    >
      <div className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-1 md:mb-2 flex justify-center">
        <motion.span>{count}</motion.span>{suffix}
      </div>
      <div className={`text-xs md:text-sm font-bold uppercase tracking-wider ${active ? 'text-[#0066FF]' : 'text-gray-500'}`}>
        {label}{onClick ? ' ↓' : ''}
      </div>
    </motion.div>
  );
}

export default function HomeClient({ tools, categories: categoriesData, totalCount }: { tools: any[]; categories: { name: string; count: number; slug: string }[]; totalCount: number }) {
  const [scrollY, setScrollY] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSearch = () => {
    const element = document.getElementById('search-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            <motion.h1 variants={fadeInUp} className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-[1.1] tracking-tighter text-gray-900 dark:text-white">
              Discover the Perfect{' '}
              <span className="inline md:block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-cyan-500">AI Tool in Seconds</span>
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed font-medium px-4">
              Stop searching. Start building. <br className="hidden md:block"/>
              <span className="text-gray-900 dark:text-white font-bold">{totalCount}+ tools</span> curated by experts.
            </motion.p>

            {/* SEARCH BAR - FIXED WIDTH FOR MOBILE */}
            <motion.div id="search-section" variants={fadeInUp} className="relative w-full max-w-3xl mx-auto z-10 px-2">
              <SearchAutocomplete
                placeholder="Describe your problem..."
                containerClassName="w-full"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* STATS */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 relative grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 z-10 mb-8"
        >
          <StatItem value={totalCount} label="AI Tools Curated" />
          <StatItem value={420} label="Active Members" />
          <StatItem
            value={categoriesData.length || 15}
            label="Categories"
            suffix=""
            onClick={() => setShowCategories(v => !v)}
            active={showCategories}
          />
        </motion.div>

        {/* CATEGORIES GRID — revealed by clicking the Categories stat */}
        {showCategories && categoriesData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="max-w-7xl mx-auto px-4 relative z-10 mb-20 md:mb-32"
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">
              Explore by Category
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {categoriesData.map((cat, i) => {
                const Icon = getCategoryIcon(cat.name);
                return (
                  <div
                    key={i}
                    onClick={() => router.push(`/category/${categoryToSlug(cat.name)}`)}
                    className="cursor-pointer bg-white dark:bg-[#111] p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#0066FF] hover:shadow-lg transition-all group text-left active:scale-95"
                  >
                    <div className="w-8 h-8 bg-blue-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-[#0066FF] mb-2.5 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">{cat.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.count} tools</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TESTIMONIALS */}
        <Testimonials />
      </main>
      
      <Footer />
    </div>
  );
}