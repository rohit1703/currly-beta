'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Loader2, Github } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Fake delay to feel real, then go to dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#050505] text-white font-sans">
      {/* LEFT SIDE: BRANDING */}
      <div className="hidden lg:flex w-1/2 bg-[#0A0A0A] items-center justify-center border-r border-white/10 relative overflow-hidden">
         <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#D4E6B5] opacity-[0.05] blur-[120px] rounded-full" />
         <div className="relative z-10 p-12">
            <h1 className="text-5xl font-bold mb-4">Currly.</h1>
            <p className="text-xl text-neutral-400">The intelligence layer for your SaaS stack.</p>
         </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Welcome back</h2>
            <p className="text-neutral-400 text-sm">Enter your email to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="name@company.com" className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#D4E6B5]" required />
            <button disabled={isLoading} className="w-full bg-[#D4E6B5] hover:bg-[#c2d6a1] text-black font-bold p-3 rounded-lg flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="animate-spin w-4 h-4"/> : "Sign In"}
            </button>
          </form>

          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#050505] px-2 text-neutral-500">Or</span></div>

          <button className="w-full border border-white/10 bg-[#0A0A0A] hover:bg-neutral-800 text-white p-3 rounded-lg flex items-center justify-center gap-2 font-medium">
            <Github className="w-4 h-4" /> Continue with GitHub
          </button>
        </div>
      </div>
    </div>
  );
}