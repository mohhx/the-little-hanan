'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './MiniPreloader.module.css'
import { useNavLoaderStore } from '../../lib/store/navLoaderStore'

const MIN_VISIBLE_MS = 580 // floor so a fast/prefetched route can't skip the blink entirely
const FADE_MS = 260 // matches .fading's opacity transition duration in CSS

export default function MiniPreloader() {
  const active = useNavLoaderStore((s) => s.active)
  const [mounted, setMounted] = useState(false)
  const [fading, setFading] = useState(false)
  const startedAt = useRef(0)
  const minHoldTimeout = useRef(null)
  const fadeTimeout = useRef(null)

  useEffect(() => {
    if (active) {
      clearTimeout(minHoldTimeout.current)
      clearTimeout(fadeTimeout.current)
      startedAt.current = Date.now()
      setFading(false)
      setMounted(true)
    } else if (mounted) {
      // Real readiness has already been reached (that's what set active
      // to false) — but don't let the scrim disappear before it's had a
      // minimum chance to actually be seen.
      const elapsed = Date.now() - startedAt.current
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed)
      minHoldTimeout.current = setTimeout(() => {
        setFading(true)
        fadeTimeout.current = setTimeout(() => setMounted(false), FADE_MS)
      }, remaining)
    }
    return () => {
      clearTimeout(minHoldTimeout.current)
      clearTimeout(fadeTimeout.current)
    }
  }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null

  return (
    <div className={`${styles.scrim} ${fading ? styles.fading : ''}`} aria-hidden="true">
      <div className={styles.wordWrap}>
        <span className={`${styles.word} ${styles.outline}`}>
          The Little Hanan<span className={styles.dot}>.</span>
        </span>
        <span className={`${styles.word} ${styles.fill} ${fading ? styles.fillFading : ''}`}>
          The Little Hanan.
        </span>
      </div>
    </div>
  )
}