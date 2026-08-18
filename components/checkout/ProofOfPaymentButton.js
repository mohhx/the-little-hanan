import styles from './ProofOfPaymentButton.module.css'

const formatNaira = (amount) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount)

export default function ProofOfPaymentButton({ whatsappNumber, orderRef, amount, customerName }) {
  if (!whatsappNumber) return null

  const firstName = customerName?.split(' ')[0] || ''
  const message =
    `Hi The Little Hanan! I'm ${firstName} and I've just made a bank transfer for order ${orderRef} ` +
    `(${formatNaira(amount)}). Sharing my proof of payment below.`

  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

  return (
    <div className={styles.wrap}>
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles.btn}>
        <i className="ri-whatsapp-line" />
        Send Proof of Payment
      </a>
      <p className={styles.hint}>
        Opens WhatsApp with your order details filled in — attach a screenshot of your transfer in the chat.
      </p>
    </div>
  )
}