'use client'
import { Fragment, useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from '../../lib/gsap'
import { onPreloaderComplete } from '../../lib/preloaderState'
import styles from './Hero.module.css'

// Middle line renders in brand-rose (was the <em> line in the previous
// split-layout version) — everything else stays brand-black.
const HEADLINE = [
  { text: 'The Art', tone: 'ink' },
  { text: 'of Getting', tone: 'rose' },
  { text: 'Dressed.', tone: 'ink' },
]

const MARQUEE_ITEMS = [
  'New Arrivals',
  'Spring Edit',
  'Abuja Fashion',
  'WhimsyNetting',
  'Crochet Pieces',
  'Kaduna Fashion',
  'Limited Styles',
]

export default function Hero() {
  const heroRef = useRef(null)
  const headingRef = useRef(null)
  const bgMarkRef = useRef(null)
  const videoRef = useRef(null)

  // Respect reduced-motion for the background video too — it still
  // shows (poster/first frame), it just doesn't autoplay.
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced && videoRef.current) {
      videoRef.current.pause()
    }
  }, [])

  // Entrance — held until the preloader hands off, so the circular reveal
  // and the line cascade feel like one continuous motion.
  //
  // NOTE: this used to reveal the headline letter-by-letter via
  // `yPercent` inside an `overflow: hidden` mask. On at least one mobile
  // device that combination (many small elements, transform-animated,
  // clipped by an overflow:hidden ancestor) never actually painted —
  // even after promoting the mask to its own compositor layer — while
  // simple opacity/y fades on single elements (eyebrow, desc, ctas,
  // social) worked fine every time. Rather than keep chasing a
  // device-specific paint bug, the headline now uses that same proven
  // opacity/y technique, per line instead of per letter. Individual
  // `.letter` spans are kept only for the hover-ripple interaction.
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return // CSS reduced-motion rule already shows everything

    const heroEl = heroRef.current
    const headingEl = headingRef.current
    if (!heroEl || !headingEl) return

    const lineEls = headingEl.querySelectorAll(`.${styles.lineInner}`)
    const eyebrowEl = heroEl.querySelector(`.${styles.eyebrow}`)
    const descEl = heroEl.querySelector(`.${styles.desc}`)
    const ctasEl = heroEl.querySelector(`.${styles.ctas}`)
    const socialEl = heroEl.querySelector(`.${styles.social}`)
    const fadeTargets = [eyebrowEl, descEl, ctasEl, socialEl].filter(Boolean)

    gsap.set(lineEls, { opacity: 0, y: 24 })
    gsap.set(fadeTargets, { opacity: 0, y: 20 })

    let played = false
    function play() {
      if (played) return
      played = true

      // The video stays parked on its poster frame — pixel-identical to
      // the preloader's last shuffle frame — until the preloader has
      // completely finished, fade included. Starting playback any earlier
      // (even mid-fade) meant real motion was visible underneath the
      // preloader's own fade-out, which read as the same seam this was
      // meant to fix. 500ms matches Preloader.js's .fading transition.
      setTimeout(() => {
        videoRef.current?.play()
      }, 500)

      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to(eyebrowEl, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
        .to(lineEls, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0.3)
        .to(descEl, { opacity: 1, y: 0, duration: 0.6 }, '-=0.5')
        .to(ctasEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.4')
        .to(socialEl, { opacity: 1, y: 0, duration: 0.5 }, '-=0.35')
    }

    const stopListening = onPreloaderComplete(play)

    // Independent safety net — if `play` somehow never fires (a future
    // regression, a browser quirk, anything), the hero still reveals
    // itself instead of staying invisible forever.
    const hardFallback = setTimeout(play, 5000)

    return () => {
      stopListening()
      clearTimeout(hardFallback)
    }
  }, [])

  // Scroll interactivity — desktop only, keeps mobile scroll perf untouched.
  // The giant watermark drifts/scales up and the headline drifts and
  // loosens its letter-spacing slightly as the hero scrolls past.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference) and (min-width: 769px)', () => {
        const scrollTriggerBase = {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }

        if (bgMarkRef.current) {
          gsap.to(bgMarkRef.current, { yPercent: -25, scale: 1.15, opacity: 0.02, ease: 'none', scrollTrigger: scrollTriggerBase })
        }
        if (headingRef.current) {
          gsap.to(headingRef.current, { yPercent: -6, letterSpacing: '0.01em', ease: 'none', scrollTrigger: scrollTriggerBase })
        }
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  // Interactive touch — hover a letter and its near neighbors (within the
  // same line) lift and scale with it, decaying with distance. Desktop
  // pointer only; scoped per line so the ripple never crosses line breaks.
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (prefersReduced || !hasFinePointer || !headingRef.current) return

    let cleanups = []
    let attached = false

    // Wait for the entrance handoff before wiring up hover — otherwise a
    // stray mouseenter during load could nudge a letter's `y` before the
    // entrance timeline has set its `yPercent`, making hover look like
    // the thing that "reveals" the headline.
    const stop = onPreloaderComplete(() => {
      if (attached || !headingRef.current) return
      attached = true
      cleanups = attachRipple(headingRef.current)
    })

    return () => {
      stop()
      cleanups.forEach((fn) => fn())
    }
  }, [])

  function attachRipple(headingEl) {
    const lines = Array.from(headingEl.querySelectorAll(`.${styles.lineInner}`))
    const cleanups = []

    lines.forEach((line) => {
      const letters = Array.from(line.querySelectorAll(`.${styles.letter}`))

      function rippleFrom(index) {
        letters.forEach((el, j) => {
          const dist = Math.abs(index - j)
          const amount = Math.max(0, 1 - dist * 0.32)
          gsap.to(el, {
            y: -12 * amount,
            scale: 1 + 0.25 * amount,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        })
      }

      function reset() {
        gsap.to(letters, { y: 0, scale: 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto' })
      }

      letters.forEach((el, i) => {
        const enter = () => rippleFrom(i)
        el.addEventListener('mouseenter', enter)
        cleanups.push(() => el.removeEventListener('mouseenter', enter))
      })
      line.addEventListener('mouseleave', reset)
      cleanups.push(() => line.removeEventListener('mouseleave', reset))
    })

    return cleanups
  }

  return (
    <section className={styles.hero} ref={heroRef}>
      {/* Background video — public/videos/hero.mp4, poster still at
          public/assets/hero-poster.png */}
      <video
        ref={videoRef}
        className={styles.videoBg}
        data-hero-media
        muted
        loop
        playsInline
        poster="/assets/hero-poster.png"
        aria-hidden="true"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className={styles.overlay} aria-hidden="true" />

      <div className={styles.bgMark} ref={bgMarkRef} aria-hidden="true">Hanan</div>

      <div className={styles.inner}>
        <p className={`eyebrow ${styles.eyebrow}`}>New Arrivals · Spring Edit</p>

        <h1 className={`display-xl ${styles.heading}`} ref={headingRef}>
          {HEADLINE.map((line, li) => (
            <span className={styles.lineMask} key={li}>
              <span className={`${styles.lineInner} ${line.tone === 'rose' ? styles.rose : ''}`}>
                {line.text.split(' ').map((word, wi, arr) => (
                  <Fragment key={wi}>
                    <span>
                      {word.split('').map((ch, ci) => (
                        <span className={styles.letter} key={ci}>{ch}</span>
                      ))}
                    </span>
                    {wi < arr.length - 1 ? ' ' : ''}
                  </Fragment>
                ))}
              </span>
            </span>
          ))}
        </h1>

        <p className={styles.desc}>
          "Curated women's fashion in Abuja and Kaduna — from statement pieces to everyday essentials, all priced in Naira."
        </p>

        <div className={styles.ctas}>
          <Link href="/shop" className={styles.btnPrimary}>
            Shop now <i className="ri-arrow-right-line" aria-hidden="true" />
          </Link>
          <Link href="/sale" className={styles.btnOutline}>View sale</Link>
        </div>

        <div className={styles.social}>
          <a href="https://www.instagram.com/theelittlehanan/" target="_blank" rel="noreferrer" aria-label="Instagram" className={styles.socialIcon}><i className="ri-instagram-line" /></a>
          <a href="https://wa.me/2348100653400" target="_blank" rel="noreferrer" aria-label="WhatsApp" className={styles.socialIcon}><i className="ri-whatsapp-line" /></a>
          <a href="https://www.tiktok.com/@just.jiddvh" target="_blank" rel="noreferrer" aria-label="TikTok" className={styles.socialIcon}><i className="ri-tiktok-line" /></a>
        </div>
      </div>

      {/* Scrolling marquee — oversized editorial type, alternating
          solid/outlined words, duplicated once for a seamless loop */}
      <div className={styles.marqueeWrap} aria-hidden="true">
        <div className={styles.marquee}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
            <span
              key={i}
              className={`${styles.marqueeItem} ${i % 2 === 1 ? styles.outline : ''}`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}