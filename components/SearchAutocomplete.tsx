'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { getSuggestions } from '@/actions/search';

interface Props {
  defaultValue?: string;
  placeholder?: string;
  inputName?: string;
  formAction?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  inputClassName?: string;
  containerClassName?: string;
}

export default function SearchAutocomplete({
  defaultValue = '',
  placeholder = 'Describe your problem...',
  inputName = 'q',
  formAction = '/dashboard',
  onSubmit,
  inputClassName = '',
  containerClassName = '',
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced suggestion fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length < 2) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      const results = await getSuggestions(value);
      setSuggestions(results);
      setOpen(results.length > 0);
      setActiveIndex(-1);
    }, 200);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

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
    router.push(`/dashboard?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      navigate(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setOpen(false);
    if (onSubmit) onSubmit(e);
  };

  return (
    <div ref={wrapperRef} className={`relative ${containerClassName}`}>
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
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={placeholder}
            autoComplete="off"
            className={`flex-1 bg-transparent border-none outline-none text-base text-[#1A1A1A] dark:text-white placeholder-gray-400 h-12 ${inputClassName}`}
          />
          <button type="submit" className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-6 py-2.5 rounded-full font-bold transition-all shrink-0">
            Search
          </button>
        </div>
      </form>

      {open && (
        <ul className="absolute z-50 mt-2 w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <li
              key={s}
              onMouseDown={() => navigate(s)}
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer text-sm text-gray-700 dark:text-gray-200 transition-colors ${
                i === activeIndex ? 'bg-blue-50 dark:bg-white/10 text-[#0066FF]' : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
