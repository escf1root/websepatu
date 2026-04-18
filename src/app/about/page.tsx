'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '@/components/Navbar';

// ── Shared animation preset ────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: EASE },
});

// ── Brand milestones data ──────────────────────────────────────────────
const MILESTONES = [
  {
    year: '2018',
    title: 'Awal Sebuah Visi',
    desc: 'Compass lahir di sebuah garasi kecil di Jakarta. Bukan dari modal besar, melainkan dari satu pertanyaan sederhana: mengapa sepatu premium harus terasa jauh dari jangkauan?',
  },
  {
    year: '2019',
    title: 'Koleksi Perdana',
    desc: 'Peluncuran 12 model pertama kami. Dalam 72 jam, 500 pasang ludes terjual — bukan karena kami sempurna, tapi karena kami jujur terhadap apa yang kami buat.',
  },
  {
    year: '2021',
    title: 'Tumbuh Bersama Indonesia',
    desc: 'Ekspansi ke Surabaya, Bandung, dan Bali. Di setiap kota, kami bertemu pelanggan yang menjadi bagian dari keluarga Compass — dan setiap cerita mereka menginspirasi desain kami selanjutnya.',
  },
  {
    year: '2024',
    title: 'Menapak Lebih Jauh',
    desc: 'Kini Compass hadir di lebih dari 15 kota dengan 50+ model. Namun prinsip kami tidak berubah: setiap pasang sepatu adalah janji kami untuk kualitas yang bisa kamu percaya.',
  },
];

// ── Brand values data ──────────────────────────────────────────────────
const VALUES = [
  {
    icon: '◈',
    title: 'Kualitas Tanpa Kompromi',
    desc: 'Setiap material dipilih dengan cermat. Setiap jahitan diuji kekuatannya. Kami tidak akan melepas produk yang tidak kami banggakan sendiri.',
  },
  {
    icon: '◉',
    title: 'Warisan Nusantara',
    desc: 'Dibuat dengan jiwa Indonesia. Kerajinan tangan lokal, sensibilitas desain global — kami percaya bahwa kebanggan nasional bisa berjalan beriringan dengan gaya dunia.',
  },
  {
    icon: '◎',
    title: 'Inovasi Sejati',
    desc: 'Tradisi adalah fondasi, bukan batasan. Kami terus merancang ulang apa artinya "sepatu premium" di era modern — lebih ringan, lebih kuat, lebih ekspresif.',
  },
  {
    icon: '⊕',
    title: 'Kenyamanan Abadi',
    desc: 'Tampil memukau tidak harus menyiksa kaki. Desain kami lahir dari riset ergonomi yang serius, karena kami tahu kamu memakai sepatu sepanjang hari.',
  },
];

// ── Stats data ─────────────────────────────────────────────────────────
const STATS = [
  { value: '6+', label: 'Tahun Berkarya' },
  { value: '50+', label: 'Model Koleksi' },
  { value: '10K+', label: 'Pelanggan Setia' },
  { value: '15+', label: 'Kota di Indonesia' },
];

// ═══════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════
export default function AboutPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <main className="bg-[#0d0303] text-white overflow-x-hidden">
      <Navbar />

      {/* ── 1. HERO ──────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        aria-label="Compass hero"
      >
        {/* Parallax background layer */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0 pointer-events-none">
          {/* Compass rose SVG watermark */}
          <svg
            viewBox="0 0 600 600"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-[0.04]"
            aria-hidden="true"
          >
            <circle cx="300" cy="300" r="280" stroke="#c0392b" strokeWidth="1" fill="none" />
            <circle cx="300" cy="300" r="200" stroke="#c0392b" strokeWidth="0.5" fill="none" />
            <circle cx="300" cy="300" r="120" stroke="#c0392b" strokeWidth="0.5" fill="none" />
            <polygon points="300,20 312,300 300,240 288,300" fill="#c0392b" />
            <polygon points="300,580 288,300 300,360 312,300" fill="#c0392b" opacity="0.4" />
            <polygon points="20,300 300,288 240,300 300,312" fill="#c0392b" opacity="0.4" />
            <polygon points="580,300 300,312 360,300 300,288" fill="#c0392b" opacity="0.4" />
            <circle cx="300" cy="300" r="8" fill="#c0392b" />
          </svg>
          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d0303]/60 via-transparent to-[#0d0303]" />
        </motion.div>

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center pt-24 pb-16">
          <motion.p
            {...fadeUp(0.1)}
            className="text-[#c0392b] text-xs font-bold uppercase tracking-[0.4em] mb-6"
          >
            Tentang Compass
          </motion.p>

          <motion.h1
            {...fadeUp(0.2)}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-8"
          >
            Langkah Setiap{' '}
            <span className="text-[#c0392b] italic">Cerita.</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.35)}
            className="text-white/60 text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12"
          >
            Kami tidak sekadar membuat sepatu. Kami merancang kepercayaan diri yang kamu kenakan,
            kenyamanan yang menemanimu sepanjang hari, dan kualitas yang berbicara sendiri.
          </motion.p>

          <motion.div {...fadeUp(0.5)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-8 py-4 bg-[#c0392b] text-white font-bold text-sm uppercase tracking-widest rounded-full hover:bg-[#a93226] transition-colors duration-300"
            >
              Jelajahi Koleksi
            </Link>
            <a
              href="#story"
              className="px-8 py-4 border border-white/20 text-white/80 font-medium text-sm uppercase tracking-wider rounded-full hover:bg-white/5 hover:border-white/40 transition-all duration-300"
            >
              Cerita Kami ↓
            </a>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0d0303] to-transparent pointer-events-none" />
      </section>

      {/* ── 2. BRAND STORY TIMELINE ──────────────────────────────────── */}
      <section id="story" className="py-24 md:py-32 px-6 md:px-12 lg:px-24" aria-label="Brand story">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left: section header */}
            <div className="lg:sticky lg:top-32">
              <motion.p {...fadeUp(0)} className="text-[#c0392b] text-xs font-bold uppercase tracking-[0.4em] mb-4">
                Perjalanan Kami
              </motion.p>
              <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
                Dari Garasi ke{' '}
                <span className="text-[#c0392b]">Seluruh</span>{' '}
                Indonesia
              </motion.h2>
              <motion.p {...fadeUp(0.2)} className="text-white/50 text-base md:text-lg font-medium leading-relaxed">
                Setiap brand besar punya cerita sederhana di awalnya. Ini adalah milik kami —
                tanpa romantisasi berlebihan, hanya kerja keras dan cinta terhadap apa yang kami buat.
              </motion.p>
            </div>

            {/* Right: timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#c0392b]/60 via-[#c0392b]/20 to-transparent" />

              <div className="space-y-12">
                {MILESTONES.map((m, i) => (
                  <motion.div
                    key={m.year}
                    {...fadeUp(i * 0.12)}
                    className="relative pl-16"
                  >
                    {/* Year dot */}
                    <div className="absolute left-0 top-1 w-12 h-12 rounded-full bg-[#0d0303] border border-[#c0392b]/40 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#c0392b]" />
                    </div>

                    <p className="text-[#c0392b] text-xs font-black uppercase tracking-[0.3em] mb-2">
                      {m.year}
                    </p>
                    <h3 className="text-white text-xl font-bold mb-3 leading-snug">
                      {m.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed font-medium">
                      {m.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. STATS ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 border-y border-white/5" aria-label="Brand statistics">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                {...fadeUp(i * 0.1)}
                className="bg-[#0d0303] px-8 py-10 text-center group hover:bg-[#120505] transition-colors duration-300"
              >
                <p className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 group-hover:text-[#c0392b] transition-colors duration-300">
                  {s.value}
                </p>
                <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. MISSION & VALUES ──────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24" aria-label="Mission and values">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <motion.p {...fadeUp(0)} className="text-[#c0392b] text-xs font-bold uppercase tracking-[0.4em] mb-4">
              Misi &amp; Nilai
            </motion.p>
            <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Apa yang Membuat{' '}
              <span className="text-[#c0392b]">Compass</span>
              <br className="hidden md:block" /> Berbeda
            </motion.h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                {...fadeUp(i * 0.1)}
                className="group relative p-8 md:p-10 rounded-2xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#c0392b]/30 transition-all duration-400"
              >
                <div className="flex items-start gap-6">
                  <span
                    className="text-3xl text-[#c0392b]/60 group-hover:text-[#c0392b] transition-colors duration-300 shrink-0 mt-1 leading-none"
                    aria-hidden="true"
                  >
                    {v.icon}
                  </span>
                  <div>
                    <h3 className="text-white text-xl font-bold mb-3 leading-snug group-hover:text-[#c0392b] transition-colors duration-300">
                      {v.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed font-medium">
                      {v.desc}
                    </p>
                  </div>
                </div>
                {/* Hover corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 rounded-tr-2xl overflow-hidden pointer-events-none">
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-[3px] border-r-[3px] border-[#c0392b]/0 group-hover:border-[#c0392b]/40 transition-all duration-300 w-full h-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. CRAFTSMANSHIP ─────────────────────────────────────────── */}
      <section
        className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-[#080101]"
        aria-label="Craftsmanship"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            {/* Left: visual block */}
            <motion.div {...fadeUp(0)} className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-[#1a0808] to-[#2d1010] border border-white/5 overflow-hidden flex items-center justify-center">
                {/* Decorative grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage: `linear-gradient(#c0392b 1px, transparent 1px), linear-gradient(90deg, #c0392b 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                  }}
                />
                {/* Central visual */}
                <div className="relative z-10 text-center p-8">
                  <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto opacity-20" aria-hidden="true">
                    <circle cx="100" cy="100" r="90" stroke="#c0392b" strokeWidth="1" fill="none" />
                    <circle cx="100" cy="100" r="60" stroke="#c0392b" strokeWidth="0.5" fill="none" />
                    <polygon points="100,10 107,100 100,80 93,100" fill="#c0392b" />
                    <polygon points="100,190 93,100 100,120 107,100" fill="#c0392b" opacity="0.5" />
                    <polygon points="10,100 100,93 80,100 100,107" fill="#c0392b" opacity="0.5" />
                    <polygon points="190,100 100,107 120,100 100,93" fill="#c0392b" opacity="0.5" />
                    <circle cx="100" cy="100" r="5" fill="#c0392b" />
                  </svg>
                  <p className="text-white/20 text-xs font-bold uppercase tracking-[0.3em] mt-6">
                    Made with Purpose
                  </p>
                </div>
              </div>

              {/* Floating stat card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute -bottom-6 -right-6 md:-right-10 bg-[#c0392b] rounded-2xl p-6 shadow-2xl"
              >
                <p className="text-white text-3xl font-black leading-none">100%</p>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mt-1">
                  Quality Checked
                </p>
              </motion.div>
            </motion.div>

            {/* Right: text content */}
            <div className="lg:pl-4">
              <motion.p {...fadeUp(0)} className="text-[#c0392b] text-xs font-bold uppercase tracking-[0.4em] mb-4">
                Keahlian &amp; Ketelitian
              </motion.p>
              <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6">
                Dibuat untuk{' '}
                <span className="text-[#c0392b]">Bertahan</span>,
                <br /> Dirancang untuk{' '}
                <span className="italic">Bersinar.</span>
              </motion.h2>

              <div className="space-y-6">
                {[
                  {
                    title: 'Material Premium',
                    body: 'Kami hanya menggunakan leather grade-A, EVA foam berdensitas tinggi, dan outsole karet alam yang tahan lama. Setiap komonen dipilih oleh tim material kami yang berpengalaman.',
                  },
                  {
                    title: 'Proses Pengerjaan',
                    body: 'Dari pola hingga jahitan akhir, setiap pasang Compass melewati 47 tahap pemeriksaan. Tidak ada produk yang lolos jika tidak memenuhi standar kami.',
                  },
                  {
                    title: 'Uji Kenyamanan',
                    body: 'Setiap model diuji oleh panel 30 penggunaan nyata selama minimal 2 minggu sebelum diproduksi massal. Kenyamanan adalah syarat, bukan bonus.',
                  },
                ].map((item, i) => (
                  <motion.div key={item.title} {...fadeUp(0.2 + i * 0.1)}>
                    <h3 className="text-white text-base font-bold mb-2 flex items-center gap-3">
                      <span className="w-5 h-px bg-[#c0392b] inline-block shrink-0" />
                      {item.title}
                    </h3>
                    <p className="text-white/50 text-sm leading-relaxed pl-8 font-medium">
                      {item.body}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. BRAND PROMISE ─────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-6 md:px-12 lg:px-24" aria-label="Brand promise">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl border border-white/8 bg-white/[0.02] p-10 md:p-16 text-center overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#c0392b]/5 via-transparent to-transparent pointer-events-none" />

            <p className="text-[#c0392b] text-xs font-bold uppercase tracking-[0.4em] mb-6">
              Janji Kami
            </p>
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white mb-6">
              &ldquo;Kami tidak akan pernah melepas produk yang tidak kami percaya
              untuk dipakai oleh orang yang kami cintai.&rdquo;
            </blockquote>
            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
              — Tim Compass, Jakarta
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── 7. CALL TO ACTION ────────────────────────────────────────── */}
      <section
        className="py-24 md:py-32 px-6 md:px-12 lg:px-24 bg-[#c0392b] relative overflow-hidden"
        aria-label="Call to action"
      >
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.p {...fadeUp(0)} className="text-white/70 text-xs font-bold uppercase tracking-[0.4em] mb-6">
            Mulai Perjalananmu
          </motion.p>
          <motion.h2 {...fadeUp(0.1)} className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-white leading-tight mb-6">
            Siap Menemukan
            <br />
            <span className="italic opacity-80">Pasangan Langkahmu?</span>
          </motion.h2>
          <motion.p {...fadeUp(0.2)} className="text-white/70 text-lg font-medium leading-relaxed mb-10 max-w-xl mx-auto">
            Lebih dari 50 model menunggu untuk menemani setiap langkah hidupmu.
            Premium quality, harga yang masuk akal.
          </motion.p>
          <motion.div {...fadeUp(0.3)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="px-10 py-4 bg-white text-[#c0392b] font-black text-sm uppercase tracking-widest rounded-full hover:bg-white/90 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Lihat Semua Produk →
            </Link>
            <a
              href="mailto:hello@compass.id"
              className="px-10 py-4 border-2 border-white/40 text-white font-bold text-sm uppercase tracking-wider rounded-full hover:bg-white/10 hover:border-white/70 transition-all duration-300"
            >
              Hubungi Kami
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── 8. FOOTER ────────────────────────────────────────────────── */}
      <footer className="bg-[#080101] border-t border-white/5 py-16 px-6 md:px-12 lg:px-24" role="contentinfo">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8" aria-hidden="true">
                  <circle cx="16" cy="16" r="14.5" stroke="#c0392b" strokeWidth="1" />
                  <polygon points="16,3 17.8,16 16,12 14.2,16" fill="#c0392b" />
                  <polygon points="16,29 14.2,16 16,20 17.8,16" fill="#c0392b" opacity="0.5" />
                  <polygon points="3,16 16,14.2 12,16 16,17.8" fill="#c0392b" opacity="0.5" />
                  <polygon points="29,16 16,17.8 20,16 16,14.2" fill="#c0392b" opacity="0.5" />
                  <circle cx="16" cy="16" r="2" fill="#c0392b" />
                </svg>
                <span className="text-white font-black text-lg tracking-[0.15em] uppercase">Compass</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed font-medium max-w-xs">
                Premium footwear untuk mereka yang tahu ke mana mereka melangkah.
                Langkah setiap cerita.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] mb-5">Navigasi</p>
              <ul className="space-y-3">
                {[
                  { label: 'Beranda', href: '/' },
                  { label: 'Produk', href: '/products' },
                  { label: 'Tentang Kami', href: '/about' },
                ].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-white/50 hover:text-white text-sm font-medium transition-colors duration-200"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-white/30 text-xs font-bold uppercase tracking-[0.3em] mb-5">Kontak</p>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:hello@compass.id"
                    className="text-white/50 hover:text-white text-sm font-medium transition-colors duration-200"
                  >
                    hello@compass.id
                  </a>
                </li>
                <li>
                  <p className="text-white/50 text-sm font-medium">Jakarta, Indonesia</p>
                </li>
                <li className="flex gap-4 pt-2">
                  {['Instagram', 'TikTok', 'X'].map((s) => (
                    <a
                      key={s}
                      href="#"
                      className="text-white/30 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors duration-200"
                      aria-label={s}
                    >
                      {s}
                    </a>
                  ))}
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs font-medium">
              © {new Date().getFullYear()} Compass. All rights reserved.
            </p>
            <p className="text-white/20 text-xs font-medium">
              Premium Quality Since Day One.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
