'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import { Check, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

type Step = 1 | 2 | 3;
type Zone = 'jakarta' | 'java' | 'outside_java';

interface PriceBreakdown {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  discount_applied: boolean;
  shipping_zone: string;
}

interface FormData {
  nama: string;
  telepon: string;
  alamat: string;
  kota: string;
  zone: Zone;
}

const ZONE_LABELS: Record<Zone, string> = {
  jakarta: 'Jakarta (Rp 15.000)',
  java: 'Pulau Jawa (Rp 25.000)',
  outside_java: 'Luar Jawa (Rp 45.000)',
};

const formatIDR = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);

export default function CheckoutForm() {
  const { items, clearCart } = useCartStore();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>({
    nama: '',
    telepon: '',
    alamat: '',
    kota: '',
    zone: 'java',
  });
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [calcError, setCalcError] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const goToStep2 = async () => {
    if (!form.nama || !form.telepon || !form.alamat || !form.kota) {
      setCalcError('Harap lengkapi semua field.');
      return;
    }
    setCalcError('');
    setLoadingCalc(true);
    try {
      const res = await fetch('/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            brand: i.brand,
            size: i.size,
            price: i.price,
            quantity: i.quantity,
            imageFilename: i.imageFilename,
          })),
          shipping_zone: form.zone,
        }),
      });
      if (!res.ok) throw new Error('Gagal menghitung harga');
      const data = await res.json();
      setPriceBreakdown(data);
      setStep(2);
    } catch {
      setCalcError('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 8000.');
    } finally {
      setLoadingCalc(false);
    }
  };

  const placeOrder = async () => {
    setOrderLoading(true);
    setOrderError('');
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            brand: i.brand,
            size: i.size,
            price: i.price,
            quantity: i.quantity,
            imageFilename: i.imageFilename,
          })),
          shipping_address: form,
          shipping_zone: form.zone,
        }),
      });
      if (res.status === 409) {
        setOrderError('Maaf stok produk habis. Silakan periksa kembali keranjang Anda.');
        return;
      }
      if (!res.ok) throw new Error('Gagal membuat pesanan');
      const data = await res.json();
      setOrderNumber(data.orderNumber);
      clearCart();
      setStep(3);
    } catch {
      setOrderError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
    } finally {
      setOrderLoading(false);
    }
  };

  const steps = [
    { num: 1, label: 'Alamat' },
    { num: 2, label: 'Review' },
    { num: 3, label: 'Konfirmasi' },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-10 gap-0">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step > s.num
                      ? 'bg-zinc-900 text-white'
                      : step === s.num
                      ? 'bg-zinc-900 text-white ring-4 ring-zinc-200'
                      : 'bg-zinc-200 text-zinc-500'
                  }`}
                >
                  {step > s.num ? <Check size={16} /> : s.num}
                </div>
                <span className={`text-xs font-medium ${step >= s.num ? 'text-zinc-900' : 'text-zinc-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-20 h-0.5 mb-4 mx-2 transition-all duration-500 ${
                    step > s.num ? 'bg-zinc-900' : 'bg-zinc-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Alamat */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm p-8"
            >
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Alamat Pengiriman</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Nama Lengkap</label>
                  <input
                    name="nama"
                    value={form.nama}
                    onChange={handleFormChange}
                    placeholder="Masukkan nama lengkap"
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Nomor Telepon</label>
                  <input
                    name="telepon"
                    value={form.telepon}
                    onChange={handleFormChange}
                    placeholder="08xxxxxxxxxx"
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Alamat Lengkap</label>
                  <textarea
                    name="alamat"
                    value={form.alamat}
                    onChange={handleFormChange}
                    rows={3}
                    placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Kota</label>
                  <input
                    name="kota"
                    value={form.kota}
                    onChange={handleFormChange}
                    placeholder="Nama kota"
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Zona Pengiriman</label>
                  <select
                    name="zone"
                    value={form.zone}
                    onChange={handleFormChange}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 transition bg-white"
                  >
                    {(Object.keys(ZONE_LABELS) as Zone[]).map((z) => (
                      <option key={z} value={z}>{ZONE_LABELS[z]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {calcError && (
                <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle size={16} />
                  {calcError}
                </div>
              )}

              <button
                onClick={goToStep2}
                disabled={loadingCalc}
                className="mt-6 w-full bg-zinc-900 text-white py-3.5 rounded-full font-semibold hover:bg-black transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loadingCalc ? <Loader2 size={18} className="animate-spin" /> : null}
                {loadingCalc ? 'Menghitung...' : 'Lanjut ke Review'}
              </button>
            </motion.div>
          )}

          {/* Step 2: Review */}
          {step === 2 && priceBreakdown && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-zinc-900 mb-4">Review Pesanan</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-50 shrink-0">
                        <img
                          src={`/images/shoes/${item.imageFilename}`}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/48x48/f4f4f5/71717a?text=?';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{item.productName}</p>
                        <p className="text-xs text-zinc-500">Ukuran {item.size} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-bold text-zinc-900 shrink-0">{formatIDR(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-base font-bold text-zinc-900 mb-4">Rincian Harga</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span>{formatIDR(priceBreakdown.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Pajak (PPN 11%)</span>
                    <span>{formatIDR(priceBreakdown.tax)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Ongkos Kirim</span>
                    <span>{formatIDR(priceBreakdown.shipping)}</span>
                  </div>
                  {priceBreakdown.discount_applied && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Diskon 10%</span>
                      <span>-{formatIDR(priceBreakdown.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-zinc-100 pt-2.5 flex justify-between font-bold text-zinc-900 text-base">
                    <span>Total</span>
                    <span>{formatIDR(priceBreakdown.total)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-white rounded-2xl shadow-sm p-6 text-sm text-zinc-600 space-y-1">
                <p className="font-semibold text-zinc-900 mb-2">Dikirim ke:</p>
                <p>{form.nama} ({form.telepon})</p>
                <p>{form.alamat}</p>
                <p>{form.kota} — {ZONE_LABELS[form.zone]}</p>
              </div>

              {orderError && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm">
                  <AlertCircle size={16} />
                  {orderError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-zinc-300 text-zinc-700 py-3.5 rounded-xl font-semibold hover:bg-zinc-50 transition-all duration-200"
                >
                  Kembali
                </button>
                <button
                  onClick={placeOrder}
                  disabled={orderLoading}
                  className="flex-1 bg-zinc-900 text-white py-3.5 rounded-full font-semibold hover:bg-black transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {orderLoading ? <Loader2 size={18} className="animate-spin" /> : null}
                  {orderLoading ? 'Memproses...' : 'Konfirmasi Pesanan'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Konfirmasi */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl shadow-sm p-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 size={40} className="text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Pesanan Berhasil!</h2>
              <p className="text-zinc-500 mb-4">Terima kasih telah berbelanja di SoleMate.</p>
              <div className="bg-zinc-50 rounded-xl px-6 py-4 mb-6 inline-block">
                <p className="text-xs text-zinc-500 mb-1">Nomor Pesanan</p>
                <p className="text-xl font-bold text-zinc-900 tracking-wider">{orderNumber}</p>
              </div>
              <br />
              <button
                onClick={() => router.push('/products')}
                className="bg-zinc-900 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-black transition-all duration-200"
              >
                Belanja Lagi
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
