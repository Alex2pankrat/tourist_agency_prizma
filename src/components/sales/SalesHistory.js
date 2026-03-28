'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Компонент истории продаж
 * Отображает список всех заказов
 */
export default function SalesHistory() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const router = useRouter()

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
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

  // Загрузка истории продаж
  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/sales?limit=50')
      if (!response.ok) {
        throw new Error('Не удалось загрузить историю продаж')
      }

      const responseData = await response.json()
      
      // Новый API возвращает { success: true, data: [...] }
      const salesData = responseData.data || []
      setSales(salesData)
      setPagination(responseData.pagination || null)
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
        <p>Загрузка истории заказов...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={styles.error}>
        <p>Ошибка: {error}</p>
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <div style={styles.empty}>
        <p>История заказов пуста</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>История заказов</h2>

      <div style={styles.table}>
        {/* Заголовок таблицы */}
        <div style={styles.header}>
          <span style={styles.headerCell}>№ заказа</span>
          <span style={styles.headerCell}>Дата</span>
          <span style={styles.headerCell}>Клиент</span>
          <span style={styles.headerCell}>Товары</span>
          <span style={styles.headerCell}>Сумма</span>
          <span style={styles.headerCell}>Статус</span>
        </div>

        {/* Список заказов */}
        {sales.map((sale) => {
          const statusInfo = getStatusText(sale.status)
          return (
            <div
              key={sale.id}
              style={styles.row}
              onClick={() => router.push(`/sales/${sale.id}`)}
            >
              <span style={styles.cell}>{sale.id.slice(-8)}</span>
              <span style={styles.cell}>{formatDate(sale.createdAt)}</span>
              <span style={styles.cell}>{sale.client.name}</span>
              <span style={styles.cell}>{sale.items.length} поз.</span>
              <span style={styles.cellTotal}>
                {formatPrice(sale.totalAmount)}
              </span>
              <span
                style={{
                  ...styles.cellStatus,
                  backgroundColor: statusInfo.color,
                }}
              >
                {statusInfo.text}
              </span>
            </div>
          )
        })}
      </div>

      {/* Пагинация */}
      {pagination && pagination.totalPages > 1 && (
        <div style={styles.pagination}>
          <span>
            Страница {pagination.page} из {pagination.totalPages} (всего:{' '}
            {pagination.total})
          </span>
        </div>
      )}
    </div>
  )
}

// Стили
const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
  },
  loading: {
    padding: '3rem',
    textAlign: 'center',
    color: '#6b7280',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '0.5rem',
  },
  empty: {
    padding: '3rem',
    textAlign: 'center',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'grid',
    gridTemplateColumns: '100px 150px 1fr 100px 120px 120px',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  headerCell: {
    display: 'flex',
    alignItems: 'center',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '100px 150px 1fr 100px 120px 120px',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: '#4b5563',
  },
  cellTotal: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  cellStatus: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: 'white',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    alignSelf: 'center',
    justifySelf: 'center',
  },
  pagination: {
    padding: '1rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
  },
}
