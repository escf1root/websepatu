import { NextRequest, NextResponse } from 'next/server';

const SHIPPING_COSTS: Record<string, number> = {
  jakarta: 15000,
  java: 25000,
  outside_java: 45000,
};

const TAX_RATE = 0.11;
const DISCOUNT_THRESHOLD = 500000;
const DISCOUNT_RATE = 0.10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body.items || [];
    const shippingZone = body.shipping_zone || 'java';

    let subtotal = 0;
    for (const item of items) {
      subtotal += (item.price || 0) * (item.quantity || 1);
    }

    const tax = Math.round(subtotal * TAX_RATE);
    const shipping = SHIPPING_COSTS[shippingZone] || 25000;
    
    let discount = 0;
    if (subtotal >= DISCOUNT_THRESHOLD) {
      discount = Math.round(subtotal * DISCOUNT_RATE);
    }

    const total = subtotal + tax + shipping - discount;

    return NextResponse.json({
      subtotal,
      tax,
      shipping,
      discount,
      total,
      tax_rate: "11%",
      discount_applied: subtotal >= DISCOUNT_THRESHOLD,
      shipping_zone: shippingZone,
    });
  } catch (err: unknown) {
    console.error('API /calculate-price POST Error:', err);
    return NextResponse.json({ error: (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
