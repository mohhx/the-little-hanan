'use client';

import { formatNaira } from './formatNaira';
import styles from './PriceRangeSlider.module.css';

export default function PriceRangeSlider({ min, max, step = 1000, value, onChange }) {
  const [low, high] = value;

  function handleLowChange(event) {
    const next = Math.min(Number(event.target.value), high - step);
    onChange([next, high]);
  }

  function handleHighChange(event) {
    const next = Math.max(Number(event.target.value), low + step);
    onChange([low, next]);
  }

  const lowPercent = ((low - min) / (max - min)) * 100;
  const highPercent = ((high - min) / (max - min)) * 100;

  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        <div
          className={styles.activeTrack}
          style={{ left: `${lowPercent}%`, right: `${100 - highPercent}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={handleLowChange}
          className={styles.thumb}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={handleHighChange}
          className={styles.thumb}
        />
      </div>
      <div className={styles.valuesRow}>
        <span>{formatNaira(low)}</span>
        <span>{formatNaira(high)}</span>
      </div>
    </div>
  );
}