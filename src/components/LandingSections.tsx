"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { value: "10K+", label: "Happy Customers" },
  { value: "50+", label: "Premium Brands" },
  { value: "4.9★", label: "Average Rating" },
  { value: "2h", label: "Avg. Response Time" },
];

const TESTIMONIALS = [
  {
    quote:
      '"Kualitasnya luar biasa. Compass benar-benar mengubah cara saya memilih sepatu."',
    author: "Rina Dewi",
    location: "Jakarta",
    initial: "R",
  },
  {
    quote:
      '"Pengiriman cepat, packaging premium. Saya sudah beli 3 kali dan tidak kecewa."',
    author: "Budi Santoso",
    location: "Surabaya",
    initial: "B",
  },
  {
    quote:
      '"Brand lokal tapi kualitas internasional. Compass adalah pilihan terbaik untuk footwear premium."',
    author: "Sari Ananda",
    location: "Bandung",
    initial: "S",
  },
];

function StatCard({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.33, 1, 0.68, 1],
      }}
      className="flex flex-col items-center gap-2 p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm"
    >
      <span className="text-5xl md:text-6xl font-black text-white">
        {value}
      </span>
      <span className="text-white/40 text-xs uppercase tracking-[0.3em] text-center">
        {label}
      </span>
    </motion.div>
  );
}

export default function LandingSections() {
  const aboutRef = useRef<HTMLDivElement>(null);
  const aboutInView = useInView(aboutRef, { once: true, margin: "-100px" });

  return (
    <div className="bg-[#0d0303] relative z-10">
      {/* ── ABOUT SECTION ──────────────────────────────────────────────────── */}
      <section
        id="about"
        className="min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 py-32"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div ref={aboutRef}>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={aboutInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-[#c0392b] text-xs uppercase tracking-[0.4em] font-bold mb-6"
            >
              About Compass
            </motion.p>

            {/* Character-split text reveal */}
            <h2 className="text-5xl md:text-7xl font-black text-white leading-tight mb-8 overflow-hidden">
              {["Defining", "premium", "step", "by step."].map((word, wi) => (
                <span key={wi} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: "110%" }}
                    animate={aboutInView ? { y: 0 } : {}}
                    transition={{
                      duration: 0.7,
                      delay: 0.1 + wi * 0.12,
                      ease: [0.33, 1, 0.68, 1],
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={aboutInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="text-white/50 leading-relaxed text-base md:text-lg max-w-md"
            >
              Compass lahir dari kecintaan terhadap craftsmanship. Setiap produk
              dipilih dengan cermat kualitas bahan, kenyamanan pemakaian, dan
              desain yang tak lekang oleh waktu. Ini bukan sekadar sepatu. Ini
              pernyataan dirimu.
            </motion.p>
          </div>

          {/* Decorative side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={aboutInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="relative aspect-[4/5] rounded-3xl overflow-hidden"
          >
            <img
              src="/images/shoes/nike-airmax-270.jpg"
              alt="Compass premium shoes"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0303]/60 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-white font-black text-2xl">Stay in The Loop</p>
              <p className="text-white/50 text-sm mt-1">The icon, redefined.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BENTO GRID ─────────────────────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center text-[#c0392b] text-xs uppercase tracking-[0.4em] font-bold mb-4"
          >
            Featured Collection
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-white text-4xl md:text-6xl font-black text-center mb-16"
          >
            Handpicked for You
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Large card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="col-span-2 row-span-1 md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden aspect-[4/3] md:aspect-auto min-h-[280px] md:min-h-[400px] group bg-[#1a0a0a] border border-white/5"
            >
              <img
                src="/images/shoes/persepatuan.jpg"
                alt="Featured shoe"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white/50 text-xs uppercase tracking-wide mb-1">
                  Nike
                </p>
                <p className="text-white font-black text-2xl md:text-3xl">
                  Compass Tribune Home-Away
                </p>
                <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs px-4 py-2 rounded-full">
                  <button>Shop Now →</button>
                </div>
              </div>
            </motion.div>

            {/* Stat/Image cards (right column) */}
            {[
              { img: "/images/logocompass.png", alt: "Free Shipping" },
              { img: "/images/sampel.jpg", alt: "30-Day Returns" },
            ].map((card, i) => (
              <motion.div
                key={card.alt}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
                // ✅ Tambahkan aspect-ratio agar semua card seragam
                className="relative rounded-3xl bg-[#1a0a0a] border border-white/10 overflow-hidden group aspect-square md:aspect-[4/3]"
              >
                <img
                  src={card.img}
                  alt={card.alt}
                  // ✅ object-cover memaksa gambar full box tanpa distorsi
                  // ✅ object-center memastikan fokus crop di tengah (bisa diganti object-top/object-bottom)
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />

                {/* ✅ Overlay halus agar gambar tidak terlalu "mentah" */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-20 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────── */}
      <section className="px-8 md:px-16 lg:px-24 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-[#c0392b] text-xs uppercase tracking-[0.4em] font-bold mb-4"
          >
            Testimonials
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-white text-4xl md:text-6xl font-black text-center mb-16"
          >
            Loved by Thousands
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.author}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="relative rounded-2xl bg-[#1a0a0a] border border-white/8 p-8 flex flex-col gap-6 hover:border-[#c0392b]/30 transition-colors duration-300"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, s) => (
                    <span key={s} className="text-[#c0392b] text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-white/70 text-base leading-relaxed italic flex-1">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-[#c0392b]/20 flex items-center justify-center text-[#c0392b] font-black">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {t.author}
                    </p>
                    <p className="text-white/30 text-xs">{t.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ────────────────────────────────────────────────────── */}
      <section className="relative px-8 md:px-16 py-32 overflow-hidden">
        {/* Animated background circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[240, 400, 560].map((size, i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.08, 1], opacity: [0.05, 0.12, 0.05] }}
              transition={{
                duration: 4 + i * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i,
              }}
              className="absolute rounded-full border border-[#c0392b]"
              style={{ width: size, height: size }}
            />
          ))}
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white text-5xl md:text-7xl font-black leading-tight mb-8"
          >
            Ready to Find Your <span className="text-[#c0392b]">Direction</span>
            ?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/40 text-base md:text-lg mb-12 leading-relaxed"
          >
            Jelajahi koleksi premium kami. Mulai perjalananmu hari ini bersama
            Compass.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <a
              href="/products"
              className="group relative inline-flex items-center gap-3 bg-[#c0392b] text-white px-12 py-5 rounded-full text-sm font-bold tracking-widest uppercase overflow-hidden transition-all duration-300 hover:bg-[#a93226] hover:scale-105 active:scale-100"
            >
              Shop the Collection
              <span className="group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-8 md:px-16 lg:px-24 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8">
                  <svg
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                  >
                    <circle
                      cx="16"
                      cy="16"
                      r="14.5"
                      stroke="#c0392b"
                      strokeWidth="1"
                    />
                    <polygon
                      points="16,3 17.8,16 16,12 14.2,16"
                      fill="#c0392b"
                    />
                    <polygon
                      points="16,29 14.2,16 16,20 17.8,16"
                      fill="#c0392b"
                      opacity="0.5"
                    />
                    <polygon
                      points="3,16 16,14.2 12,16 16,17.8"
                      fill="#c0392b"
                      opacity="0.5"
                    />
                    <polygon
                      points="29,16 16,17.8 20,16 16,14.2"
                      fill="#c0392b"
                      opacity="0.5"
                    />
                    <circle cx="16" cy="16" r="2" fill="#c0392b" />
                  </svg>
                </div>
                <span className="text-white font-black text-lg tracking-[0.15em] uppercase">
                  Compass
                </span>
              </div>
              <p className="text-white/30 text-sm leading-relaxed">
                Premium footwear for those who know where they&apos;re going.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] mb-4">
                Navigate
              </p>
              <ul className="space-y-3">
                {["Home", "Products", "About", "Contact"].map((link) => (
                  <li key={link}>
                    <a
                      href={
                        link === "Home"
                          ? "/"
                          : link === "Products"
                            ? "/products"
                            : "#"
                      }
                      className="text-white/50 hover:text-white text-sm transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-white/20 text-[10px] uppercase tracking-[0.3em] mb-4">
                Contact
              </p>
              <p className="text-white/50 text-sm">hello@compass.id</p>
              <p className="text-white/50 text-sm mt-2">+62 021 1234 5678</p>
              <div className="flex gap-4 mt-6">
                {["IG", "X", "TT"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 text-xs transition-all"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/20 text-xs">
              © 2024 Compass. All rights reserved.
            </p>
            <p className="text-white/20 text-xs">Built with ♥ in Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
