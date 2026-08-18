'use client'
import { useEffect, useRef } from 'react'
import { gsap } from '../../lib/gsap'

// Three variants, one shared primitive:
//  - 'fade' (default, unchanged): opacity + rise + slight scale. Used for
//    everything that isn't a heading or a fast utility list.
//  - 'text': a masked "curtain" reveal for headings — children sit inside
//    an overflow:hidden box and slide up into view from below, no opacity
//    fade. Reads as more editorial than a flat fade.
//  - 'subtle': fast fade + small rise, no scale. For utility lists (e.g.
//    FAQ answers) that should settle quickly rather than perform.
export default function Reveal({ children, delay = 0, className = '', variant = 'fade' }) {
  const ref = useRef(null)
  const innerRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        if (variant === 'text') {
          const inner = innerRef.current
          if (!inner) return
          gsap.fromTo(
            inner,
            { yPercent: 100 },
            {
              yPercent: 0,
              duration: 0.9,
              delay: delay / 1000,
              ease: 'power4.out',
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }
          )
        } else if (variant === 'subtle') {
          gsap.fromTo(
            el,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.45,
              delay: delay / 1000,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            }
          )
        } else {
          gsap.fromTo(
            el,
            { opacity: 0, y: 32, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              delay: delay / 1000,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            }
          )
        }
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        if (variant === 'text' && innerRef.current) {
          gsap.set(innerRef.current, { yPercent: 0 })
        } else {
          gsap.set(el, { opacity: 1, y: 0, scale: 1 })
        }
      })
    }, el)

    return () => ctx.revert()
  }, [delay, variant])

  if (variant === 'text') {
    return (
      <div ref={ref} className={className} style={{ overflow: 'hidden' }}>
        <div ref={innerRef}>{children}</div>
      </div>
    )
  }

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  )
}