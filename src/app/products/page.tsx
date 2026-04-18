'use client';

// IMPROVEMENT: Fully enhanced products listing page with:
// - Search bar (name + brand)
// - Sort dropdown (relevansi, harga asc/desc, nama A-Z)
// - "Clear all filters" button + active filter count badge
// - Mobile filter drawer (slide-in from left)
// - QuickView modal integration
// - Breadcrumb navigation
// - Responsive grid: 1col → 2col → 3col → 4col
// - Enhanced skeleton loading
// - Empty state illustration
// - Product count with active filters display
// - All existing filter functionality preserved

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import QuickViewModal from '@/components/QuickViewModal';
import { useCartStore } from '@/store/cartStore';
import { normalizeBrandName } from '@/lib/utils';
import {
  ShoppingBag,
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  Home,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  imageFilename: string;
  totalStock: number;
  stockBySize: Record<string, number>;
}

const ALL_SIZES = ['39', '40', '41', '42', '43', '44'];

type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance',  label: 'Relevansi' },
  { value: 'price-asc',  label: 'Harga: Terendah' },
  { value: 'price-desc', label: 'Harga: Tertinggi' },
  { value: 'name-asc',   label: 'Nama: A–Z' },
];

// IMPROVEMENT: Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden animate-pulse">
      <div className="aspect-square bg-zinc-100" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-2.5 bg-zinc-100 rounded-full w-16" />
          <div className="h-2.5 bg-zinc-100 rounded-full w-14" />
        </div>
        <div className="h-4 bg-zinc-100 rounded-full w-3/4" />
        <div className="h-4 bg-zinc-100 rounded-full w-1/2" />
        <div className="h-px bg-zinc-50 w-full" />
        <div className="flex justify-between items-center">
          <div className="h-5 bg-zinc-100 rounded-full w-28" />
          <div className="flex gap-1">
            {[1,2,3].map(i => <div key={i} className="h-4 w-7 bg-zinc-100 rounded" />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// IMPROVEMENT: Empty state component
function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-5">
        <ShoppingBag size={32} strokeWidth={1.2} className="text-zinc-300" />
      </div>
      <h3 className="text-lg font-bold text-zinc-700 mb-2">
        {hasFilters ? 'Tidak ada produk yang cocok' : 'Belum ada produk'}
      </h3>
      <p className="text-zinc-400 text-sm mb-6 max-w-xs">
        {hasFilters
          ? 'Coba ubah filter atau kata kunci pencarianmu.'
          : 'Produk akan segera ditambahkan.'}
      </p>
      {hasFilters && (
        <button
          onClick={onClear}
          className="px-5 py-2.5 bg-zinc-900 text-white text-sm font-semibold rounded-full hover:bg-black transition-colors"
        >
          Hapus Semua Filter
        </button>
      )}
    </motion.div>
  );
}

export default function ProductsPage() {
  const [products, setProducts]           = useState<Product[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes]   = useState<string[]>([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [sortKey, setSortKey]             = useState<SortKey>('relevance');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen]   = useState(false);
  const [quickViewId, setQuickViewId]     = useState<number | null>(null);

  const { openDrawer, items } = useCartStore();
  const totalCartItems = items.reduce((s, i) => s + i.quantity, 0);

  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch products
  useEffect(() => {
    fetch('/api/products')
      .then((r) => {
        if (!r.ok) throw new Error('Gagal memuat produk');
        return r.json();
      })
      .then(setProducts)
      .catch(() => setError('Backend tidak dapat dijangkau. Pastikan server berjalan di port 8000.'))
      .finally(() => setLoading(false));
  }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Prevent body scroll when mobile filter panel open
  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileFiltersOpen]);

  const brands = useMemo(() =>
    Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);

  const toggleBrand = useCallback((brand: string) =>
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    ), []);

  const toggleSize = useCallback((size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    ), []);

  const clearAllFilters = useCallback(() => {
    setSelectedBrands([]);
    setSelectedSizes([]);
    setSearchQuery('');
    setSortKey('relevance');
  }, []);

  // IMPROVEMENT: Combined filter + search + sort logic
  const filteredAndSorted = useMemo(() => {
    let result = products.filter((p) => {
      const brandOk = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const sizeOk =
        selectedSizes.length === 0 ||
        selectedSizes.some((s) => (p.stockBySize[s] ?? 0) > 0);
      const searchOk =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        normalizeBrandName(p.brand).toLowerCase().includes(searchQuery.toLowerCase());
      return brandOk && sizeOk && searchOk;
    });

    switch (sortKey) {
      case 'price-asc':  result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price-desc': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'name-asc':   result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    return result;
  }, [products, selectedBrands, selectedSizes, searchQuery, sortKey]);

  const activeFilterCount =
    selectedBrands.length + selectedSizes.length + (searchQuery.trim() ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortKey)?.label ?? 'Urutkan';

  // IMPROVEMENT: Determine "new" badge — last 3 products by ID (highest IDs)
  const newestIds = useMemo(() => {
    const sorted = [...products].sort((a, b) => b.id - a.id);
    return new Set(sorted.slice(0, 3).map((p) => p.id));
  }, [products]);

  // ── Filter panel (shared between desktop sidebar and mobile drawer) ──
  const FilterPanel = ({ onClose }: { onClose?: () => void }) => (
    <div className="space-y-6">
      {/* Brand filter */}
      <div>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Brand</p>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => { toggleBrand(brand); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                selectedBrands.includes(brand)
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900'
              }`}
            >
              {normalizeBrandName(brand)}
            </button>
          ))}
        </div>
      </div>

      {/* Size filter */}
      <div>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Ukuran</p>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => { toggleSize(size); }}
              className={`w-11 h-11 rounded-xl text-sm font-bold transition-all duration-200 border ${
                selectedSizes.includes(size)
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={() => { clearAllFilters(); onClose?.(); }}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
        >
          <X size={12} />
          Hapus Semua Filter
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* ── IMPROVEMENT: Sticky top bar ─────────────────────────── */}
      <div className="bg-white/95 backdrop-blur-md border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">

            {/* LEFT: Breadcrumb */}
            <nav className="hidden sm:flex items-center gap-1 text-xs text-zinc-400 shrink-0">
              <Link href="/" className="hover:text-zinc-700 transition-colors flex items-center gap-1">
                <Home size={12} />
                <span>Home</span>
              </Link>
              <ChevronRight size={12} />
              <span className="text-zinc-700 font-semibold">Produk</span>
            </nav>

            {/* CENTER: Search bar */}
            <div className="flex-1 max-w-md relative">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk atau brand..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-full text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-400 focus:bg-white transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* RIGHT: Sort + Cart */}
            <div className="flex items-center gap-2 shrink-0">
              {/* IMPROVEMENT: Sort dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setSortDropdownOpen((v) => !v)}
                  className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-full hover:border-zinc-400 hover:text-zinc-900 transition-all duration-200"
                >
                  <ArrowUpDown size={13} />
                  <span className="max-w-[100px] truncate">{currentSortLabel}</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${sortDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {sortDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-44 bg-white border border-zinc-100 rounded-2xl shadow-xl overflow-hidden z-50 py-1"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortKey(opt.value); setSortDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                            sortKey === opt.value
                              ? 'bg-zinc-900 text-white font-bold'
                              : 'text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* IMPROVEMENT: Mobile filter trigger with badge */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden relative flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-full hover:border-zinc-400 transition-all duration-200"
              >
                <SlidersHorizontal size={13} />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#c0392b] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Cart button */}
              <button
                onClick={openDrawer}
                className="relative p-2 rounded-full hover:bg-zinc-100 transition-colors"
                aria-label="Keranjang belanja"
              >
                <ShoppingBag size={20} className="text-zinc-800" />
                {totalCartItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-zinc-900 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    {totalCartItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout ───────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">

          {/* ── IMPROVEMENT: Desktop sidebar filters ─────────────── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-[69px] bg-white rounded-2xl border border-zinc-100 p-5 shadow-[0_2px_12px_rgb(0,0,0,0.04)]">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-zinc-900">Filter</h2>
                {hasActiveFilters && (
                  <span className="w-5 h-5 bg-[#c0392b] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {!loading && <FilterPanel />}
              {loading && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-2 bg-zinc-100 rounded w-1/2" />
                  <div className="flex flex-wrap gap-1.5">
                    {[1,2,3].map(i => <div key={i} className="h-7 w-16 bg-zinc-100 rounded-full" />)}
                  </div>
                  <div className="h-2 bg-zinc-100 rounded w-1/3 mt-4" />
                  <div className="flex flex-wrap gap-1.5">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="w-11 h-11 bg-zinc-100 rounded-xl" />)}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* ── Products area ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* IMPROVEMENT: Status bar — product count + active filter chips */}
            {!loading && !error && (
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-zinc-500">
                    <span className="font-bold text-zinc-900">{filteredAndSorted.length}</span> produk
                    {hasActiveFilters && (
                      <span className="text-zinc-400"> · difilter dari {products.length}</span>
                    )}
                  </p>

                  {/* IMPROVEMENT: Active filter chips */}
                  {selectedBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => toggleBrand(b)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 text-white text-[11px] font-semibold rounded-full"
                    >
                      {normalizeBrandName(b)}
                      <X size={10} />
                    </button>
                  ))}
                  {selectedSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleSize(s)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 text-white text-[11px] font-semibold rounded-full"
                    >
                      EU {s}
                      <X size={10} />
                    </button>
                  ))}
                  {searchQuery.trim() && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="flex items-center gap-1 px-2.5 py-1 bg-zinc-900 text-white text-[11px] font-semibold rounded-full"
                    >
                      &quot;{searchQuery.slice(0, 16)}&quot;
                      <X size={10} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Loading skeletons */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <X size={24} className="text-red-400" />
                </div>
                <p className="text-zinc-700 font-semibold mb-1">Tidak dapat memuat produk</p>
                <p className="text-zinc-400 text-sm max-w-xs">{error}</p>
              </div>
            )}

            {/* IMPROVEMENT: Products grid — 1→2→3→4 columns */}
            {!loading && !error && (
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5"
              >
                <AnimatePresence mode="popLayout">
                  {filteredAndSorted.map((p, i) => (
                    <ProductCard
                      key={p.id}
                      id={p.id}
                      name={p.name}
                      brand={p.brand}
                      price={p.price}
                      imageFilename={p.imageFilename}
                      totalStock={p.totalStock}
                      stockBySize={p.stockBySize}
                      delay={Math.min(i * 0.05, 0.4)}
                      onQuickView={setQuickViewId}
                      isNew={newestIds.has(p.id)}
                    />
                  ))}
                </AnimatePresence>

                {/* Empty state */}
                {filteredAndSorted.length === 0 && (
                  <EmptyState hasFilters={hasActiveFilters} onClear={clearAllFilters} />
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── IMPROVEMENT: Mobile filter drawer (slide from left) ────── */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              key="filter-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              key="filter-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-[210] flex flex-col shadow-2xl lg:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-zinc-700" />
                  <h2 className="font-bold text-zinc-900 text-sm">Filter & Urutkan</h2>
                  {activeFilterCount > 0 && (
                    <span className="w-5 h-5 bg-[#c0392b] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
                >
                  <X size={17} className="text-zinc-600" />
                </button>
              </div>

              {/* Sort section in mobile drawer */}
              <div className="px-5 py-4 border-b border-zinc-50">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">Urutkan</p>
                <div className="space-y-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSortKey(opt.value)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        sortKey === opt.value
                          ? 'bg-zinc-900 text-white font-bold'
                          : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters in mobile drawer */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <FilterPanel onClose={() => setMobileFiltersOpen(false)} />
              </div>

              {/* Apply button */}
              <div className="px-5 py-4 border-t border-zinc-100">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full bg-zinc-900 text-white py-3 rounded-full font-bold text-sm hover:bg-black transition-colors"
                >
                  Tampilkan {filteredAndSorted.length} Produk
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick View Modal */}
      <QuickViewModal
        productId={quickViewId}
        onClose={() => setQuickViewId(null)}
      />

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
}
