/**
 * src/lib/imageUrl.ts
 * ─────────────────────────────────────────────────────────────────────
 * Helper to resolve product image URLs uniformly across the app.
 *
 * WHY THIS EXISTS:
 * - Old products (seed data) store just a filename: "nike-airmax-270.jpg"
 *   → resolved to /images/shoes/nike-airmax-270.jpg  (local public folder)
 *
 * - New products uploaded via admin panel store a full Cloudinary URL:
 *   "https://res.cloudinary.com/my-cloud/image/upload/..."
 *   → used as-is
 *
 * USAGE:
 *   import { getImageUrl } from '@/lib/imageUrl';
 *   <img src={getImageUrl(product.imageFilename)} ... />
 * ─────────────────────────────────────────────────────────────────────
 */

/** Fallback shown when a product has no image or the image fails to load. */
export const PLACEHOLDER_IMG =
  'https://placehold.co/600x600/f4f4f5/71717a?text=No+Image';

/**
 * Resolves a product image value to a full URL.
 *
 * @param imageFilename - Either a bare filename ("shoe.jpg") or a full URL
 *                        ("https://res.cloudinary.com/...")
 * @returns A full URL ready to use in an <img> src or Next.js <Image> src.
 */
export function getImageUrl(imageFilename: string | null | undefined): string {
  if (!imageFilename || imageFilename.trim() === '') {
    return PLACEHOLDER_IMG;
  }

  // Already a full URL (Cloudinary, Supabase, S3, etc.)
  if (imageFilename.startsWith('http://') || imageFilename.startsWith('https://')) {
    return imageFilename;
  }

  // Legacy: bare filename stored in DB → serve from Next.js public folder
  return `/images/shoes/${imageFilename}`;
}
