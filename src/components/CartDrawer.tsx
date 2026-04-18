'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeItem, updateQuantity } =
    useCartStore();
  const router = useRouter();

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(n);

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-zinc-900" />
                <h2 className="text-lg font-bold text-zinc-900">
                  Keranjang ({totalItems})
                </h2>
              </div>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
                aria-label="Tutup keranjang"
              >
                <X size={20} className="text-zinc-700" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="text-sm">Keranjang kamu kosong</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-4 items-start py-3 border-b border-zinc-50"
                  >
                    {/* Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-50 shrink-0">
                      <img
                        src={`/images/shoes/${item.imageFilename}`}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://placehold.co/64x64/f4f4f5/71717a?text=?';
                        }}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">
                        {item.brand}
                      </p>
                      <p className="text-sm font-semibold text-zinc-900 truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-zinc-500 mb-2">
                        Ukuran: {item.size}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Quantity */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.quantity - 1
                              )
                            }
                            aria-label="Kurangi jumlah"
                            className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition-all duration-150"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-bold w-6 text-center text-zinc-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.size,
                                item.quantity + 1
                              )
                            }
                            aria-label="Tambah jumlah"
                            className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-700 active:scale-95 transition-all duration-150"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <p className="text-sm font-bold text-zinc-900">
                          {formatIDR(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.productId, item.size)}
                      className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-zinc-400 transition-colors shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-zinc-100 space-y-3">
                <p className="text-xs text-zinc-400 text-center">
                  * Harga final dihitung saat checkout
                </p>
                <p className="text-sm text-zinc-500 text-center">
                  {totalItems} item di keranjang
                </p>
                <button
                  onClick={() => {
                    closeDrawer();
                    router.push('/checkout');
                  }}
                  className="w-full bg-zinc-900 text-white py-3.5 rounded-full font-semibold text-sm hover:bg-black transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Checkout Sekarang
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
