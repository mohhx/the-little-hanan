import Link from 'next/link'
import Reveal from '../../../components/ui/Reveal'
import ShareRow from '../../../components/blog/ShareRow'
import { getBlogPostBySlug, getBlogPosts } from '../../../lib/products'
import styles from './page.module.css'

export default async function BlogPostPage({ params }) {
  const { slug } = params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return (
      <main className={styles.notFound}>
        <p className="eyebrow" style={{ color: 'var(--brand-rose)' }}>404</p>
        <h1 className={`display-lg ${styles.notFoundTitle}`}>Post not found</h1>
        <p className="body-lg" style={{ marginBottom: '2rem' }}>
          This article may have been moved. Browse the rest of the journal instead.
        </p>
        <Link href="/blog" className="btn btn-primary">Back to Journal</Link>
      </main>
    )
  }

  const allPosts = await getBlogPosts()
  const related = allPosts.filter((p) => p.slug !== slug).slice(0, 2)

  return (
    <main className={styles.page}>

      {/* ── Breadcrumb ── */}
      <div className={`container ${styles.breadcrumbWrap}`}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/blog">Journal</Link>
          <span aria-hidden="true"> / </span>
          <span aria-current="page">{post.title}</span>
        </nav>
      </div>

      {/* ── Hero ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroImgWrap}>
          <img src={post.image} alt={post.title} className={styles.heroImg} />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroCategory}>{post.category}</p>
          <h1 className={styles.heroTitle}>{post.title}</h1>
          <span className={styles.heroDate}>{post.date}</span>
        </div>
      </section>

      {/* ── Article body ── */}
      <article className={`container ${styles.articleWrap}`}>
        {post.body.map((paragraph, i) => (
          <Reveal key={i} delay={i * 60}>
            <p className={`body-lg ${styles.paragraph}`}>{paragraph}</p>
          </Reveal>
        ))}

        <ShareRow title={post.title} />
      </article>

      {/* ── More from the journal ── */}
      {related.length > 0 && (
        <section className={`section ${styles.relatedSection}`}>
          <div className="container">
            <Reveal>
              <p className="eyebrow" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                Keep Reading
              </p>
            </Reveal>
            <Reveal delay={60}>
              <h2 className={`display-md ${styles.relatedTitle}`}>More from the Journal</h2>
            </Reveal>
            <div className={styles.relatedGrid}>
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 80}>
                  <Link href={`/blog/${p.slug}`} className={styles.relatedCard}>
                    <div className={styles.relatedImgWrap}>
                      <img src={p.image} alt={p.title} className={styles.relatedImg} />
                    </div>
                    <div className={styles.relatedBody}>
                      <p className={styles.relatedCategory}>{p.category}</p>
                      <h3 className={styles.relatedCardTitle}>{p.title}</h3>
                      <span className={styles.relatedDate}>{p.date}</span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}