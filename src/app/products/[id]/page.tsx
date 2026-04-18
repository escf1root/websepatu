'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import CartDrawer from '@/components/CartDrawer';
import { ShoppingBag, ChevronRight, Minus, Plus, AlertCircle } from 'lucide-react';

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

const SIZES = ['39', '40', '41', '42', '43', '44'];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [addedAnim, setAddedAnim] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const { addItem, openDrawer, items } = useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(setProduct)
      .catch(() => router.push('/products'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const formatIDR = (n: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(n);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    if (!product) return;
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-zinc-400 animate-pulse">Memuat...</div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-zinc-500">
            <button onClick={() => router.push('/')} className="hover:text-zinc-900 transition-colors">Home</button>
            <ChevronRight size={14} />
            <button onClick={() => router.push('/products')} className="hover:text-zinc-900 transition-colors">Products</button>
            <ChevronRight size={14} />
            <span className="text-zinc-900 font-medium truncate max-w-[120px]">{product.name}</span>
          </nav>
          <button onClick={openDrawer} className="relative p-2.5 rounded-full hover:bg-zinc-100 transition-colors">
            <ShoppingBag size={22} className="text-zinc-800" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-zinc-900 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Image */}
          <div>
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-md">
              <img
                src={`/images/shoes/${product.imageFilename}`}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/600x600/f4f4f5/71717a?text=No+Image';
                }}
              />
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">
            <span className="inline-block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
              {product.brand}
            </span>
            <h1 className="text-3xl font-bold text-zinc-900 mb-3 leading-tight">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-zinc-900 mb-5">
              {formatIDR(product.price)}
            </p>
            <p className="text-zinc-500 text-sm leading-relaxed mb-7">
              {product.description}
            </p>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-zinc-700">Pilih Ukuran</p>
                {sizeError && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> Pilih ukuran dulu
                  </span>
                )}
              </div>
              <div className="grid grid-cols-6 gap-2">
                {SIZES.map((size) => {
                  const stock = product.stockBySize[size] ?? 0;
                  const isOut = stock === 0;
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      disabled={isOut}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      className={`h-12 rounded-xl text-sm font-semibold transition-all duration-200 border ${
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
              {/* Stock per size */}
              {selectedSize && (
                <p className="mt-2 text-xs text-zinc-500">
                  Stok ukuran {selectedSize}: <span className="font-semibold text-zinc-900">{product.stockBySize[selectedSize] ?? 0}</span>
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-7">
              <p className="text-sm font-bold text-zinc-700 mb-2">Jumlah</p>
              <div className="flex items-center gap-3 border border-zinc-200 rounded-xl w-fit px-2 py-1.5">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold text-zinc-900">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <motion.button
              animate={addedAnim ? { scale: [1, 0.93, 1.06, 1] } : {}}
              transition={{ duration: 0.4 }}
              onClick={handleAddToCart}
              className="w-full bg-zinc-900 text-white py-4 rounded-full font-bold text-base hover:bg-black transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ShoppingBag size={18} />
              Tambah ke Keranjang
            </motion.button>

            {/* Stock warning */}
            {product.totalStock < 10 && product.totalStock > 0 && (
              <p className="mt-3 text-center text-sm text-red-500 font-medium">
                ⚠ Stok terbatas — hanya {product.totalStock} tersisa
              </p>
            )}
          </div>
        </div>
      </div>

      <CartDrawer />
    </div>
  );
}
