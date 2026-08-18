'use client';

import { useEffect } from 'react';
import styles from './FilterDrawer.module.css';

export default function FilterDrawer({ isOpen, onClose, resultCount, children }) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
      onClick={onClose}
    >
      <div
        className={styles.sheet}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
      >
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>Filter &amp; Sort</span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close filters"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <div className={styles.sheetBody}>{children}</div>

        <div className={styles.sheetFooter}>
          <button type="button" className={`btn btn-primary ${styles.showButton}`} onClick={onClose}>
            Show {resultCount} {resultCount === 1 ? 'result' : 'results'}
          </button>
        </div>
      </div>
    </div>
  );
}