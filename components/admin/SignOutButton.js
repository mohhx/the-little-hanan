'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/browserClient'
import styles from './SignOutButton.module.css'

export default function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      className={`btn btn-outline ${styles.signOutBtn}`}
      onClick={handleSignOut}
      disabled={loading}
    >
      {loading ? 'Signing out…' : 'Sign Out'}
    </button>
  )
}