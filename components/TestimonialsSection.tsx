'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "Currly community has become my Sunday ritual. I discover new tools, test them during the week, and share findings on Friday. The collaborative learning is unmatched.",
    author: "Priya Malhotra",
    role: "Marketing Manager"
  },
  {
    quote: "The developer tools section is gold. I've discovered APIs and frameworks here that completely transformed my workflow. These aren't casual users, they're experts.",
    author: "Arjun Kumar",
    role: "Full-Stack Developer"
  },
  {
    quote: "What I love most is the honesty. People don't just share what's cool—they share what actually works and what doesn't. That authenticity is rare.",
    author: "Sneha Reddy",
    role: "Product Designer"
  },
  {
    quote: "I run a 15-person startup on a tight budget. This community has helped me build a world-class tech stack. I've saved 10x what I would've spent on wrong choices.",
    author: "Vikram Singh",
    role: "Startup Founder"
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white dark:bg-black overflow-hidden border-t border-gray-100 dark:border-white/5">
      <div className="container mx-auto px-4 mb-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Trusted by 420+ Professionals
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          See how others are using Currly to find the right tools for their workflow.
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full mask-linear-fade">
        <div className="flex overflow-hidden">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
            className="flex flex-shrink-0 gap-6 px-6"
          >
            {/* Double the list for seamless looping */}
            {[...testimonials, ...testimonials].map((item, idx) => (
              <div
                key={idx}
                className="w-[350px] flex-shrink-0 rounded-2xl border border-gray-100 bg-gray-50 p-8 dark:border-gray-800 dark:bg-gray-900/50"
              >
                <div className="mb-6 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <blockquote className="mb-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
                  "{item.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                    {item.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{item.author}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}