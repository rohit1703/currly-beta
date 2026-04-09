'use client';

import { useState, useTransition } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { saveTool, unsaveTool } from '@/actions/saved';

export default function SaveButton({
  toolId,
  initialSaved,
  isLoggedIn,
}: {
  toolId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <a
        href="/login"
        className="inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl font-bold text-sm hover:border-[#0066FF] transition-colors"
      >
        <Bookmark className="w-4 h-4" /> Save to Stack
      </a>
    );
  }

  return (
    <button
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          if (saved) {
            await unsaveTool(toolId);
            setSaved(false);
          } else {
            await saveTool(toolId);
            setSaved(true);
          }
        });
      }}
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
      {saved ? 'Saved' : 'Save to Stack'}
    </button>
  );
}
