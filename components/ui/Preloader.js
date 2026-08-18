'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './Preloader.module.css'

// Real product photos (refined for a clean, consistent studio look), ending
// on the actual Hero poster frame — so the shuffle visibly "arrives" at
// exactly the image Hero's background video is about to pick up from,
// instead of settling on something unrelated right before the handoff.
const SHUFFLE_IMAGES = [
  '/assets/preloader-1.jpg',
  '/assets/preloader-2.jpg',
  '/assets/preloader-3.jpg',
  '/assets/preloader-4.jpg',
  '/assets/preloader-5.jpg',
  '/assets/preloader-6.jpg',
  '/assets/preloader-7.jpg',
  '/assets/hero-poster.png',
]

// Decelerating, like a slot machine settling rather than a flat loop —
// each swap takes a little longer than the last.
const SHUFFLE_DELAYS = [130, 140, 150, 170, 190, 220, 260, 380]

const MIN_VISIBLE_MS_DESKTOP = 2000 // don't let it flash by unreadably fast
const MIN_VISIBLE_MS_MOBILE = 1300  // a 2s hold reads as longer on a small screen
const MAX_WAIT_MS = 6000            // never hang indefinitely on a slow asset

export default function Preloader() {
  const [frameIndex, setFrameIndex] = useState(0)
  const [phase, setPhase] = useState('shuffling') // shuffling -> zooming -> fading -> done
  const wrapRef = useRef(null)
  const markRef = useRef(null)
  const frameRef = useRef(null)
  const startedAt = useRef(null)
  const loadedCountRef = useRef(0)
  const [loadedPct, setLoadedPct] = useState(0)
  const assetsReady = useRef(false)
  const shuffleSettled = useRef(false)

  useEffect(() => {
    // Only the very first load of a browser session gets the full
    // shuffle/zoom spectacle. Every navigation after that is handled by
    // MiniPreloader instead — replaying this on every internal route
    // change is far too long. sessionStorage (not localStorage) so a
    // fresh tab/session sees it again, matching "opening the website."
    const alreadyShown = sessionStorage.getItem('lh_preloader_shown') === '1'
    if (alreadyShown) {
      setPhase('done')
      window.dispatchEvent(new CustomEvent('preloader:complete'))
      return
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      // Skip the shuffle/zoom spectacle entirely — brief presence, then
      // hand off immediately so nothing waits on motion that won't play.
      const t = setTimeout(() => finish(), 400)
      return () => clearTimeout(t)
    }

    const isMobile = window.matchMedia('(max-width: 640px)').matches
    const minVisibleMs = isMobile ? MIN_VISIBLE_MS_MOBILE : MIN_VISIBLE_MS_DESKTOP

    startedAt.current = Date.now()

    // Preload every shuffle frame + the real hero poster in the
    // background, so the progress bar reflects genuine load state
    // instead of a guessed timer.
    const total = SHUFFLE_IMAGES.length
    SHUFFLE_IMAGES.forEach((src) => {
      const img = new Image()
      img.onload = img.onerror = () => {
        loadedCountRef.current += 1
        setLoadedPct(Math.round((loadedCountRef.current / total) * 100))
        if (loadedCountRef.current >= total) {
          assetsReady.current = true
          maybeAdvance()
        }
      }
      img.src = src
    })

    // Shuffle sequence — advances through SHUFFLE_DELAYS, landing on the
    // real hero poster as the final frame.
    let i = 0
    function step() {
      if (i >= SHUFFLE_IMAGES.length - 1) {
        setFrameIndex(SHUFFLE_IMAGES.length - 1)
        shuffleSettled.current = true
        maybeAdvance()
        return
      }
      i += 1
      setFrameIndex(i)
      timeoutRef.current = setTimeout(step, SHUFFLE_DELAYS[i])
    }
    const timeoutRef = { current: setTimeout(step, SHUFFLE_DELAYS[0]) }

    // Only move to the zoom once the shuffle has visibly settled on the
    // hero poster AND real assets are loaded AND the minimum readable
    // duration has passed — whichever finishes last.
    function maybeAdvance() {
      if (!shuffleSettled.current) return
      const elapsed = Date.now() - startedAt.current
      const minWaitLeft = Math.max(0, minVisibleMs - elapsed)
      if (assetsReady.current) {
        setTimeout(startZoom, minWaitLeft)
      }
    }

    const hardTimeout = setTimeout(() => {
      if (phaseRef.current === 'shuffling') startZoom()
    }, MAX_WAIT_MS)

    const phaseRef = { current: 'shuffling' }
    function startZoom() {
      if (phaseRef.current !== 'shuffling') return
      phaseRef.current = 'zooming'
      computeHandoff()
      computeFrameTarget()
      setPhase('zooming')
      setTimeout(finish, 900) // matches the zoom transition duration in CSS
    }

    return () => {
      clearTimeout(timeoutRef.current)
      clearTimeout(hardTimeout)
    }
  }, [])

  // Positions the corner wordmark so its CSS transform lands it exactly on
  // top of the real navbar logo (see data-navbar-logo in Navbar.js) — so it
  // reads as "becoming" the navbar rather than just fading independently.
  function computeHandoff() {
    const markEl = markRef.current
    const navLogoEl = document.querySelector('[data-navbar-logo]')
    if (!markEl || !navLogoEl) return

    const markRect = markEl.getBoundingClientRect()
    const navRect = navLogoEl.getBoundingClientRect()
    if (markRect.height === 0 || navRect.height === 0) return

    const dx = (navRect.left + navRect.width / 2) - (markRect.left + markRect.width / 2)
    const dy = (navRect.top + navRect.height / 2) - (markRect.top + markRect.height / 2)
    const scale = navRect.height / markRect.height

    markEl.style.setProperty('--handoff-x', `${dx}px`)
    markEl.style.setProperty('--handoff-y', `${dy}px`)
    markEl.style.setProperty('--handoff-scale', scale.toFixed(2))
  }

  // The old approach scaled the frame up generically from its own center
  // via `transform: scale()`, while Hero ran its own separate circular
  // reveal on the actual video — two independent animations that never
  // quite lined up, which read as a seam rather than one continuous move.
  //
  // Instead: measure the real Hero video's on-screen rect (data-hero-media
  // in Hero.js) and animate the frame's actual top/left/width/height to
  // match it exactly. Because .frameImg uses object-fit: cover, animating
  // real box dimensions (not a CSS transform) means the image re-crops
  // correctly at every step with no stretching — and since the frame's
  // last shuffle image IS the video's poster frame, once the box lands on
  // the real video's rect the two are pixel-identical, so the fade that
  // follows is invisible instead of a visible cut.
  function computeFrameTarget() {
    const frameEl = frameRef.current
    const heroMediaEl = document.querySelector('[data-hero-media]')
    if (!frameEl || !heroMediaEl) return

    const startRect = frameEl.getBoundingClientRect()
    const targetRect = heroMediaEl.getBoundingClientRect()
    if (targetRect.height === 0) return

    // Pin the frame at its current on-screen position first, in the same
    // pixel spot it already occupies, so leaving the flex layout for fixed
    // positioning causes zero visual jump.
    frameEl.style.position = 'fixed'
    frameEl.style.margin = '0'
    frameEl.style.top = `${startRect.top}px`
    frameEl.style.left = `${startRect.left}px`
    frameEl.style.width = `${startRect.width}px`
    frameEl.style.height = `${startRect.height}px`

    // Force a layout flush so the browser registers the pinned position
    // as the transition's start point before the target values below are
    // applied on the next frame.
    // eslint-disable-next-line no-unused-expressions
    frameEl.offsetHeight

    requestAnimationFrame(() => {
      frameEl.style.top = `${targetRect.top}px`
      frameEl.style.left = `${targetRect.left}px`
      frameEl.style.width = `${targetRect.width}px`
      frameEl.style.height = `${targetRect.height}px`
    })
  }

  function finish() {
    // Marked here — once the animation has genuinely completed — rather
    // than preemptively on mount, so React Strict Mode's dev-only double
    // effect invocation can't poison the flag before the real shuffle runs.
    sessionStorage.setItem('lh_preloader_shown', '1')

    // Dispatched at the start of the fade rather than after it, so Hero's
    // content reveal (triggered by this event) plays concurrently with the
    // preloader's own fade-out instead of waiting for it to finish first —
    // the two motions overlap into one continuous handoff.
    window.dispatchEvent(new CustomEvent('preloader:complete'))
    setPhase('fading')
    setTimeout(() => setPhase('done'), 500) // matches .fading's opacity transition duration in CSS
  }

  if (phase === 'done') return null

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${phase === 'zooming' ? styles.zooming : ''} ${phase === 'fading' ? styles.fading : ''}`}
      aria-hidden="true"
    >
      <div className={styles.bgText}>
        <svg className={styles.bgTextSvg} width="100%" height="100%">
          <defs>
            <filter id="preloaderWaterRipple">
              <feTurbulence type="fractalNoise" baseFrequency="0.009 0.05" numOctaves="2" seed="4" result="turb">
                <animate attributeName="baseFrequency" dur="10s" values="0.009 0.05;0.013 0.035;0.009 0.05" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="turb" scale="16" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <text x="50%" y="53%" textAnchor="middle" className={styles.bgTextEl} filter="url(#preloaderWaterRipple)">
            Little Hanan
          </text>
        </svg>
      </div>

      <div className={styles.mark} ref={markRef}>
        The Little Hanan<span className={styles.dot}>.</span>
      </div>

      <div className={styles.frame} ref={frameRef}>
        {SHUFFLE_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={styles.frameImg}
            style={{ opacity: i === frameIndex ? 1 : 0 }}
          />
        ))}
      </div>

      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${loadedPct}%` }} />
      </div>
    </div>
  )
}