'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/browserClient'
import { useNavLoaderStore } from '../../../lib/store/navLoaderStore'
import styles from './page.module.css'

export default function AdminLoginPage() {
  const router = useRouter()
  const startNav = useNavLoaderStore((s) => s.start)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      const message = signInError.message || ''
      const isBadCredentials =
        message.toLowerCase().includes('invalid login credentials') ||
        message.toLowerCase().includes('invalid email or password')

      setError(
        isBadCredentials
          ? 'Incorrect email or password.'
          : 'Something went wrong signing in. Please check your connection and try again.'
      )
      setLoading(false)
      return
    }

    startNav()
    router.push('/admin/dashboard')
    router.refresh()
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className="eyebrow" style={{ color: 'var(--brand-rose)', marginBottom: '0.5rem' }}>
          The Little Hanan
        </p>
        <h1 className={`display-md ${styles.title}`}>Admin Login</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={styles.input}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={styles.input}
            />
          </label>

          {error && (
            <p className={styles.error} role="alert">{error}</p>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}