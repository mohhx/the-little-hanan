import Link from 'next/link'
import Reveal from '../components/ui/Reveal'
import styles from './not-found.module.css'

export const metadata = {
  title: 'Page not found',
  description: 'The page you’re looking for doesn’t exist — but the rest of The Little Hanan does.',
}

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={`container ${styles.inner}`}>
        <Reveal variant="fade">
          <p className={`eyebrow ${styles.eyebrow}`}>Error 404</p>
        </Reveal>

        <Reveal variant="text" delay={80}>
          <h1 className={`display-xl ${styles.headline}`}>
            Lost the<br />thread<span className={styles.dot}>.</span>
          </h1>
        </Reveal>

        <Reveal variant="fade" delay={200}>
          <p className={`body-lg ${styles.body}`}>
            The page you’re looking for has wandered off. Let’s get you
            back to something beautiful.
          </p>
        </Reveal>

        <Reveal variant="fade" delay={280}>
          <div className={styles.actions}>
            <Link href="/shop" className="btn btn-primary">
              Shop now <i className="ri-arrow-right-line" aria-hidden="true" />
            </Link>
            <Link href="/" className={styles.homeLink}>
              Back home
            </Link>
          </div>
        </Reveal>
      </div>
    </main>
  )
}