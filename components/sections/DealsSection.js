'use client'
import { useState, useEffect, useRef, Fragment } from 'react'
import Link from 'next/link'
import ProductCard from '../ui/ProductCard'
import Reveal from '../ui/Reveal'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import styles from './DealsSection.module.css'

const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)

// Underlay marquee content — duplicated in render for a seamless loop,
// same technique Hero.js already uses for its own marquee band.
const MARQUEE_WORDS = ['Deals of the Month', 'Up to 20% Off']

export default function DealsSection({ products = [] }) {
  const getDeadline = () => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    d.setHours(d.getHours() + 20)
    return d
  }

  const deadline = getDeadline()
  const [time, setTime] = useState({ d: '00', h: '00', m: '00', s: '00' })
  const digitRefs = useRef({})
  const prevTime = useRef(time)

  const sectionRef = useRef(null)
  const unitRefs = useRef([]) // the 4 countdown units (d/h/m/s), for the entrance stagger
  const copyRef = useRef(null)

  // Sticky-scroll / slideshow refs (desktop only, see the crossfade effect below).
  const layoutRef = useRef(null)
  const reelWindowRef = useRef(null)
  const trackRef = useRef(null)
  const frameRefs = useRef([]) // each frame's animated visual wrapper (index numeral + card together)
  const counterRef = useRef(null) // small "01" wayfinding readout, top-right of the reel
  const progressRef = useRef(null) // thin fill bar under the counter
  const hintRef = useRef(null) // "scroll to explore" hint, first frame only

  // Real deals only — no fabricated discounts, no random backfill (decided
  // explicitly with the client). getDealsReelProducts() upstream already
  // caps this at 6, sliced defensively here too.
  const productFrames = products.slice(0, 6)

  // Below this, a sticky-pin + scroll-driven slideshow feels broken rather
  // than premium (not enough content to justify hijacking that much
  // scroll), so we fall back to the same simple horizontal-row layout
  // mobile uses, regardless of viewport width. Tune this threshold if it
  // feels off once you see it live.
  const hasReel = productFrames.length >= 3

  const allFrames = productFrames.length > 0
    ? [...productFrames, { isShopAll: true, id: 'shop-all' }]
    : []

  useEffect(() => {
    const tick = () => {
      const diff = deadline - Date.now()
      if (diff <= 0) return
      const pad = (n) => String(Math.floor(n)).padStart(2, '0')
      setTime({
        d: pad(diff / 86400000),
        h: pad((diff % 86400000) / 3600000),
        m: pad((diff % 3600000) / 60000),
        s: pad((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // Pulse whichever digit(s) just changed — a small, tasteful "tick" instead
  // of a flat re-render. Unrelated to scroll, kept as-is.
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!prefersReduced) {
      Object.keys(time).forEach((key) => {
        if (prevTime.current[key] !== time[key] && digitRefs.current[key]) {
          gsap.fromTo(
            digitRefs.current[key],
            { y: -10, opacity: 0.3 },
            { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
          )
        }
      })
    }
    prevTime.current = time
  }, [time])

  // Editorial entrance — same beat structure as WhimsyTeaser's own banner
  // entrance: eyebrow fades in first, the heading does a masked line-reveal
  // (yPercent 105 -> 0, power4.out, staggered per line — see .headingLine /
  // .headingLineInner in the CSS), then the countdown units pop in
  // (back.out stagger, unrelated to scroll, kept as-is from before), and
  // finally the description + CTA settle in. copyRef itself is left alone
  // now (no longer animated as one flat block) so each piece reveals on
  // its own beat instead of the whole column moving together.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const root = sectionRef.current
        if (!root) return

        const eyebrow = root.querySelector(`.${styles.eyebrow}`)
        const headingLines = root.querySelectorAll(`.${styles.headingLineInner}`)
        const desc = root.querySelector(`.${styles.desc}`)
        const cta = root.querySelector(`.${styles.cta}`)
        const units = unitRefs.current.filter(Boolean)

        gsap.set(eyebrow, { opacity: 0, y: 12 })
        gsap.set(headingLines, { yPercent: 105 })
        gsap.set(desc, { opacity: 0, y: 16 })
        gsap.set(cta, { opacity: 0, y: 14 })
        gsap.set(units, { opacity: 0, y: 14 })

        const tl = gsap.timeline({
          scrollTrigger: { trigger: root, start: 'top 82%', once: true },
        })

        tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.25, ease: 'power3.out' })
          .to(
            headingLines,
            { yPercent: 0, duration: 0.45, ease: 'power4.out', stagger: 0.04 },
            '-=0.15'
          )
          .to(
            units,
            { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power3.out' },
            '-=0.2'
          )
          .to(
            [desc, cta],
            { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power3.out' },
            '-=0.15'
          )
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        const root = sectionRef.current
        if (!root) return

        const eyebrow = root.querySelector(`.${styles.eyebrow}`)
        const headingLines = root.querySelectorAll(`.${styles.headingLineInner}`)
        const desc = root.querySelector(`.${styles.desc}`)
        const cta = root.querySelector(`.${styles.cta}`)
        const units = unitRefs.current.filter(Boolean)

        gsap.set([eyebrow, desc, cta, ...headingLines, ...units].filter(Boolean), {
          opacity: 1,
          y: 0,
          yPercent: 0,
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Scroll-driven crossfade slideshow — no-reduced-motion only, and only
  // when there's enough real inventory (hasReel). Frames are stacked
  // directly on top of one another (position: absolute) and a single
  // scrub-linked timeline crossfades between them — the outgoing frame
  // dissolves back and slightly down-scales while the incoming frame
  // grows in from a touch larger, rather than sliding laterally. Each
  // frame gets an even "dwell" window with a short crossfade at each
  // boundary, so most of the scroll feels settled rather than constantly
  // moving. Desktop pins the whole split-grid layout via plain CSS
  // position:sticky (.copyWrapPin / .reelWindow); mobile/tablet has no
  // side-by-side column to pin against, so the reel window pins itself
  // via GSAP instead, over a scroll distance sized to the number of
  // products rather than a fixed value.
  useEffect(() => {
    if (!hasReel) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Identical frame-to-frame dissolve for both breakpoints — only the
      // ScrollTrigger config (what pins, how long) differs between them.
      const buildCrossfade = (scrollTriggerConfig) => {
        const visuals = frameRefs.current.filter(Boolean)
        if (visuals.length === 0) return

        gsap.set(visuals, { opacity: 0, scale: 0.94 })
        gsap.set(visuals[0], { opacity: 1, scale: 1 })
        if (hintRef.current) gsap.set(hintRef.current, { opacity: 1 })

        const tl = gsap.timeline({
          scrollTrigger: {
            ...scrollTriggerConfig,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (counterRef.current) {
                const idx = Math.round(self.progress * (visuals.length - 1))
                counterRef.current.textContent = String(idx + 1).padStart(2, '0')
              }
              if (progressRef.current) {
                progressRef.current.style.width = self.progress * 100 + '%'
              }
              if (hintRef.current) {
                // Fades out over the first ~8% of scroll progress, rather
                // than on a timer, so it disappears exactly when the
                // user actually starts scrolling through the reel.
                hintRef.current.style.opacity = Math.max(1 - self.progress / 0.08, 0)
              }
            },
          },
        })

        const segment = 1 / visuals.length
        const crossfadeDur = segment * 0.4

        for (let i = 0; i < visuals.length - 1; i++) {
          const boundary = (i + 1) * segment
          const at = boundary - crossfadeDur / 2
          tl.to(visuals[i], { opacity: 0, scale: 0.94, ease: 'power1.inOut', duration: crossfadeDur }, at)
          tl.fromTo(
            visuals[i + 1],
            { opacity: 0, scale: 1.05 },
            { opacity: 1, scale: 1, ease: 'power1.inOut', duration: crossfadeDur },
            at
          )
        }
      }

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const layout = layoutRef.current
        if (!layout) return

        buildCrossfade({
          trigger: layout,
          start: 'top top+=96',
          // A small eased value instead of `true` — smooths fast
          // trackpad/wheel flicks into a glide instead of a jump.
          end: 'bottom bottom',
          scrub: 0.6,
        })
      })

      mm.add('(max-width: 1023px) and (prefers-reduced-motion: no-preference)', () => {
        const reelWindow = reelWindowRef.current
        if (!reelWindow) return

        buildCrossfade({
          trigger: reelWindow,
          // Centers the reel vertically in the viewport when the pin
          // engages, instead of pinning it flush under the navbar with
          // dead space below. Recomputed on every refresh (function,
          // not a static value) since both viewport height and the
          // reel's own height can change.
          start: () => {
            const reelHeight = reelWindow.getBoundingClientRect().height
            const offset = Math.max((window.innerHeight - reelHeight) / 2, 0)
            return 'top top+=' + offset
          },
          pin: true,
          pinSpacing: true,
          // ~0.8 viewport-heights of dwell per product, so a longer reel
          // gets proportionally more scroll room instead of feeling
          // rushed — this replaces an earlier version that mapped the
          // whole reel to a fixed, too-short scroll distance. A slower
          // scrub than desktop too, meant to feel unhurried rather than
          // track the finger/wheel exactly.
          end: () => '+=' + allFrames.length * window.innerHeight * 0.8,
          scrub: 1,
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [hasReel, productFrames.length])

  const units = [
    { key: 'd', v: time.d, label: 'Days' },
    { key: 'h', v: time.h, label: 'Hours' },
    { key: 'm', v: time.m, label: 'Mins' },
    { key: 's', v: time.s, label: 'Secs' },
  ]

  const copyBlock = (
<div className={`${styles.copyWrap} ${hasReel ? styles.copyWrapPin : ''}`} ref={copyRef}>
      <div className={styles.marqueeUnderlay} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className={styles.marqueeWord}>{w}</span>
          ))}
        </div>
      </div>

      <div className={styles.copyContent}>
        <p className={`eyebrow ${styles.eyebrow}`}>
          <span className={styles.eyebrowDot} />
          Up to 20% off
        </p>
        <h2 className={styles.heading}>
          <span className={styles.headingLine}>
            <span className={styles.headingLineInner}>Deals of the</span>
          </span>
          <span className={styles.headingLine}>
            <span className={styles.headingLineInner}><em>Month</em></span>
          </span>
        </h2>
        <p className={styles.desc}>
          Monthly deals that make style dreams a reality. Exquisite clothing, accessories, and footwear — all in Naira.
        </p>

        <div className={styles.countdownRow}>
          {units.map((u, i) => (
            <Fragment key={u.label}>
              <div
                className={styles.countUnit}
                ref={(el) => { unitRefs.current[i] = el }}
              >
                <span
                  ref={(el) => { digitRefs.current[u.key] = el }}
                  className={styles.countNum}
                >
                  {u.v}
                </span>
                <span className={styles.countLabel}>{u.label}</span>
              </div>
              {i < units.length - 1 && <span className={styles.countSlash}>/</span>}
            </Fragment>
          ))}
        </div>

        <Link href="/sale" className={`btn btn-primary ${styles.cta}`}>Shop Sale Now</Link>
      </div>
    </div>
  )

  const renderFrame = (item, i) => {
    const indexLabel = item.isShopAll
      ? String(allFrames.length).padStart(2, '0')
      : String(i + 1).padStart(2, '0')

    const inner = item.isShopAll ? (
      <div className={styles.shopAllInner}>
        <h3 className={styles.shopAllHeading}>Shop All Deals</h3>
        <span className={styles.shopAllArrow}>
          <i className="ri-arrow-right-line" />
        </span>
      </div>
    ) : (
      <div className={styles.frameCard}>
        <span className={styles.framePriceTag}>{formatNaira(item.price)}</span>
        <ProductCard product={item} />
      </div>
    )

    const Tag = item.isShopAll ? Link : 'div'
    const tagProps = item.isShopAll ? { href: '/sale' } : {}

    return (
      <Tag
        key={item.id}
        className={`${styles.frame} ${item.isShopAll ? styles.frameShopAll : ''}`}
        {...tagProps}
      >
        <div
          className={styles.frameVisual}
          ref={(el) => { frameRefs.current[i] = el }}
        >
          <span className={styles.frameIndex}>{indexLabel}</span>
          {inner}
        </div>
      </Tag>
    )
  }

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className="container">
        {productFrames.length === 0 ? (
          <div className={styles.layout}>
            {copyBlock}

            <div className={styles.emptyState}>
              <p>No items on sale right now — check back soon.</p>
              <Link href="/shop" className="btn btn-ghost">Shop New Arrivals</Link>
            </div>
          </div>
        ) : (
          <div
            className={`${styles.layout} ${hasReel ? styles.layoutReel : ''}`}
            ref={layoutRef}
            style={hasReel ? { '--frame-count': allFrames.length } : undefined}
          >
            {copyBlock}

            {hasReel && (
              <div className={styles.reelWindow} ref={reelWindowRef}>
                <div className={styles.reelCounter}>
                  <span ref={counterRef}>01</span>
                  <span className={styles.reelCounterTotal}>/ {String(allFrames.length).padStart(2, '0')}</span>
                </div>
                <div className={styles.reelProgressTrack}>
                  <div className={styles.reelProgressFill} ref={progressRef} />
                </div>
                <div className={styles.reelHint} ref={hintRef}>
                  <i className="ri-arrow-left-right-line" aria-hidden="true" />
                  Scroll to explore
                </div>
                <div className={styles.track} ref={trackRef}>
                  {allFrames.map(renderFrame)}
                </div>
              </div>
            )}

            <div className={`${styles.simpleTrackWrap} ${hasReel ? styles.simpleTrackWrapHideOnPin : ''}`}>
              <div className={styles.simpleTrack}>
                {productFrames.map((product, i) => (
                  <Reveal key={product.id} delay={i * 80} className={styles.simpleSlide}>
                    <div className={styles.simpleCard}>
                      <ProductCard product={product} />
                    </div>
                  </Reveal>
                ))}
                <Reveal delay={productFrames.length * 80} className={styles.simpleSlide}>
                  <Link href="/sale" className={styles.simpleMoreTile}>
                    <span className={styles.moreLabel}>Shop All Deals</span>
                    <i className="ri-arrow-right-line" />
                  </Link>
                </Reveal>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}