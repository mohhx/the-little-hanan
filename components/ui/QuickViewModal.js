'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useCartStore } from '../../lib/store/cartStore'
import { useQuickViewStore } from '../../lib/store/quickViewStore'
import { showToast } from './Toast'
import styles from './QuickViewModal.module.css'

const SIZES = ['XS', 'S', 'M', 'L', 'XL']

const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)

// Centered popup version of the product-detail info column, launched from
// a ProductCard's "Quick View" trigger. Mirrors CartDrawer's overlay +
// Escape + body-scroll-lock pattern, just centered instead of a side panel.
export default function QuickViewModal({ product, onClose }) {
  const open = !!product
  const triggerEl = useQuickViewStore((s) => s.triggerEl)
  const modalRef = useRef(null)
  const closeBtnRef = useRef(null)

  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWishlist = useCartStore((s) => s.toggleWishlist)
  const wishlisted = useCartStore((s) => s.wishlist.includes(product?.id))

  const [selectedSize, setSelectedSize] = useState(null)
  const [qty, setQty] = useState(1)
  const [sizeError, setSizeError] = useState(false)

  // Reset transient selection state each time a different product opens
  useEffect(() => {
    setSelectedSize(null)
    setQty(1)
    setSizeError(false)
  }, [product?.id])

  // Lock body scroll while open, close on Escape, trap Tab inside the
  // modal, and move focus in on open / back to the trigger on close —
  // without this a keyboard user could tab straight through into the
  // page behind the overlay.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'

    // Focus the close button once the modal has painted.
    const focusTimer = window.setTimeout(() => closeBtnRef.current?.focus(), 0)

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !modalRef.current) return

      const focusables = modalRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(focusTimer)
      triggerEl?.focus?.()
    }
  }, [open, onClose, triggerEl])

  if (!product) return null

  const {
    name,
    price,
    originalPrice,
    category,
    rating = 4,
    image,
    slug,
    inStock = true,
    description,
  } = product

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  function handleAddToBag() {
    if (!inStock) return
    if (!selectedSize) {
      setSizeError(true)
      showToast('Please select a size', { variant: 'error', icon: 'ri-error-warning-line' })
      return
    }
    addItem(product, qty, selectedSize)
    showToast(`${name} added to bag`, { icon: 'ri-shopping-bag-line' })
    openCart()
    onClose()
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <div
        className={`${styles.modalWrap} ${open ? styles.modalWrapOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={name}
      >
        <div className={styles.modal} ref={modalRef}>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close quick view" ref={closeBtnRef}>
            <i className="ri-close-line" />
          </button>

          <div className={styles.body}>
            <div className={styles.imageCol}>
              <img src={image} alt={name} className={styles.image} />
              {!inStock ? (
                <span className={styles.soldOutBadge}>Sold Out</span>
              ) : (
                discount && <span className={styles.discountBadge}>-{discount}%</span>
              )}
            </div>

            <div className={styles.infoCol}>
              {category && <p className={styles.category}>{category}</p>}
              <h2 className={styles.name}>{name}</h2>

              <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <i
                    key={i}
                    className={i <= rating ? 'ri-star-fill' : i - 0.5 <= rating ? 'ri-star-half-fill' : 'ri-star-line'}
                  />
                ))}
              </div>

              <div className={styles.priceRow}>
                <span className={styles.price}>{formatNaira(price)}</span>
                {originalPrice && (
                  <s className={styles.originalPrice}>{formatNaira(originalPrice)}</s>
                )}
              </div>

              <p className={styles.description}>
                {description || "Description for this piece hasn't been added yet."}
              </p>

              <div className={styles.sizeSection}>
                <div className={styles.sizeHeader}>
                  <span className={styles.sectionLabel}>Size</span>
                  {selectedSize && <span className={styles.selectedSize}>{selectedSize}</span>}
                </div>
                <div className={styles.sizeButtons}>
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeBtnActive : ''}`}
                      onClick={() => { setSelectedSize(size); setSizeError(false) }}
                      aria-pressed={selectedSize === size}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className={styles.sizeErrorText} role="alert">Please select a size</p>
                )}
              </div>

              <div className={styles.qtySection}>
                <span className={styles.sectionLabel}>Quantity</span>
                <div className={styles.qtyControl}>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    disabled={qty === 1}
                  >
                    <i className="ri-subtract-line" />
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => q + 1)}
                    aria-label="Increase quantity"
                  >
                    <i className="ri-add-line" />
                  </button>
                </div>
              </div>

              <div className={styles.ctaRow}>
                <button
                  type="button"
                  className={`btn btn-primary ${styles.addToBag}`}
                  disabled={!inStock}
                  onClick={handleAddToBag}
                >
                  <i className="ri-shopping-bag-line" />
                  {inStock ? 'Add to Bag' : 'Sold Out'}
                </button>
                <button
                  type="button"
                  className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ''}`}
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <i className={wishlisted ? 'ri-heart-fill' : 'ri-heart-line'} />
                </button>
              </div>

              <Link href={`/product/${slug}`} className={styles.fullDetailsLink} onClick={onClose}>
                View full details <i className="ri-arrow-right-line" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}