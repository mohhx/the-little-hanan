'use client'

import { useEffect, useRef } from 'react'
import Reveal from '../ui/Reveal'
import { gsap } from '../../lib/gsap'
import styles from './BlogSection.module.css'

/**
 * Add a cache-busting version to image URLs.
 *
 * This is especially useful with Supabase Storage when an image
 * is replaced using the exact same filename/path.
 */
function getFreshImageUrl(image, version) {
  if (!image) return ''

  // If the URL already contains a query string, append with &
  const separator = image.includes('?') ? '&' : '?'

  return `${image}${separator}v=${encodeURIComponent(
    version || 'latest'
  )}`
}

export default function BlogSection({ posts = [] }) {
  const gridRef = useRef(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const images = grid.querySelectorAll(`.${styles.image}`)

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

      mm.add(
        '(min-width: 641px) and (prefers-reduced-motion: no-preference)',
        () => {
          const dividers = grid.querySelectorAll(`.${styles.divider}`)

          dividers.forEach((divider, i) => {
            gsap.fromTo(
              divider,
              { clipPath: 'inset(0 0 100% 0)' },
              {
                clipPath: 'inset(0 0 0% 0)',
                ease: 'none',
                scrollTrigger: {
                  trigger: grid,
                  start: `top ${85 - i * 4}%`,
                  end: 'bottom 55%',
                  scrub: true,
                },
              }
            )
          })
        }
      )

      mm.add(
        '(max-width: 640px) and (prefers-reduced-motion: no-preference)',
        () => {
          const dividers = grid.querySelectorAll(`.${styles.divider}`)

          gsap.fromTo(
            dividers,
            { clipPath: 'inset(0 0 0 100%)' },
            {
              clipPath: 'inset(0 0 0 0%)',
              duration: 0.8,
              ease: 'power3.inOut',
              stagger: 0.1,
              scrollTrigger: {
                trigger: grid,
                start: 'top 85%',
                once: true,
              },
            }
          )
        }
      )

      mm.add(
        '(min-width: 1025px) and (prefers-reduced-motion: no-preference)',
        () => {
          const cols = grid.querySelectorAll(`.${styles.col}`)
          const speeds = [-7, 5, -9]

          cols.forEach((col, i) => {
            const img = col.querySelector(`.${styles.image}`)

            if (!img) return

            gsap.to(img, {
              yPercent: speeds[i % speeds.length],
              ease: 'none',
              scrollTrigger: {
                trigger: grid,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            })
          })
        }
      )

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(grid.querySelectorAll(`.${styles.image}`), {
          clipPath: 'inset(0 0 0 0%)',
        })

        gsap.set(grid.querySelectorAll(`.${styles.divider}`), {
          clipPath: 'inset(0 0 0% 0)',
        })
      })
    }, grid)

    return () => ctx.revert()
  }, [posts])

  return (
    <section className={styles.section}>
      <div className="container container--md">
        <Reveal>
          <p
            className={`eyebrow ${styles.eyebrow}`}
            style={{ textAlign: 'center' }}
          >
            From the journal
          </p>
        </Reveal>

        <Reveal variant="text">
          <h2
            className={`display-lg ${styles.headline}`}
            style={{ textAlign: 'center' }}
          >
            Stories from the Studio
          </h2>
        </Reveal>

        <div ref={gridRef} className={styles.grid}>
          {posts.map((post, i) => {
            const title = post.title || 'Untitled story'

            const [leadWord, ...rest] = title.split(' ')
            const restOfTitle = rest.join(' ')

            /*
             * Use updated_at when available.
             * If your posts don't have updated_at yet, the fallback
             * still forces a fresh URL during development.
             */
            const imageVersion =
              post.updated_at ||
              post.updatedAt ||
              post.image_updated_at ||
              post.imageVersion ||
              'latest'

            const imageUrl = getFreshImageUrl(
              post.image,
              imageVersion
            )

            return (
              <div key={post.id || post.slug || i} className={styles.col}>
                {i > 0 && (
                  <span
                    className={styles.divider}
                    aria-hidden="true"
                  />
                )}

                <Reveal delay={i * 80}>
                  <a
                    href={post.instagram_url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.card}
                  >
                    <div className={styles.imageWrap}>
                      <img
                        src={imageUrl}
                        alt={title}
                        className={styles.image}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        onError={(e) => {
                          /*
                           * If a versioned URL fails, retry the original
                           * Supabase URL once.
                           */
                          if (
                            post.image &&
                            e.currentTarget.src !== post.image
                          ) {
                            e.currentTarget.src = post.image
                          }
                        }}
                      />
                    </div>

                    <div className={styles.meta}>
                      <p className={styles.index}>
                        {String(i + 1).padStart(2, '0')}
                      </p>

                      <p className={styles.category}>
                        {post.category}
                      </p>

                      <p className={styles.date}>
                        {post.date}
                      </p>

                      <h3 className={styles.title}>
                        <span className={styles.titleText}>
                          <span className={styles.leadWord}>
                            {leadWord}
                          </span>

                          {restOfTitle
                            ? ` ${restOfTitle}`
                            : ''}
                        </span>

                        <span
                          className={styles.arrow}
                          aria-hidden="true"
                        >
                          ↗
                        </span>
                      </h3>
                    </div>
                  </a>
                </Reveal>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}