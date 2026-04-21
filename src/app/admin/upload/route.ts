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
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ── Config ──────────────────────────────────────────────────────────────
const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const BUCKET_NAME       = 'product-images';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ── Helper: get admin Supabase client ────────────────────────────────────
function getAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ── Helper: ensure bucket exists and is public ───────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensurePublicBucket(supabase: SupabaseClient<any, any, any>) {
  // Check if bucket already exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error('[Upload] Cannot list buckets:', listError.message);
    // Don't throw — bucket might already exist, try to proceed
    return;
  }

  const exists = buckets?.some((b) => b.name === BUCKET_NAME);

  if (!exists) {
    console.log(`[Upload] Bucket "${BUCKET_NAME}" not found — creating it now...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,            // ← CRITICAL: allows public URL access
      fileSizeLimit: MAX_SIZE_BYTES,
      allowedMimeTypes: ACCEPTED_TYPES,
    });

    if (createError && !createError.message.includes('already exists')) {
      throw new Error(`Gagal membuat bucket storage: ${createError.message}`);
    }
    console.log(`[Upload] Bucket "${BUCKET_NAME}" created successfully.`);
  } else {
    // Bucket exists — make sure it's public (update in case it was created as private)
    const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: MAX_SIZE_BYTES,
      allowedMimeTypes: ACCEPTED_TYPES,
    });
    if (updateError) {
      console.warn('[Upload] Could not update bucket to public:', updateError.message);
    }
  }
}

// ── POST handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 0. Check env vars are configured ───────────────────────────────
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

    // ── 1. Validate: file must be present ────────────────────────────
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada file yang dikirim.' },
        { status: 400 }
      );
    }

    // ── 2. Validate: file type ────────────────────────────────────────
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Format tidak didukung. Gunakan JPG, PNG, atau WebP.' },
        { status: 400 }
      );
    }

    // ── 3. Validate: file size ────────────────────────────────────────
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file terlalu besar. Maksimal 5MB.' },
        { status: 400 }
      );
    }

    // ── 4. Generate unique filename ───────────────────────────────────
    const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const randomId = Math.random().toString(36).slice(2, 10);
    const filename = `${Date.now()}-${randomId}.${ext}`;

    // ── 5. Read file as ArrayBuffer ───────────────────────────────────
    const buffer = await file.arrayBuffer();

    // ── 6. Init admin Supabase client (service_role — bypasses RLS) ──
    const supabase = getAdminClient();

    // ── 7. Ensure the bucket exists and is public ─────────────────────
    await ensurePublicBucket(supabase);

    // ── 8. Upload file via supabase-js SDK ────────────────────────────
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: true,           // overwrite if same name (safe with timestamp prefix)
        cacheControl: '31536000', // 1 year CDN cache
      });

    if (uploadError) {
      console.error('[Upload] Supabase upload error:', uploadError);
      throw new Error(`Upload ke Supabase Storage gagal: ${uploadError.message}`);
    }

    console.log('[Upload] File uploaded successfully:', uploadData?.path);

    // ── 9. Build public URL using the SDK (always correct format) ─────
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    const publicUrl = urlData.publicUrl;
    console.log('[Upload] Public URL:', publicUrl);

    // ── 10. Return the full public URL ────────────────────────────────
    return NextResponse.json({
      success: true,
      filename: publicUrl,  // full https:// URL — saved to DB as image_filename
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
