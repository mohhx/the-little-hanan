// lib/store/cartStore.js
// Cart + wishlist state, persisted to localStorage.
// NOTE: this is a stopgap until Supabase (see phase-prompts doc) — the
// `items` shape is intentionally flat/serializable so it can migrate to a
// Supabase `orders`/`order_items` table later without a rewrite.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Build a stable line-item key: same product + same size = same line,
// different size = different line (so e.g. two sizes of the same dress
// don't collapse into one row).
function lineKey(id, size) {
  return `${id}::${size || 'nosize'}`
}

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [], // array of product ids
      drawerOpen: false, // transient UI state — not persisted, see partialize below

      openCart: () => set({ drawerOpen: true }),
      closeCart: () => set({ drawerOpen: false }),

      // ── cart actions ──────────────────────────────────────────────
      addItem: (product, qty = 1, size = null) => {
        const { id, slug, name, price, image } = product
        const key = lineKey(id, size)

        set((state) => {
          const existing = state.items.find((i) => i.key === key)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, qty: i.qty + qty } : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              { key, id, slug, name, price, image, size, qty },
            ],
          }
        })
      },

      removeItem: (key) => {
        set((state) => ({ items: state.items.filter((i) => i.key !== key) }))
      },

      updateQty: (key, qty) => {
        if (qty < 1) {
          get().removeItem(key)
          return
        }
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, qty } : i)),
        }))
      },

      clearCart: () => set({ items: [] }),

      // ── wishlist actions ──────────────────────────────────────────
      toggleWishlist: (productId) => {
        set((state) => {
          const inList = state.wishlist.includes(productId)
          return {
            wishlist: inList
              ? state.wishlist.filter((id) => id !== productId)
              : [...state.wishlist, productId],
          }
        })
      },

      isWishlisted: (productId) => get().wishlist.includes(productId),

      // ── computed selectors (called as functions, not hooks) ────────
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: 'little-hanan-cart',
      partialize: (state) => ({ items: state.items, wishlist: state.wishlist }),
    }
  )
)
