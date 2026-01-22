// components/StackBuilder.tsx
'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, DollarSign, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Tool } from '@/types';
import { useStackBuilder } from '@/hooks/useStackBuilder'; 

interface StackBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

// Optimized Search Result Item
const SearchResultItem = memo(({ tool, onAdd }: { tool: Tool; onAdd: (t: Tool) => void }) => (
  <button 
    onClick={() => onAdd(tool)} 
    className="w-full flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/5 text-left group transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center text-white font-bold text-xs overflow-hidden shrink-0">
        {/* FIX: Used image_url instead of logo_url based on your types */}
        {tool.image_url ? (
          <img src={tool.image_url} className="w-full h-full object-cover" alt="" />
        ) : (
          tool.name[0]
        )}
      </div>
      <span className="text-sm font-medium text-white truncate">{tool.name}</span>
    </div>
    <Plus className="w-4 h-4 text-neutral-500 group-hover:text-[#D4E6B5]" />
  </button>
));
SearchResultItem.displayName = 'SearchResultItem';

// Optimized Selected Tool Item
const SelectedToolItem = memo(({ tool, onRemove }: { tool: Tool; onRemove: (id: string | number) => void }) => (
  <motion.div 
    layout 
    initial={{ opacity: 0, x: 20 }} 
    animate={{ opacity: 1, x: 0 }} 
    exit={{ opacity: 0, scale: 0.9 }} 
    className="bg-neutral-900/50 border border-white/5 rounded-xl p-4 relative group"
  >
    <button 
      onClick={() => onRemove(tool.id)} 
      className="absolute top-2 right-2 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 p-1 transition-opacity"
    >
      <X className="w-4 h-4" />
    </button>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-black border border-white/10 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
         {tool.image_url ? <img src={tool.image_url} className="w-full h-full object-cover" alt="" /> : tool.name[0]}
      </div>
      <div>
        <h4 className="text-white font-medium">{tool.name}</h4>
        <p className="text-xs text-neutral-500">
            {tool.pricing_model || 'Free'}
        </p>
      </div>
    </div>
  </motion.div>
));
SelectedToolItem.displayName = 'SelectedToolItem';

export default function StackBuilder({ isOpen, onClose }: StackBuilderProps) {
  const {
    stackTitle, setStackTitle,
    searchQuery, setSearchQuery,
    searchResults, selectedTools,
    isSearching, error,
    addTool, removeTool, totalPrice
  } = useStackBuilder();

  const handlePublish = () => {
    alert(`Published Stack: ${stackTitle} with ${selectedTools.length} tools!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-5xl h-[85vh] bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden"
      >
        {/* LEFT PANEL */}
        <div className="w-1/2 border-r border-white/10 p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-6">Build your Stack</h2>
          <input 
            type="text" 
            placeholder="Name your stack (e.g. 'My Agency Kit')" 
            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white mb-8 focus:border-[#D4E6B5] outline-none transition-colors"
            value={stackTitle}
            onChange={e => setStackTitle(e.target.value)}
          />

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-neutral-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search database..." 
              className="w-full bg-neutral-900 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#E6B578] outline-none transition-colors"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {isSearching ? (
              <div className="flex justify-center mt-8"><Loader2 className="animate-spin text-neutral-500" /></div>
            ) : error ? (
              <div className="text-red-400 flex items-center justify-center gap-2 mt-4"><AlertCircle className="w-4 h-4"/> {error}</div>
            ) : (
              searchResults.map(tool => (
                <SearchResultItem key={tool.id} tool={tool} onAdd={addTool} />
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-1/2 bg-[#050505] p-8 flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4E6B5] to-[#E6B578]"></div>
          <div className="flex justify-between items-end mb-6">
             <div>
               <p className="text-[#D4E6B5] text-xs font-mono uppercase mb-1">Live Preview</p>
               <h3 className="text-xl font-bold text-white truncate max-w-[200px]">{stackTitle || "Untitled Stack"}</h3>
             </div>
             <div className="bg-neutral-900 px-3 py-1 rounded border border-white/10 flex items-center gap-2">
               <DollarSign className="w-4 h-4 text-[#E6B578]" />
               <span className="text-white font-mono font-bold">{totalPrice}</span>
               <span className="text-neutral-500 text-xs">/mo</span>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            <AnimatePresence mode='popLayout'>
              {selectedTools.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-600 border-2 border-dashed border-white/5 rounded-xl">
                  <Sparkles className="w-8 h-8 mb-4 opacity-50" />
                  <p>Search tools to add them here.</p>
                </div>
              ) : (
                selectedTools.map((tool) => (
                  <SelectedToolItem key={tool.id} tool={tool} onRemove={removeTool} />
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handlePublish} className="px-6 py-2 bg-[#D4E6B5] hover:bg-[#c2d6a1] text-black font-bold rounded-lg flex items-center gap-2 transition-colors">
              Publish Stack
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}