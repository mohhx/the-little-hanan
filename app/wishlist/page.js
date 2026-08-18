'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '../../lib/store/cartStore'
import { getProducts } from '../../lib/products'
import ProductCard from '../../components/ui/ProductCard'
import Reveal from '../../components/ui/Reveal'
import styles from './page.module.css'

export default function WishlistPage() {
  const wishlist = useCartStore((s) => s.wishlist)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  const [products, setProducts] = useState([])
  useEffect(() => {
    let cancelled = false
    getProducts().then((data) => { if (!cancelled) setProducts(data) })
    return () => { cancelled = true }
  }, [])

  const savedProducts = products.filter((p) => wishlist.includes(p.id))

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <span className="eyebrow">The Little Hanan</span>
        <h1 className={`display-lg ${styles.title}`}>Your Wishlist</h1>
      </div>

      <div className="container">
        {!hydrated ? null : savedProducts.length === 0 ? (
          <div className={styles.empty}>
            <i className={`ri-heart-line ${styles.emptyIcon}`} />
            <h2 className={`display-md ${styles.emptyTitle}`}>Nothing saved yet</h2>
            <p className={styles.emptyText}>Tap the heart on anything you love to save it here.</p>
            <Link href="/shop" className="btn btn-primary">Explore Shop</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {savedProducts.map((product, i) => (
              <Reveal key={product.id} delay={i * 60} className={styles.cardWrap}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}