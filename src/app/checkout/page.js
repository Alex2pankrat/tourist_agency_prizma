'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'

/**
 * Страница оформления заказа
 * GET /checkout
 */
export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Данные формы
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Валидация
      if (!formData.name.trim()) {
        throw new Error('Введите имя')
      }

      // Оформление заказа
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientData: formData,
          items: cart.items,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Не удалось оформить заказ')
      }

      const sale = await response.json()

      // Очистка корзины
      clearCart()

      // Перенаправление на страницу успеха
      router.push(`/checkout/success?orderId=${sale.id}`)
    } catch (err) {
      console.error('Ошибка при оформлении заказа:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Если корзина пуста
  if (cart.items.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Оформление заказа</h1>
        <div style={styles.empty}>
          <p style={styles.emptyText}>Ваша корзина пуста</p>
          <button
            onClick={() => router.push('/tours')}
            style={styles.button}
          >
            Перейти в каталог
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Оформление заказа</h1>

      <div style={styles.content}>
        {/* Форма */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>Данные клиента</h2>

          {error && (
            <div style={styles.error}>
              <p>{error}</p>
            </div>
          )}

          {/* Имя */}
          <div style={styles.field}>
            <label style={styles.label}>
              Имя *
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Иванов Иван"
                required
                style={styles.input}
              />
            </label>
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>
              Email
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.ru"
                style={styles.input}
              />
            </label>
          </div>

          {/* Телефон */}
          <div style={styles.field}>
            <label style={styles.label}>
              Телефон
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (999) 123-45-67"
                style={styles.input}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {}),
            }}
          >
            {loading ? 'Оформление...' : 'Подтвердить заказ'}
          </button>
        </form>

        {/* Заказ */}
        <div style={styles.summary}>
          <h2 style={styles.summaryTitle}>Ваш заказ</h2>

          {/* Список товаров */}
          <div style={styles.items}>
            {cart.items.map((item) => (
              <div key={item.tourId} style={styles.item}>
                <div style={styles.itemInfo}>
                  <span style={styles.itemTitle}>{item.title}</span>
                  <span style={styles.itemQuantity}>
                    {item.quantity} шт.
                  </span>
                </div>
                <span style={styles.itemPrice}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Итого */}
          <div style={styles.total}>
            <span>Итого:</span>
            <span style={styles.totalValue}>{formatPrice(cart.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Стили
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '2rem',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '2rem',
  },
  empty: {
    padding: '3rem',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
  },
  emptyText: {
    fontSize: '1.125rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
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
  form: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  formTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1.5rem',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '0.375rem',
    marginBottom: '1rem',
  },
  field: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    outline: 'none',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '1rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1.5rem',
  },
  submitButtonDisabled: {
    backgroundColor: '#6b7280',
    cursor: 'not-allowed',
  },
  summary: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    height: 'fit-content',
  },
  summaryTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #e5e7eb',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  itemTitle: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#1f2937',
  },
  itemQuantity: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  itemPrice: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '2px solid #e5e7eb',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
  },
}
