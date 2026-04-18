'use client';

// IMPROVEMENT: Fully redesigned ProductCard with:
// - Visible "Add to Cart" hover overlay with size quick-select
// - Heart/wishlist toggle (localStorage persisted)
// - Eye icon → Quick View modal trigger
// - Color-coded stock indicator (green / orange / red)
// - "New" badge for products (id-based heuristic until API supports it)
// - Smoother hover lift & shadow transition

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { normalizeBrandName, formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { getImageUrl, PLACEHOLDER_IMG } from '@/lib/imageUrl';

interface ProductCardProps {
  id: number;
  name: string;
  brand: string;
  price: number;
  imageFilename: string;
  totalStock: number;
  stockBySize: Record<string, number>;
  delay?: number;
  onQuickView?: (id: number) => void;
  isNew?: boolean;
}

const SIZES = ['39', '40', '41', '42', '43', '44'];

// IMPROVEMENT: Color-coded stock indicator
function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
        Habis
      </span>
    );
  if (stock < 10)
    return (
      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
        Sisa {stock}
      </span>
    );
  return (
    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
      Tersedia
    </span>
  );
}

export default function ProductCard({
  id,
  name,
  brand,
  price,
  imageFilename,
  totalStock,
  stockBySize,
  delay = 0,
  onQuickView,
  isNew = false,
}: ProductCardProps) {
  const router = useRouter();
  const { addItem, openDrawer } = useCartStore();

  // IMPROVEMENT: Wishlist toggle — localStorage persisted per product
  const [wishlisted, setWishlisted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = JSON.parse(localStorage.getItem('compass-wishlist') || '[]');
      return saved.includes(id);
    } catch { return false; }
  });

  const [addedSize, setAddedSize] = useState<string | null>(null);
  const [showSizePicker, setShowSizePicker] = useState(false);

  const toggleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setWishlisted((prev) => {
        const next = !prev;
        try {
          const saved: number[] = JSON.parse(localStorage.getItem('compass-wishlist') || '[]');
          const updated = next ? [...saved, id] : saved.filter((x) => x !== id);
          localStorage.setItem('compass-wishlist', JSON.stringify(updated));
        } catch {}
        return next;
      });
    },
    [id]
  );

  const handleQuickView = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onQuickView?.(id);
    },
    [id, onQuickView]
  );

  // IMPROVEMENT: Direct size-based add-to-cart from card hover overlay
  const handleAddSize = useCallback(
    (e: React.MouseEvent, size: string) => {
      e.stopPropagation();
      addItem({
        productId: id,
        productName: name,
        brand,
        size,
        price,
        quantity: 1,
        imageFilename,
      });
      setAddedSize(size);
      setTimeout(() => {
        setAddedSize(null);
        setShowSizePicker(false);
        openDrawer();
      }, 700);
    },
    [id, name, brand, price, imageFilename, addItem, openDrawer]
  );



  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      // IMPROVEMENT: Hover lifts card; shadow deepens naturally
      whileHover={{ y: -6 }}
      onClick={() => !showSizePicker && router.push(`/products/${id}`)}
      className="bg-white rounded-2xl border border-zinc-100 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] hover:border-zinc-200 transition-shadow duration-300 overflow-hidden cursor-pointer group flex flex-col"
    >
      {/* ── Image area ────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-zinc-50">
        <img
          src={getImageUrl(imageFilename)}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
          }}
        />

        {/* IMPROVEMENT: Gradient overlay that appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* ── Top badges ── */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {/* IMPROVEMENT: "New" badge for new products */}
          {isNew && (
            <span className="bg-[#c0392b] text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
              New
            </span>
          )}
          {totalStock > 0 && totalStock < 10 && !isNew && (
            <span className="bg-amber-500/95 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
              Terbatas
            </span>
          )}
        </div>

        {/* ── Action buttons (top-right) ── */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          {/* IMPROVEMENT: Wishlist heart button */}
          <button
            onClick={toggleWishlist}
            aria-label={wishlisted ? 'Hapus dari wishlist' : 'Tambah ke wishlist'}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md transition-all duration-200 ${
              wishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-zinc-500 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* IMPROVEMENT: Eye/Quick-view button */}
          {onQuickView && (
            <button
              onClick={handleQuickView}
              aria-label="Pratinjau cepat"
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-zinc-500 hover:bg-white hover:text-zinc-900 flex items-center justify-center shadow-lg transition-all duration-200"
            >
              <Eye size={15} />
            </button>
          )}
        </div>

        {/* ── Out-of-stock overlay ── */}
        {totalStock === 0 && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <span className="bg-white/95 backdrop-blur-md text-zinc-900 text-xs font-bold tracking-widest uppercase px-6 py-2 rounded-full shadow-xl border border-white/40">
              Habis
            </span>
          </div>
        )}

        {/* ── IMPROVEMENT: Add-to-cart hover panel (size picker) ── */}
        {totalStock > 0 && (
          <div
            className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {!showSizePicker ? (
              // Quick "Add to Cart" button — shows size picker on click
              <button
                onClick={(e) => { e.stopPropagation(); setShowSizePicker(true); }}
                className="w-full bg-zinc-900/95 backdrop-blur-md text-white py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black transition-colors"
              >
                <ShoppingBag size={13} />
                Tambah ke Keranjang
              </button>
            ) : (
              // IMPROVEMENT: Inline size picker — select size → add immediately
              <div className="bg-white/98 backdrop-blur-md border-t border-zinc-100 p-3">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center mb-2">
                  Pilih Ukuran
                </p>
                <div className="grid grid-cols-6 gap-1">
                  {SIZES.map((size) => {
                    const inStock = (stockBySize[size] ?? 0) > 0;
                    const added = addedSize === size;
                    return (
                      <button
                        key={size}
                        disabled={!inStock}
                        onClick={(e) => inStock && handleAddSize(e, size)}
                        className={`h-9 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                          added
                            ? 'bg-emerald-500 text-white border border-emerald-500'
                            : inStock
                            ? 'bg-zinc-900 text-white hover:bg-zinc-700 border border-zinc-900'
                            : 'bg-zinc-50 text-zinc-300 border border-zinc-100 cursor-not-allowed'
                        }`}
                      >
                        {added ? <Check size={12} className="mx-auto" /> : size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Product info ─────────────────────────────────────────── */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Brand + stock badge row */}
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
            {normalizeBrandName(brand)}
          </p>
          {/* IMPROVEMENT: Color-coded stock badge */}
          <StockBadge stock={totalStock} />
        </div>

        {/* IMPROVEMENT: Product name with hover color transition */}
        <h3 className="text-zinc-900 font-bold text-[15px] leading-snug mb-3 line-clamp-2 group-hover:text-[#c0392b] transition-colors duration-300">
          {name}
        </h3>

        {/* Price row — clean, no size clutter */}
        <div className="mt-auto pt-3 border-t border-zinc-50">
          <p className="text-zinc-900 font-black text-lg tracking-tight">
            {formatPrice(price)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
