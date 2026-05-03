'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, Plus, Loader2 } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

interface CollectionInfo {
  id: string;
  name: string;
}

interface Props {
  toolId: string;
  collections: CollectionInfo[];
  toolCollectionIds: string[];
  onToolCollectionIdsChange: (ids: string[]) => void;
  onNewCollection: (col: CollectionInfo) => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  compact?: boolean;
}

export default function CollectionPickerPopover({
  toolId,
  collections,
  toolCollectionIds,
  onToolCollectionIdsChange,
  onNewCollection,
  anchorRef,
  onClose,
  compact,
}: Props) {
  const posthog = usePostHog();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  // Position anchored to button
  useEffect(() => {
    const calc = () => {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      const W = 240;
      const H = 300;
      let top = r.bottom + 8;
      let left = r.left;
      if (top + H > window.innerHeight - 16) top = r.top - H - 8;
      if (left + W > window.innerWidth - 16) left = window.innerWidth - W - 16;
      setPos({ top, left });
    };
    calc();
    window.addEventListener('resize', calc);
    window.addEventListener('scroll', calc, true);
    return () => {
      window.removeEventListener('resize', calc);
      window.removeEventListener('scroll', calc, true);
    };
  }, [anchorRef]);

  // Click-outside + Escape
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (
        popoverRef.current?.contains(e.target as Node) ||
        anchorRef.current?.contains(e.target as Node)
      ) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose, anchorRef]);

  const toggle = async (col: CollectionInfo) => {
    const isIn = toolCollectionIds.includes(col.id);
    setPendingIds(p => new Set([...p, col.id]));
    const next = isIn
      ? toolCollectionIds.filter(id => id !== col.id)
      : [...toolCollectionIds, col.id];
    onToolCollectionIdsChange(next); // optimistic

    try {
      if (isIn) {
        const res = await fetch(`/api/collections/${col.id}/tools/${toolId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        posthog?.capture('tool_removed_from_collection', { tool_id: toolId, collection_id: col.id });
      } else {
        const res = await fetch(`/api/collections/${col.id}/tools`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool_id: toolId }),
        });
        if (!res.ok) throw new Error();
        posthog?.capture('tool_added_to_collection', { tool_id: toolId, collection_id: col.id });
      }
    } catch {
      onToolCollectionIdsChange(toolCollectionIds); // revert
    } finally {
      setPendingIds(p => { const s = new Set(p); s.delete(col.id); return s; });
    }
  };

  const createAndAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreateError(null);
    setCreateLoading(true);

    try {
      const res = await fetch('/api/collections/create-and-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tool_id: toolId }),
      });
      const json = await res.json();

      if (!res.ok) {
        setCreateError(json.error || 'Failed to create collection.');
        posthog?.capture('tool_add_to_new_collection_failed', {
          tool_id: toolId,
          reason: json.reason ?? (res.status === 409 ? 'duplicate_name' : 'unknown'),
          http_status: res.status,
        });
        return;
      }

      // Both create and add succeeded — update parent state and close input
      const newCol: CollectionInfo = { id: json.collection.id, name: json.collection.name };
      onNewCollection(newCol);
      onToolCollectionIdsChange([...toolCollectionIds, newCol.id]);
      posthog?.capture('collection_created_inline', { tool_id: toolId, collection_id: newCol.id });
      setCreating(false);
      setNewName('');
    } catch {
      setCreateError('Network error — please try again.');
      posthog?.capture('tool_add_to_new_collection_failed', {
        tool_id: toolId,
        reason: 'network_error',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const content = (
    <div
      ref={popoverRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width: 240 }}
      className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
    >
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-100 dark:border-white/5">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Save to collection
        </p>
      </div>

      {/* Collection list */}
      <div className="overflow-y-auto" style={{ maxHeight: 192 }}>
        {collections.length === 0 ? (
          <p className="px-3 py-3 text-xs text-gray-400">No collections yet — create one below.</p>
        ) : (
          collections.map(col => {
            const isIn = toolCollectionIds.includes(col.id);
            const pending = pendingIds.has(col.id);
            return (
              <button
                key={col.id}
                onClick={() => toggle(col)}
                disabled={pending}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50 text-left"
              >
                <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  isIn
                    ? 'bg-[#0066FF] border-[#0066FF]'
                    : 'border-gray-300 dark:border-white/20'
                }`}>
                  {pending
                    ? <Loader2 className="w-2.5 h-2.5 animate-spin text-gray-400" />
                    : isIn
                      ? <Check className="w-2.5 h-2.5 text-white" />
                      : null}
                </span>
                <span className="text-sm truncate flex-1">{col.name}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Create collection */}
      <div className="border-t border-gray-100 dark:border-white/5 px-3 py-2.5">
        {creating ? (
          <div className="space-y-1.5">
            <div className="flex gap-1.5">
              <input
                autoFocus
                type="text"
                placeholder="Collection name"
                value={newName}
                maxLength={100}
                disabled={createLoading}
                onChange={e => { setNewName(e.target.value); setCreateError(null); }}
                onKeyDown={e => {
                  if (e.key === 'Enter') createAndAdd();
                  if (e.key === 'Escape') { setCreating(false); setNewName(''); setCreateError(null); }
                }}
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 bg-transparent focus:outline-none focus:border-[#0066FF] dark:text-white placeholder:text-gray-400 disabled:opacity-50"
              />
              <button
                onClick={createAndAdd}
                disabled={createLoading}
                className="px-2.5 py-1.5 text-xs bg-[#0066FF] text-white rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-60 flex items-center gap-1"
              >
                {createLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Add'}
              </button>
            </div>
            {createError && <p className="text-xs text-red-500">{createError}</p>}
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 text-xs text-[#0066FF] font-semibold hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> New collection
          </button>
        )}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(content, document.body);
}
