'use client';

import { formatNaira } from './formatNaira';
import styles from './ActiveFilterTags.module.css';

export default function ActiveFilterTags({
  selectedCategories,
  onToggleCategory,
  priceRange,
  isPriceActive,
  onResetPrice,
  hasActiveFilters,
  onClearAll,
}) {
  if (!hasActiveFilters) return null;

  return (
    <div className={styles.row}>
      {selectedCategories.map((category) => (
        <button
          key={category}
          type="button"
          className={styles.tag}
          onClick={() => onToggleCategory(category)}
        >
          {category}
          <span className={styles.remove} aria-hidden="true">×</span>
        </button>
      ))}

      {isPriceActive && (
        <button type="button" className={styles.tag} onClick={onResetPrice}>
          {formatNaira(priceRange[0])} – {formatNaira(priceRange[1])}
          <span className={styles.remove} aria-hidden="true">×</span>
        </button>
      )}

      <button type="button" className={styles.clearAll} onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}