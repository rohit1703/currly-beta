'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#F5F5F7] dark:bg-[#050505] text-gray-900 dark:text-white px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-xl font-bold mb-2">Search unavailable</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          We couldn't load the dashboard. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-[#0066FF] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#0052CC] transition-colors text-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-full font-bold hover:bg-gray-200 transition-colors text-sm"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
