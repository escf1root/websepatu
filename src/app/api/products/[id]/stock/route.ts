import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getAdminSupabase();
    const productId = parseInt(params.id, 10);
    const body = await req.json();

    const stockBySize = body.stock_by_size || {};

    // Upsert sizes
    for (const [size, qty] of Object.entries(stockBySize)) {
      const quantity = parseInt(qty as string, 10);
      if (quantity < 0) {
        return NextResponse.json({ detail: `Stok untuk ukuran ${size} tidak boleh negatif.` }, { status: 400 });
      }

      // Check if exists
      const { data: existing } = await supabase
        .from('stock')
        .select('id')
        .eq('product_id', productId)
        .eq('size', size)
        .single();

      if (existing) {
        await supabase
          .from('stock')
          .update({ quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('stock')
          .insert({ product_id: productId, size, quantity });
      }
    }

    // Return updated stock summary
    const { data: stocks, error: sError } = await supabase
      .from('stock')
      .select('*')
      .eq('product_id', productId);

    if (sError) throw sError;

    const totalStock = stocks.reduce((sum, item) => sum + item.quantity, 0);
    const newStockBySize: Record<string, number> = {};
    stocks.forEach((item) => {
      newStockBySize[item.size] = item.quantity;
    });

    return NextResponse.json({
      success: true,
      product_id: productId,
      total_stock: totalStock,
      stock_by_size: newStockBySize,
      message: `Stok produk ID ${productId} berhasil diperbarui.`,
    });
  } catch (err: any) {
    console.error('API /products/[id]/stock PUT Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
