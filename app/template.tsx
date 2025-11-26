'use client';

import { motion, Variants } from 'framer-motion';

const mistVariants: Variants = {
  hidden: { 
    opacity: 0, 
    filter: 'blur(10px)', 
    scale: 0.99 // Micro-scale only, NO Y movement
  },
  visible: { 
    opacity: 1, 
    filter: 'blur(0px)', 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.25, 0.1, 0.25, 1] // Cubic bezier for "snappy" feel
    }
  },
  exit: { 
    opacity: 0, 
    filter: 'blur(10px)', 
    scale: 1.01,
    transition: { 
      duration: 0.3, 
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
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}