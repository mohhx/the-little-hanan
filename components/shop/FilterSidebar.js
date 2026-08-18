'use client';

import { SORT_OPTIONS, PRICE_MIN, PRICE_MAX, PRICE_STEP } from './constants';
import PriceRangeSlider from './PriceRangeSlider';
import styles from './FilterSidebar.module.css';

export default function FilterSidebar({
  categories = [],
  selectedCategories,
  onToggleCategory,
  priceRange,
  onPriceChange,
  sortBy,
  onSortChange,
  hasActiveFilters,
  onClearAll,
}) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.headerRow}>
        <h2 className={styles.heading}>Filter</h2>
        {hasActiveFilters && (
          <button type="button" className={styles.clearAll} onClick={onClearAll}>
            Clear all
          </button>
        )}
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Category</h3>
        <ul className={styles.checkList}>
          {categories.map((category) => (
            <li key={category}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => onToggleCategory(category)}
                />
                <span className={styles.checkboxCustom} aria-hidden="true" />
                <span>{category}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Price</h3>
        <PriceRangeSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={priceRange}
          onChange={onPriceChange}
        />
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Sort by</h3>
        <ul className={styles.radioList}>
          {SORT_OPTIONS.map((option) => (
            <li key={option.value}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="sort"
                  value={option.value}
                  checked={sortBy === option.value}
                  onChange={() => onSortChange(option.value)}
                />
                <span className={styles.radioCustom} aria-hidden="true" />
                <span>{option.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}