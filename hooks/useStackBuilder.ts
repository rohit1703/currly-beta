// hooks/useStackBuilder.ts
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase';
import { Tool } from '@/types'; 

export function useStackBuilder() {
  const [stackTitle, setStackTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const [selectedTools, setSelectedTools] = useState<Tool[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SEARCH LOGIC WITH RACE CONDITION FIX
  useEffect(() => {
    const controller = new AbortController();
    
    const searchDB = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('tools')
          .select('id, name, slug, description, main_category, pricing_model, image_url, is_india_based, website, launch_date')
          .ilike('name', `%${searchQuery}%`)
          .limit(5)
          .abortSignal(controller.signal);

        if (error) throw error;
        setSearchResults((data as unknown as Tool[]) || []);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Search failed:", err);
          setError("Failed to fetch tools");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    };

    const debounceTimer = setTimeout(() => searchDB(), 300);
    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [searchQuery]);

  // ACTIONS
  const addTool = useCallback((tool: Tool) => {
    setSelectedTools(prev => {
      if (prev.find(t => t.id === tool.id)) return prev;
      return [...prev, tool];
    });
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const removeTool = useCallback((id: string | number) => {
    setSelectedTools(prev => prev.filter(t => t.id !== id));
  }, []);

  // NOTE: Your original code used 'starting_price_usd' but your Type definition only had 'pricing_model' (string).
  // I've defaulted this to 0 to prevent crashes. Update your Tool interface if you have real numbers.
  const totalPrice = 0; 

  return {
    stackTitle,
    setStackTitle,
    searchQuery,
    setSearchQuery,
    searchResults,
    selectedTools,
    isSearching,
    error,
    addTool,
    removeTool,
    totalPrice
  };
}