'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

/**
 * Страница деталей заказа
 * GET /sales/[id]
 */
export default function SaleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sale, setSale] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Статус заказа
  const getStatusText = (status) => {
    const statusMap = {
      confirmed: { text: 'Подтвержден', color: '#10b981' },
      pending: { text: 'В обработке', color: '#f59e0b' },
      completed: { text: 'Выполнен', color: '#3b82f6' },
      cancelled: { text: 'Отменен', color: '#ef4444' },
    }
    return statusMap[status] || { text: status, color: '#6b7280' }
  }

  // Загрузка деталей заказа
  useEffect(() => {
    loadSale()
  }, [])

  const loadSale = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/sales/${params.id}`)
      if (!response.ok) {
        throw new Error('Заказ не найден')
      }

      const data = await response.json()
      setSale(data)
    } catch (err) {
      console.error('Ошибка при загрузке:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Загрузка деталей заказа...</p>
      </div>
    )
  }

  if (error || !sale) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <p>Ошибка: {error || 'Заказ не найден'}</p>
          <button onClick={() => router.push('/sales')} style={styles.button}>
            К истории заказов
          </button>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusText(sale.status)

  return (
    <div style={styles.container}>
      <button onClick={() => router.push('/sales')} style={styles.backButton}>
        ← Назад к истории
      </button>

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Заказ № {sale.id.slice(-8)}</h1>
          <p style={styles.date}>{formatDate(sale.createdAt)}</p>
        </div>
        <span
          style={{
            ...styles.status,
            backgroundColor: statusInfo.color,
          }}
        >
          {statusInfo.text}
        </span>
      </div>

      <div style={styles.content}>
        {/* Информация о клиенте */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Клиент</h2>
          <div style={styles.info}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Имя:</span>
              <span style={styles.infoValue}>{sale.client.name}</span>
            </div>
            {sale.client.email && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Email:</span>
                <span style={styles.infoValue}>{sale.client.email}</span>
              </div>
            )}
            {sale.client.phone && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Телефон:</span>
                <span style={styles.infoValue}>{sale.client.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Товары */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Товары</h2>
          <div style={styles.items}>
            {sale.items.map((item, index) => (
              <div key={index} style={styles.item}>
                <div style={styles.itemInfo}>
                  <h3 style={styles.itemTitle}>{item.tour.title}</h3>
                  <p style={styles.itemQuantity}>
                    Количество: {item.quantity} шт.
                  </p>
                </div>
                <div style={styles.itemPrice}>
                  {formatPrice(item.price)} × {item.quantity} ={' '}
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Итого */}
        <div style={styles.total}>
          <span>Общая сумма:</span>
          <span style={styles.totalValue}>{formatPrice(sale.totalAmount)}</span>
        </div>
      </div>
    </div>
  )
}

// Стили
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  backButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#3b82f6',
    fontSize: '0.875rem',
    cursor: 'pointer',
    marginBottom: '1rem',
    padding: '0.5rem',
  },
  loading: {
    padding: '3rem',
    textAlign: 'center',
    color: '#6b7280',
  },
  error: {
    padding: '2rem',
    textAlign: 'center',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '0.5rem',
  },
  button: {
    marginTop: '1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #e5e7eb',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  date: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  status: {
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  section: {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  infoRow: {
    display: 'flex',
    gap: '1rem',
  },
  infoLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#6b7280',
    minWidth: '100px',
  },
  infoValue: {
    fontSize: '0.875rem',
    color: '#1f2937',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.375rem',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.25rem',
  },
  itemQuantity: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  itemPrice: {
    fontSize: '0.875rem',
    color: '#4b5563',
    textAlign: 'right',
  },
  total: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
  },
}
