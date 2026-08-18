// components/sections/Categories.js
'use client'
import { useEffect, useRef } from 'react'
import Reveal from '../ui/Reveal'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import styles from './Categories.module.css'

export function Categories({ categories = [] }) {
  const gridRef = useRef(null)

  // Extra "unveil" reveal layered on top of Reveal's fade/rise: each tile's
  // image slides open (clip-path) as it scrolls into view, on its own
  // ScrollTrigger so it can be timed independently from the tile fade.
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const images = grid.querySelectorAll(`.${styles.img}`)
        images.forEach((img) => {
          gsap.fromTo(
            img,
            { clipPath: 'inset(0 0 0 100%)' },
            {
              clipPath: 'inset(0 0 0 0%)',
              duration: 1.1,
              ease: 'power3.inOut',
              scrollTrigger: {
                trigger: img,
                start: 'top 88%',
                once: true,
              },
            }
          )
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        const images = grid.querySelectorAll(`.${styles.img}`)
        gsap.set(images, { clipPath: 'inset(0 0 0 0%)' })
      })
    }, grid)

    return () => ctx.revert()
  }, [categories])

  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <Reveal><p className="eyebrow" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>Browse by</p></Reveal>
        <Reveal variant="text"><h2 className={`display-md ${styles.heading}`}>Top Categories</h2></Reveal>

        <div className={styles.grid} ref={gridRef}>
          {categories.map((cat, i) => (
            <Reveal key={cat.slug} delay={i * 80}>
              <a href={`/shop?category=${cat.slug}`} className={styles.tile}>
                <img src={cat.image} alt={cat.name} className={styles.img} />
                <div className={styles.overlay} />
                <div className={styles.caption}>
                  <span className={styles.eyebrowSm}>Shop the Edit</span>
                  <h3 className={styles.name}>{cat.name}</h3>
                  <span className={styles.link}>Explore →</span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Categories