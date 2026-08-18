'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from '../../lib/gsap'

// Mounted once in the root layout. Renders nothing — it just wires up
// Lenis's smooth scroll and syncs it with GSAP's ticker/ScrollTrigger.
// Intentionally desktop-only: mobile already has good native momentum
// scroll, and skipping Lenis there avoids any extra JS/perf cost on the
// devices most of our customers are actually using.
export default function SmoothScroll() {
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 769px)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isDesktop || prefersReduced) return

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    })

    // Exposed so components that change total document height after
    // Lenis's initial measurement (e.g. Footer.js, whose negative-margin
    // reveal technique shrinks the page's real scroll range) can tell it
    // to recalculate — otherwise Lenis keeps scrolling against its stale,
    // taller cached range and the page appears to "stop" before the true
    // end of the document.
    window.__lenis = lenis

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      window.__lenis = null
    }
  }, [])

  return null
}