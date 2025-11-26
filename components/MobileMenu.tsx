'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { usePathname } from 'next/navigation';

interface MobileMenuProps {
  children: React.ReactNode;
}

export default function MobileMenu({ children }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes (user navigates)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent scrolling background when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-white/10"
        aria-label="Open Menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-[#FDFBF7] dark:bg-[#050505] p-6 shadow-2xl border-r border-gray-200 dark:border-white/10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <Logo />
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 pb-10">
                <div className="text-sm font-bold text-[#0066FF] uppercase tracking-wider mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-2">
                  <Filter className="w-4 h-4" /> Filters & Menu
                </div>
                {/* This is where the filters from the parent page will render */}
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}