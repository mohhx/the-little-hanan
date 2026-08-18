'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '../../lib/store/cartStore'
import { createOrder } from '../../lib/orders'
import { getSettings } from '../../lib/settings'
import BankDetailsCard from '../../components/checkout/BankDetailsCard'
import ProofOfPaymentButton from '../../components/checkout/ProofOfPaymentButton'
import styles from './page.module.css'

const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)

const NG_STATES = [
  'Abia', 'Abuja (FCT)', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  state: '',
  city: '',
  notes: '',
  paymentMethod: 'bank_transfer',
}

function genOrderRef() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5)
  return `TLH-${stamp}`
}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.subtotal())
  const clearCart = useCartStore((s) => s.clearCart)

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => { setHydrated(true) }, [])

  const [settings, setSettings] = useState({})
  const [settingsLoading, setSettingsLoading] = useState(true)
  useEffect(() => {
    getSettings().then((data) => {
      setSettings(data)
      setSettingsLoading(false)
    })
  }, [])

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [order, setOrder] = useState(null) // set once placed — holds a snapshot for the confirmation view
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const onChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors((er) => ({ ...er, [field]: null }))
  }

  const validate = () => {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Required'
    if (!form.phone.trim()) next.phone = 'Required'
    if (!form.email.trim()) next.email = 'Required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email'
    if (!form.address.trim()) next.address = 'Required'
    if (!form.state) next.state = 'Required'
    if (!form.city.trim()) next.city = 'Required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!validate()) return

    setSaving(true)
    const ref = genOrderRef()

    const { data, error } = await createOrder({
      orderRef: ref,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state,
      notes: form.notes.trim(),
      items,
      subtotal,
      paymentMethod: form.paymentMethod,
    })

    setSaving(false)

    if (error) {
      setSubmitError("Couldn't place your order — please check your connection and try again. If this keeps happening, reach out to us directly.")
      return
    }

    setOrder({
      ref: data.order_ref,
      form,
      items,
      subtotal,
    })
    clearCart()
  }

  // ── Confirmation view ──────────────────────────────────────────────────
  if (order) {
    return (
      <main className={styles.page}>
        <div className="container container--sm">
          <div className={styles.confirm}>
            <i className={`ri-checkbox-circle-line ${styles.confirmIcon}`} />
            <span className="eyebrow">Order Placed</span>
            <h1 className={`display-lg ${styles.confirmTitle}`}>Thank you, {order.form.fullName.split(' ')[0]}.</h1>
            <p className={styles.confirmText}>
              Your order <strong>{order.ref}</strong> has been received. We&apos;ll reach out on{' '}
              <strong>{order.form.phone}</strong> to confirm delivery and payment details.
            </p>

            <div className={styles.confirmSummary}>
              <div className={styles.confirmRow}>
                <span>Delivering to</span>
                <span>{order.form.address}, {order.form.city}, {order.form.state}</span>
              </div>
              <div className={styles.confirmRow}>
                <span>Payment method</span>
                <span>{order.form.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Pay on Delivery'}</span>
              </div>
              <div className={styles.confirmRow}>
                <span>Total</span>
                <span>{formatNaira(order.subtotal)}</span>
              </div>
            </div>

            {order.form.paymentMethod === 'bank_transfer' && (
              <>
                <BankDetailsCard settings={settings} loading={settingsLoading} />
                <ProofOfPaymentButton
                  whatsappNumber={settings.whatsapp_number}
                  orderRef={order.ref}
                  amount={order.subtotal}
                  customerName={order.form.fullName}
                />
              </>
            )}

            <Link href="/shop" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </main>
    )
  }

  // ── Empty cart guard ────────────────────────────────────────────────────
  if (hydrated && items.length === 0) {
    return (
      <main className={styles.page}>
        <div className="container container--sm">
          <div className={styles.empty}>
            <h1 className={`display-md ${styles.emptyTitle}`}>Your bag is empty</h1>
            <p className={styles.emptyText}>Add something to your bag before checking out.</p>
            <Link href="/shop" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </main>
    )
  }

  // ── Form view ───────────────────────────────────────────────────────────
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <span className="eyebrow">The Little Hanan</span>
        <h1 className={`display-lg ${styles.title}`}>Checkout</h1>
      </div>

      <div className="container container--md">
        <form className={styles.layout} onSubmit={onSubmit} noValidate>
          <div className={styles.formCol}>
            <h2 className={`display-md ${styles.sectionTitle}`}>Delivery Details</h2>

            <div className={styles.field}>
              <label htmlFor="fullName">Full Name</label>
              <input id="fullName" value={form.fullName} onChange={onChange('fullName')} />
              {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="phone">Phone Number</label>
                <input id="phone" type="tel" value={form.phone} onChange={onChange('phone')} />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
              </div>
              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input id="email" type="email" value={form.email} onChange={onChange('email')} />
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="address">Delivery Address</label>
              <textarea id="address" rows={3} value={form.address} onChange={onChange('address')} />
              {errors.address && <span className={styles.error}>{errors.address}</span>}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="state">State</label>
                <select id="state" value={form.state} onChange={onChange('state')}>
                  <option value="">Select state</option>
                  {NG_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.state && <span className={styles.error}>{errors.state}</span>}
              </div>
              <div className={styles.field}>
                <label htmlFor="city">City / Area</label>
                <input id="city" value={form.city} onChange={onChange('city')} />
                {errors.city && <span className={styles.error}>{errors.city}</span>}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="notes">Order Notes (optional)</label>
              <textarea id="notes" rows={2} value={form.notes} onChange={onChange('notes')} />
            </div>

            <h2 className={`display-md ${styles.sectionTitle}`}>Payment Method</h2>
            <div className={styles.paymentOptions}>
              <label className={`${styles.paymentOption} ${form.paymentMethod === 'bank_transfer' ? styles.paymentOptionActive : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={form.paymentMethod === 'bank_transfer'}
                  onChange={onChange('paymentMethod')}
                />
                <i className="ri-bank-line" />
                <span>Bank Transfer</span>
              </label>
              {form.paymentMethod === 'bank_transfer' && (
                <BankDetailsCard settings={settings} loading={settingsLoading} />
              )}

              <label className={`${styles.paymentOption} ${form.paymentMethod === 'pay_on_delivery' ? styles.paymentOptionActive : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="pay_on_delivery"
                  checked={form.paymentMethod === 'pay_on_delivery'}
                  onChange={onChange('paymentMethod')}
                />
                <i className="ri-truck-line" />
                <span>Pay on Delivery</span>
              </label>

              <label className={`${styles.paymentOption} ${styles.paymentOptionDisabled}`}>
                <input type="radio" name="paymentMethod" disabled />
                <i className="ri-bank-card-line" />
                <span>Card Payment</span>
                <span className={styles.comingSoonBadge}>Coming Soon</span>
              </label>
            </div>
            <p className={styles.paymentNote}>
              {form.paymentMethod === 'bank_transfer'
                ? "Transfer the total to the account above, then send proof of payment once your order is confirmed."
                : "We'll confirm payment directly with you after your order is received."}
            </p>
          </div>

          <div className={styles.summaryCol}>
            <div className={styles.summary}>
              <h2 className={`display-md ${styles.summaryTitle}`}>Order Summary</h2>
              <ul className={styles.summaryItems}>
                {items.map((item) => (
                  <li key={item.key} className={styles.summaryItem}>
                    <img src={item.image} alt={item.name} className={styles.summaryItemImg} />
                    <div className={styles.summaryItemInfo}>
                      <span className={styles.summaryItemName}>{item.name}</span>
                      {item.size && <span className={styles.summaryItemMeta}>Size: {item.size}</span>}
                      <span className={styles.summaryItemMeta}>Qty: {item.qty}</span>
                    </div>
                    <span className={styles.summaryItemPrice}>{formatNaira(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className={styles.divider} />
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <p className={styles.summaryNote}>Delivery calculated after confirmation</p>
              <div className={styles.divider} />
              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                <span>Total</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              {submitError && <p className={styles.error}>{submitError}</p>}
              <button type="submit" className={`btn btn-primary ${styles.placeOrderBtn}`} disabled={saving}>
                {saving ? 'Placing Order…' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}