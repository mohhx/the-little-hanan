// lib/store/quickViewStore.js
// Drives the single, app-wide QuickViewModal instance (mounted once in
// SiteChrome.js, the same way CartDrawer is mounted once in Navbar.js).
// Keeping this as shared state — rather than local state per ProductCard —
// guarantees only one Quick View can ever be open at a time, and keeps the
// modal itself out of page content entirely (immune to any ancestor
// transform/pin a future section might add).

import { create } from 'zustand'

export const useQuickViewStore = create((set) => ({
  product: null,
  triggerEl: null, // element to restore focus to when the modal closes

  open: (product, triggerEl = null) => set({ product, triggerEl }),
  close: () => set({ product: null, triggerEl: null }),
}))