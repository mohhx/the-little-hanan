'use client';

import { useMemo, useState } from 'react';
import { PRICE_MIN, PRICE_MAX } from './constants';

// "Newest" uses createdAt (from Supabase's created_at) when present. Falls
// back to dateAdded for any legacy callers, then keeps original array order
// — numeric string ids ('1', '2'...) from the old static seed data are long
// gone now that every product has a UUID id, so that fallback was dropped.
function getRecencyValue(product) {
  if (product.createdAt) return new Date(product.createdAt).getTime()
  if (product.dateAdded) return new Date(product.dateAdded).getTime()
  return 0
}

export default function useProductFilters(products) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [sortBy, setSortBy] = useState('newest');

  function toggleCategory(category) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  }

  function clearAll() {
    setSelectedCategories([]);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
  }

  const isPriceActive = priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX;
  const hasActiveFilters = selectedCategories.length > 0 || isPriceActive;

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const inCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);
      const price = product.price ?? 0;
      const inPrice = price >= priceRange[0] && price <= priceRange[1];
      return inCategory && inPrice;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === 'price-desc') return (b.price ?? 0) - (a.price ?? 0);
      return getRecencyValue(b) - getRecencyValue(a);
    });

    return sorted;
  }, [products, selectedCategories, priceRange, sortBy]);

  return {
    selectedCategories,
    setSelectedCategories,
    toggleCategory,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    clearAll,
    isPriceActive,
    hasActiveFilters,
    filteredProducts,
  };
}