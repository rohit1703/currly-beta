'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, DollarSign, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/utils/supabase';

interface StackBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StackBuilder({ isOpen, onClose }: StackBuilderProps) {
  // FORM STATE
  const [stackTitle, setStackTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedTools, setSelectedTools] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // LIVE SEARCH DATABASE
  useEffect(() => {
    const searchDB = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const { data } = await supabase
        .from('tools')
        .select('*')
        .ilike('name', `%${searchQuery}%`)
        .limit(5);
      setSearchResults(data || []);
      setIsSearching(false);
    };

    const delayDebounce = setTimeout(() => searchDB(), 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // ACTIONS
  const addTool = (tool: any) => {
    if (!selectedTools.find(t => t.id === tool.id)) {
      setSelectedTools([...selectedTools, { ...tool, note: '' }]);
    }
    setSearchQuery(''); 
    setSearchResults([]);
  };

  const removeTool = (id: string) => {
    setSelectedTools(selectedTools.filter(t => t.id !== id));
  };

  const handlePublish = async () => {
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
        {/* LEFT: SEARCH */}
        <div className="w-1/2 border-r border-white/10 p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-6">Build your Stack</h2>
          <input 
            type="text" 
            placeholder="Name your stack (e.g. 'My Agency Kit')" 
            className="w-full bg-neutral-900 border border-white/10 rounded-lg p-3 text-white mb-8 focus:border-[#D4E6B5] outline-none"
            value={stackTitle}
            onChange={e => setStackTitle(e.target.value)}
          />

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-neutral-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search database..." 
              className="w-full bg-neutral-900 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#E6B578] outline-none"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {isSearching ? <Loader2 className="animate-spin text-neutral-500 mx-auto mt-4"/> : 
             searchResults.map(tool => (
              <button key={tool.id} onClick={() => addTool(tool)} className="w-full flex items-center justify-between p-3 rounded-lg border border-white/5 hover:bg-white/5 text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                    {tool.logo_url ? <img src={tool.logo_url} className="w-full h-full object-cover" alt={tool.name} /> : tool.name[0]}
                  </div>
                  <span className="text-sm font-medium text-white">{tool.name}</span>
                </div>
                <Plus className="w-4 h-4 text-neutral-500 group-hover:text-[#D4E6B5]" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="w-1/2 bg-[#050505] p-8 flex flex-col relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4E6B5] to-[#E6B578]"></div>
          <div className="flex justify-between items-end mb-6">
             <div><p className="text-[#D4E6B5] text-xs font-mono uppercase mb-1">Live Preview</p><h3 className="text-xl font-bold text-white">{stackTitle || "Untitled Stack"}</h3></div>
             <div className="bg-neutral-900 px-3 py-1 rounded border border-white/10 flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#E6B578]" /><span className="text-white font-mono font-bold">{selectedTools.reduce((acc, t) => acc + (t.starting_price_usd || 0), 0)}</span><span className="text-neutral-500 text-xs">/mo</span></div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            <AnimatePresence mode='popLayout'>
              {selectedTools.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-neutral-600 border-2 border-dashed border-white/5 rounded-xl"><Sparkles className="w-8 h-8 mb-4 opacity-50" /><p>Search tools to add them here.</p></div>
              ) : (
                selectedTools.map((tool) => (
                  <motion.div key={tool.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-neutral-900/50 border border-white/5 rounded-xl p-4 relative group">
                    <button onClick={() => removeTool(tool.id)} className="absolute top-2 right-2 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 p-1"><X className="w-4 h-4" /></button>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-black border border-white/10 rounded-lg flex items-center justify-center text-white font-bold overflow-hidden">
                         {tool.logo_url ? <img src={tool.logo_url} className="w-full h-full object-cover" alt={tool.name} /> : tool.name[0]}
                      </div>
                      <div><h4 className="text-white font-medium">{tool.name}</h4><p className="text-xs text-neutral-500">{tool.pricing_type === 'free' ? 'Free' : `$${tool.starting_price_usd}/mo`}</p></div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-400 hover:text-white">Cancel</button>
            <button onClick={handlePublish} className="px-6 py-2 bg-[#D4E6B5] hover:bg-[#c2d6a1] text-black font-bold rounded-lg flex items-center gap-2">Publish Stack</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}