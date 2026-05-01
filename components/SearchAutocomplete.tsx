'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, Loader2, Clock, X } from 'lucide-react';
import { getSuggestions, logSearch, logSearchEvent, type Suggestion } from '@/actions/search';

const STORAGE_KEY = 'currly_recent_searches';
const MAX_RECENT = 6;

function getRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveRecent(query: string) {
  const prev = getRecent().filter(q => q.toLowerCase() !== query.toLowerCase());
  const next = [query, ...prev].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function removeRecent(query: string) {
  const next = getRecent().filter(q => q !== query);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

interface Props {
  defaultValue?: string;
  placeholder?: string;
  inputName?: string;
  formAction?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  containerClassName?: string;
}

export default function SearchAutocomplete({
  defaultValue = '',
  placeholder = 'Describe your problem...',
  inputName = 'q',
  formAction = '/dashboard',
  onSubmit,
  containerClassName = '',
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'recent' | 'suggestions'>('recent');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [navigating, setNavigating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecent());
  }, []);

  // Reset navigating state when page is restored from bfcache (browser Back button).
  // Without this, the submit button stays disabled after returning from a search.
  useEffect(() => {
    const handler = (e: PageTransitionEvent) => {
      if (e.persisted) setNavigating(false);
    };
    window.addEventListener('pageshow', handler);
    return () => window.removeEventListener('pageshow', handler);
  }, []);

  // Debounced suggestion fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length < 2) {
      setSuggestions([]);
      // If focused with short/empty input, show recent
      if (document.activeElement?.closest('[data-search-wrapper]')) {
        setMode('recent');
        setOpen(recentSearches.length > 0);
      } else {
        setOpen(false);
      }
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const results = await getSuggestions(value);
      setSuggestions(results);
      setMode('suggestions');
      setOpen(results.length > 0);
      setActiveIndex(-1);
    }, 200);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, recentSearches.length]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = (q: string) => {
    setOpen(false);
    setValue(q);
    setNavigating(true);
    saveRecent(q);
    setRecentSearches(getRecent());
    logSearch(q);
    router.push(`/dashboard?q=${encodeURIComponent(q)}`);
  };

  const handleFocus = () => {
    if (value.length < 2) {
      const recent = getRecent();
      setRecentSearches(recent);
      if (recent.length > 0) {
        setMode('recent');
        setOpen(true);
      }
    } else if (suggestions.length > 0) {
      setMode('suggestions');
      setOpen(true);
    }
  };

  const handleRemoveRecent = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    removeRecent(query);
    const updated = getRecent();
    setRecentSearches(updated);
    if (updated.length === 0) setOpen(false);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.removeItem(STORAGE_KEY);
    setRecentSearches([]);
    setOpen(false);
  };

  const activeItems = mode === 'recent' ? recentSearches : suggestions.map(s => s.text);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, activeItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      navigate(activeItems[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setOpen(false);
    if (value.trim()) {
      setNavigating(true);
      saveRecent(value.trim());
      setRecentSearches(getRecent());
      logSearch(value.trim());
      logSearchEvent(value.trim());
    }
    if (onSubmit) onSubmit(e);
  };

  return (
    <div ref={wrapperRef} data-search-wrapper className={`relative ${containerClassName}`}>
      <form action={formAction} onSubmit={handleFormSubmit}>
        <input type="hidden" name={inputName} value={value} />
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0066FF] to-cyan-500 rounded-full opacity-20 blur"></div>
        <div className="relative flex items-center bg-white dark:bg-[#111] rounded-full shadow-lg p-1 pl-5">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            autoComplete="off"
            className="flex-1 bg-transparent border-none outline-none text-base text-[#1A1A1A] dark:text-white placeholder-gray-400 h-12"
          />
          <button type="submit" disabled={navigating} className="bg-[#0066FF] hover:bg-[#0052CC] disabled:opacity-70 text-white px-6 py-2.5 rounded-full font-bold transition-all shrink-0 flex items-center gap-2">
            {navigating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {navigating ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {open && (
        <ul className="absolute z-50 mt-2 w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
          {mode === 'recent' && (
            <li className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 dark:border-white/5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Searches</span>
              <button
                onMouseDown={handleClearAll}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            </li>
          )}

          {mode === 'recent'
            ? recentSearches.map((q, i) => (
                <li
                  key={q}
                  onMouseDown={() => navigate(q)}
                  className={`flex items-center gap-3 px-5 py-3 cursor-pointer text-sm transition-colors ${
                    i === activeIndex
                      ? 'bg-blue-50 dark:bg-white/10 text-[#0066FF]'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="flex-1">{q}</span>
                  <button
                    onMouseDown={(e) => handleRemoveRecent(e, q)}
                    className="text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 p-0.5 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </li>
              ))
            : suggestions.map((s, i) => (
                <li
                  key={s.text}
                  onMouseDown={() => navigate(s.text)}
                  className={`flex items-center gap-3 px-5 py-3 cursor-pointer text-sm transition-colors ${
                    i === activeIndex
                      ? 'bg-blue-50 dark:bg-white/10 text-[#0066FF]'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  {s.type === 'query' ? (
                    <TrendingUp className="w-3.5 h-3.5 text-[#0066FF] shrink-0" />
                  ) : (
                    <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  )}
                  <span className="flex-1">{s.text}</span>
                  {s.type === 'query' && (
                    <span className="text-xs text-gray-400">popular</span>
                  )}
                </li>
              ))
          }
        </ul>
      )}
    </div>
  );
}
