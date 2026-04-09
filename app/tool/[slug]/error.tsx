'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ToolError({
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
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] dark:bg-[#050505] text-gray-900 dark:text-white px-6">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-2">Couldn't load tool</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
          We hit an unexpected error loading this page.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-[#0066FF] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#0052CC] transition-colors text-sm"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-full font-bold hover:bg-gray-200 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </div>
    </div>
  );
}
