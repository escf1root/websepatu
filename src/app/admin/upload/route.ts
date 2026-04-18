/**
 * src/app/admin/upload/route.ts
 * ─────────────────────────────────────────────────────────────────────
 * API Route: POST /admin/upload
 *
 * Receives a file via multipart/form-data and uploads it to Cloudinary.
 * Returns: { success: true, filename: "https://res.cloudinary.com/..." }
 *
 * WHY CLOUDINARY instead of local filesystem?
 * Vercel serverless functions run on a read-only filesystem.
 * Any file written to disk is instantly lost when the function exits.
 * Cloudinary provides persistent, CDN-backed cloud storage for free.
 *
 * REQUIRED ENVIRONMENT VARIABLES (set in Vercel Dashboard → Settings → Env Vars):
 *   CLOUDINARY_CLOUD_NAME  — e.g. "my-cloud-name"
 *   CLOUDINARY_API_KEY     — e.g. "123456789012345"
 *   CLOUDINARY_API_SECRET  — e.g. "abcDEFghiJKLmnoPQRstuvWXYZ"
 * ─────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// ── Config ──────────────────────────────────────────────────────────────
const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME  ?? '';
const API_KEY     = process.env.CLOUDINARY_API_KEY     ?? '';
const API_SECRET  = process.env.CLOUDINARY_API_SECRET  ?? '';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const UPLOAD_FOLDER  = 'solemate-shoes'; // Cloudinary folder name


// ── Cloudinary signature helper ──────────────────────────────────────────
/**
 * Generates a signed request for Cloudinary's authenticated uploads.
 * Formula: SHA1( "key1=val1&key2=val2" + API_SECRET ) — keys sorted A→Z.
 * See: https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
 */
function buildSignature(params: Record<string, string>): string {
  const paramString = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join('&');
  return createHash('sha1').update(paramString + API_SECRET).digest('hex');
}


// ── POST handler ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 0. Check env vars are configured ─────────────────────────────────
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    console.error('[Upload] Cloudinary env vars are not set.');
    return NextResponse.json(
      {
        success: false,
        error:
          'Konfigurasi server belum selesai. Tambahkan CLOUDINARY_CLOUD_NAME, ' +
          'CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET ke environment variables Vercel.',
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

    // ── 4. Build Cloudinary signed upload params ────────────────────────
    const timestamp = Math.round(Date.now() / 1000).toString();
    const signParams = { folder: UPLOAD_FOLDER, timestamp };
    const signature  = buildSignature(signParams);

    // ── 5. Build multipart form for Cloudinary ──────────────────────────
    const cloudForm = new FormData();
    cloudForm.append('file', file);
    cloudForm.append('api_key', API_KEY);
    cloudForm.append('timestamp', timestamp);
    cloudForm.append('signature', signature);
    cloudForm.append('folder', UPLOAD_FOLDER);

    // ── 6. Upload to Cloudinary ─────────────────────────────────────────
    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: cloudForm }
    );

    if (!cloudRes.ok) {
      const errData = await cloudRes.json().catch(() => ({}));
      const msg = (errData as { error?: { message?: string } }).error?.message ?? 'Upload ke Cloudinary gagal.';
      throw new Error(msg);
    }

    const cloudData = await cloudRes.json() as { secure_url: string; public_id: string };

    // ── 7. Return the Cloudinary URL (stored in DB as image_filename) ───
    return NextResponse.json({
      success: true,
      filename: cloudData.secure_url,   // full https:// URL
      url: cloudData.secure_url,
      public_id: cloudData.public_id,
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
