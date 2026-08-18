'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/browserClient'
import { formatNaira } from '../shop/formatNaira'
import { showToast } from '../ui/Toast'
import StockToggle from './StockToggle'
import styles from './AllProductsToggle.module.css'

export default function AllProductsToggle({ products }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

  if (products.length === 0) return null

  async function handleDelete(product) {
    const confirmed = window.confirm(`Delete "${product.name}"? This can't be undone.`)
    if (!confirmed) return

    setError('')
    setDeletingId(product.id)

    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id)

    setDeletingId(null)

    if (deleteError) {
      setError(`Failed to delete "${product.name}": ${deleteError.message}`)
      return
    }

    showToast('Product deleted')
    router.refresh()
  }

  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? 'Hide all products' : `Show all products (${products.length})`}
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>&#9662;</span>
      </button>

      {open && (
        <div className={styles.list}>
          {error && <p className={styles.error} role="alert">{error}</p>}

          {products.map((product) => {
            const cover = product.images?.[0] || product.image
            return (
              <div className={styles.row} key={product.id}>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className={styles.rowLink}
                >
                  {cover ? (
                    <img src={cover} alt="" className={styles.rowImg} />
                  ) : (
                    <div className={styles.rowPlaceholder} />
                  )}
                  <span className={styles.rowName}>{product.name}</span>
                  <span className={styles.rowPrice}>{formatNaira(product.price)}</span>
                </Link>

                <div className={styles.rowActions}>
                  <StockToggle productId={product.id} inStock={product.in_stock !== false} />
                  <button
                    type="button"
                    className={styles.rowDeleteBtn}
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}