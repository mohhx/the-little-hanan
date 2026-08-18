import Link from 'next/link'
import { createClient } from '../../../lib/supabase/serverClient'
import SettingsForm from '../../../components/admin/SettingsForm'
import SignOutButton from '../../../components/admin/SignOutButton'
import styles from './page.module.css'

export default async function AdminSettingsPage() {
  const supabase = createClient()
  const { data: rows, error } = await supabase.from('settings').select('key, value')

  const settings = {}
  for (const row of rows || []) {
    settings[row.key] = row.value
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--brand-rose)', marginBottom: '0.25rem' }}>
            The Little Hanan — Admin
          </p>
          <h1 className={`display-md ${styles.title}`}>Settings</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/dashboard" className={styles.backLink}>&larr; Back to dashboard</Link>
          <SignOutButton />
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          Couldn't load settings: {error.message}
        </p>
      )}

      {!error && <SettingsForm settings={settings} />}
    </main>
  )
}