'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Reveal from '../ui/Reveal'
import { gsap } from '../../lib/gsap'
import styles from './TrendCards.module.css'

/* ═══════════ TREND CARDS ═══════════ */
export function TrendCards() {
  const cards = [
    { label: "Women's Shirts",   img: '/assets/card-1.png' },
    { label: "Women's Dresses",  img: '/assets/card-2.png' },
    { label: "Women's Casuals",  img: '/assets/card-3.png' },
  ]

  const gridRef = useRef(null)

  // Same clip-path unveil Categories.js uses on its tile images — one image
  // reveal signature for every image-led card across the site.
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const images = grid.querySelectorAll('img')
        images.forEach((img) => {
          gsap.fromTo(
            img,
            { clipPath: 'inset(0 0 0 100%)' },
            {
              clipPath: 'inset(0 0 0 0%)',
              duration: 1.1,
              ease: 'power3.inOut',
              scrollTrigger: { trigger: img, start: 'top 88%', once: true },
            }
          )
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(grid.querySelectorAll('img'), { clipPath: 'inset(0 0 0 0%)' })
      })
    }, grid)

    return () => ctx.revert()
  }, [])

  return (
    <section style={{ padding: '5rem 0', background: 'var(--brand-greige)' }}>
      <div className="container">
        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {cards.map((c, i) => (
            <Reveal key={i} delay={i * 100}>
              <a href="/shop" style={{ position: 'relative', display: 'block', overflow: 'hidden', borderRadius: 0, cursor: 'pointer' }}>
                <img
                  src={c.img}
                  alt={c.label}
                  style={{ width: '100%', height: '460px', objectFit: 'cover', display: 'block', transition: 'transform 0.55s var(--ease-out)' }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.04)'
                    const caption = e.currentTarget.parentElement.querySelector('[data-caption]')
                    if (caption) caption.style.transform = 'translateY(-6px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)'
                    const caption = e.currentTarget.parentElement.querySelector('[data-caption]')
                    if (caption) caption.style.transform = 'translateY(0)'
                  }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,10,10,0.65) 0%, transparent 55%)', pointerEvents: 'none' }} />
                <div data-caption style={{ position: 'absolute', bottom: '1.75rem', left: '1.75rem', transition: 'transform 0.35s var(--ease-out)' }}>
                  <p style={{ fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)', marginBottom: '0.3rem' }}>New Season</p>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 500, fontStyle: 'italic', color: 'white', marginBottom: '0.6rem' }}>{c.label}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.5)', paddingBottom: '1px' }}>Discover More →</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════ TRUST BANNER ═══════════ */
export function TrustBanner() {
  const items = [
    {
      number: '01',
      icon: 'ri-truck-line',
      title: 'Nationwide Delivery',
      desc: 'Your pieces, delivered with care. Always free.',
    },
    {
      number: '02',
      icon: 'ri-shield-check-line',
      title: 'Easy Returns',
      desc: '100% money-back guarantee. Not happy? Return within 30 days, no questions asked.',
    },
    {
      number: '03',
      icon: 'ri-whatsapp-line',
      title: 'WhatsApp Concierge',
      desc: 'Need help? Our team is just a message away.',
    },
  ]

  const itemRefs = useRef([])
  const iconRefs = useRef([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        itemRefs.current.forEach((item, i) => {
          if (!item) return

          gsap.fromTo(
            item,
            {
              opacity: 0,
              y: 22,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: i * 0.1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 88%',
                once: true,
              },
            }
          )
        })

        iconRefs.current.forEach((icon, i) => {
          if (!icon) return

          gsap.fromTo(
            icon,
            {
              opacity: 0,
              y: 10,
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              delay: i * 0.1 + 0.15,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: icon,
                start: 'top 88%',
                once: true,
              },
            }
          )
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(itemRefs.current.filter(Boolean), {
          opacity: 1,
          y: 0,
        })

        gsap.set(iconRefs.current.filter(Boolean), {
          opacity: 1,
          y: 0,
        })
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.trustSection}>
      <div className="container">
        <div className={styles.trustHeader}>
        <div className={styles.trustAmbient} aria-hidden="true">
          <span />
          <span />
        </div>

        <p className={styles.trustEyebrow}>The Hanan Experience</p>

        <div className={styles.trustOrnament} aria-hidden="true">
          <span />
          <i>✦</i>
          <span />
        </div>
      </div>

        <div className={styles.trustGrid}>
          {items.map((item, i) => (
            <div
              key={item.number}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              className={`${styles.trustItem} ${
                i < items.length - 1 ? styles.trustItemWithDivider : ''
              }`}
            >
              <div className={styles.trustNumber}>{item.number}</div>

              <div className={styles.trustContent}>
                <div
                  ref={(el) => {
                    iconRefs.current[i] = el
                  }}
                  className={styles.trustIcon}
                  aria-hidden="true"
                >
                  <i className={item.icon} />
                </div>

                <div className={styles.trustCopy}>
                  <h3>{item.title}</h3>
                  <span className={styles.trustAccent} />
                  <p>{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════ NEWSLETTER ═══════════ */
export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const successRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    // TODO Phase 2: POST to /api/newsletter with email → saves to Supabase
    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 1000)
  }

  useEffect(() => {
    if (status !== 'success' || !successRef.current) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return
    gsap.fromTo(
      successRef.current,
      { opacity: 0, scale: 0.85, y: 8 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }
    )
  }, [status])

  return (
    <section data-newsletter-section style={{ background: 'var(--brand-black)' }}>
      <div data-newsletter-curtain style={{ padding: '5rem 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <Reveal>
            <p className="eyebrow" style={{ color: 'var(--brand-sage)', marginBottom: '0.75rem' }}>Stay in the loop</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 500, fontStyle: 'italic', color: 'var(--brand-white)', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
              First to know,<br />first to shop.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '2rem' }}>
              New arrivals, exclusive deals, and style tips — straight to your inbox.
            </p>
            {status === 'success' ? (
              <p ref={successRef} style={{ color: 'var(--brand-rose)', fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontStyle: 'italic' }}>
                You're on the list. ✓
              </p>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0', maxWidth: '440px', margin: '0 auto' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{ flex: 1, padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRight: 'none', color: 'white', fontSize: '0.875rem', outline: 'none', fontFamily: 'var(--font-body)' }}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn btn-rose"
                  style={{ borderRadius: 0, flexShrink: 0 }}
                >
                  {status === 'loading' ? '...' : 'Subscribe'}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default TrendCards