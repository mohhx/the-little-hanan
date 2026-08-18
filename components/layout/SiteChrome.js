'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import SmoothScroll from '../ui/SmoothScroll'
import Preloader from '../ui/Preloader'
import MiniPreloader from '../ui/MiniPreloader'
import NavigationWatcher from './NavigationWatcher'
import QuickViewModal from '../ui/QuickViewModal'
import { useQuickViewStore } from '../../lib/store/quickViewStore'
import styles from './SiteChrome.module.css'

export default function SiteChrome({ children }) {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  const quickViewProduct = useQuickViewStore((s) => s.product)
  const closeQuickView = useQuickViewStore((s) => s.close)

  if (isAdmin) {
    return children
  }

  return (
    <>
      <Preloader />

      <Suspense fallback={null}>
        <NavigationWatcher />
      </Suspense>

      <MiniPreloader />

      <SmoothScroll />

      <Navbar />

      <main className={styles.pageShell}>
        <div className={styles.contentWrap}>
          {children}
        </div>

        <Footer />
      </main>

      <QuickViewModal
        product={quickViewProduct}
        onClose={closeQuickView}
      />
    </>
  )
}