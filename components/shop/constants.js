// Shared constants for the Shop / Sale filtering UI.
// Category names come from Supabase (lib/products.js getCategories())
// now, not a hardcoded list here — see app/shop/page.js.

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export const PRICE_MIN = 0;
export const PRICE_MAX = 700000;
export const PRICE_STEP = 5000;