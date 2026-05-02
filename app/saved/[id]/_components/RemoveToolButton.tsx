'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Loader2 } from 'lucide-react';

export default function RemoveToolButton({
  collectionId,
  toolId,
}: {
  collectionId: string;
  toolId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const remove = async () => {
    setLoading(true);
    try {
      await fetch(`/api/collections/${collectionId}/tools/${toolId}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={remove}
      disabled={loading}
      className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
      Remove from collection
    </button>
  );
}
