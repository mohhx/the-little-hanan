'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import styles from './NavProgress.module.css'

// App Router has no "navigation started" event — usePathname/useSearchParams
// only update once the new page has actually rendered. So progress starts
// optimistically on click (any internal link) and ramps toward ~80% without
// ever completing on its own; the moment the route actually changes, it
// snaps to 100% and fades. Click-only for now — router.push() redirects
// (e.g. after a form save) don't trigger this yet.
export default function NavProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const rampRef = useRef(null)
  const finishTimeoutRef = useRef(null)
  const navigatingRef = useRef(false)

  useEffect(() => {
    function onClick(event) {
      const link = event.target.closest('a')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      if (link.target === '_blank' || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      let url
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return
      if (url.pathname === window.location.pathname && url.search === window.location.search) return

      startNav()
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  function startNav() {
    navigatingRef.current = true
    clearTimeout(finishTimeoutRef.current)
    clearInterval(rampRef.current)

    setVisible(true)
    setProgress(8)

    rampRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 80) return p
        const remaining = 80 - p
        return p + Math.max(0.5, remaining * 0.08)
      })
    }, 120)
  }

  // Route (or query) actually changed — the new page has rendered, so
  // snap to complete and fade out.
  useEffect(() => {
    if (!navigatingRef.current) return
    navigatingRef.current = false
    clearInterval(rampRef.current)
    setProgress(100)

    finishTimeoutRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 260)

    return () => clearTimeout(finishTimeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  useEffect(() => {
    return () => {
      clearInterval(rampRef.current)
      clearTimeout(finishTimeoutRef.current)
    }
  }, [])

  return (
    <div className={`${styles.track} ${visible ? styles.visible : ''}`} aria-hidden="true">
      <div className={styles.fill} style={{ width: `${progress}%` }} />
    </div>
  )
}