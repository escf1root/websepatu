'use client';

// IMPROVEMENT: Quick view modal — user can preview product details without
// navigating away from the products listing page.

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, AlertCircle, Minus, Plus, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { normalizeBrandName, formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getImageUrl, PLACEHOLDER_IMG } from '@/lib/imageUrl';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  description: string;
  imageFilename: string;
  totalStock: number;
  stockBySize: Record<string, number>;
}

interface QuickViewModalProps {
  productId: number | null;
  onClose: () => void;
}

const SIZES = ['39', '40', '41', '42', '43', '44'];

export default function QuickViewModal({ productId, onClose }: QuickViewModalProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  const { addItem, openDrawer } = useCartStore();

  useEffect(() => {
    if (!productId) return;
    setProduct(null);
    setSelectedSize('');
    setQty(1);
    setSizeError(false);
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then(setProduct)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  // IMPROVEMENT: Lock body scroll when modal is open
  useEffect(() => {
    if (productId) {
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [productId]);

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    if (!product) return;
    setSizeError(false);
    addItem({
      productId: product.id,
      productName: product.name,
      brand: product.brand,
      size: selectedSize,
      price: product.price,
      quantity: qty,
      imageFilename: product.imageFilename,
    });
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 600);
    openDrawer();
    onClose();
  };

  const handleGoToDetail = () => {
    onClose();
    router.push(`/products/${productId}`);
  };

  return (
    <AnimatePresence>
      {productId && (
        <>
          {/* Backdrop */}
          <motion.div
            key="qv-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="qv-modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[310] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Pratinjau Produk</p>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-500"
                  aria-label="Tutup pratinjau"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1">
                {loading && (
                  <div className="flex items-center justify-center py-24">
                    {/* IMPROVEMENT: Branded spinner using Compass red */}
                    <div className="w-8 h-8 border-2 border-zinc-200 border-t-[#c0392b] rounded-full animate-spin" />
                  </div>
                )}

                {!loading && product && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                    {/* Left: Image */}
                    <div className="aspect-square bg-zinc-50 relative overflow-hidden">
                      <img
                        src={getImageUrl(product.imageFilename)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                        }}
                      />
                      {/* IMPROVEMENT: Low stock badge */}
                      {product.totalStock > 0 && product.totalStock < 10 && (
                        <span className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                          Stok Terbatas
                        </span>
                      )}
                    </div>

                    {/* Right: Info */}
                    <div className="p-6 flex flex-col">
                      <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-1">
                        {normalizeBrandName(product.brand)}
                      </p>
                      <h2 className="text-xl font-bold text-zinc-900 leading-snug mb-2">
                        {product.name}
                      </h2>
                      <p className="text-2xl font-black text-zinc-900 mb-3">
                        {formatPrice(product.price)}
                      </p>
                      {product.description && (
                        <p className="text-zinc-500 text-sm leading-relaxed mb-5 line-clamp-3">
                          {product.description}
                        </p>
                      )}

                      {/* Size picker */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Ukuran</p>
                          {sizeError && (
                            <span className="text-[11px] text-red-500 flex items-center gap-1">
                              <AlertCircle size={11} /> Pilih ukuran dulu
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-6 gap-1.5">
                          {SIZES.map((size) => {
                            const stock = product.stockBySize[size] ?? 0;
                            const isOut = stock === 0;
                            const isSelected = selectedSize === size;
                            return (
                              <button
                                key={size}
                                disabled={isOut}
                                onClick={() => { setSelectedSize(size); setSizeError(false); }}
                                className={`h-10 rounded-xl text-xs font-bold transition-all duration-200 border ${
                                  isOut
                                    ? 'bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed line-through'
                                    : isSelected
                                    ? 'bg-zinc-900 text-white border-zinc-900'
                                    : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-500'
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Qty */}
                      <div className="flex items-center gap-3 mb-5">
                        <p className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Jumlah</p>
                        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            className="px-3 py-2 hover:bg-zinc-100 transition-colors text-zinc-700"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-sm font-bold text-zinc-900">{qty}</span>
                          <button
                            onClick={() => setQty((q) => q + 1)}
                            className="px-3 py-2 hover:bg-zinc-100 transition-colors text-zinc-700"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* CTA buttons */}
                      <motion.button
                        animate={addedAnim ? { scale: [1, 0.93, 1.06, 1] } : {}}
                        transition={{ duration: 0.4 }}
                        onClick={handleAddToCart}
                        disabled={product.totalStock === 0}
                        className="w-full bg-zinc-900 text-white py-3 rounded-2xl font-bold text-sm hover:bg-black transition-all duration-200 flex items-center justify-center gap-2 mb-2 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ShoppingBag size={16} />
                        {product.totalStock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                      </motion.button>

                      <button
                        onClick={handleGoToDetail}
                        className="w-full border border-zinc-200 text-zinc-700 py-3 rounded-2xl font-semibold text-sm hover:border-zinc-400 hover:text-zinc-900 transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        Lihat Detail
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
