'use client';

import { useState, useTransition } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { saveTool, unsaveTool } from '@/actions/saved';

export default function SaveButton({
  toolId,
  initialSaved,
  isLoggedIn,
  redirectTo,
  compact = false,
}: {
  toolId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
  redirectTo?: string;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const newSaved = !saved;
    setSaved(newSaved); // Optimistic: update immediately
    startTransition(async () => {
      try {
        if (newSaved) {
          await saveTool(toolId);
        } else {
          await unsaveTool(toolId);
        }
      } catch {
        setSaved(!newSaved); // Revert on failure
      }
    });
  };

  if (!isLoggedIn) {
    const loginHref = redirectTo
      ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/login';

    if (compact) {
      return (
        <a href={loginHref} title="Save to Stack" className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-400 hover:text-[#0066FF] hover:border-[#0066FF] transition-colors shrink-0">
          <Bookmark className="w-4 h-4" />
        </a>
      );
    }

    return (
      <a
        href={loginHref}
        className="inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl font-bold text-sm hover:border-[#0066FF] transition-colors"
      >
        <Bookmark className="w-4 h-4" /> Save to Stack
      </a>
    );
  }

  if (compact) {
    return (
      <button
        disabled={pending}
        onClick={toggle}
        title={saved ? 'Unsave' : 'Save to Stack'}
        className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-colors disabled:opacity-50 shrink-0 ${
          saved
            ? 'bg-[#0066FF] border-[#0066FF] text-white hover:bg-[#0052CC]'
            : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-400 hover:text-[#0066FF] hover:border-[#0066FF]'
        }`}
      >
        {pending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : saved ? (
          <BookmarkCheck className="w-3.5 h-3.5" />
        ) : (
          <Bookmark className="w-3.5 h-3.5" />
        )}
      </button>
    );
  }

  return (
    <button
      disabled={pending}
      onClick={toggle}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 ${
        saved
          ? 'bg-[#0066FF] text-white hover:bg-[#0052CC]'
          : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#0066FF]'
      }`}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {pending ? '' : saved ? 'Saved' : 'Save to Stack'}
    </button>
  );
}
