'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ProductCard from '../../../components/ui/ProductCard'
import Reveal from '../../../components/ui/Reveal'
import { getProductBySlug, getProducts } from '../../../lib/products'
import { useCartStore } from '../../../lib/store/cartStore'
import { showToast } from '../../../components/ui/Toast'
import styles from './page.module.css'

// ── helpers ──────────────────────────────────────────────────────────────────

const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)

const SIZES = ['XS', 'S', 'M', 'L', 'XL']

// Four placeholder thumbnails from the same image (swapped for real shots later)
function buildGallery(image) {
  return [image, image, image, image]
}

// ── star renderer ─────────────────────────────────────────────────────────────

function Stars({ rating, size = 'sm' }) {
  return (
    <div className={`${styles.stars} ${styles[`stars--${size}`]}`} aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={
            i <= rating
              ? 'ri-star-fill'
              : i - 0.5 <= rating
              ? 'ri-star-half-fill'
              : 'ri-star-line'
          }
        />
      ))}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  // Product lookup + related items now come from Supabase instead of the
  // static PRODUCTS array — see useEffectFetch below.
  useEffectFetch(slug, setProduct, setRelated, setLoading)

  // — loading —
  if (loading) {
    return (
      <main className={styles.notFound}>
        <p className="body-lg">Loading…</p>
      </main>
    )
  }

  // — guard —
  if (!product) {
    return (
      <main className={styles.notFound}>
        <p className="eyebrow" style={{ color: 'var(--brand-rose)' }}>404</p>
        <h1 className={`display-lg ${styles.notFoundTitle}`}>Product not found</h1>
        <p className="body-lg" style={{ marginBottom: '2rem' }}>
          This piece may have sold out or moved. Browse the full collection instead.
        </p>
        <Link href="/shop" className="btn btn-primary">Back to Shop</Link>
      </main>
    )
  }

  const { image } = product
  const gallery = buildGallery(image)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  // ── inner component with state (kept inside to access product data cleanly) ──
  return <ProductDetailView
    product={product}
    gallery={gallery}
    discount={discount}
    related={related}
  />
}

// Runs the actual data fetch — product by slug, plus the full product list
// (client-side, so related items can be filtered by category) — and feeds
// the three setters above. Pulled out as a small hook so the main
// component above stays readable.
function useEffectFetch(slug, setProduct, setRelated, setLoading) {
  useEffect(() => {
    let cancelled = false
    async function load() {
      const [prod, allProducts] = await Promise.all([
        getProductBySlug(slug),
        getProducts(),
      ])
      if (cancelled) return
      setProduct(prod)
      if (prod) {
        setRelated(
          allProducts
            .filter((p) => p.category === prod.category && p.slug !== slug)
            .slice(0, 4)
        )
      }
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [slug])
}

function ProductDetailView({ product, gallery, discount, related }) {
  const { name, price, originalPrice, category, rating, inStock = true, fabric, fit, careInstructions, measurements, description } = product
  const specs = [
    { label: 'Fabric', value: fabric },
    { label: 'Fit', value: fit },
    { label: 'Care Instructions', value: careInstructions },
    { label: 'Measurements', value: measurements },
  ].filter((s) => s.value)

  const [activeThumb, setActiveThumb] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [sizeError, setSizeError] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWishlist = useCartStore((s) => s.toggleWishlist)
  const wishlisted = useCartStore((s) => s.wishlist.includes(product.id))

  const whatsappNumber = '2348000000000' // replace with real number
  const whatsappMessage = encodeURIComponent(
    `Hi, I'd like to order:\n${name}\nSize: ${selectedSize || 'Please select a size'}\nQty: ${qty}\n${formatNaira(price)}`
  )
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

  function decreaseQty() {
    setQty((q) => Math.max(1, q - 1))
  }

  function increaseQty() {
    setQty((q) => q + 1)
  }

  return (
    <main className={styles.page}>

      {/* ── Breadcrumb ── */}
      <div className={`container ${styles.breadcrumbWrap}`}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/shop">Shop</Link>
          <span aria-hidden="true"> / </span>
          <Link href={`/shop?category=${category.toLowerCase()}`}>{category}</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{name}</span>
        </nav>
      </div>

      {/* ── Main product layout ── */}
      <div className={`container ${styles.productLayout}`}>

        {/* LEFT — Gallery */}
        <div className={styles.galleryCol}>
          <div className={styles.mainImageWrap}>
            <img
              src={gallery[activeThumb]}
              alt={name}
              className={styles.mainImage}
            />
            {!inStock ? (
              <span className={styles.discountBadge}>Sold Out</span>
            ) : (
              discount && <span className={styles.discountBadge}>-{discount}%</span>
            )}
            {category === 'WhimsyNetting' && (
              <span className={styles.whimsyBadge}>WhimsyNetting</span>
            )}
          </div>

          <div className={styles.thumbRow}>
            {gallery.map((src, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.thumb} ${activeThumb === i ? styles.thumbActive : ''}`}
                onClick={() => setActiveThumb(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={src} alt={`${name} view ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — Info */}
        <div className={styles.infoCol}>
          <Reveal>
            <p className="eyebrow" style={{ color: 'var(--brand-rose)', marginBottom: '0.5rem' }}>
              {category}
            </p>
          </Reveal>

          <Reveal delay={60}>
            <h1 className={`display-lg ${styles.productName}`}>{name}</h1>
          </Reveal>

          <Reveal delay={100}>
            <div className={styles.ratingRow}>
              <Stars rating={product.rating} size="md" />
            </div>
          </Reveal>

          <Reveal delay={130}>
            <div className={styles.priceRow}>
              <span className={styles.price}>{formatNaira(price)}</span>
              {originalPrice && (
                <s className={styles.originalPrice}>{formatNaira(originalPrice)}</s>
              )}
              {discount && (
                <span className={styles.savingBadge}>Save {discount}%</span>
              )}
            </div>
          </Reveal>

          <div className={styles.divider} />

          {/* Size selector */}
          <Reveal delay={150}>
            <div className={styles.sizeSection}>
              <div className={styles.sizeHeader}>
                <span className={styles.sectionLabel}>Size</span>
                {selectedSize && (
                  <span className={styles.selectedSize}>{selectedSize}</span>
                )}
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
          </Reveal>

          {/* Qty selector */}
          <Reveal delay={170}>
            <div className={styles.qtySection}>
              <span className={styles.sectionLabel}>Quantity</span>
              <div className={styles.qtyControl}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={decreaseQty}
                  aria-label="Decrease quantity"
                  disabled={qty === 1}
                >
                  <i className="ri-subtract-line" />
                </button>
                <span className={styles.qtyValue}>{qty}</span>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={increaseQty}
                  aria-label="Increase quantity"
                >
                  <i className="ri-add-line" />
                </button>
              </div>
            </div>
          </Reveal>

          {/* CTAs */}
          <Reveal delay={190}>
            <div className={styles.ctaRow}>
              <button
                type="button"
                className={`btn btn-primary ${styles.addToBag}`}
                disabled={!inStock}
                onClick={() => {
                  if (!inStock) return
                  if (!selectedSize) {
                    setSizeError(true)
                    showToast('Please select a size', { variant: 'error', icon: 'ri-error-warning-line' })
                    return
                  }
                  addItem(product, qty, selectedSize)
                  showToast(`${name} added to bag`, { icon: 'ri-shopping-bag-line' })
                  openCart()
                }}
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
          </Reveal>

          <Reveal delay={210}>
            {inStock ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`btn ${styles.whatsappBtn}`}
              >
                <i className="ri-whatsapp-line" />
                Order via WhatsApp
              </a>
            ) : (
              <span className={`btn ${styles.whatsappBtn} ${styles.whatsappBtnDisabled}`} aria-disabled="true">
                <i className="ri-whatsapp-line" />
                Currently sold out
              </span>
            )}
          </Reveal>

          {/* Trust strip */}
          <Reveal delay={210}>
            <ul className={styles.trustStrip}>
              <li><i className="ri-truck-line" /> Free delivery in Kaduna</li>
              <li><i className="ri-refresh-line" /> 7-day returns</li>
              <li><i className="ri-shield-check-line" /> Secure checkout</li>
            </ul>
          </Reveal>
        </div>
      </div>

      {/* ── Tabs: Description / Details ── */}
      <div className={`container ${styles.tabsSection}`}>
        <div className={styles.tabBar}>
          {['description', 'details'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'description' ? 'Description' : 'Details'}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className={styles.tabContent}>
            {description ? (
              <p className="body-lg" style={{ whiteSpace: 'pre-line' }}>{description}</p>
            ) : (
              <p className="body-lg" style={{ color: 'var(--text-muted)' }}>
                Description for this piece hasn't been added yet.
              </p>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className={styles.tabContent}>
            {specs.length > 0 ? (
              <dl className={styles.specList}>
                {specs.map((spec) => (
                  <div key={spec.label} className={styles.specRow}>
                    <dt className={styles.specLabel}>{spec.label}</dt>
                    <dd className={styles.specValue}>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="body-lg" style={{ color: 'var(--text-muted)' }}>
                Detail information for this piece hasn't been added yet.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Related products ── */}
      {related.length > 0 && (
        <section className={`section ${styles.relatedSection}`}>
          <div className="container">
            <Reveal>
              <p className="eyebrow" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                More from {category}
              </p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className={`display-md ${styles.relatedTitle}`}>You Might Also Like</h2>
            </Reveal>
            <div className={styles.relatedGrid}>
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}