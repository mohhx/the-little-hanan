'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import styles from './Footer.module.css'

const LOGO_TEXT = 'The Little Hanan'

function InteractiveLogo() {
  const logoRef = useRef(null)

  useEffect(() => {
    const logo = logoRef.current
    if (!logo) return

    const letters = logo.querySelectorAll(`.${styles.logoLetter}`)

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const touchDevice = window.matchMedia(
      '(hover: none), (pointer: coarse)'
    ).matches

    if (reduceMotion || touchDevice) return

    const quickTo = []

    letters.forEach((letter) => {
      quickTo.push({
        x: gsap.quickTo(letter, 'x', {
          duration: 0.45,
          ease: 'power3.out',
        }),

        y: gsap.quickTo(letter, 'y', {
          duration: 0.45,
          ease: 'power3.out',
        }),

        rotation: gsap.quickTo(letter, 'rotation', {
          duration: 0.5,
          ease: 'power3.out',
        }),

        scale: gsap.quickTo(letter, 'scale', {
          duration: 0.45,
          ease: 'power3.out',
        }),
      })
    })

    const resetLetters = () => {
      letters.forEach((_, index) => {
        quickTo[index].x(0)
        quickTo[index].y(0)
        quickTo[index].rotation(0)
        quickTo[index].scale(1)
      })
    }

    const handleMove = (event) => {
      letters.forEach((letter, index) => {
        const rect = letter.getBoundingClientRect()

        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const dx = event.clientX - centerX
        const dy = event.clientY - centerY

        const distance = Math.sqrt(dx * dx + dy * dy)
        const radius = 170

        if (distance > radius) {
          quickTo[index].x(0)
          quickTo[index].y(0)
          quickTo[index].rotation(0)
          quickTo[index].scale(1)
          return
        }

        const strength = 1 - distance / radius

        quickTo[index].x(dx * 0.11 * strength)
        quickTo[index].y(dy * 0.08 * strength)
        quickTo[index].rotation(dx * 0.018 * strength)
        quickTo[index].scale(1 + 0.035 * strength)
      })
    }

    logo.addEventListener('pointermove', handleMove)
    logo.addEventListener('pointerleave', resetLetters)

    return () => {
      logo.removeEventListener('pointermove', handleMove)
      logo.removeEventListener('pointerleave', resetLetters)
    }
  }, [])

  return (
    <div
      ref={logoRef}
      className={styles.giantLogo}
      aria-label="The Little Hanan"
    >
      {LOGO_TEXT.split('').map((char, index) => {
        if (char === ' ') {
          return (
            <span
              key={`space-${index}`}
              className={styles.logoSpace}
              aria-hidden="true"
            >
              {' '}
            </span>
          )
        }

        return (
          <span
            key={`${char}-${index}`}
            className={`${styles.logoLetter} ${
              char === 'H' || index >= 9
                ? styles.logoItalic
                : ''
            }`}
          >
            {char}
          </span>
        )
      })}

      <span className={styles.logoDot}>.</span>
    </div>
  )
}

function LinkGroup({
  title,
  groupKey,
  open,
  toggle,
  children,
}) {
  const isOpen = open[groupKey]

  return (
    <div className={styles.col}>
      <button
        type="button"
        className={`${styles.colHead} ${
          isOpen ? styles.open : ''
        }`}
        onClick={() => toggle(groupKey)}
        aria-expanded={isOpen}
        aria-controls={`footer-${groupKey}`}
      >
        <span>{title}</span>

        <i
          className={`ri-add-line ${styles.chevron}`}
          aria-hidden="true"
        />
      </button>

      <div
        id={`footer-${groupKey}`}
        className={`${styles.accordionPanel} ${
          isOpen ? styles.open : ''
        }`}
      >
        <div className={styles.accordionInner}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function Footer() {
  const footerRef = useRef(null)
  const footerMainRef = useRef(null)

  const [open, setOpen] = useState({
    shop: true,
    info: false,
    contact: false,
  })

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    const footer = footerRef.current
    const footerMain = footerMainRef.current

    if (!footer || !footerMain) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      /*
       * Desktop / large tablet:
       *
       * The footer remains a normal document section.
       * We only create a subtle visual transition as the footer
       * approaches the viewport.
       *
       * The bottom bar is intentionally the first visual anchor.
       * The main content then settles into place as scrolling
       * continues.
       */
      mm.add(
        '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
        () => {
          gsap.set(footerMain, {
            yPercent: 9,
            opacity: 0.82,
          })

          gsap.to(footerMain, {
            yPercent: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: footer,
              start: 'top bottom',
              end: 'top 62%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
        }
      )

      /*
       * Mobile:
       *
       * Do not add the desktop reveal treatment.
       * The footer should simply enter the document naturally.
       */
      mm.add(
        '(max-width: 768px) and (prefers-reduced-motion: no-preference)',
        () => {
          gsap.set(footerMain, {
            y: 0,
            opacity: 1,
          })
        }
      )

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(footerMain, {
          clearProps: 'all',
        })
      })
    }, footer)

    return () => ctx.revert()
  }, [])

  const toggle = (key) => {
    setOpen((current) => ({
      ...current,
      [key]: !current[key],
    }))

    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
    })
  }

  const handleSubscribe = (event) => {
    event.preventDefault()

    if (!email) return

    setStatus('loading')

    /*
     * TODO:
     * Connect this to /api/newsletter -> Supabase.
     *
     * The existing UI behavior is preserved for now.
     */
    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 1000)
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <footer
      id="site-footer"
      ref={footerRef}
      className={styles.footer}
    >
      <div
        ref={footerMainRef}
        className={styles.footerMain}
      >
        <div className={`container ${styles.footerInner}`}>

          {/* =================================================
              BRAND / NEWSLETTER
          ================================================= */}

          <div className={styles.brandArea}>
            <div className={styles.brandTop}>
              <div className={styles.brand}>
                <span className={styles.wordItalic}>
                  The{' '}
                </span>

                <span className={styles.wordBold}>
                  Little{' '}
                </span>

                <span className={styles.wordItalic}>
                  Hanan
                </span>

                <span className={styles.dot}>.</span>
              </div>

              <p className={styles.tagline}>
                Curated women's fashion in Abuja.
                <br />
                Style that speaks for itself.
              </p>

              <div className={styles.socials}>
                <a
                  href="https://instagram.com/thelittlehanan/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <i className="ri-instagram-line" />
                </a>

                <a
                  href="https://wa.me/2348100653400"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                >
                  <i className="ri-whatsapp-line" />
                </a>

                <a
                  href="https://www.tiktok.com/@just.jiddvh"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                >
                  <i className="ri-tiktok-line" />
                </a>
              </div>
            </div>

            <div className={styles.newsletter}>
              <p className={styles.newsletterLabel}>
                Join the list
              </p>

              {status === 'success' ? (
                <p className={styles.newsletterSuccess}>
                  You're on the list. ✓
                </p>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  className={styles.newsletterForm}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="your@email.com"
                    required
                    aria-label="Email address"
                    className={styles.newsletterInput}
                  />

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={styles.newsletterBtn}
                    aria-label="Subscribe"
                  >
                    {status === 'loading' ? (
                      '...'
                    ) : (
                      <i className="ri-arrow-right-line" />
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* =================================================
              LINK GROUPS
          ================================================= */}

          <div className={styles.linksArea}>

            <LinkGroup
              title="Shop"
              groupKey="shop"
              open={open}
              toggle={toggle}
            >
              <Link href="/shop">All Products</Link>
              <Link href="/shop?category=dresses">
                Dresses
              </Link>
              <Link href="/shop?category=accessories">
                Accessories
              </Link>
              <Link href="/shop?category=jewellery">
                Jewellery
              </Link>
              <Link href="/shop?category=whimsynetting">
                WhimsyNetting
              </Link>
              <Link href="/sale">Sale</Link>
            </LinkGroup>

            <LinkGroup
              title="Info"
              groupKey="info"
              open={open}
              toggle={toggle}
            >
              <Link href="/about">About Us</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/contact">Contact</Link>
              <Link href="#">Track My Order</Link>
              <Link href="#">Terms & Conditions</Link>
              <Link href="#">Privacy Policy</Link>
            </LinkGroup>

            <LinkGroup
              title="Contact"
              groupKey="contact"
              open={open}
              toggle={toggle}
            >
              <p>
                <i className="ri-map-pin-2-fill" />
                Kaduna / Abuja, Nigeria
              </p>

              <p>
                <i className="ri-whatsapp-line" />

                <a
                  href="https://wa.me/2348100653400"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp Us
                </a>
              </p>

              <p>
                <i className="ri-instagram-line" />

                <a
                  href="https://instagram.com/thelittlehanan/"
                  target="_blank"
                  rel="noreferrer"
                >
                  @thelittlehanan
                </a>
              </p>

              <div className={styles.whimsyBlock}>
                <span className={styles.whimsyLabel}>
                  Also find us
                </span>

                <span className={styles.whimsyName}>
                  WhimsyNetting
                </span>

                <span className={styles.whimsyDesc}>
                  Handcrafted crochet
                </span>
              </div>
            </LinkGroup>

          </div>

          {/* =================================================
              GIANT WORDMARK
          ================================================= */}

          <div className={styles.logoArea}>
            <InteractiveLogo />
          </div>

        </div>
      </div>

      {/* =====================================================
          BOTTOM BAR
      ===================================================== */}

      <div className={styles.bar}>
        <div className={`container ${styles.barInner}`}>
          <p>
            © {new Date().getFullYear()} The Little Hanan.
            All rights reserved.
          </p>

          <p>
            Built by{' '}
            <a
              href="#"
              className={styles.credit}
            >
              DevXmoh
            </a>
          </p>

          <button
            type="button"
            className={styles.toTop}
            onClick={scrollToTop}
            aria-label="Back to top"
          >
            <i className="ri-arrow-up-line" />
          </button>
        </div>
      </div>
    </footer>
  )
}