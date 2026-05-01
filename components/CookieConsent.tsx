'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import posthog from 'posthog-js';

const CONSENT_KEY = 'currly_analytics_consent';

export type ConsentValue = 'accepted' | 'declined';

export function getStoredConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  return (localStorage.getItem(CONSENT_KEY) as ConsentValue) || null;
}

export function setConsent(value: ConsentValue) {
  localStorage.setItem(CONSENT_KEY, value);
  if (value === 'accepted') {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show banner only if no prior choice has been made
    if (!getStoredConsent()) setVisible(true);
  }, []);

  const accept = () => {
    setConsent('accepted');
    setVisible(false);
  };

  const decline = () => {
    setConsent('declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pointer-events-none">
      <div className="max-w-2xl mx-auto bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 pointer-events-auto">
        <div className="flex-1 text-sm text-gray-600 dark:text-gray-400">
          We use analytics to understand how people discover tools and improve Currly.
          No advertising, no selling your data.{' '}
          <Link href="/privacy" className="text-[#0066FF] hover:underline">Privacy Policy</Link>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-white/10"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 text-sm font-bold bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-xl transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
