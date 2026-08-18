'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/browserClient'
import { formatNaira } from '../shop/formatNaira'
import { showToast } from '../ui/Toast'
import StockToggle from './StockToggle'
import styles from './ProductsTable.module.css'

export default function ProductsTable({ products }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState('')

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
    <div className={styles.tableWrap}>
      {error && <p className={styles.error} role="alert">{error}</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Sizes</th>
            <th>Images</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const cover = product.images?.[0] || product.image
            return (
              <tr key={product.id}>
                <td className={styles.thumbCell}>
                  {cover ? (
                    <img src={cover} alt={product.name} className={styles.thumb} />
                  ) : (
                    <div className={styles.thumbPlaceholder}>No image</div>
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{formatNaira(product.price)}</td>
                <td>{product.sizes?.length ? product.sizes.join(', ') : '—'}</td>
                <td>{product.images?.length || 0}</td>
                <td>
                  <StockToggle productId={product.id} inStock={product.in_stock !== false} />
                </td>
                <td className={styles.actionsCell}>
                  <Link href={`/admin/products/${product.id}/edit`} className={styles.editLink}>
                    Edit
                  </Link>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                  >
                    {deletingId === product.id ? 'Deleting…' : 'Delete'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className={styles.cardList}>
        {products.map((product) => {
          const cover = product.images?.[0] || product.image
          return (
            <div className={styles.card} key={product.id}>
              <div className={styles.cardTop}>
                {cover ? (
                  <img src={cover} alt={product.name} className={styles.cardThumb} />
                ) : (
                  <div className={styles.cardThumbPlaceholder}>No image</div>
                )}
                <div className={styles.cardInfo}>
                  <span className={styles.cardName}>{product.name}</span>
                  <span className={styles.cardCategory}>{product.category}</span>
                  <span className={styles.cardPrice}>{formatNaira(product.price)}</span>
                </div>
                <StockToggle productId={product.id} inStock={product.in_stock !== false} />
              </div>

              <div className={styles.cardMeta}>
                <span>{product.sizes?.length ? product.sizes.join(', ') : 'No sizes'}</span>
                <span>{product.images?.length || 0} image{product.images?.length === 1 ? '' : 's'}</span>
              </div>

              <div className={styles.cardActions}>
                <Link href={`/admin/products/${product.id}/edit`} className={styles.editLink}>
                  Edit
                </Link>
                <button
                  type="button"
                  className={styles.deleteBtn}
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
    </div>
  )
}