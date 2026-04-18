import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getAdminSupabase();
    
    const { data: products, error: pError } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });
      
    if (pError) throw pError;
    
    const { data: stocks, error: sError } = await supabase
      .from('stock')
      .select('*');
      
    if (sError) throw sError;

    const result = products.map((p) => {
      const pStocks = stocks.filter((s) => s.product_id === p.id);
      const totalStock = pStocks.reduce((sum, item) => sum + item.quantity, 0);
      const stockBySize: Record<string, number> = {};
      pStocks.forEach((item) => {
        stockBySize[item.size] = item.quantity;
      });

      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price,
        description: p.description,
        imageFilename: p.image_filename,
        totalStock,
        stockBySize,
        createdAt: p.created_at,
      };
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error('API /products GET Error:', err);
    return NextResponse.json({ error: (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getAdminSupabase();
    
    const { data: newDbProduct, error: insertError } = await supabase
      .from('products')
      .insert({
        name: body.name.trim(),
        brand: body.brand.trim(),
        price: body.price,
        description: body.description.trim(),
        image_filename: body.image_filename.trim(),
      })
      .select()
      .single();

    if (insertError) throw insertError;
    
    const sizes = ["39", "40", "41", "42", "43", "44"];
    const initialStocks = sizes.map((s) => ({
      product_id: newDbProduct.id,
      size: s,
      quantity: 0
    }));
    
    const { error: stockError } = await supabase.from('stock').insert(initialStocks);
    if (stockError) throw stockError;

    return NextResponse.json({
      success: true,
      id: newDbProduct.id,
      message: `Produk '${newDbProduct.name}' berhasil ditambahkan.`,
    });
  } catch (err: unknown) {
    console.error('API /products POST Error:', err);
    return NextResponse.json({ success: false, error: (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
