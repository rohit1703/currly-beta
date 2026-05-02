'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Check, X, Loader2 } from 'lucide-react';

export default function CollectionManageControls({
  collectionId,
  initialName,
  initialDescription,
}: {
  collectionId: string;
  initialName: string;
  initialDescription: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const save = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, description: description.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) { setSaveError(json.error || 'Failed to save.'); return; }
      setEditing(false);
      router.refresh();
    } catch {
      setSaveError('Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const deleteCollection = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/collections/${collectionId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) { setDeleteError(json.error || 'Failed to delete.'); setDeleting(false); return; }
      router.push('/saved');
    } catch {
      setDeleteError('Something went wrong.');
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <div className="space-y-3">
        <div>
          <input
            autoFocus
            type="text"
            value={name}
            maxLength={100}
            onChange={e => { setName(e.target.value); setSaveError(null); }}
            onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }}
            className="text-xl font-bold w-full bg-transparent border-b-2 border-[#0066FF] focus:outline-none pb-1 dark:text-white"
          />
        </div>
        <textarea
          value={description}
          maxLength={500}
          placeholder="Add a description (optional)"
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="w-full text-sm text-gray-500 bg-transparent border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:border-[#0066FF] resize-none"
        />
        {saveError && <p className="text-xs text-red-500">{saveError}</p>}
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0066FF] text-white text-sm font-bold rounded-xl hover:bg-blue-600 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Save
          </button>
          <button
            onClick={() => { setEditing(false); setName(initialName); setDescription(initialDescription); }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/10 text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{initialName}</h1>
          {initialDescription && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{initialDescription}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setEditing(true)}
            title="Rename"
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 text-gray-400 hover:text-[#0066FF] hover:border-[#0066FF] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete collection"
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl px-2 py-1">
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">Delete?</span>
              <button
                onClick={deleteCollection}
                disabled={deleting}
                className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline disabled:opacity-60"
              >
                {deleting ? '...' : 'Yes'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
      {deleteError && <p className="text-xs text-red-500 mt-1">{deleteError}</p>}
    </div>
  );
}
