// Shared GSAP setup — registers ScrollTrigger once and re-exports both so
// every component imports from the same place instead of registering the
// plugin repeatedly.
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export { gsap, ScrollTrigger }
