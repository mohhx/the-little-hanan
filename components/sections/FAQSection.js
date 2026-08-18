'use client'
import { useEffect, useRef, useState } from 'react'
import Reveal from '../ui/Reveal'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import styles from './FAQSection.module.css'

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'Orders within Kaduna and Abuja typically arrive within 1–2 business days. Deliveries to other states across Nigeria usually take 3–5 business days, depending on location.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We currently accept bank transfer and pay-on-delivery for orders within Kaduna. Online card payments are coming soon.',
  },
  {
    q: 'Can I return or exchange an item?',
    a: 'Yes — unworn items with tags attached can be returned or exchanged within 7 days of delivery. Reach out to us on WhatsApp to start a return.',
  },
  {
    q: 'How do I find my size?',
    a: 'Each product page includes a size guide. If you\u2019re between sizes or unsure, message us on WhatsApp with your measurements and we\u2019ll help you pick the right fit.',
  },
  {
    q: 'What is WhimsyNetting?',
    a: 'WhimsyNetting is our handcrafted crochet sub-brand — think tops, bags and accessories made to order. Look for the WhimsyNetting badge while browsing the shop.',
  },
  {
    q: 'Do you ship outside Nigeria?',
    a: 'Not yet — for now we deliver within Nigeria only. We\u2019re working on international shipping, so watch this space.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)
  const sectionRef = useRef(null)

  const toggle = (i) => {
    setOpenIndex((current) => (current === i ? -1 : i))
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'bottom bottom',
      end: 'bottom top',
      scrub: true,
        onUpdate: (self) => {
        gsap.set(el, {
          scale: 1 - self.progress * 0.08,
          y: -self.progress * 40,
          opacity: 1 - self.progress * 0.35,
        })
      },
    })

    return () => trigger.kill()
  }, [])

  return (
    <section ref={sectionRef} className={`section ${styles.faq}`}>
      <div className="container container--sm">
        <div className={styles.header}>
          <Reveal><span className="eyebrow">Good to Know</span></Reveal>
          <Reveal variant="text"><h2 className={`display-lg ${styles.title}`}>Frequently Asked Questions</h2></Reveal>
        </div>

        <div className={styles.list}>
          {FAQS.map((item, i) => {
            const open = openIndex === i
            return (
              <Reveal key={item.q} delay={i * 50} variant="subtle">
                <div className={`${styles.item} ${open ? styles.itemOpen : ''}`}>
                  <button
                    className={styles.question}
                    onClick={() => toggle(i)}
                    aria-expanded={open}
                    aria-controls={`faq-answer-${i}`}
                  >
                    <span>{item.q}</span>
                    <i className={open ? 'ri-subtract-line' : 'ri-add-line'} />
                  </button>
                  <div
                    id={`faq-answer-${i}`}
                    className={styles.answerWrap}
                    style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                  >
                    <p className={styles.answer}>{item.a}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}