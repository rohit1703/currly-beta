'use client';

import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserNav() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();

    // Listen for auth changes (sign in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  if (loading) return null; // Prevent flicker

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-[#0066FF] rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm">
          {user.user_metadata.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
          ) : (
            <span>{user.email?.[0].toUpperCase()}</span>
          )}
        </div>
        <button 
          onClick={handleSignOut}
          className="text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // If not logged in, show Login link
  return (
    <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#0066FF] transition-colors">
      Login
    </Link>
  );
}