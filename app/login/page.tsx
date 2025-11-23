'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, Github } from 'lucide-react'; // We'll use an SVG for Google
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // 1. THE GOOGLE LOGIN LOGIC
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      alert(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground font-sans">
      
      {/* LEFT: ART */}
      <div className="hidden lg:flex w-1/2 bg-[#0A0A0A] items-center justify-center border-r border-border relative overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#D4E6B5] opacity-[0.05] blur-[120px] rounded-full" />
         <div className="relative z-10 p-12 max-w-lg">
            <h1 className="text-5xl font-bold mb-6 tracking-tight text-white">Currly.</h1>
            <p className="text-xl text-neutral-400 leading-relaxed">The intelligence layer for your SaaS stack. Join 380+ founders optimizing their workflow.</p>
         </div>
      </div>

      {/* RIGHT: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to access your stacks and bookmarks.</p>
          </div>

          <div className="space-y-4">
            
            {/* 2. THE NEW GOOGLE BUTTON */}
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black border border-neutral-200 py-3 rounded-xl font-bold hover:bg-neutral-100 transition-all shadow-sm"
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5"/> : (
                <>
                  {/* Google Icon SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase">Or email</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {/* Email Form (Visual Only for Beta) */}
            <form className="space-y-4">
              <input type="email" placeholder="name@company.com" className="w-full bg-muted/50 border border-border rounded-xl p-3 text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
              <button type="button" className="w-full bg-primary/10 text-primary-darker border border-primary/20 font-bold py-3 rounded-xl hover:bg-primary/20 transition-colors">
                Sign In with Email
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}