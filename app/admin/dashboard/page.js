import Link from 'next/link'
import { createClient } from '../../../lib/supabase/serverClient'
import SignOutButton from '../../../components/admin/SignOutButton'
import AllProductsToggle from '../../../components/admin/AllProductsToggle'
import StockToggle from '../../../components/admin/StockToggle'
import { formatNaira } from '../../../components/shop/formatNaira'
import styles from './page.module.css'

export default async function AdminDashboardPage() {
  const supabase = createClient()

  const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('*'),
    ])

  const safeProducts = products || []
  const safeCategories = categories || []

  const missingImagesCount = safeProducts.filter(
    (p) => !p.images || p.images.length === 0
  ).length

  const recentProducts = safeProducts.slice(0, 6)

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const addedThisWeek = safeProducts.filter(
    (p) => p.created_at && new Date(p.created_at) >= oneWeekAgo
  ).length

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.topbar}>
          <div>
            <h1 className={styles.greet}>Welcome back</h1>
            <p className={styles.greetSub}>Here's how The Little Hanan is doing</p>
          </div>
          <div className={styles.topbarActions}>
            <Link href="/admin/products" className={styles.navLink}>Products</Link>
            <SignOutButton />
          </div>
        </div>

        <div className={styles.quickRow}>
          <Link href="/admin/products/new" className={styles.quickBtn}>
            + Add product
          </Link>
          <Link href="/admin/products/new" className={`${styles.quickBtn} ${styles.quickBtnGhost}`}>
            + Add category
          </Link>
        </div>

        {(productsError || categoriesError) && (
          <p className={styles.error} role="alert">
            Couldn't load some dashboard data
            {productsError ? `: ${productsError.message}` : ''}
            {categoriesError ? `: ${categoriesError.message}` : ''}
          </p>
        )}

        <div className={styles.stats}>
          <div className={styles.stat}>
            <p className={styles.statNum}>{safeProducts.length}</p>
            <p className={styles.statLabel}>Products</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statNum}>{safeCategories.length}</p>
            <p className={styles.statLabel}>Categories</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statNum}>{missingImagesCount}</p>
            <p className={styles.statLabel}>Need images</p>
          </div>
          <div className={styles.stat}>
            <p className={styles.statNum}>{addedThisWeek}</p>
            <p className={styles.statLabel}>Added this week</p>
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Your products</h2>
          {recentProducts.length === 0 ? (
            <p className={styles.emptyText}>No products yet.</p>
          ) : (
            <div className={styles.strip}>
              {recentProducts.map((product) => {
                const cover = product.images?.[0] || product.image
                return (
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    key={product.id}
                    className={styles.stripItem}
                  >
                    {cover ? (
                      <img src={cover} alt={product.name} className={styles.stripImg} />
                    ) : (
                      <div className={styles.stripPlaceholder}>No image</div>
                    )}
                    <p className={styles.stripName}>{product.name}</p>
                    <p className={styles.stripPrice}>{formatNaira(product.price)}</p>
                    <div className={styles.stripStockRow}>
                      <StockToggle productId={product.id} inStock={product.in_stock !== false} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          <AllProductsToggle products={safeProducts} />
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Sales</h2>
          <div className={styles.salesPlaceholder}>
            <span className={styles.salesBig}>Coming soon</span>
            <span className={styles.badge}>Connects once checkout uses Paystack</span>
          </div>
        </div>
      </div>
    </main>
  )
}