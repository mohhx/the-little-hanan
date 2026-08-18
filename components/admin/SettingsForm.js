'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/browserClient'
import { showToast } from '../ui/Toast'
import styles from './SettingsForm.module.css'

export default function SettingsForm({ settings }) {
  const [bankName, setBankName] = useState(settings.bank_name || '')
  const [accountNumber, setAccountNumber] = useState(settings.account_number || '')
  const [accountName, setAccountName] = useState(settings.account_name || '')
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsapp_number || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setError('Bank name, account number, and account name are all required — these show directly to customers at checkout.')
      return
    }

    setSaving(true)
    const supabase = createClient()

    const { error: upsertError } = await supabase.from('settings').upsert(
      [
        { key: 'bank_name', value: bankName.trim() },
        { key: 'account_number', value: accountNumber.trim() },
        { key: 'account_name', value: accountName.trim() },
        { key: 'whatsapp_number', value: whatsappNumber.trim() },
      ],
      { onConflict: 'key' }
    )

    setSaving(false)

    if (upsertError) {
      setError(`Couldn't save settings: ${upsertError.message}`)
      return
    }

    showToast('Settings saved')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <p className={styles.error} role="alert">{error}</p>}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Bank Transfer Details</h2>
        <p className={styles.sectionHint}>
          Shown to customers at checkout when they choose "Bank Transfer" as their payment method.
        </p>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="bankName">Bank name</label>
          <input
            id="bankName"
            type="text"
            className={styles.input}
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Guaranty Trust Bank"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="accountNumber">Account number</label>
            <input
              id="accountNumber"
              type="text"
              inputMode="numeric"
              className={styles.input}
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="0123456789"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="accountName">Account name</label>
            <input
              id="accountName"
              type="text"
              className={styles.input}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="The Little Hanan"
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Proof of Payment</h2>
        <p className={styles.sectionHint}>
          After paying, customers tap a button to send proof of payment straight to this WhatsApp
          number, with their order details pre-filled.
        </p>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="whatsappNumber">WhatsApp number</label>
          <input
            id="whatsappNumber"
            type="text"
            inputMode="tel"
            className={styles.input}
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="2348012345678"
          />
          <p className={styles.fieldHint}>
            International format, no "+" or leading 0 — e.g. a Nigerian number 0801 234 5678 becomes 2348012345678.
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </form>
  )
}