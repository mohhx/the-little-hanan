'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '../../lib/store/cartStore'
import styles from './CartDrawer.module.css'

const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)

export default function CartDrawer({ open, onClose }) {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQty = useCartStore((s) => s.updateQty)
  const subtotal = useCartStore((s) => s.subtotal())

  // Lock body scroll while open, close on Escape
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        aria-hidden={!open}
        aria-label="Shopping bag"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Your Bag</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close bag">
            <i className="ri-close-line" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <i className="ri-shopping-bag-line" />
            <p>Your bag is empty.</p>
            <button className="btn btn-primary" onClick={onClose}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.key} className={styles.item}>
                  <img src={item.image} alt={item.name} className={styles.itemImg} />
                  <div className={styles.itemInfo}>
                    <div className={styles.itemTop}>
                      <span className={styles.itemName}>{item.name}</span>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.key)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <i className="ri-close-line" />
                      </button>
                    </div>
                    {item.size && <span className={styles.itemSize}>Size: {item.size}</span>}
                    <div className={styles.itemBottom}>
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
                      <span className={styles.itemPrice}>{formatNaira(item.price * item.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.footer}>
              <div className={styles.subtotalRow}>
                <span>Subtotal</span>
                <span className={styles.subtotalValue}>{formatNaira(subtotal)}</span>
              </div>
              <p className={styles.shippingNote}>Delivery calculated at checkout</p>
              <Link href="/checkout" className={`btn btn-primary ${styles.checkoutBtn}`} onClick={onClose}>
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
