'use client';

import { useCompletion } from 'ai/react';
import { useEffect } from 'react';
import { Sparkles, Bot } from 'lucide-react';

export default function AISearchSummary({ query, tools }: { query: string, tools: any[] }) {
  const { completion, complete, isLoading } = useCompletion({
    api: '/api/generate',
  });

  // Trigger the AI whenever the search query or results change
  useEffect(() => {
    if (query && tools.length > 0) {
      complete(query, { body: { context: tools.slice(0, 5) } }); 
    }
  }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!query) return null;

  return (
    <div className="mb-10 bg-white dark:bg-[#111] border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 text-primary">
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="text-sm font-bold uppercase tracking-wider">AI Overview</span>
      </div>

      {/* The AI Text */}
      <div className="prose dark:prose-invert max-w-none text-charcoal dark:text-gray-200 leading-relaxed text-sm md:text-base">
        {isLoading && !completion ? (
          <div className="flex items-center gap-2 text-gray-400 animate-pulse">
            <Bot className="w-4 h-4" />
            <span>Analyzing {tools.length} tools for best match...</span>
          </div>
        ) : (
          completion
        )}
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 dark:from-blue-900/10 to-transparent rounded-bl-full pointer-events-none opacity-50" />
    </div>
  );
}