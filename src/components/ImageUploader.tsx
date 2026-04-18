'use client';

/**
 * ImageUploader.tsx
 * ─────────────────────────────────────────────────────────────────────
 * A beginner-friendly drag-and-drop image upload component.
 *
 * WHAT IT DOES:
 * - Shows a drag-and-drop zone
 * - Previews the selected image before uploading
 * - Validates file type (JPG, PNG, WebP) and size (max 5MB)
 * - Uploads to /admin/upload API route
 * - Calls onUploadComplete(filename) when done
 * ─────────────────────────────────────────────────────────────────────
 */

import { useRef, useState, useCallback } from 'react';
import { isValidImageType, isValidImageSize } from '@/lib/utils';

interface ImageUploaderProps {
  currentImageFilename?: string; // existing image to preview
  onUploadComplete: (filename: string) => void; // called after successful upload
}

type UploadState = 'idle' | 'dragging' | 'previewing' | 'uploading' | 'done' | 'error';

export default function ImageUploader({
  currentImageFilename,
  onUploadComplete,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageFilename ? `/images/shoes/${currentImageFilename}` : null
  );
  const [uploadState, setUploadState] = useState<UploadState>(
    currentImageFilename ? 'done' : 'idle'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ── Validate and preview a file ──────────────────────────────────────
  const handleFile = useCallback((file: File) => {
    setErrorMsg('');

    if (!isValidImageType(file)) {
      setErrorMsg('Format tidak didukung. Gunakan JPG, PNG, atau WebP.');
      setUploadState('error');
      return;
    }

    if (!isValidImageSize(file)) {
      setErrorMsg('Ukuran file terlalu besar. Maksimal 5MB.');
      setUploadState('error');
      return;
    }

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSelectedFile(file);
    setUploadState('previewing');
  }, []);

  // ── Drag handlers ────────────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadState('dragging');
  };

  const onDragLeave = () => {
    setUploadState(previewUrl ? 'previewing' : 'idle');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  // ── Upload to Next.js API ────────────────────────────────────────────
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadState('uploading');
    setErrorMsg('');

    try {
      const form = new FormData();
      form.append('file', selectedFile);

      const res = await fetch('/admin/upload', {
        method: 'POST',
        body: form,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error ?? 'Upload gagal.');
      }

      setUploadState('done');
      onUploadComplete(data.filename); // ← Pass filename to parent form
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan.';
      setErrorMsg(msg);
      setUploadState('error');
    }
  };

  const handleReset = () => {
    setPreviewUrl(currentImageFilename ? `/images/shoes/${currentImageFilename}` : null);
    setSelectedFile(null);
    setUploadState(currentImageFilename ? 'done' : 'idle');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isDragging = uploadState === 'dragging';

  return (
    <div className="admin-uploader">
      {/* ── Drop zone ───────────────────────────────────────────────── */}
      <div
        className={`admin-dropzone ${isDragging ? 'admin-dropzone--dragging' : ''} ${
          uploadState === 'error' ? 'admin-dropzone--error' : ''
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
        aria-label="Upload gambar produk"
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileInputChange}
          style={{ display: 'none' }}
          aria-hidden="true"
        />

        {previewUrl ? (
          /* Image preview */
          <div className="admin-uploader__preview">
            <img
              src={previewUrl}
              alt="Preview gambar produk"
              className="admin-uploader__preview-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/200x200/f4f4f5/71717a?text=No+Image';
              }}
            />
            <div className="admin-uploader__preview-overlay">
              <span>🔄 Ganti Gambar</span>
            </div>
          </div>
        ) : (
          /* Placeholder */
          <div className="admin-uploader__placeholder">
            <div className="admin-uploader__icon">🖼️</div>
            <p className="admin-uploader__hint-primary">
              {isDragging ? 'Lepaskan file di sini' : 'Drag & drop atau klik untuk pilih'}
            </p>
            <p className="admin-uploader__hint-secondary">JPG, PNG, WebP • Maks 5MB</p>
          </div>
        )}
      </div>

      {/* ── Error message ────────────────────────────────────────────── */}
      {errorMsg && (
        <p className="admin-uploader__error" role="alert">
          ⚠️ {errorMsg}
        </p>
      )}

      {/* ── Action buttons ───────────────────────────────────────────── */}
      {uploadState === 'previewing' && (
        <div className="admin-uploader__actions">
          <button
            type="button"
            onClick={handleUpload}
            className="admin-btn admin-btn--primary"
          >
            ⬆️ Upload Gambar
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="admin-btn admin-btn--ghost"
          >
            Batal
          </button>
        </div>
      )}

      {/* ── Upload pending ───────────────────────────────────────────── */}
      {uploadState === 'uploading' && (
        <p className="admin-uploader__status admin-uploader__status--loading">
          <span className="admin-spinner" /> Mengupload...
        </p>
      )}

      {/* ── Success ─────────────────────────────────────────────────── */}
      {uploadState === 'done' && !selectedFile && (
        <p className="admin-uploader__status admin-uploader__status--success">
          ✅ Gambar saat ini
        </p>
      )}
      {uploadState === 'done' && selectedFile && (
        <p className="admin-uploader__status admin-uploader__status--success">
          ✅ Upload berhasil!
        </p>
      )}
    </div>
  );
}
