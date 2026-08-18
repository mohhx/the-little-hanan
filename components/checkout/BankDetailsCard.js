'use client'

import { useState } from 'react'
import styles from './BankDetailsCard.module.css'

export default function BankDetailsCard({ settings, loading }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!settings.account_number) return
    try {
      await navigator.clipboard.writeText(settings.account_number)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard API can fail (permissions, insecure context) — the
      // number is still visible on screen, so this is a nice-to-have,
      // not a required interaction. Fail silently.
    }
  }

  if (loading) {
    return (
      <div className={styles.card}>
        <p className={styles.loading}>Loading bank details…</p>
      </div>
    )
  }

  if (!settings.bank_name && !settings.account_number) {
    return (
      <div className={styles.card}>
        <p className={styles.loading}>
          Bank details aren&apos;t set up yet — we&apos;ll confirm them with you directly.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <span className={styles.label}>Bank</span>
        <span className={styles.value}>{settings.bank_name}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Account Number</span>
        <span className={styles.valueRow}>
          <span className={styles.value}>{settings.account_number}</span>
          <button type="button" className={styles.copyBtn} onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Account Name</span>
        <span className={styles.value}>{settings.account_name}</span>
      </div>
    </div>
  )
}