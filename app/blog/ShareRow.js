'use client'

import { useState } from 'react'
import styles from './ShareRow.module.css'

export default function ShareRow({ title }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable — fail silently, link stays visible in the address bar.
    }
  }

  const whatsappHref =
    typeof window !== 'undefined'
      ? `https://wa.me/?text=${encodeURIComponent(`${title} — ${window.location.href}`)}`
      : 'https://wa.me/'

  return (
    <div className={styles.shareRow}>
      <span className={styles.shareLabel}>Share this article</span>
      <div className={styles.shareIcons}>
        <a
          href="https://www.instagram.com/theelittlehanan/"
          target="_blank"
          rel="noreferrer"
          aria-label="Visit our Instagram"
        >
          <i className="ri-instagram-line" />
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Share on WhatsApp"
        >
          <i className="ri-whatsapp-line" />
        </a>
        <button
          type="button"
          onClick={handleCopy}
          className={styles.copyBtn}
          aria-label="Copy link"
        >
          <i className={copied ? 'ri-check-line' : 'ri-link'} />
          {copied && <span className={styles.copiedLabel}>Copied!</span>}
        </button>
      </div>
    </div>
  )
}