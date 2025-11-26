import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Users, Zap, Search, Clock, Linkedin, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: "About Currly - The Honest AI Tools Discovery Platform",
  description: "We built a lighthouse in a sea of AI tools. Honest, unbiased, and built for you.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-black text-black dark:text-white font-sans selection:bg-[#0066FF] selection:text-white overflow-x-hidden transition-colors duration-300">
      
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#0066FF] opacity-5 dark:opacity-20 blur-[120px] rounded-full pointer-events-none z-0" />

      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-white/10 bg-white/90 dark:bg-black/50 backdrop-blur-xl px-4 py-4 md:px-6 md:py-5 transition-colors">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wide text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-4">
             <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        
        <header className="container mx-auto px-4 py-16 md:py-40 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white dark:bg-[#0066FF]/10 dark:border-[#0066FF]/30 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#0066FF] mb-6 shadow-sm">
            <Zap className="h-3 w-3" /> Est. August 2025
          </div>
          
          {/* RESPONSIVE FONT SIZING FIX */}
          <h1 className="text-4xl md:text-8xl font-bold leading-[1.1] mb-8 md:mb-12 tracking-tight text-black dark:text-white">
            We built a lighthouse in a <br />
            <span className="text-[#0066FF]">sea of AI tools.</span>
          </h1>
          
          <div className="max-w-2xl mx-auto text-lg md:text-2xl leading-relaxed text-gray-800 dark:text-gray-300 font-medium px-4">