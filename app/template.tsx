'use client';

import { motion } from 'framer-motion';

// The "Glass Mist" Animation Configuration
const mistVariants = {
  hidden: { 
    opacity: 0, 
    filter: 'blur(10px)', 
    y: 5, // Slight upward drift for a "weightless" feel
    scale: 0.98 
  },
  visible: { 
    opacity: 1, 
    filter: 'blur(0px)', 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] // Custom "Apple-like" bezier curve
    }
  },
  exit: { 
    opacity: 0, 
    filter: 'blur(10px)', 
    y: -5,
    scale: 1.02,
    transition: { 
      duration: 0.4, 
      ease: "easeIn" 
    }
  }
};

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={mistVariants}
      initial="hidden"
      animate="visible"
      // "exit" only works with AnimatePresence in complex setups, 
      // but this setup ensures the ENTRY animation fires on every navigation.
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}