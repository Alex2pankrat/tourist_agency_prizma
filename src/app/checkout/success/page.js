'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

/**
 * Страница успеха после оформления заказа
 * GET /checkout/success
 */
export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')

  return (
    <div style={styles.container}>
      <div style={styles.success}>
        <div style={styles.icon}>✓</div>
        <h1 style={styles.title}>Заказ оформлен!</h1>
        <p style={styles.text}>
          Ваш заказ успешно оформлен. Менеджер свяжется с вами в ближайшее время.
        </p>
        
        {orderId && (
          <p style={styles.orderId}>
            Номер заказа: <strong>{orderId}</strong>
          </p>
        )}

        <div style={styles.actions}>
          <button
            onClick={() => router.push('/tours')}
            style={styles.button}
          >
            В каталог
          </button>
          <button
            onClick={() => router.push('/sales')}
            style={styles.secondaryButton}
          >
            История заказов
          </button>
        </div>
      </div>
    </div>
  )
}

// Стили
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '2rem 1rem',
    minHeight: 'calc(100vh - 200px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  success: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  icon: {
    width: '80px',
    height: '80px',
    backgroundColor: '#10b981',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    fontWeight: '700',
    margin: '0 auto 1.5rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
    lineHeight: '1.6',
  },
  orderId: {
    fontSize: '0.875rem',
    color: '#4b5563',
    marginBottom: '2rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
}
