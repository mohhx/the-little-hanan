'use client'
import { useRef } from 'react'
import Link from 'next/link'
import styles from './ProductCard.module.css'
import { useCartStore } from '../../lib/store/cartStore'
import { useQuickViewStore } from '../../lib/store/quickViewStore'
import { showToast } from './Toast'
import { gsap } from '../../lib/gsap'

export default function ProductCard({ product, disableQuickViewOnClick = false }) {
  const wishlistRef = useRef(null)
  const openQuickView = useQuickViewStore((s) => s.open)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWishlist = useCartStore((s) => s.toggleWishlist)
  // Selecting a boolean derived from the wishlist array (rather than the
  // array itself) keeps this component from re-rendering every card
  // whenever any product's wishlist status changes.
  const wishlisted = useCartStore((s) => s.wishlist.includes(product?.id))

  const {
    id = '1',
    name = 'Product Name',
    price = 0,
    originalPrice = null,
    image = '/assets/placeholder.jpg',
    rating = 4,
    category = '',
    slug = 'product',
    inStock = true,
  } = product || {}

  const formatNaira = (amount) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  const handleQuickAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!inStock) return
    // No size selector on the card, so this adds a "no size" line.
    // Shoppers who need a specific size can still pick one on the product page.
    addItem(product, 1, null)
    showToast(`${name} added to bag`, { icon: 'ri-shopping-bag-line' })
    openCart()
  }

  const handleQuickView = (e) => {
    e.preventDefault()
    e.stopPropagation()
    openQuickView(product, e.currentTarget)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(id)
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReduced && wishlistRef.current) {
      gsap.fromTo(
        wishlistRef.current,
        { scale: 0.7 },
        { scale: 1, duration: 0.4, ease: 'back.out(3)' }
      )
    }
  }

  const handleCardClick = (e) => {
    if (disableQuickViewOnClick) return
    // Let modified clicks (new tab / new window) behave normally instead
    // of hijacking them into the popup.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return
    e.preventDefault()
    openQuickView(product, e.currentTarget)
  }

  return (
    <>
    <Link
      href={`/product/${slug}`}
      className={styles.card}
      onClick={handleCardClick}
      data-quick-view={disableQuickViewOnClick ? undefined : 'true'}
    >
      <div className={styles.imageWrap}>
        <img src={image} alt={name} className={`${styles.img} ${!inStock ? styles.imgSoldOut : ''}`} />

        {!inStock ? (
          <span className={styles.soldOutBadge}>Sold Out</span>
        ) : (
          discount && <span className={styles.badge}>-{discount}%</span>
        )}

        <button
          ref={wishlistRef}
          className={`${styles.wishlist} ${wishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          data-no-nav-loader
        >
          <i className={wishlisted ? 'ri-heart-fill' : 'ri-heart-line'} />
        </button>

        <button
          className={styles.quickView}
          onClick={handleQuickView}
          aria-label={`Quick view ${name}`}
          data-no-nav-loader
        >
          <i className="ri-eye-line" />
        </button>

        <button
          className={`${styles.quickAdd} ${!inStock ? styles.quickAddDisabled : ''}`}
          onClick={handleQuickAdd}
          aria-label={inStock ? `Quick add ${name}` : `${name} is sold out`}
          aria-disabled={!inStock}
          data-no-nav-loader
        >
          {inStock ? '+ Quick Add' : 'Sold Out'}
        </button>
      </div>

      <div className={styles.info}>
        {category && <span className={styles.category}>{category}</span>}
        <h3 className={styles.name}>{name}</h3>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatNaira(price)}</span>
          {originalPrice && (
            <s className={styles.original}>{formatNaira(originalPrice)}</s>
          )}
        </div>
        <div className={styles.stars} aria-label={`${rating} out of 5 stars`}>
          {[1,2,3,4,5].map(i => (
            <i
              key={i}
              className={i <= rating ? 'ri-star-fill' : i - 0.5 <= rating ? 'ri-star-half-fill' : 'ri-star-line'}
            />
          ))}
        </div>
      </div>
    </Link>
    </>
  )
}