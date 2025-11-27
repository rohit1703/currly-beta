'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, MessageCircle, Share2, Rocket, Layers, Zap, Plus, LayoutGrid, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr'; // Using the correct client we fixed
import StackBuilder from '@/components/StackBuilder';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import UserNav from '@/components/UserNav';
import { Logo } from '@/components/Logo';

const POSTS_PER_PAGE = 10;

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('pulse');
  const [isStackBuilderOpen, setIsStackBuilderOpen] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Supabase
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchPosts = async (pageNumber: number) => {
    try {
      setIsLoading(true);
      // Calculate range: 0-9, 10-19, etc.
      const from = pageNumber * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (data) {
        if (data.length < POSTS_PER_PAGE) {
          setHasMore(false); // No more posts to fetch
        }
        
        setPosts(prev => (pageNumber === 0 ? data : [...prev, ...data]));
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchPosts(0);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  const filteredPosts = activeTab === 'pulse' ? posts : posts.filter(p => p.type === (activeTab === 'launches' ? 'launch' : 'stack'));

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#050505] text-[#1A1A1A] dark:text-white font-sans flex flex-col items-center transition-colors duration-500">
      
      {/* HEADER NAVIGATION */}
      <nav className="w-full border-b border-gray-200/50 dark:border-white/10 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur p-4 flex justify-between items-center sticky top-0 z-20">
         <div className="flex items-center gap-6">
            <Link href="/">
                <Logo />
            </Link>
            <Link href="/dashboard" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#0066FF] transition-colors">
               <LayoutGrid className="w-4 h-4" /> Discovery
            </Link>
         </div>

         <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav />
            <button 
              onClick={() => setIsStackBuilderOpen(true)}
              className="bg-[#0066FF] hover:bg-[#0052CC] text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" /> Create Stack
            </button>
         </div>
      </nav>

      {/* TABS */}
      <div className="w-full max-w-2xl mt-8 px-4">
        <div className="flex gap-6 text-sm font-medium border-b border-gray-200 dark:border-white/10 pb-4 mb-6">
          {['pulse', 'launches', 'stacks'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 capitalize transition-colors ${activeTab === tab ? 'text-[#0066FF]' : 'text-gray-500 hover:text-[#1A1A1A] dark:hover:text-white'}`}
            >
              {tab === 'pulse' && <Zap className="w-4 h-4" />}
              {tab === 'launches' && <Rocket className="w-4 h-4" />}
              {tab === 'stacks' && <Layers className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>

        {/* FEED ITEMS */}
        <div className="space-y-6 pb-10">
          {filteredPosts.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden hover:border-[#0066FF]/30 transition-colors shadow-sm hover:shadow-md"
            >
              {item.type === 'launch' && (
                <div className="relative h-48 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 flex items-center justify-center">
                   <span className="text-gray-400 text-xs uppercase tracking-widest">Video Preview Area</span>
                   <div className="absolute top-4 left-4 bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20 px-2 py-1 rounded text-[10px] font-mono">🚀 LAUNCH</div>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                   <img src={item.author_avatar || 'https://i.pravatar.cc/150'} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10" alt="Author" />
                   <div>
                     <h3 className="font-bold text-[#1A1A1A] dark:text-white leading-tight text-lg">{item.title}</h3>
                     <p className="text-xs text-gray-500">by {item.author_name} • {new Date(item.created_at).toLocaleDateString()}</p>
                   </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">{item.content}</p>

                <div className="flex items-center gap-4 text-gray-400 pt-4 border-t border-gray-100 dark:border-white/5">
                   <button className="flex items-center gap-1 hover:text-[#0066FF] transition-colors"><ArrowUp className="w-4 h-4" /> {item.upvotes_count}</button>
                   <button className="flex items-center gap-1 hover:text-[#1A1A1A] dark:hover:text-white transition-colors"><MessageCircle className="w-4 h-4" /> {item.comments_count}</button>
                   <button className="ml-auto hover:text-[#1A1A1A] dark:hover:text-white"><Share2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4 pb-8">
              <button 
                onClick={handleLoadMore}
                disabled={isLoading}
                className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 px-6 py-2 rounded-full text-sm font-bold hover:border-[#0066FF] hover:text-[#0066FF] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
          
          {!hasMore && posts.length > 0 && (
            <p className="text-center text-gray-400 text-sm py-8">You've reached the end.</p>
          )}
        </div>
      </div>

      <StackBuilder isOpen={isStackBuilderOpen} onClose={() => setIsStackBuilderOpen(false)} />
    </div>
  );
}