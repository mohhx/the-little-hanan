'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/browserClient'
import styles from './StockToggle.module.css'

export default function StockToggle({ productId, inStock }) {
  const router = useRouter()
  const [current, setCurrent] = useState(inStock)
  const [saving, setSaving] = useState(false)

  async function handleToggle(event) {
    event.preventDefault()
    event.stopPropagation()
    if (saving) return

    const next = !current
    setCurrent(next) // optimistic
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update({ in_stock: next })
      .eq('id', productId)

    setSaving(false)

    if (error) {
      setCurrent(!next) // revert on failure
      return
    }

    router.refresh()
  }

  return (
    <button
      type="button"
      className={`${styles.toggle} ${current ? styles.on : styles.off}`}
      onClick={handleToggle}
      disabled={saving}
      aria-pressed={current}
      aria-label={current ? 'Mark as out of stock' : 'Mark as in stock'}
      title={current ? 'In stock — click to mark out of stock' : 'Out of stock — click to mark in stock'}
    >
      <span className={styles.knob} />
    </button>
  )
}