'use client';

import { motion, Variants } from 'framer-motion';

// Explicitly type as Variants to fix build error
const mistVariants: Variants = {
  hidden: { 
    opacity: 0, 
    filter: 'blur(10px)', 
    y: 5, 
    scale: 0.98 
  },
  visible: { 
    opacity: 1, 
    filter: 'blur(0px)', 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.6, 
      // The error happened here. We keep the bezier curve but Typescript now accepts it because of the Variants type
      ease: [0.22, 1, 0.36, 1] 
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
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}