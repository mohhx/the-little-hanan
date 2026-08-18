'use client'
import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useNavLoaderStore } from '../../lib/store/navLoaderStore'

// Safety net only — real readiness (pathname/searchParams change) almost
// always fires first. This just guarantees the scrim can never hang
// indefinitely if a navigation is somehow never observed (e.g. a false
// positive from an in-page anchor).
const MAX_WAIT_MS = 4000

export default function NavigationWatcher() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const start = useNavLoaderStore((s) => s.start)
  const finish = useNavLoaderStore((s) => s.finish)
  const active = useNavLoaderStore((s) => s.active)
  const isFirstRun = useRef(true)

  useEffect(() => {
    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const anchor = e.target.closest ? e.target.closest('a[href]') : null
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return
      if (anchor.hasAttribute('data-quick-view')) return
      if (e.target.closest && e.target.closest('[data-no-nav-loader]')) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#')) return

      let url
      try {
        url = new URL(href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin) return

      const currentFull = window.location.pathname + window.location.search
      const targetFull = url.pathname + url.search
      if (targetFull === currentFull) return

      start()
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [start])

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    finish()
  }, [pathname, searchParams, finish])

  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => finish(), MAX_WAIT_MS)
    return () => clearTimeout(t)
  }, [active, finish])

  return null
}