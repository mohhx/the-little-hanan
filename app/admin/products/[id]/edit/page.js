import Link from 'next/link'
import { createClient } from '../../../../../lib/supabase/serverClient'
import ProductForm from '../../../../../components/admin/ProductForm'
import styles from '../../new/page.module.css'

export default async function EditProductPage({ params }) {
  const supabase = createClient()

  const [{ data: product, error: productError }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', params.id).single(),
    supabase.from('categories').select('*').order('name', { ascending: true }),
  ])

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--brand-rose)', marginBottom: '0.25rem' }}>
            The Little Hanan — Admin
          </p>
          <h1 className={`display-md ${styles.title}`}>
            {product ? `Edit — ${product.name}` : 'Edit product'}
          </h1>
        </div>
        <Link href="/admin/dashboard" className={styles.backLink}>&larr; Back to dashboard</Link>
      </div>

      {productError || !product ? (
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
          Couldn't find that product. It may have been deleted.
        </p>
      ) : (
        <ProductForm mode="edit" product={product} categories={categories || []} />
      )}
    </main>
  )
}