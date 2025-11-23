'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, Sparkles, Users, ArrowRight, Shield, Brain, Zap, Star, Database } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useCountUp } from '@/hooks/useCountUp';

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
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-black font-bold text-lg">C</div>
            <span className="text-xl font-bold tracking-tight">currly</span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-sm font-medium hover:opacity-70 hidden sm:block">Login</Link>
            <Link href="/dashboard" className="bg-black dark:bg-white text-white dark:text-black px-5 py-2 rounded-full text-sm font-bold hover:opacity-80 transition-all">Sign up</Link>
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
          500+ tools curated by experts. Powered by AI. <br/> Validated