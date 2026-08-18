import Link from 'next/link'
import { createClient } from '../../../lib/supabase/serverClient'
import ProductsTable from '../../../components/admin/ProductsTable'
import SignOutButton from '../../../components/admin/SignOutButton'
import styles from './page.module.css'

export default async function AdminProductsPage() {
  const supabase = createClient()
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--brand-rose)', marginBottom: '0.25rem' }}>
            The Little Hanan — Admin
          </p>
          <h1 className={`display-md ${styles.title}`}>Products</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/products/new" className="btn btn-primary">
            + Add Product
          </Link>
          <SignOutButton />
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          Couldn't load products: {error.message}
        </p>
      )}

      {!error && products && products.length === 0 && (
        <p className={styles.empty}>
          No products yet. Click "Add Product" to create your first one.
        </p>
      )}

      {!error && products && products.length > 0 && (
        <ProductsTable products={products} />
      )}
    </main>
  )
}