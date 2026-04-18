/**
 * api.ts
 * ─────────────────────────────────────────────────────────────────────
 * Centralized API configuration for the SoleMate project.
 *
 * - In development  → requests go to /api/... which Next.js rewrites to localhost:8000
 * - In production   → requests go directly to the Vercel backend URL
 * ─────────────────────────────────────────────────────────────────────
 */

// URL backend Vercel yang sudah di-deploy
export const BACKEND_URL = 'https://websepatu-75ax.vercel.app';

/**
 * Returns the full API URL for a given path.
 *
 * Usage:
 *   apiUrl('/api/products')       → in dev:  '/api/products'  (proxied by Next.js)
 *                                 → in prod: 'https://websepatu-75ax.vercel.app/api/products'
 */
export function apiUrl(path: string): string {
  // Saat di browser pada production build (bukan localhost)
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (!isLocalhost) {
      // Production: arahkan langsung ke backend Vercel
      return `${BACKEND_URL}${path}`;
    }
  }

  // Development: gunakan /api/... yang di-proxy oleh Next.js ke localhost:8000
  return path;
}
