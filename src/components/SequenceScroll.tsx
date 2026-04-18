'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, motion, useTransform, MotionValue } from 'framer-motion';

// ─── Config ──────────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 192;
const FRAME_BASE   = '/videos/sequences/img_'; // + '00001.jpg'
// Padding helper: img_00001.jpg format (5 digits zero-padded)
function frameSrc(i: number): string {
  return `${FRAME_BASE}${String(i).padStart(5, '0')}.jpg`;
}

// ─── Text overlay definition ──────────────────────────────────────────────────
interface Overlay {
  id: string;
  fadeIn: [number, number];
  fadeOut: [number, number];
  align: 'left' | 'center' | 'right';
  content: React.ReactNode;
}

// All overlay text content — pt-20 md:pt-24 keeps text below the h-20 navbar
const OVERLAYS: Overlay[] = [
  {
    id: 'title',
    fadeIn:  [0,    0.05],
    fadeOut: [0.08, 0.14],
    align: 'center',
    content: (
      // FIX #2: pt-20 keeps text below navbar; clamp() prevents overflow at 100–125% zoom
      <div className="text-center px-4 pt-20 md:pt-24">
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.45em] text-white/40 mb-4">
          Premium Footwear
        </p>
        <h1
          style={{ fontSize: 'clamp(3rem, 12vw, 9.6rem)' }}
          className="font-black leading-none tracking-tight text-white drop-shadow-2xl"
        >
          Compass
        </h1>
        <p className="text-white/50 text-base md:text-xl mt-4 tracking-wide drop-shadow-lg">
          Walk with purpose. Step with passion.
        </p>
      </div>
    ),
  },
  {
    id: 'langkah',
    fadeIn:  [0.25, 0.32],
    fadeOut: [0.44, 0.50],
    align: 'left',
    content: (
      // FIX #2: clamp() replaces fixed px — safe at 100%, 110%, 125% zoom
      <div className="pl-8 md:pl-24 pt-20 md:pt-24">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c0392b] mb-3">
          Our Story
        </p>
        <h2
          style={{ fontSize: 'clamp(2.5rem, 8vw, 6.25rem)', lineHeight: '0.92' }}
          className="font-black text-white drop-shadow-2xl"
        >
          Langkah<br />Setiap<br />Cerita
        </h2>
        <p className="text-white/40 text-sm md:text-base mt-6 max-w-xs leading-relaxed drop-shadow-lg">
          Setiap jejak menyimpan sebuah kisah. Setiap langkah membawa kita lebih jauh.
        </p>
      </div>
    ),
  },
  {
    id: 'quality',
    // FIX #1: Wider fade window — starts earlier, ends later → more reading time at all zoom levels
    fadeIn:  [0.48, 0.58],
    fadeOut: [0.82, 0.90],
    align: 'right',
    content: (
      // FIX #2: Reduced pt to pt-8/md:pt-12, added pb-8, max-h-[80vh] + flex centering
      // so 4-line text block never overflows h-screen at 100%–125% zoom
      <div className="pr-8 md:pr-24 text-right pt-8 md:pt-12 pb-8 max-h-[80vh] flex flex-col justify-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c0392b] mb-3">
          Craftsmanship
        </p>
        {/* FIX #3: Lower clamp() minimum (1.25rem) so text shrinks safely at 100% zoom;
            lineHeight 1.1 prevents lines from touching while staying compact */}
        <h2
          style={{ fontSize: 'clamp(1.25rem, 5vw, 5.625rem)', lineHeight: '1.1' }}
          className="font-black text-white drop-shadow-2xl"
        >
          Premium<br />Quality<br />Since<br />Day One
        </h2>
        <p className="text-white/40 text-sm md:text-base mt-4 max-w-xs ml-auto leading-relaxed drop-shadow-lg">
          Bahan terbaik, detail sempurna, kenyamanan tanpa kompromi.
        </p>
      </div>
    ),
  },
  {
    id: 'cta',
    fadeIn:  [0.85, 0.91],
    fadeOut: [0.97, 1.0],
    align: 'center',
    content: (
      // FIX #2: clamp() on CTA heading too for consistency
      <div className="text-center px-4 pt-20 md:pt-24">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c0392b] mb-4">
          Temukan Koleksimu
        </p>
        <h2
          style={{ fontSize: 'clamp(3rem, 10vw, 7.5rem)' }}
          className="font-black leading-none text-white mb-10 drop-shadow-2xl"
        >
          Shop Now
        </h2>
        <a
          href="/products"
          className="group relative inline-flex items-center gap-3 border border-white/30 text-white px-10 py-5 rounded-full text-sm font-semibold tracking-widest uppercase overflow-hidden transition-all duration-500 hover:border-[#c0392b]"
        >
          <span className="absolute inset-0 bg-[#c0392b] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
          <span className="relative z-10">Explore Collection</span>
          <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">→</span>
        </a>
      </div>
    ),
  },
];

// ─── Overlay item (fade + lift on enter) ─────────────────────────────────────
function OverlayItem({
  overlay,
  scrollYProgress,
}: {
  overlay: Overlay;
  scrollYProgress: MotionValue<number>;
}) {
  const opacity = useTransform(
    scrollYProgress,
    [overlay.fadeIn[0], overlay.fadeIn[1], overlay.fadeOut[0], overlay.fadeOut[1]],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    scrollYProgress,
    [overlay.fadeIn[0], overlay.fadeIn[1]],
    [36, 0]
  );

  const alignClass =
    overlay.align === 'left'  ? 'items-start  justify-start'  :
    overlay.align === 'right' ? 'items-end    justify-end'    :
                                'items-center justify-center';

  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute inset-0 flex flex-col pointer-events-none z-10 ${alignClass}`}
    >
      <div className="pointer-events-auto">{overlay.content}</div>
    </motion.div>
  );
}

// ─── Scroll-down cue ─────────────────────────────────────────────────────────
function ScrollIndicator({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const opacity = useTransform(scrollYProgress, [0, 0.07], [1, 0]);
  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none z-10"
    >
      <span className="text-white/40 text-[10px] uppercase tracking-[0.4em]">Scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-[1px] h-8 bg-gradient-to-b from-white/50 to-transparent"
      />
    </motion.div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-10">
      <motion.div style={{ scaleX, originX: 0 }} className="h-full bg-[#c0392b]" />
    </div>
  );
}

// ─── Preloader overlay ────────────────────────────────────────────────────────
function LoaderOverlay({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0d0303]">
      {/* Spinning compass logo */}
      <div className="w-14 h-14 mb-6">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full animate-spin"
          style={{ animationDuration: '3s' }}
        >
          <circle cx="16" cy="16" r="14.5" stroke="#c0392b" strokeWidth="1" />
          <polygon points="16,3 17.8,16 16,12 14.2,16" fill="#c0392b" />
          <polygon points="16,29 14.2,16 16,20 17.8,16" fill="#c0392b" opacity="0.5" />
          <polygon points="3,16 16,14.2 12,16 16,17.8"  fill="#c0392b" opacity="0.5" />
          <polygon points="29,16 16,17.8 20,16 16,14.2" fill="#c0392b" opacity="0.5" />
          <circle cx="16" cy="16" r="2" fill="#c0392b" />
        </svg>
      </div>
      <p className="text-white font-black text-xl tracking-[0.5em] uppercase mb-2">Compass</p>
      <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] mb-8">Premium Footwear</p>
      {/* Progress bar */}
      <div className="w-48 h-[1px] bg-white/10 overflow-hidden">
        <div
          className="h-full bg-[#c0392b] transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-white/20 text-[10px] mt-3 tracking-widest">
        {Math.round(progress)}%
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SequenceScroll() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const imagesRef     = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);       // tracks last drawn frame to skip no-ops
  const rafRef        = useRef<number | null>(null);

  // Loading state: null = not started, 0–100 = loading, true = done
  const [loadProgress, setLoadProgress] = useState<number | true>(0);
  const isLoaded = loadProgress === true;

  // ── Scroll tracking (400vh container) ────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // ── Preload all frames ────────────────────────────────────────────────────
  useEffect(() => {
    let loaded = 0;
    const imgs: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    imagesRef.current = imgs;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const idx = i; // closure
      const img = new Image();
      img.onload = () => {
        loaded++;
        // Update progress every 5 frames to avoid too many re-renders
        if (loaded % 5 === 0 || loaded === TOTAL_FRAMES) {
          const pct = (loaded / TOTAL_FRAMES) * 100;
          setLoadProgress(loaded === TOTAL_FRAMES ? true : pct);
        }
      };
      img.onerror = () => {
        // Count failed as loaded so we don't stall
        loaded++;
        if (loaded === TOTAL_FRAMES) setLoadProgress(true);
      };
      img.src = frameSrc(i + 1); // frames are 1-indexed
      imgs[idx] = img;
    }
  }, []);

  // ── Canvas draw loop (rAF) ────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Size canvas to device pixel ratio for crisp rendering
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
      // Redraw current frame after resize
      drawFrame(currentFrameRef.current);
    };
    window.addEventListener('resize', resize);
    resize();

    function drawFrame(frameIdx: number) {
      const img = imagesRef.current[frameIdx];
      if (!img || !img.complete || !canvas || !ctx) return;

      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const iw = img.naturalWidth  || img.width;
      const ih = img.naturalHeight || img.height;

      // Cover fit: maintain aspect ratio, fill canvas
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const dx = (cw - sw) / 2;
      const dy = (ch - sh) / 2;

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, sw, sh);
    }

    const tick = () => {
      const progress = scrollYProgress.get(); // 0 → 1
      // Map progress to frame index (0-based)
      const rawIdx = Math.round(progress * (TOTAL_FRAMES - 1));
      const frameIdx = Math.min(Math.max(rawIdx, 0), TOTAL_FRAMES - 1);

      if (frameIdx !== currentFrameRef.current) {
        currentFrameRef.current = frameIdx;
        drawFrame(frameIdx);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // Draw first frame immediately so canvas isn't blank
    drawFrame(0);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isLoaded, scrollYProgress]);

  return (
    // 400vh sticky container — drives the scroll-to-frame mapping
    <div ref={containerRef} className="relative h-[400vh]">

      {/* Sticky full-screen panel */}
      {/* FIX #4: overflow-visible allows text overlay to render fully without being clipped;
          canvas is absolutely positioned so it stays contained within the viewport */}
      <div className="sticky top-0 h-screen w-full overflow-visible bg-[#111]">

        {/* ── Preloader (shown until all frames are loaded) ─────────────── */}
        {!isLoaded && (
          <LoaderOverlay progress={typeof loadProgress === 'number' ? loadProgress : 100} />
        )}

        {/* ── Canvas: image sequence rendered here ──────────────────────── */}
        {/*
          INTEGRATION POINT: frames at /public/videos/sequences/img_00001.jpg → img_00192.jpg
          Canvas draws based on scroll progress × TOTAL_FRAMES.
        */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            // Background matches the outer dark frames of the shoe sequence
            background: '#111',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        />

        {/* Subtle vignettes to improve text legibility over sequence frames */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50 pointer-events-none z-[5]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none z-[5]" />

        {/* ── Text overlays ─────────────────────────────────────────────── */}
        {OVERLAYS.map((overlay) => (
          <OverlayItem
            key={overlay.id}
            overlay={overlay}
            scrollYProgress={scrollYProgress}
          />
        ))}

        {/* ── Scroll progress bar ───────────────────────────────────────── */}
        <ProgressBar scrollYProgress={scrollYProgress} />

        {/* ── Scroll indicator (disappears after first scroll) ──────────── */}
        <ScrollIndicator scrollYProgress={scrollYProgress} />
      </div>
    </div>
  );
}
