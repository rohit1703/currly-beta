'use client';

import { useState, useRef, useCallback } from 'react';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { saveTool, unsaveTool } from '@/actions/saved';
import { usePostHog } from 'posthog-js/react';
import CollectionPickerPopover from './CollectionPickerPopover';

interface CollectionInfo {
  id: string;
  name: string;
}

interface Props {
  toolId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
  redirectTo?: string;
  compact?: boolean;
  // Collection picker mode (replaces legacy toggle when provided)
  userCollections?: CollectionInfo[];
  toolCollectionIds?: string[];
}

export default function SaveButton({
  toolId,
  initialSaved,
  isLoggedIn,
  redirectTo,
  compact = false,
  userCollections,
  toolCollectionIds: initialToolCollectionIds,
}: Props) {
  const posthog = usePostHog();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ── Collection picker mode ────────────────────────────────────────
  const pickerMode = isLoggedIn && userCollections !== undefined;

  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<CollectionInfo[]>(userCollections ?? []);
  const [toolCollectionIds, setToolCollectionIds] = useState<string[]>(
    initialToolCollectionIds ?? []
  );

  const isSavedViaCollections = toolCollectionIds.length > 0;

  const handleNewCollection = useCallback((col: CollectionInfo) => {
    setCollections(prev => [col, ...prev]);
  }, []);

  const openPicker = () => {
    posthog?.capture('collection_picker_opened', { tool_id: toolId, compact });
    setOpen(true);
  };

  // ── Legacy toggle mode ────────────────────────────────────────────
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const newSaved = !saved;
    setSaved(newSaved);
    startTransition(async () => {
      try {
        if (newSaved) await saveTool(toolId);
        else await unsaveTool(toolId);
      } catch {
        setSaved(!newSaved);
      }
    });
  };

  // ── Unauthenticated ───────────────────────────────────────────────
  if (!isLoggedIn) {
    const loginHref = redirectTo
      ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/login';

    if (compact) {
      return (
        <a
          href={loginHref}
          title="Save to Stack"
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-400 hover:text-[#0066FF] hover:border-[#0066FF] transition-colors shrink-0"
        >
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

  // ── Compact button ────────────────────────────────────────────────
  if (compact) {
    const isSaved = pickerMode ? isSavedViaCollections : saved;
    return (
      <>
        <button
          ref={buttonRef}
          onClick={pickerMode ? openPicker : toggle}
          disabled={!pickerMode && pending}
          title={isSaved ? 'Manage collections' : 'Save to collection'}
          className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-colors disabled:opacity-50 shrink-0 ${
            isSaved
              ? 'bg-[#0066FF] border-[#0066FF] text-white hover:bg-[#0052CC]'
              : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-400 hover:text-[#0066FF] hover:border-[#0066FF]'
          }`}
        >
          {!pickerMode && pending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isSaved ? (
            <BookmarkCheck className="w-3.5 h-3.5" />
          ) : (
            <Bookmark className="w-3.5 h-3.5" />
          )}
        </button>
        {pickerMode && open && (
          <CollectionPickerPopover
            toolId={toolId}
            collections={collections}
            toolCollectionIds={toolCollectionIds}
            onToolCollectionIdsChange={setToolCollectionIds}
            onNewCollection={handleNewCollection}
            anchorRef={buttonRef}
            onClose={() => setOpen(false)}
            compact
          />
        )}
      </>
    );
  }

  // ── Full button ───────────────────────────────────────────────────
  const isSaved = pickerMode ? isSavedViaCollections : saved;
  return (
    <>
      <button
        ref={buttonRef}
        onClick={pickerMode ? openPicker : toggle}
        disabled={!pickerMode && pending}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-60 ${
          isSaved
            ? 'bg-[#0066FF] text-white hover:bg-[#0052CC]'
            : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-[#0066FF]'
        }`}
      >
        {!pickerMode && pending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSaved ? (
          <BookmarkCheck className="w-4 h-4" />
        ) : (
          <Bookmark className="w-4 h-4" />
        )}
        {(!pickerMode && pending) ? '' : isSaved ? 'Saved' : 'Save to Stack'}
      </button>
      {pickerMode && open && (
        <CollectionPickerPopover
          toolId={toolId}
          collections={collections}
          toolCollectionIds={toolCollectionIds}
          onToolCollectionIdsChange={setToolCollectionIds}
          onNewCollection={handleNewCollection}
          anchorRef={buttonRef}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
