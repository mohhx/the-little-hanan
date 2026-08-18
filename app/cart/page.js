'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '../../lib/store/cartStore'
import Reveal from '../../components/ui/Reveal'
import styles from './page.module.css'

const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty = useCartStore((s) => s.updateQty)
  const subtotal = useCartStore((s) => s.subtotal())

  // Avoid a hydration mismatch — persisted cart state only exists client-side.
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <span className="eyebrow">The Little Hanan</span>
        <h1 className={`display-lg ${styles.title}`}>Your Bag</h1>
      </div>

      <div className="container container--md">
        {!hydrated ? null : items.length === 0 ? (
          <div className={styles.empty}>
            <i className={`ri-shopping-bag-line ${styles.emptyIcon}`} />
            <h2 className={`display-md ${styles.emptyTitle}`}>Your bag is empty</h2>
            <p className={styles.emptyText}>Nothing here yet — let&apos;s find you something.</p>
            <Link href="/shop" className="btn btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div className={styles.layout}>
            <Reveal className={styles.itemsCol}>
              <ul className={styles.list}>
                {items.map((item) => (
                  <li key={item.key} className={styles.item}>
                    <Link href={`/product/${item.slug}`} className={styles.itemImgLink}>
                      <img src={item.image} alt={item.name} className={styles.itemImg} />
                    </Link>

                    <div className={styles.itemInfo}>
                      <Link href={`/product/${item.slug}`} className={styles.itemName}>
                        {item.name}
                      </Link>
                      {item.size && <span className={styles.itemSize}>Size: {item.size}</span>}
                      <span className={styles.itemUnitPrice}>{formatNaira(item.price)}</span>
                    </div>

                    <div className={styles.itemActions}>
                      <div className={styles.qtyControl}>
                        <button
                          onClick={() => updateQty(item.key, item.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          <i className="ri-subtract-line" />
                        </button>
                        <span>{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.key, item.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          <i className="ri-add-line" />
                        </button>
                      </div>
                      <span className={styles.itemLineTotal}>{formatNaira(item.price * item.qty)}</span>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <i className="ri-close-line" /> Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={80} className={styles.summaryCol}>
              <div className={styles.summary}>
                <h2 className={`display-md ${styles.summaryTitle}`}>Order Summary</h2>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>{formatNaira(subtotal)}</span>
                </div>
                <p className={styles.summaryNote}>Delivery calculated at checkout</p>
                <div className={styles.divider} />
                <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                  <span>Total</span>
                  <span>{formatNaira(subtotal)}</span>
                </div>
                <Link href="/checkout" className={`btn btn-primary ${styles.checkoutBtn}`}>
                  Proceed to Checkout
                </Link>
                <Link href="/shop" className={styles.continueLink}>
                  Continue Shopping
                </Link>
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </main>
  )
}