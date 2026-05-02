'use client';

import { useState } from 'react';
import { Globe, Lock, Link2, Copy, Check, Loader2, X } from 'lucide-react';

export default function CollectionShareControls({
  collectionId,
  initialIsPublic,
  initialShareToken,
  siteUrl,
}: {
  collectionId: string;
  initialIsPublic: boolean;
  initialShareToken: string | null;
  siteUrl: string;
}) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareToken, setShareToken] = useState(initialShareToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = async (body: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Failed.'); return null; }
      return json.collection;
    } catch {
      setError('Something went wrong.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const togglePublic = async () => {
    const updated = await patch({ is_public: !isPublic });
    if (updated) setIsPublic(updated.is_public);
  };

  const generateLink = async () => {
    const updated = await patch({ generate_share_token: true, is_public: true });
    if (updated) { setShareToken(updated.share_token); setIsPublic(true); }
  };

  const revokeLink = async () => {
    const updated = await patch({ revoke_share_token: true });
    if (updated) { setShareToken(null); setIsPublic(false); }
  };

  const copyLink = async () => {
    if (!shareToken) return;
    await navigator.clipboard.writeText(`${siteUrl}/s/${shareToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = shareToken ? `${siteUrl}/s/${shareToken}` : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPublic
            ? <Globe className="w-4 h-4 text-green-500" />
            : <Lock className="w-4 h-4 text-gray-400" />}
          <span className="text-sm font-medium">
            {isPublic ? 'Public collection' : 'Private collection'}
          </span>
        </div>
        <button
          onClick={togglePublic}
          disabled={loading}
          className={`relative w-10 h-6 rounded-full transition-colors disabled:opacity-50 ${isPublic ? 'bg-green-500' : 'bg-gray-200 dark:bg-white/10'}`}
          aria-label={isPublic ? 'Make private' : 'Make public'}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>

      {shareUrl ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 min-w-0">
            <Link2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs text-gray-500 truncate">{shareUrl}</span>
          </div>
          <button
            onClick={copyLink}
            title="Copy link"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 hover:border-[#0066FF] hover:text-[#0066FF] transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={revokeLink}
            disabled={loading}
            title="Revoke link"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 hover:border-red-400 hover:text-red-500 transition-colors shrink-0 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
          </button>
        </div>
      ) : (
        <button
          onClick={generateLink}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-[#0066FF] font-semibold hover:underline disabled:opacity-50"
        >
          {loading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Link2 className="w-3.5 h-3.5" />}
          Generate share link
        </button>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
