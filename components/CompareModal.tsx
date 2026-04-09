'use client';

import { X, ExternalLink, Check, Minus } from 'lucide-react';
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
}

const Row = ({ label, values }: { label: string; values: (string | null | undefined)[] }) => (
  <tr className="border-b border-gray-100 dark:border-white/5">
    <td className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-28 shrink-0">{label}</td>
    {values.map((v, i) => (
      <td key={i} className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
        {v || <Minus className="w-4 h-4 text-gray-300" />}
      </td>
    ))}
  </tr>
);

export default function CompareModal({ tools, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-4xl bg-white dark:bg-[#111] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-lg font-bold">Compare Tools</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tool logos + names */}
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="w-28 px-4 py-4" />
                {tools.map((tool) => (
                  <th key={tool.id} className="px-4 py-4 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {tool.image_url ? (
                          <img src={tool.image_url} alt={tool.name} className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-sm font-bold text-gray-400">{tool.name[0]}</span>
                        )}
                      </div>
                      <Link href={`/tool/${tool.slug}`} className="font-bold text-sm hover:text-[#0066FF] transition-colors">
                        {tool.name}
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Category" values={tools.map(t => t.main_category)} />
              <Row label="Pricing" values={tools.map(t => t.pricing_model)} />
              <Row label="Region" values={tools.map(t => t.is_india_based ? '🇮🇳 India' : 'Global')} />
              <tr className="border-b border-gray-100 dark:border-white/5">
                <td className="py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Description</td>
                {tools.map((tool) => (
                  <td key={tool.id} className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400 align-top">
                    {tool.description
                      ? <span className="line-clamp-3">{tool.description}</span>
                      : <Minus className="w-4 h-4 text-gray-300" />}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Website</td>
                {tools.map((tool) => (
                  <td key={tool.id} className="py-4 px-4">
                    {tool.website ? (
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#0066FF] text-white px-4 py-2 rounded-xl hover:bg-[#0052CC] transition-colors"
                      >
                        Visit <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Minus className="w-4 h-4 text-gray-300" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
