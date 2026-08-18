'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { gsap } from '../../lib/gsap'
import styles from './WhimsyTeaser.module.css'

const LEAD = {
  src: '/assets/preloader-7.jpg',
  alt: 'WhimsyNetting crochet corset top, styled shot',
  area: 'model',
  tag: 'the corset top',
}

const STRIP = [
  {
    src: '/assets/preloader-6.jpg',
    alt: 'WhimsyNetting ruffle crochet bag in window light',
    area: 'bag',
    tag: 'the ruffle bag',
  },
  {
    src: '/assets/whimsy-flatlay.jpg',
    alt: 'Flat-lay of WhimsyNetting crochet pieces',
    area: 'flat',
    tag: 'the flat lay',
  },
  {
    src: '/assets/preloader-5.jpg',
    alt: 'Macro shot of a handmade crochet rose',
    area: 'rose',
    tag: 'the crochet rose',
  },
]

export default function WhimsyTeaser() {
  const sectionRef = useRef(null)
  const bannerRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const banner = bannerRef.current

    if (!section || !banner) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const eyebrow = banner.querySelector(`.${styles.eyebrow}`)
        const headingLines = banner.querySelectorAll(`.${styles.headingLineInner}`)
        const desc = banner.querySelector(`.${styles.desc}`)
        const cta = banner.querySelector(`.${styles.cta}`)
        const instaLink = banner.querySelector(`.${styles.instaLink}`)
        const cells = banner.querySelectorAll(`.${styles.cell}`)

        // Initial state.
        gsap.set(eyebrow, { opacity: 0, y: 12 })
        gsap.set(headingLines, { yPercent: 105 })
        gsap.set(desc, { opacity: 0, y: 16 })
        gsap.set(cta, { opacity: 0, y: 14 })
        gsap.set(instaLink, { opacity: 0, y: 12 })
        gsap.set(cells, { opacity: 0, y: 14 })
        gsap.set(banner.querySelectorAll(`.${styles.cellImg}`), {
          clipPath: 'inset(0 0 0 100%)',
          scale: 1.035,
        })
        gsap.set(banner.querySelectorAll(`.${styles.tag}`), { opacity: 0, y: 8 })
        gsap.set(banner.querySelectorAll(`.${styles.pieceLink}`), { opacity: 0, y: 8 })

        // One coordinated editorial entrance: copy first, then the
        // collage cells fade up as a group, then each cell's own image
        // wipes into view with its tag/link following right on its
        // heels — a cascading reveal rather than everything popping in
        // at once, so it reads as one continuous motion instead of
        // several disconnected animations.
        const entrance = gsap.timeline({
          scrollTrigger: {
            trigger: banner,
            start: 'top 78%',
            once: true,
          },
        })

        entrance
          .to(eyebrow, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out',
          })
          .to(
            headingLines,
            {
              yPercent: 0,
              duration: 0.9,
              ease: 'power4.out',
              stagger: 0.07,
            },
            '-=0.28'
          )
          .to(
            desc,
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: 'power3.out',
            },
            '-=0.5'
          )
          .to(
            cta,
            {
              opacity: 1,
              y: 0,
              duration: 0.55,
              ease: 'power3.out',
            },
            '-=0.35'
          )
          .to(
            instaLink,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power3.out',
            },
            '-=0.3'
          )
          .to(
            cells,
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: 'power3.out',
              stagger: 0.08,
            },
            '-=0.55'
          )
          .addLabel('reveal', '-=0.5')

        // Per-cell cascade: each cell's image wipe is staggered from the
        // last, and that same cell's tag + shop link fade up just as its
        // own wipe is finishing — not after every image on the page has
        // finished — so the label feels attached to its photo instead of
        // arriving as a separate, disconnected beat.
        cells.forEach((cell, i) => {
          const img = cell.querySelector(`.${styles.cellImg}`)
          const tag = cell.querySelector(`.${styles.tag}`)
          const link = cell.querySelector(`.${styles.pieceLink}`)
          const delay = i * 0.12

          entrance
            .to(
              img,
              {
                clipPath: 'inset(0 0 0 0%)',
                scale: 1,
                duration: 1.2,
                ease: 'power3.inOut',
              },
              `reveal+=${delay}`
            )
            .to(
              tag,
              {
                opacity: 1,
                y: 0,
                duration: 0.45,
                ease: 'power3.out',
              },
              `reveal+=${delay + 0.7}`
            )
            .to(
              link,
              {
                opacity: 1,
                y: 0,
                duration: 0.45,
                ease: 'power3.out',
              },
              `reveal+=${delay + 0.8}`
            )
        })

        // Very restrained editorial parallax after the entrance.
        mm.add(
          '(min-width: 901px) and (prefers-reduced-motion: no-preference)',
          () => {
            const model = banner.querySelector(`[data-area="model"] .${styles.cellImg}`)
            const bag = banner.querySelector(`[data-area="bag"] .${styles.cellImg}`)
            const flat = banner.querySelector(`[data-area="flat"] .${styles.cellImg}`)
            const rose = banner.querySelector(`[data-area="rose"] .${styles.cellImg}`)

            const parallax = [
              [model, -3],
              [bag, 2],
              [flat, -2],
              [rose, 2.5],
            ]

            parallax.forEach(([image, amount]) => {
              if (!image) return

              gsap.to(image, {
                yPercent: amount,
                ease: 'none',
                scrollTrigger: {
                  trigger: banner,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.8,
                },
              })
            })
          }
        )
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(banner.querySelectorAll(`.${styles.eyebrow}`), {
          opacity: 1,
          y: 0,
        })
        gsap.set(banner.querySelectorAll(`.${styles.headingLineInner}`), {
          yPercent: 0,
        })
        gsap.set(banner.querySelectorAll(`.${styles.desc}`), {
          opacity: 1,
          y: 0,
        })
        gsap.set(banner.querySelectorAll(`.${styles.cta}`), {
          opacity: 1,
          y: 0,
        })
        gsap.set(banner.querySelectorAll(`.${styles.instaLink}`), {
          opacity: 1,
          y: 0,
        })
        gsap.set(banner.querySelectorAll(`.${styles.cell}`), {
          opacity: 1,
          y: 0,
        })
        gsap.set(banner.querySelectorAll(`.${styles.cellImg}`), {
          clipPath: 'inset(0 0 0 0%)',
          scale: 1,
        })
        gsap.set(banner.querySelectorAll(`.${styles.tag}`), {
          opacity: 1,
          y: 0,
        })
        gsap.set(banner.querySelectorAll(`.${styles.pieceLink}`), {
          opacity: 1,
          y: 0,
        })
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className={styles.section}>
      <div ref={bannerRef} className={styles.banner}>
        <div className="container">
          <div className={styles.bannerInner}>
            <div className={styles.textCol}>
              <p className={styles.eyebrow}>
                <span className={styles.eyebrowDot} aria-hidden="true" />
                WHIMSY NETTING
              </p>

              <h2 className={`display-md ${styles.heading}`}>
                <span className={styles.headingLine}>
                  <span className={styles.headingLineInner}>
                    Handmade crochet,
                  </span>
                </span>
                <span className={styles.headingLine}>
                  <span className={styles.headingLineInner}>
                    worn like <em>couture.</em>
                  </span>
                </span>
              </h2>

              <p className={styles.desc}>
                Our hand-knotted pieces bring texture, softness, and personality
                to every look. Made to be the finishing touch — always.
              </p>

              <Link
                href="/shop?category=whimsynetting"
                className={styles.cta}
              >
                <span>Explore the collection</span>
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="https://www.instagram.com/whimsynetting/"
                target="_blank"
                rel="noreferrer"
                className={styles.instaLink}
              >
                <i className="ri-instagram-line" aria-hidden="true" />
                Follow @whimsynetting
              </a>
            </div>

            <div className={styles.bento}>
              <div className={styles.collage}>
                <div className={`${styles.cell} ${styles.cellLead}`} data-area="model">
                  <img
                    src={LEAD.src}
                    alt={LEAD.alt}
                    className={styles.cellImg}
                  />
                  <span className={styles.tag}>{LEAD.tag}</span>
                  <Link
                    href="/shop?category=whimsynetting"
                    className={styles.pieceLink}
                  >
                    <span>Shop the piece</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>

                <div className={styles.strip}>
                  {STRIP.map((item) => (
                    <div
                      className={`${styles.cell} ${item.area === 'bag' ? styles.cellBag : ''}`}
                      data-area={item.area}
                      key={item.area}
                    >
                      <img
                        src={item.src}
                        alt={item.alt}
                        className={styles.cellImg}
                      />
                      <span className={styles.tag}>{item.tag}</span>
                      <Link
                        href="/shop?category=whimsynetting"
                        className={styles.pieceLink}
                      >
                        <span>Shop the piece</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}