import React from 'react';

export const Logo = () => (
  <div className="flex items-center gap-2 group cursor-pointer">
    {/* The Blue Square C */}
    <div className="w-10 h-10 bg-[#0066FF] rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-[0_4px_14px_0_rgba(0,102,255,0.39)] transition-transform group-hover:scale-105">
      C
    </div>
    {/* The Wordmark */}
    <span className="font-bold text-2xl tracking-tight text-[#1A1A1A] dark:text-white">
      currly
    </span>
  </div>
);