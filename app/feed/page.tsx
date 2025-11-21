'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, MessageCircle, Share2, Rocket, Layers, Zap, Plus, LayoutGrid } from 'lucide-react';
import { supabase } from '@/utils/supabase';
import StackBuilder from '@/components/StackBuilder';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('pulse');
  const [isStackBuilderOpen, setIsStackBuilderOpen] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
      setPosts(data || []);
    }
    fetchPosts();
  }, []);

  const filteredPosts = activeTab === 'pulse' ? posts : posts.filter(p => p.type === (activeTab === 'launches' ? 'launch' : 'stack'));

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center transition-colors duration-300">
      
      {/* HEADER NAVIGATION */}
      <nav className="w-full border-b border-border bg-background/80 backdrop-blur p-4 flex justify-between items-center sticky top-0 z-20">
         <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
                <div className="w-6 h-6 bg-gradient-to-br from-[#D4E6B5] to-[#A3C968] rounded flex items-center justify-center text-black font-bold">C</div>
                <span className="font-bold tracking-tight text-foreground">currly</span>
            </Link>
            <Link href="/dashboard" className="hidden md:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
               <LayoutGrid className="w-4 h-4" /> Discovery
            </Link>
         </div>

         <div className="flex items-center gap-4">
            <ThemeToggle />
            <button 
            onClick={() => setIsStackBuilderOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 transition-colors shadow-md"
            >
            <Plus className="w-4 h-4" /> Create Stack
            </button>
         </div>
      </nav>

      {/* TABS */}
      <div className="w-full max-w-2xl mt-8 px-4">
        <div className="flex gap-6 text-sm font-medium border-b border-border pb-4 mb-6">
          {['pulse', 'launches', 'stacks'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 capitalize transition-colors ${activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab === 'pulse' && <Zap className="w-4 h-4" />}
              {tab === 'launches' && <Rocket className="w-4 h-4" />}
              {tab === 'stacks' && <Layers className="w-4 h-4" />}
              {tab}
            </button>
          ))}
        </div>

        {/* FEED ITEMS */}
        <div className="space-y-6 pb-32">
          {filteredPosts.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors shadow-sm"
            >
              {item.type === 'launch' && (
                <div className="relative h-48 bg-muted border-b border-border flex items-center justify-center">
                   <span className="text-muted-foreground text-xs uppercase tracking-widest">Video Preview Area</span>
                   <div className="absolute top-4 left-4 bg-primary/10 text-primary-darker border border-primary/20 px-2 py-1 rounded text-[10px] font-mono">🚀 LAUNCH</div>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                   <img src={item.author_avatar || 'https://i.pravatar.cc/150'} className="w-8 h-8 rounded-full bg-accent" />
                   <div>
                     <h3 className="font-bold text-foreground leading-tight">{item.title}</h3>
                     <p className="text-xs text-muted-foreground">by {item.author_name} • {new Date(item.created_at).toLocaleDateString()}</p>
                   </div>
                </div>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{item.content}</p>

                {/* ACTIONS */}
                <div className="flex items-center gap-4 text-muted-foreground pt-4 border-t border-border">
                   <button className="flex items-center gap-1 hover:text-primary transition-colors"><ArrowUp className="w-4 h-4" /> {item.upvotes_count}</button>
                   <button className="flex items-center gap-1 hover:text-foreground transition-colors"><MessageCircle className="w-4 h-4" /> {item.comments_count}</button>
                   <button className="ml-auto hover:text-foreground"><Share2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <StackBuilder isOpen={isStackBuilderOpen} onClose={() => setIsStackBuilderOpen(false)} />
    </div>
  );
}