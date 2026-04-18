/**
 * src/app/admin/upload/route.ts
 * ─────────────────────────────────────────────────────────────────────
 * API Route: POST /admin/upload
 *
 * Receives a file via multipart/form-data and uploads it to
 * Supabase Storage (bucket: "product-images").
 *
 * Returns: { success: true, filename: "https://<project>.supabase.co/..." }
 *
 * WHY SUPABASE STORAGE instead of local filesystem?
 * Vercel serverless functions run on a read-only filesystem.
 * Supabase Storage provides persistent, CDN-backed cloud storage for free
 * and integrates directly with the Supabase PostgreSQL database.
 *
 * REQUIRED ENVIRONMENT VARIABLES (set in Vercel Dashboard → Settings → Env Vars):
 *   NEXT_PUBLIC_SUPABASE_URL     — e.g. "https://xyzabc123.supabase.co"
 *   SUPABASE_SERVICE_ROLE_KEY    — from Project Settings → API → service_role key
 * ─────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';

// ── Config ──────────────────────────────────────────────────────────────
const SUPABASE_URL        = process.env.NEXT_PUBLIC_SUPABASE_URL     ?? '';
const SERVICE_ROLE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY    ?? '';
const BUCKET_NAME         = 'product-images'; // Supabase Storage bucket name

const MAX_SIZE_BYTES  = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES  = ['image/jpeg', 'image/png', 'image/webp'];


// ── POST handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 0. Check env vars are configured ─────────────────────────────────
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('[Upload] Supabase env vars are not set.');
    return NextResponse.json(
      {
        success: false,
        error:
          'Konfigurasi server belum selesai. Tambahkan NEXT_PUBLIC_SUPABASE_URL ' +
          'dan SUPABASE_SERVICE_ROLE_KEY ke environment variables Vercel.',
      },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    // ── 1. Validate: file must be present ──────────────────────────────
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada file yang dikirim.' },
        { status: 400 }
      );
    }

    // ── 2. Validate: file type ──────────────────────────────────────────
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Format tidak didukung. Gunakan JPG, PNG, atau WebP.' },
        { status: 400 }
      );
    }

    // ── 3. Validate: file size ──────────────────────────────────────────
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file terlalu besar. Maksimal 5MB.' },
        { status: 400 }
      );
    }

    // ── 4. Generate unique filename ─────────────────────────────────────
    const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const randomId = Math.random().toString(36).slice(2, 10);
    const filename = `${Date.now()}-${randomId}.${ext}`;

    // ── 5. Read file as ArrayBuffer ─────────────────────────────────────
    const buffer = await file.arrayBuffer();

    // ── 6. Upload to Supabase Storage via REST API ──────────────────────
    //    POST {SUPABASE_URL}/storage/v1/object/{bucket}/{filename}
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filename}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': file.type,
        'x-upsert': 'false',                   // error if filename already exists
        'Cache-Control': 'max-age=31536000',   // 1 year CDN cache
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const errData = await uploadRes.json().catch(() => ({}));
      const msg = (errData as { message?: string }).message ?? 'Upload ke Supabase Storage gagal.';
      throw new Error(`Supabase Storage error: ${msg}`);
    }

    // ── 7. Build the public URL ─────────────────────────────────────────
    //    Format: {SUPABASE_URL}/storage/v1/object/public/{bucket}/{filename}
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;

    // ── 8. Return the public URL (stored in DB as image_filename) ───────
    return NextResponse.json({
      success: true,
      filename: publicUrl,   // full https:// URL — saved to database
      url: publicUrl,
    });

  } catch (err: unknown) {
    console.error('[Upload Error]', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Terjadi kesalahan server saat upload.',
      },
      { status: 500 }
    );
  }
}
