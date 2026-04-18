// Admin access: Footer link or Ctrl+Shift+A (dev only)
// This hook registers a keyboard shortcut for developers to access /admin
// WITHOUT exposing any admin link in the public navbar or mobile menu.
// Usage: import and call useAdminShortcut() inside Navbar.tsx or layout.tsx

'use client';

import { useEffect } from 'react';

/**
 * useAdminShortcut
 *
 * Registers a global keyboard shortcut → Ctrl + Shift + A → redirects to /admin.
 * This is intentionally NOT surfaced in any public UI element.
 *
 * Admin access methods:
 *   1. Keyboard: Ctrl + Shift + A (dev only, registered via this hook)
 *   2. Footer:   Small, low-visibility link in the page footer
 *
 * DO NOT add a button, link, or menu item to the public navbar.
 */
export function useAdminShortcut(): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + A → navigate to admin panel
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        window.location.href = '/admin';
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
