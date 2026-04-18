'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import CheckoutForm from '@/components/CheckoutForm';

export default function CheckoutPage() {
  const { items } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/products');
    }
  }, [items, router]);

  if (items.length === 0) return null;

  return <CheckoutForm />;
}
