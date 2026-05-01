'use client';

import { X, ExternalLink, Minus } from 'lucide-react';
import Link from 'next/link';

interface Tool {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  image_url?: string;
  main_category?: string;
  pricing_model?: string;
  is_india_based?: boolean;
}

interface Props {
  tools: Tool[];
  onClose: () => void;
  searchQuery?: string;
}

const FIELDS = [
  { label: 'Category', key: 'main_category' },
  { label: 'Pricing', key: 'pricing_model' },
  { label: 'Region', key: 'region' },
];

export default function CompareModal({ tools, onClose, searchQuery }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full sm:max-w-4xl bg-white dark:bg-[#111] sm:rounded-3xl shadow-2xl border-t sm:border border-gray-100 dark:border-white/10 overflow-hidden max-h-[92vh] flex flex-col rounded-t-3xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5 shrink-0">
          <h2 className="text-base font-bold">Compare {tools.length} tools</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-5 py-5">

          {/* Tool name cards row */}
          <div className={`grid gap-3 mb-6 ${tools.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {tools.map((tool) => (
              <div key={tool.id} className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 text-center">
                <div className="w-10 h-10 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden mx-auto mb-2">
                  {tool.image_url ? (
                    <img src={tool.image_url} alt={tool.name} className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-sm font-bold text-gray-400">{tool.name[0]}</span>
                  )}
                </div>
                <Link href={`/tool/${tool.slug}${searchQuery ? `?from=${encodeURIComponent(searchQuery)}` : ''}`} onClick={onClose} className="font-bold text-sm hover:text-[#0066FF] transition-colors line-clamp-1">
                  {tool.name}
                </Link>
              </div>
            ))}
          </div>

          {/* Comparison rows */}
          <div className="space-y-3">
            {FIELDS.map(({ label, key }) => (
              <div key={key} className="bg-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden">
                <div className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {label}
                </div>
                <div className={`grid gap-0 divide-x divide-gray-200 dark:divide-white/5 ${tools.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {tools.map((tool) => {
                    const val = key === 'region'
                      ? (tool.is_india_based ? '🇮🇳 India' : 'Global')
                      : (tool as any)[key];
                    return (
                      <div key={tool.id} className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                        {val || <Minus className="w-3.5 h-3.5 text-gray-300" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Description */}
            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden">
              <div className="px-4 py-2 bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Description
              </div>
              <div className={`grid gap-0 divide-x divide-gray-200 dark:divide-white/5 ${tools.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {tools.map((tool) => (
                  <div key={tool.id} className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {tool.description
                      ? <span className="line-clamp-4">{tool.description}</span>
                      : <Minus className="w-3.5 h-3.5 text-gray-300" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Visit buttons */}
          <div className={`grid gap-3 mt-5 ${tools.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {tools.map((tool) => (
              tool.website ? (
                <a
                  key={tool.id}
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#0066FF] text-white text-sm font-bold py-3 rounded-2xl hover:bg-[#0052CC] transition-colors"
                >
                  Visit <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <div key={tool.id} className="flex items-center justify-center py-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-400 text-sm">
                  No website
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
