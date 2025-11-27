'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Loader2 } from 'lucide-react'; // We'll use an SVG for Google
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  // Initialize Supabase Client (Client-side)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] dark:bg-black px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#111] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/10 text-center">
        
        {/* Logo & Header */}
        <div className="mb-8">
          <div className="w-12 h-12 bg-[#0066FF] rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg shadow-blue-500/30">
            C
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Sign in to access your saved tools and community.
          </p>
        </div>

        {/* Google Button (The only working method) */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 rounded-xl text-gray-700 dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
          ) : (
            <>
              {/* Google SVG Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Footer Note */}
        <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
          By signing in, you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}