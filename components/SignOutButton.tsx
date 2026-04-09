'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <button
      onClick={handleSignOut}
      className="w-full flex items-center justify-between px-6 py-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors rounded-b-3xl text-red-500 group"
    >
      <div className="flex items-center gap-3">
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Sign Out</span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
