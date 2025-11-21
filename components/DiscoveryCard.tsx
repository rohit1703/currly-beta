'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion';
import { MapPin, Zap, ArrowUpRight } from 'lucide-react';

interface ToolProps {
  tool: {
    name: string;
    tagline: string;
    color: string;
    logo: string | null;
    price: string;
  };
  index: number;
}

export const DiscoveryCard = ({ tool, index }: ToolProps) => {
  const cardRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    let { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div 
      ref={cardRef}
      style={{ scale, opacity, y }}
      className="min-h-[70vh] flex items-center justify-center py-10 perspective-1000"
    >
      <div 
        onMouseMove={handleMouseMove}
        className="group relative w-full max-w-3xl bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`radial-gradient(650px circle at ${mouseX}px ${mouseY}px, ${tool.color}15, transparent 80%)`,
          }}
        />

        <div className="relative z-10 p-12 flex flex-col h-full min-h-[500px]">
          <div className="flex justify-between items-start mb-12">
            <div className="bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: tool.color }}></div>
              <span className="text-xs font-mono text-neutral-300 uppercase tracking-widest">Trending</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center transform transition-transform hover:rotate-45">
              <ArrowUpRight />
            </div>
          </div>

          <div className="mt-auto space-y-6">
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-white leading-[0.9]">
              {tool.name}
            </h2>
            <p className="text-xl text-neutral-400 max-w-lg leading-relaxed">
              {tool.tagline}
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-8">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Price</p>
              <p className="text-white font-mono">{tool.price}</p>
            </div>
            <div>
               <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Visual</p>
               <div className="flex items-center gap-2 text-orange-400">
                 {/* If no logo, show first letter */}
                 {tool.logo ? <img src={tool.logo} className="w-6 h-6 rounded" /> : <div className="w-6 h-6 bg-white/10 rounded text-xs flex items-center justify-center">{tool.name[0]}</div>}
               </div>
            </div>
            <div>
              <button className="w-full bg-[#D4E6B5] hover:bg-[#c2d6a1] text-black py-3 rounded-xl font-bold transition-transform active:scale-95 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};