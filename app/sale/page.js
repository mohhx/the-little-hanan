'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '../../components/ui/ProductCard'
import Reveal from '../../components/ui/Reveal'
import { getProducts } from '../../lib/products'
import styles from './page.module.css'

// ── helpers ──────────────────────────────────────────────────────────────────

const pad = (n) => String(Math.floor(n)).padStart(2, '0')

function getDeadline() {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  d.setHours(d.getHours() + 20)
  return d
}

// ── countdown hook ────────────────────────────────────────────────────────────

function useCountdown(deadline) {
  const [time, setTime] = useState({ d: '00', h: '00', m: '00', s: '00' })

  useEffect(() => {
    function tick() {
      const diff = deadline - Date.now()
      if (diff <= 0) return
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
  }, [deadline])

  return time
}

// ── page ──────────────────────────────────────────────────────────────────────

const DEADLINE = getDeadline()

export default function SalePage() {
  const time = useCountdown(DEADLINE)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getProducts().then((data) => {
      if (!cancelled) {
        setProducts(data)
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  const saleProducts = products.filter((p) => p.originalPrice)
  const maxDiscount = saleProducts.length > 0
    ? Math.max(
        ...saleProducts.map((p) =>
          Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
        )
      )
    : 0

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={`container ${styles.heroInner}`} style={{ padding: '4rem 0', textAlign: 'center' }}>
          <p className={styles.heroEyebrow}>Loading sale items…</p>
        </div>
      </main>
    )
  }

  const units = [
    { v: time.d, label: 'Days' },
    { v: time.h, label: 'Hours' },
    { v: time.m, label: 'Mins' },
    { v: time.s, label: 'Secs' },
  ]

  return (
    <main className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <Reveal>
            <p className={styles.heroEyebrow}>Limited Time Offer</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className={styles.heroTitle}>
              Up to {maxDiscount}%<br />Off Selected Pieces
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className={styles.heroSub}>
              Curated styles at their best prices — only while stocks last.
            </p>
          </Reveal>

          {/* Countdown */}
          <Reveal delay={200}>
            <div className={styles.countdownWrap}>
              <p className={styles.countdownLabel}>Sale ends in</p>
              <div className={styles.countdown}>
                {units.map((unit) => (
                  <div key={unit.label} className={styles.unit}>
                    <span className={styles.unitValue}>{unit.v}</span>
                    <span className={styles.unitLabel}>{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={240}>
            <a href="#sale-grid" className={`btn btn-rose ${styles.heroBtn}`}>
              Shop {saleProducts.length} Sale Items
            </a>
          </Reveal>
        </div>

        {/* decorative rose glow */}
        <div className={styles.heroGlow} aria-hidden="true" />
      </section>

      {/* ── Grid ── */}
      <section id="sale-grid" className={styles.gridSection}>
        <div className="container">
          <div className={styles.gridHeader}>
            <Reveal>
              <h2 className={`display-md ${styles.gridTitle}`}>Sale Items</h2>
            </Reveal>
            <p className={styles.gridCount}>
              {saleProducts.length} {saleProducts.length === 1 ? 'piece' : 'pieces'} on sale
            </p>
          </div>

          <div className={styles.grid}>
            {saleProducts.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 70}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>

          {/* Back to full shop */}
          <div className={styles.gridFooter}>
            <Link href="/shop" className="btn btn-outline">
              Browse Full Collection
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}