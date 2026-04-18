/**
 * src/app/admin/upload/route.ts
 * ─────────────────────────────────────────────────────────────────────
 * API Route: POST /admin/upload
 *
 * Receives a file via multipart/form-data and saves it to:
 *   public/images/shoes/<unique-filename>
 *
 * Returns: { success: true, filename: "abc123.jpg" }
 *
 * SAFE: This does NOT modify the database. It only saves a file.
 * ─────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Max file size = 5 MB
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

// Accepted MIME types
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    // ── 1. Validate: file must be present ─────────────────────────────
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada file yang dikirim.' },
        { status: 400 }
      );
    }

    // ── 2. Validate: file type ─────────────────────────────────────────
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.' },
        { status: 400 }
      );
    }

    // ── 3. Validate: file size ─────────────────────────────────────────
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file terlalu besar. Maksimal 5MB.' },
        { status: 400 }
      );
    }

    // ── 4. Generate unique filename ────────────────────────────────────
    //    Format: timestamp-randomhex.ext
    //    Example: 1712034567890-a3f2c1.jpg
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const randomHex = Math.random().toString(16).slice(2, 8);
    const filename = `${Date.now()}-${randomHex}.${ext}`;

    // ── 5. Ensure upload folder exists ────────────────────────────────
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'shoes');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // ── 6. Write file to disk ─────────────────────────────────────────
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // ── 7. Return success ─────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      filename,
      url: `/images/shoes/${filename}`,
    });
  } catch (err: unknown) {
    console.error('[Upload Error]', err);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server saat upload.' },
      { status: 500 }
    );
  }
}
