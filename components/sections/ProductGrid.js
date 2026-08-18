'use client'
import { useState, useRef, useLayoutEffect } from 'react'
import ProductCard from '../ui/ProductCard'
import Reveal from '../ui/Reveal'
import { gsap } from '../../lib/gsap'
import styles from './ProductGrid.module.css'

export default function ProductGrid({ products = [] }) {
  const [items, setItems] = useState(products)
  const gridRef = useRef(null)
  const isFirstRender = useRef(true)

  // Initial scroll-triggered entrance — grid-aware stagger, fires once.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = gridRef.current ? Array.from(gridRef.current.children) : []
        if (cards.length === 0) return

        gsap.set(cards, { opacity: 0, y: 36, scale: 0.96 })
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: 'power2.out',
          stagger: { each: 0.06, grid: 'auto', from: 'start' },
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            once: true,
          },
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        const cards = gridRef.current ? Array.from(gridRef.current.children) : []
        gsap.set(cards, { opacity: 1, y: 0, scale: 1 })
      })
    }, gridRef)

    return () => ctx.revert()
  }, [])

  // Re-stagger cards back in whenever the order changes (i.e. after shuffle).
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const cards = gridRef.current ? Array.from(gridRef.current.children) : []
    if (cards.length === 0) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 })
      return
    }

    gsap.fromTo(
      cards,
      { opacity: 0, y: 16, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    )
  }, [items])

  const shuffle = () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cards = gridRef.current ? Array.from(gridRef.current.children) : []

    if (prefersReduced || cards.length === 0) {
      setItems((prev) => [...prev].sort(() => Math.random() - 0.5))
      return
    }

    // Quick exit, then the order-change effect above re-staggers everything
    // back in — makes shuffling feel like a deliberate action, not a glitch.
    gsap.to(cards, {
      opacity: 0,
      y: 16,
      scale: 0.97,
      duration: 0.25,
      stagger: 0.03,
      ease: 'power1.in',
      onComplete: () => {
        setItems((prev) => [...prev].sort(() => Math.random() - 0.5))
      },
    })
  }

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <Reveal>
          <div className={styles.header}>
            <div>
              <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Curated for you</p>
              <Reveal variant="text"><h2 className="display-md">Trending Now</h2></Reveal>
            </div>
            <button
              className={`btn btn-ghost ${styles.shuffleBtn}`}
              onClick={shuffle}
              aria-label="Shuffle products"
            >
              <i className="ri-shuffle-line" />
              Shuffle
            </button>
          </div>
        </Reveal>

        <div className={styles.grid} ref={gridRef}>
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className={styles.loadMore}>
          <a href="/shop" className="btn btn-outline">View All Products</a>
        </div>
      </div>
    </section>
  )
}