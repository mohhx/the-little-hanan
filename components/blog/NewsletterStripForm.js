'use client'
import styles from '../../app/blog/page.module.css'

export default function NewsletterStripForm() {
  return (
    <form
      className={styles.stripForm}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="your@email.com"
        className={styles.stripInput}
        aria-label="Email address"
      />
      <button type="submit" className={`btn btn-primary ${styles.stripBtn}`}>
        Subscribe
      </button>
    </form>
  )
}
