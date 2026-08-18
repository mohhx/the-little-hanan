import Link from 'next/link'
import Reveal from '../../components/ui/Reveal'
import styles from './page.module.css'

export const metadata = {
  title: 'About',
  description: 'The story behind The Little Hanan — curated women\u2019s fashion in Abuja.',
}

const VALUES = [
  {
    icon: 'ri-sparkling-2-line',
    title: 'Curated, not crowded',
    body: 'Every piece earns its place in the collection. We\u2019d rather stock fifty things we believe in than five hundred we don\u2019t.',
  },
  {
    icon: 'ri-hand-heart-line',
    title: 'Made with intention',
    body: 'From tailoring to our WhimsyNetting crochet line, we favour craft you can feel in the seams.',
  },
  {
    icon: 'ri-map-pin-2-line',
    title: 'Rooted in Abuja',
    body: 'Built for the way Nigerian women actually dress \u2014 versatile, elevated, ready for wherever the day goes.',
  },
]

export default function AboutPage() {
  return (
    <main className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className="container">
          <Reveal>
            <p className="eyebrow" style={{ color: 'var(--brand-rose)' }}>Our Story</p>
          </Reveal>
          <Reveal delay={60}>
            <h1 className={`display-xl ${styles.heroTitle}`}>
              Style that speaks<br />for itself.
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className={`body-lg ${styles.heroSub}`}>
              The Little Hanan started in Abuja with a simple idea \u2014 that Nigerian women
              deserve fashion as considered as they are.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Story ── */}
      <section className={`section ${styles.storySection}`}>
        <div className={`container ${styles.storyGrid}`}>
          <Reveal>
            <div className={styles.storyImgWrap}>
              <img src="/assets/blog-3.png" alt="The Little Hanan boutique" className={styles.storyImg} />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className={styles.storyContent}>
              <p className="eyebrow" style={{ color: 'var(--brand-sage)', marginBottom: '0.75rem' }}>
                How It Began
              </p>
              <h2 className={`display-md ${styles.storyHeading}`}>
                From a small Abuja showroom to a name women trust
              </h2>
              <p className="body-lg" style={{ marginBottom: '1.25rem' }}>
                The Little Hanan began as a single rail of hand-picked dresses in a small
                Abuja showroom \u2014 pieces our founder couldn\u2019t find anywhere else in the
                city: well-cut, well-made, and unmistakably elegant without trying too hard.
              </p>
              <p className="body-lg" style={{ marginBottom: '1.25rem' }}>
                What started as a personal edit grew into a full collection, then a
                storefront, then this. Somewhere along the way we added WhimsyNetting,
                our handcrafted crochet line, because the same values \u2014 craft, care,
                intention \u2014 belong there too.
              </p>
              <p className="body-lg">
                Today The Little Hanan dresses women across Kaduna and beyond, one
                carefully chosen piece at a time.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Values ── */}
      <section className={`section ${styles.valuesSection}`}>
        <div className="container">
          <Reveal>
            <p className="eyebrow" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
              What We Stand For
            </p>
          </Reveal>
          <Reveal delay={60}>
            <h2 className={`display-md ${styles.valuesHeading}`}>The Little Hanan Difference</h2>
          </Reveal>

          <div className={styles.valuesGrid}>
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 90}>
                <div className={styles.valueCard}>
                  <i className={`${v.icon} ${styles.valueIcon}`} />
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className="body-sm">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <Reveal>
            <h2 className={`display-lg ${styles.ctaHeading}`}>Come find your next favourite piece</h2>
          </Reveal>
          <Reveal delay={60}>
            <div className={styles.ctaButtons}>
              <Link href="/shop" className="btn btn-primary">Shop the Collection</Link>
              <Link href="/contact" className="btn btn-outline">Get in Touch</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}