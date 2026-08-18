'use client'
import { useEffect, useState, useRef } from 'react'
import styles from './Toast.module.css'

// Simple pub/sub so any component (ProductCard, product page, etc.) can
// trigger a toast without needing its own state or a provider wrapper.
// Usage: import { showToast } from './Toast'; showToast('Added to bag')
const TOAST_EVENT = 'little-hanan-toast'

export function showToast(message, options = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, { detail: { message, ...options } })
  )
}

// Mount this once, globally (in Navbar, since Navbar is already global).
export default function ToastHost() {
  const [toast, setToast] = useState(null)
  const timeoutRef = useRef(null)

  useEffect(() => {
    function handleToast(e) {
      clearTimeout(timeoutRef.current)
      setToast(e.detail)
      timeoutRef.current = setTimeout(() => setToast(null), e.detail.duration || 2400)
    }
    window.addEventListener(TOAST_EVENT, handleToast)
    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast)
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className={styles.wrap} aria-live="polite" aria-atomic="true">
      {toast && (
        <div className={`${styles.toast} ${toast.variant === 'error' ? styles.error : ''}`}>
          {toast.icon && <i className={toast.icon} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
