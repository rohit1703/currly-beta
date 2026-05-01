'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Trash2, BarChart3 } from 'lucide-react';
import { getStoredConsent, setConsent } from '@/components/CookieConsent';

export default function ProfileActions() {
  const router = useRouter();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setAnalyticsEnabled(getStoredConsent() === 'accepted');
  }, []);

  const toggleAnalytics = () => {
    const next = !analyticsEnabled;
    setConsent(next ? 'accepted' : 'declined');
    setAnalyticsEnabled(next);
  };

  const exportData = () => {
    window.location.href = '/api/user/export';
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (res.ok) {
        router.push('/?deleted=1');
      } else {
        const { error } = await res.json();
        alert(error || 'Deletion failed. Please try again or contact founders@currly.ai');
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Analytics toggle */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium">Analytics</p>
            <p className="text-xs text-gray-400">Help us improve Currly with anonymous usage data</p>
          </div>
        </div>
        <button
          onClick={toggleAnalytics}
          className={`relative w-10 h-6 rounded-full transition-colors ${analyticsEnabled ? 'bg-[#0066FF]' : 'bg-gray-200 dark:bg-white/10'}`}
          aria-label={analyticsEnabled ? 'Disable analytics' : 'Enable analytics'}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${analyticsEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Export */}
      <button
        onClick={exportData}
        className="w-full flex items-center gap-3 py-3 border-b border-gray-100 dark:border-white/5 hover:text-[#0066FF] transition-colors text-left"
      >
        <Download className="w-4 h-4 text-gray-400" />
        <div>
          <p className="text-sm font-medium">Export my data</p>
          <p className="text-xs text-gray-400">Download your account data as JSON</p>
        </div>
      </button>

      {/* Delete account */}
      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          className="w-full flex items-center gap-3 py-3 hover:text-red-500 transition-colors text-left"
        >
          <Trash2 className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-sm font-medium">Delete my account</p>
            <p className="text-xs text-gray-400">Permanently removes your account and all saved data</p>
          </div>
        </button>
      ) : (
        <div className="py-3 space-y-3">
          <p className="text-sm text-red-500 font-medium">This cannot be undone. All your saved tools and account data will be permanently deleted.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-2 text-sm font-medium rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={deleteAccount}
              disabled={deleting}
              className="flex-1 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition-colors"
            >
              {deleting ? 'Deleting…' : 'Yes, delete my account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
