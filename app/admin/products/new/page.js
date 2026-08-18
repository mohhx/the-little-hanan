import Link from 'next/link'
import { createClient } from '../../../../lib/supabase/serverClient'
import ProductForm from '../../../../components/admin/ProductForm'
import styles from './page.module.css'

export default async function NewProductPage() {
  const supabase = createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--brand-rose)', marginBottom: '0.25rem' }}>
            The Little Hanan — Admin
          </p>
          <h1 className={`display-md ${styles.title}`}>Add product</h1>
        </div>
        <Link href="/admin/dashboard" className={styles.backLink}>&larr; Back to dashboard</Link>
      </div>

      <ProductForm mode="create" product={null} categories={categories || []} />
    </main>
  )
}