'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Hide preloader after a short delay
    const timer = setTimeout(() => setIsLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1a0a0a]"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center gap-4"
          >
            {/* Compass Rose Icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 relative"
            >
              <svg viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="28" cy="28" r="26" stroke="#7c1c1c" strokeWidth="1.5" />
                <polygon points="28,6 31,28 28,22 25,28" fill="#c0392b" />
                <polygon points="28,50 25,28 28,34 31,28" fill="#7c1c1c" opacity="0.6" />
                <polygon points="6,28 28,25 22,28 28,31" fill="#7c1c1c" opacity="0.6" />
                <polygon points="50,28 28,31 34,28 28,25" fill="#7c1c1c" opacity="0.6" />
                <circle cx="28" cy="28" r="3" fill="#c0392b" />
              </svg>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, letterSpacing: '0.2em' }}
              animate={{ opacity: 1, letterSpacing: '0.5em' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-white text-xl font-black uppercase tracking-[0.5em]"
            >
              Compass
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-white/40 text-xs uppercase tracking-[0.3em]"
            >
              Premium Footwear
            </motion.p>
          </motion.div>

          {/* Progress bar */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-white/10 overflow-hidden">
            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.8, ease: 'easeInOut' }}
              className="h-full bg-[#c0392b]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
