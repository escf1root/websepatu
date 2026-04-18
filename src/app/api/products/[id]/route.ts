import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getAdminSupabase();
    const productId = parseInt(params.id, 10);

    const { data: p, error: pError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (pError || !p) {
      return NextResponse.json({ detail: 'Product not found' }, { status: 404 });
    }

    const { data: stocks, error: sError } = await supabase
      .from('stock')
      .select('*')
      .eq('product_id', productId);

    if (sError) throw sError;

    const totalStock = stocks.reduce((sum, item) => sum + item.quantity, 0);
    const stockBySize: Record<string, number> = {};
    stocks.forEach((item) => {
      stockBySize[item.size] = item.quantity;
    });

    return NextResponse.json({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
      description: p.description,
      imageFilename: p.image_filename,
      totalStock,
      stockBySize,
      createdAt: p.created_at,
    });
  } catch (err: unknown) {
    console.error('API /products/[id] GET Error:', err);
    return NextResponse.json({ error: (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getAdminSupabase();
    const productId = parseInt(params.id, 10);
    const body = await req.json();

    const { data: p, error: pError } = await supabase
      .from('products')
      .update({
        name: body.name.trim(),
        brand: body.brand.trim(),
        price: body.price,
        description: body.description.trim(),
        image_filename: body.image_filename.trim(),
      })
      .eq('id', productId)
      .select()
      .single();

    if (pError) throw pError;

    return NextResponse.json({
      success: true,
      id: p.id,
      message: `Produk '${p.name}' berhasil diperbarui.`,
    });
  } catch (err: unknown) {
    console.error('API /products/[id] PUT Error:', err);
    return NextResponse.json({ success: false, error: (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = getAdminSupabase();
    const productId = parseInt(params.id, 10);

    const { error: pError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (pError) throw pError;

    return NextResponse.json({
      success: true,
      message: `Produk ID ${productId} berhasil dihapus.`,
    });
  } catch (err: unknown) {
    console.error('API /products/[id] DELETE Error:', err);
    return NextResponse.json({ success: false, error: (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
}
