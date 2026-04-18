// FIX: page.tsx — Hero text visibility at all zoom levels
// Key changes:
//   - Removed fixed h-screen wrapper that clips at 100%+ zoom
//   - SequenceScroll self-manages its sticky container (400vh)
//   - LandingSections stays on top via relative z-10
//   - No overflow-hidden on the main wrapper

import Navbar from '@/components/Navbar';
import Preloader from '@/components/Preloader';
import SequenceScroll from '@/components/SequenceScroll';
import LandingSections from '@/components/LandingSections';

export default function Home() {
  return (
    <>
      {/* ── Preloader (fades out after 2.2s) ──────────────────────────── */}
      <Preloader />

      {/* ── Fixed navigation bar ──────────────────────────────────────── */}
      <Navbar />

      {/* FIX: main uses min-h-screen (not fixed h-screen) so content never
          clips at 100–125% zoom. No overflow-hidden here — that was trapping
          the hero text inside the sticky canvas layer. */}
      <main className="relative min-h-screen">

        {/* ── HERO: Scroll-linked video scrubbing (400vh) ──────────────── */}
        {/*
          SequenceScroll creates an h-[400vh] sticky container.
          The canvas and text overlays are inside it at z-10 and above.
          Text uses pt-20 md:pt-24 internally to stay below the h-20 navbar.
          The sticky panel inside uses overflow-hidden — that is intentional
          for the canvas; text overlays are absolutely positioned inside it
          with z-10, which is above the canvas (z-0/z-5 vignettes).
        */}
        <SequenceScroll />

        {/* ── After-hero landing sections ───────────────────────────────── */}
        {/*
          FIX: relative z-10 ensures sections visually stack over hero background.
          No margin-top tweak needed — sections follow naturally after 400vh hero.
        */}
        <div className="relative z-10">
          <LandingSections />
        </div>
      </main>
    </>
  );
}
