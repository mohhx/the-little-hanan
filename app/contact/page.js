'use client'

import { useState } from 'react'
import emailjs from '@emailjs/browser'
import Reveal from '../../components/ui/Reveal'
import styles from './page.module.css'

// ── EmailJS config ──────────────────────────────────────────────────────────
// TODO(Moh): replace with your real EmailJS service/template/public key.
// Create these at https://dashboard.emailjs.com — takes about 5 minutes.
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY'

const WHATSAPP_NUMBER = '2348100653400'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          message: form.message,
        },
        EMAILJS_PUBLIC_KEY
      )
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      console.error('EmailJS error:', err)
      setStatus('error')
    }
  }

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi! I have a question about The Little Hanan.')}`

  return (
    <main className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className="container">
          <Reveal>
            <p className="eyebrow" style={{ color: 'var(--brand-rose)' }}>Get in Touch</p>
          </Reveal>
          <Reveal delay={60}>
            <h1 className={`display-lg ${styles.heroTitle}`}>We&apos;d love to hear from you</h1>
          </Reveal>
          <Reveal delay={120}>
            <p className={`body-lg ${styles.heroSub}`}>
              Questions about an order, sizing, or a custom piece? Reach out below or message us directly on WhatsApp.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Content ── */}
      <section className={`section ${styles.contentSection}`}>
        <div className={`container ${styles.contentGrid}`}>

          {/* Form */}
          <Reveal>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="name" className={styles.label}>Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Your name"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="your@email.com"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="message" className={styles.label}>Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="How can we help?"
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending...' : 'Send Message'}
              </button>

              {status === 'sent' && (
                <p className={styles.statusSuccess}>
                  <i className="ri-checkbox-circle-line" /> Message sent \u2014 we&apos;ll be in touch soon.
                </p>
              )}
              {status === 'error' && (
                <p className={styles.statusError}>
                  <i className="ri-error-warning-line" /> Something went wrong. Please try WhatsApp instead, or email us directly.
                </p>
              )}
            </form>
          </Reveal>

          {/* Details */}
          <Reveal delay={80}>
            <div className={styles.details}>
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className={styles.whatsappCard}>
                <i className="ri-whatsapp-line" />
                <div>
                  <span className={styles.whatsappTitle}>Chat with us on WhatsApp</span>
                  <span className={styles.whatsappSub}>Usually replies within a few hours</span>
                </div>
                <i className="ri-arrow-right-line" style={{ marginLeft: 'auto' }} />
              </a>

              <div className={styles.infoBlock}>
                <h3 className={styles.infoHeading}>Visit Us</h3>
                <p className="body-sm"><i className="ri-map-pin-2-fill" /> Kaduna/Abuja, Nigeria</p>
              </div>

              <div className={styles.infoBlock}>
                <h3 className={styles.infoHeading}>Follow Along</h3>
                <p className="body-sm">
                  <i className="ri-instagram-line" /> <a href="https://www.instagram.com/theelittlehanan/" target="_blank" rel="noreferrer">@theelittlehanan</a>
                </p>
                <p className="body-sm">
                  <i className="ri-tiktok-line" /> <a href="https://www.tiktok.com/@just.jiddvh" target="_blank" rel="noreferrer">@just.jiddvh</a>
                </p>
              </div>

              <div className={styles.infoBlock}>
                <h3 className={styles.infoHeading}>Response Time</h3>
                <p className="body-sm">
                  We typically reply within 24 hours on weekdays. For urgent order questions, WhatsApp is fastest.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}