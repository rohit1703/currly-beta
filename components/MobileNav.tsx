'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Users, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-lg md:hidden pb-safe">
      <div className="flex justify-around items-center h-16">
        <Link href="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}>
          <LayoutGrid className="w-6 h-6" />
          <span className="text-[10px] font-medium">Discover</span>
        </Link>

        <Link href="/feed" className={`flex flex-col items-center gap-1 ${isActive('/feed') ? 'text-primary' : 'text-muted-foreground'}`}>
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-medium">Community</span>
        </Link>

        <Link href="/login" className={`flex flex-col items-center gap-1 ${isActive('/login') ? 'text-primary' : 'text-muted-foreground'}`}>
          <User className="w-6 h-6" />
          <span className="text-[10px] font-medium">Login</span>
        </Link>
      </div>
    </div>
  );
}