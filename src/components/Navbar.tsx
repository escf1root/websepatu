// Admin access: Footer link or Ctrl+Shift+A (dev only)
// DO NOT add any admin link/button to the public navbar or mobile menu.
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { useAdminShortcut } from '@/hooks/useAdminShortcut';

// FIX: Clean nav links — no admin exposed here
const NAV_LINKS = [
  { label: 'Home',     href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About',    href: '/about' },
  { label: 'Contact',  href: '/#contact' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#' },
  { label: 'Twitter / X', href: '#' },
  { label: 'TikTok', href: '#' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const { items, openDrawer }     = useCartStore();
  const totalItems                = items.reduce((s, i) => s + i.quantity, 0);

  // FIX: Detect active route for link highlighting
  const pathname = usePathname();
  const isProductsPage = pathname === '/products';

  // FIX: Secure admin shortcut — Ctrl+Shift+A (dev only, no public UI)
  useAdminShortcut();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // FIX: Mobile menu — smooth slide-down with AnimatePresence
  const easeMenu = [0.76, 0, 0.24, 1] as [number, number, number, number];
  const menuVariants = {
    hidden:  { opacity: 0, y: '-100%' },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: easeMenu },
    },
    exit: {
      opacity: 0,
      y: '-100%',
      transition: { duration: 0.6, ease: easeMenu },
    },
  };

  const easeLink = [0.33, 1, 0.68, 1] as [number, number, number, number];
  const linkVariants = {
    hidden:  { opacity: 0, y: 60 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.1 + i * 0.08, ease: easeLink },
    }),
  };

  // FIX: Determine if a nav link is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('#')[0]) && href.split('#')[0].length > 1;
  };

  return (
    <>
      {/* ── Navbar Bar ───────────────────────────────────────────────────────
          FIX: bg-white/90 backdrop-blur-md on scroll, semi-transparent at top
          FIX: h-20 fixed — creates a consistent safe zone for all hero text  */}
      <header
        className={`fixed top-0 left-0 right-0 z-[200] h-20 flex items-center transition-all duration-500 ${
          scrolled && !menuOpen
            ? 'bg-[#0d0303]/90 backdrop-blur-xl border-b border-white/5'
            : 'bg-black/30 backdrop-blur-md'
        }`}
      >
        <nav className="flex items-center justify-between px-6 md:px-12 w-full">

          {/* LEFT: Back button on /products, Logo everywhere else */}
          {isProductsPage ? (
            // FIX: Back-to-home button on products page
            <Link
              href="/"
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
              aria-label="Back to home"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-sm font-medium">Home</span>
            </Link>
          ) : (
            // FIX: Logo — links to home
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 group z-10 relative"
            >
              <div className="w-8 h-8 relative shrink-0">
                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <circle cx="16" cy="16" r="14.5" stroke="#c0392b" strokeWidth="1" />
                  <polygon points="16,3 17.8,16 16,12 14.2,16" fill="#c0392b" />
                  <polygon points="16,29 14.2,16 16,20 17.8,16" fill="#c0392b" opacity="0.5" />
                  <polygon points="3,16 16,14.2 12,16 16,17.8" fill="#c0392b" opacity="0.5" />
                  <polygon points="29,16 16,17.8 20,16 16,14.2" fill="#c0392b" opacity="0.5" />
                  <circle cx="16" cy="16" r="2" fill="#c0392b" />
                </svg>
              </div>
              <span className="text-white font-black text-lg tracking-[0.15em] uppercase">
                Compass
              </span>
            </Link>
          )}

          {/* CENTER/RIGHT: Desktop nav links
              FIX: Home | Products | About | Contact — NO admin link        */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm tracking-wide transition-colors duration-200 group
                    ${active
                      ? 'text-white font-semibold'
                      : 'text-white/60 hover:text-white font-medium'
                    }`}
                >
                  {link.label}
                  {/* FIX: Underline hover animation */}
                  <span
                    className={`absolute bottom-0 left-4 right-4 h-[1.5px] bg-[#c0392b] transition-all duration-300 origin-left
                      ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                  />
                </Link>
              );
            })}
          </div>

          {/* RIGHT: Cart + Hamburger */}
          <div className="flex items-center gap-4 z-10 relative">
            {/* Cart icon */}
            <button
              onClick={openDrawer}
              aria-label="Open cart"
              className="relative p-2 text-white/70 hover:text-white transition-colors"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#c0392b] text-white text-[9px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex flex-col gap-[5px] p-2 md:hidden"
            >
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block w-6 h-[1.5px] bg-white origin-center"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.2 }}
                className="block w-6 h-[1.5px] bg-white"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
                className="block w-6 h-[1.5px] bg-white origin-center"
              />
            </button>
          </div>
        </nav>
      </header>

      {/* ── Fullscreen mobile menu overlay ──────────────────────────────────
          FIX: slide-in from top, NO admin links anywhere in this menu      */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="fullscreen-menu"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[190] bg-[#0d0303] flex flex-col md:hidden"
          >
            {/* Noise texture overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              }}
            />

            <div className="flex-1 flex flex-col justify-between px-8 md:px-16 pt-28 pb-12">
              {/* Main nav links — NO admin */}
              <div className="space-y-1">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.div
                      key={link.label}
                      custom={i}
                      variants={linkVariants}
                      initial="hidden"
                      animate="visible"
                      className="overflow-hidden"
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className={`group block text-6xl md:text-8xl font-black transition-colors duration-300 leading-none py-2
                          ${active ? 'text-[#c0392b]' : 'text-white/90 hover:text-[#c0392b]'}`}
                      >
                        <span className="inline-block group-hover:translate-x-4 transition-transform duration-300">
                          {link.label}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom section: social + contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8"
              >
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-[0.3em] mb-4">Follow Us</p>
                  <div className="flex gap-6">
                    {SOCIAL_LINKS.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        className="text-white/60 hover:text-white text-sm transition-colors duration-200 underline underline-offset-4"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-white/30 text-xs uppercase tracking-[0.3em] mb-2">Contact</p>
                  <a href="mailto:hello@compass.id" className="text-white/70 hover:text-white text-sm transition-colors">
                    hello@compass.id
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Decorative maroon line at bottom */}
            <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c0392b] to-transparent opacity-40" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
