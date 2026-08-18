'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Navbar.module.css'
import { useCartStore } from '../../lib/store/cartStore'
import CartDrawer from '../ui/CartDrawer'
import ToastHost from '../ui/Toast'
import { gsap } from '../../lib/gsap'
import { onPreloaderComplete } from '../../lib/preloaderState'

const NAV_LINKS = [
  { label: 'Home',    href: '/' },
  { label: 'Shop',    href: '/shop' },
  { label: 'Sale',    href: '/sale' },
  { label: 'Blog',    href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const cartOpen = useCartStore((s) => s.drawerOpen)
  const openCart = useCartStore((s) => s.openCart)
  const closeCart = useCartStore((s) => s.closeCart)
const itemCount = useCartStore((s) => s.itemCount())
const wishlistCount = useCartStore((s) => s.wishlist.length)
const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return // CSS media query already shows everything at full opacity

    const stop = onPreloaderComplete(() => {
      const targets = gsap.utils.toArray(
        `.${styles.logo}, .${styles.link}, .${styles.iconBtn}, .${styles.hamburger}`
      )
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to(targets, {
          opacity: 1,
          y: 0,
          duration: 1.3,
          stagger: 0.15,
        })
    })

    return stop
  }, [])

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>

          {/* Left — links */}
          <ul className={styles.links}>
            {NAV_LINKS.slice(0, 3).map(l => (
              <li key={l.href}>
                <Link href={l.href} className={styles.link}>{l.label}</Link>
              </li>
            ))}
          </ul>

          {/* Centre — wordmark */}
          <Link href="/" className={styles.logo} data-navbar-logo>
            The Little Hanan<span className={styles.dot}>.</span>
          </Link>

          {/* Right — icons + hamburger */}
          <div className={styles.icons}>
            <Link href="/shop?q=" aria-label="Search" className={styles.iconBtn}>
              <i className="ri-search-line" />
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className={styles.iconBtn}>
              <i className="ri-heart-line" />
              {hydrated && wishlistCount > 0 && (
                <span className={styles.cartBadge}>{wishlistCount}</span>
              )}
            </Link>
            <button
              className={styles.iconBtn}
              aria-label="Shopping bag"
              onClick={openCart}
            >
              <i className="ri-shopping-bag-line" />
              {hydrated && itemCount > 0 && (
                <span className={styles.cartBadge}>{itemCount}</span>
              )}
            </button>
            <button
              className={styles.hamburger}
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen mobile menu */}
      <div
        className={`${styles.mobileMenu} ${menuOpen ? styles.menuOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <button
          className={styles.closeBtn}
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <i className="ri-close-line" />
        </button>

        <div className={styles.menuLogo}>
          The Little Hanan<span>.</span>
        </div>

        <nav className={styles.menuLinks}>
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.menuLink}
              style={{ transitionDelay: `${i * 60}ms` }}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={styles.menuWhimsy}>
          <Link href="/shop?category=whimsynetting" onClick={() => setMenuOpen(false)}>
            <span className={styles.menuWhimsyTag}>Also explore</span>
            <span className={styles.menuWhimsyName}>WhimsyNetting</span>
            <span className={styles.menuWhimsyDesc}>Handcrafted crochet</span>
          </Link>
        </div>

        <div className={styles.menuIcons}>
          <Link href="https://www.instagram.com/theelittlehanan/" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="ri-instagram-line" /></Link>
          <Link href="https://wa.me/2348100653400" target="_blank" rel="noreferrer" aria-label="WhatsApp"><i className="ri-whatsapp-line" /></Link>
          <Link href="https://www.tiktok.com/@just.jiddvh" target="_blank" rel="noreferrer" aria-label="TikTok"><i className="ri-tiktok-line" /></Link>
        </div>
      </div>

      <CartDrawer open={cartOpen} onClose={closeCart} />
      <ToastHost />
    </>
  )
}