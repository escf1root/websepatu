/**
 * utils.ts
 * ─────────────────────────────────────────────────────────────────────
 * Shared utility functions for the SoleMate e-commerce project.
 *
 * HOW TO USE:
 *   import { normalizeBrandName, formatPrice } from '@/lib/utils';
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * Fixes known brand name typos in the database.
 * This does NOT touch the database — it only fixes display text.
 *
 * To add more fixes, just add a new line inside the `fixes` object:
 *   'TypoName': 'CorrectName',
 */
export function normalizeBrandName(brand: string): string {
  const fixes: Record<string, string> = {
    Compasss: 'Compass',
    compasss: 'Compass',
    COMPASSS: 'COMPASS',
    // Add more typo fixes here as needed
  };
  return fixes[brand] ?? brand;
}

/**
 * Formats a number as Indonesian Rupiah currency.
 * Example: 2100000 → "Rp 2.100.000"
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Truncates a string to a max length, adding "..." at the end.
 * Example: truncate("Hello World", 7) → "Hello W..."
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Validates whether a file is an accepted image type.
 * Returns true if valid, false if not.
 */
export function isValidImageType(file: File): boolean {
  const accepted = ['image/jpeg', 'image/png', 'image/webp'];
  return accepted.includes(file.type);
}

/**
 * Validates whether a file is under 5MB.
 * Returns true if valid, false if too large.
 */
export function isValidImageSize(file: File): boolean {
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  return file.size <= MAX_BYTES;
}
