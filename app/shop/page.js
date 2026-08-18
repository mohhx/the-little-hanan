'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../components/ui/ProductCard';
import Reveal from '../../components/ui/Reveal';
import useProductFilters from '../../components/shop/useProductFilters';
import FilterSidebar from '../../components/shop/FilterSidebar';
import ActiveFilterTags from '../../components/shop/ActiveFilterTags';
import FilterDrawer from '../../components/shop/FilterDrawer';
import { PRICE_MIN, PRICE_MAX } from '../../components/shop/constants';
import { getProducts, getCategories } from '../../lib/products';
import styles from './page.module.css';

function ShopPageContent() {
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    Promise.all([getProducts(), getCategories()]).then(([productsData, categoriesData]) => {
      if (!cancelled) {
        setProducts(productsData);
        setCategories(categoriesData);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const {
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
  } = useProductFilters(products);

  // Pre-select a category when arriving via a link like /shop?category=kimono
  // — this is the pattern components/sections/Categories.js links to, using
  // the same slug values stored in the categories table.
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (!categoryParam || categories.length === 0) return;
    const match = categories.find(
      (category) => category.slug === categoryParam.toLowerCase()
    );
    if (match) setSelectedCategories([match.name]);
  }, [searchParams, categories, setSelectedCategories]);

  const activeFilterCount = selectedCategories.length + (isPriceActive ? 1 : 0);

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.header}>
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>The Little Hanan</p>
          <h1 className={`display-lg ${styles.title}`}>Shop the Full Collection</h1>
        </div>
        <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
          <p>Loading products…</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Reveal>
          <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>The Little Hanan</p>
        </Reveal>
        <Reveal delay={80}>
          <h1 className={`display-lg ${styles.title}`}>Shop the Full Collection</h1>
        </Reveal>
      </div>

      <div className={`container ${styles.layout}`}>
        <aside className={styles.sidebarColumn}>
          <FilterSidebar
            categories={categories.map((c) => c.name)}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            sortBy={sortBy}
            onSortChange={setSortBy}
            hasActiveFilters={hasActiveFilters}
            onClearAll={clearAll}
          />
        </aside>

        <div className={styles.content}>
          <div className={styles.toolbar}>
            <p className={styles.count}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
            </p>
            <button
              type="button"
              className={`btn btn-outline ${styles.filterButton}`}
              onClick={() => setDrawerOpen(true)}
            >
              <i className="ri-equalizer-line" />
              Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          </div>

          <ActiveFilterTags
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            priceRange={priceRange}
            isPriceActive={isPriceActive}
            onResetPrice={() => setPriceRange([PRICE_MIN, PRICE_MAX])}
            hasActiveFilters={hasActiveFilters}
            onClearAll={clearAll}
          />

          {filteredProducts.length === 0 ? (
            <div className={styles.empty}>
              <p className={`display-md ${styles.emptyTitle}`}>No pieces match those filters</p>
              <p className={styles.emptyText}>
                Try widening your price range or clearing a category.
              </p>
              <button type="button" className="btn btn-primary" onClick={clearAll}>
                Clear all filters
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredProducts.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 80} className={styles.cardWrap}>
                  {product.category === 'WhimsyNetting' && (
                    <span className={styles.whimsyBadge}>WhimsyNetting</span>
                  )}
                  <ProductCard product={product} disableQuickViewOnClick />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>

      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        resultCount={filteredProducts.length}
      >
        <FilterSidebar
          categories={categories.map((c) => c.name)}
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          hasActiveFilters={hasActiveFilters}
          onClearAll={clearAll}
        />
      </FilterDrawer>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageContent />
    </Suspense>
  );
}