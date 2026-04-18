import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items = body.items || [];
    const shippingZone = body.shipping_zone || 'java';
    const shippingAddress = body.shipping_address || {};

    const supabase = getAdminSupabase();

    // 1. Check stock availability
    for (const item of items) {
      const { data: stockDb, error: sError } = await supabase
        .from('stock')
        .select('id, quantity')
        .eq('product_id', item.productId)
        .eq('size', item.size)
        .single();
        
      if (sError || !stockDb || stockDb.quantity < item.quantity) {
        return NextResponse.json(
          { detail: `Stok tidak cukup untuk produk ID ${item.productId} ukuran ${item.size}` },
          { status: 409 }
        );
      }
    }

    // 2. Reduce stock
    for (const item of items) {
       const { data: stockDb } = await supabase
         .from('stock')
         .select('id, quantity')
         .eq('product_id', item.productId)
         .eq('size', item.size)
         .single();
         
       if (stockDb) {
         await supabase
           .from('stock')
           .update({ quantity: stockDb.quantity - item.quantity })
           .eq('id', stockDb.id);
       }
    }

    // 3. Calculate final price (same logic as /api/calculate-price)
    let subtotal = 0;
    for (const item of items) {
      subtotal += (item.price || 0) * (item.quantity || 1);
    }
    const tax = Math.round(subtotal * 0.11);
    
    const SHIPPING_COSTS: Record<string, number> = { jakarta: 15000, java: 25000, outside_java: 45000 };
    const shipping = SHIPPING_COSTS[shippingZone] || 25000;
    
    let discount = 0;
    if (subtotal >= 500000) {
      discount = Math.round(subtotal * 0.10);
    }
    const total = subtotal + tax + shipping - discount;

    // 4. Create Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = crypto.randomUUID().slice(0, 6).toUpperCase();
    const orderNumber = `SM-${dateStr}-${randomStr}`;

    // 5. Insert Order
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        items_json: JSON.stringify(items),
        subtotal,
        tax,
        shipping,
        discount,
        total_price: total,
        shipping_address: JSON.stringify(shippingAddress),
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.order_number,
      orderId: newOrder.id,
      priceBreakdown: {
        subtotal,
        tax,
        shipping,
        discount,
        total
      },
    });
  } catch (err: any) {
    console.error('API /order POST Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
