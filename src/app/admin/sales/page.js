'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Страница управления продажами (админ-панель)
 * GET /admin/sales
 */
export default function AdminSalesPage() {
  const router = useRouter()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingSale, setEditingSale] = useState(null)
  const [tours, setTours] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Статусы заказов
  const statusOptions = [
    { value: 'pending', label: 'В обработке', color: '#f59e0b' },
    { value: 'confirmed', label: 'Подтвержден', color: '#10b981' },
    { value: 'completed', label: 'Выполнен', color: '#3b82f6' },
    { value: 'cancelled', label: 'Отменен', color: '#ef4444' },
  ]

  // Загрузка данных
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Загружаем продажи
      const salesResponse = await fetch('/api/sales?limit=100')
      if (!salesResponse.ok) throw new Error('Не удалось загрузить продажи')
      const salesData = await salesResponse.json()
      setSales(salesData.data)

      // Загружаем туры для редактирования
      const toursResponse = await fetch('/api/tours?limit=100')
      if (toursResponse.ok) {
        const toursData = await toursResponse.json()
        setTours(toursData.data)
      }
    } catch (err) {
      console.error('Ошибка при загрузке:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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

  // Обработчик удаления
  const handleDelete = async (saleId, clientId) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ?')) {
      return
    }

    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось удалить заказ')
      }

      loadData()
    } catch (err) {
      console.error('Ошибка при удалении:', err)
      alert(err.message)
    }
  }

  // Обработчик изменения статуса
  const handleStatusChange = async (saleId, newStatus) => {
    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось обновить статус')
      }

      loadData()
    } catch (err) {
      console.error('Ошибка при обновлении:', err)
      alert(err.message)
    }
  }

  // Открытие модального окна редактирования
  const handleEdit = (sale) => {
    setEditingSale({
      ...sale,
      clientData: {
        name: sale.client.name,
        email: sale.client.email || '',
        phone: sale.client.phone || '',
      },
      items: sale.items.map((item) => ({
        ...item,
        tourId: item.tour.id,
        quantity: item.quantity,
        price: item.price,
      })),
    })
  }

  // Сохранение изменений
  const handleSave = async () => {
    setSubmitting(true)

    try {
      const response = await fetch(`/api/sales/${editingSale.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: editingSale.status,
          clientData: editingSale.clientData,
          items: editingSale.items,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось сохранить изменения')
      }

      setEditingSale(null)
      loadData()
    } catch (err) {
      console.error('Ошибка при сохранении:', err)
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Обновление поля клиента
  const handleClientChange = (field, value) => {
    setEditingSale((prev) => ({
      ...prev,
      clientData: { ...prev.clientData, [field]: value },
    }))
  }

  // Обновление элемента заказа
  const handleItemChange = (index, field, value) => {
    setEditingSale((prev) => {
      const newItems = [...prev.items]
      newItems[index] = { ...newItems[index], [field]: value }
      return { ...prev, items: newItems }
    })
  }

  // Добавление элемента
  const handleAddItem = () => {
    setEditingSale((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { tourId: '', quantity: 1, price: 0 },
      ],
    }))
  }

  // Удаление элемента
  const handleRemoveItem = (index) => {
    setEditingSale((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Загрузка...</p>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Управление продажами</h1>

      {error && (
        <div style={styles.error}>
          <p>Ошибка: {error}</p>
        </div>
      )}

      <div style={styles.table}>
        {/* Заголовок таблицы */}
        <div style={styles.headerRow}>
          <span style={styles.headerCell}>№ заказа</span>
          <span style={styles.headerCell}>Дата</span>
          <span style={styles.headerCell}>Клиент</span>
          <span style={styles.headerCell}>Товары</span>
          <span style={styles.headerCell}>Сумма</span>
          <span style={styles.headerCell}>Статус</span>
          <span style={styles.headerCell}>Действия</span>
        </div>

        {/* Список продаж */}
        {sales.length === 0 ? (
          <div style={styles.empty}>
            <p>Продажи не найдены</p>
          </div>
        ) : (
          sales.map((sale) => {
            const statusInfo = statusOptions.find((s) => s.value === sale.status) || { color: '#6b7280' }
            return (
              <div key={sale.id} style={styles.row}>
                <span style={styles.cell}>{sale.id.slice(-8)}</span>
                <span style={styles.cell}>{formatDate(sale.createdAt)}</span>
                <span style={styles.cell}>{sale.client.name}</span>
                <span style={styles.cell}>{sale.items.length} поз.</span>
                <span style={styles.cellTotal}>{formatPrice(sale.totalAmount)}</span>
                <select
                  value={sale.status}
                  onChange={(e) => handleStatusChange(sale.id, e.target.value)}
                  style={{
                    ...styles.statusSelect,
                    backgroundColor: statusInfo.color,
                  }}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div style={styles.actions}>
                  <button
                    onClick={() => handleEdit(sale)}
                    style={styles.editButton}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(sale.id, sale.clientId)}
                    style={styles.deleteButton}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Модальное окно редактирования */}
      {editingSale && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>Редактирование заказа № {editingSale.id.slice(-8)}</h2>

            {/* Данные клиента */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Данные клиента</h3>
              <div style={styles.formRow}>
                <label style={styles.formLabel}>
                  Имя:
                  <input
                    type="text"
                    value={editingSale.clientData.name}
                    onChange={(e) => handleClientChange('name', e.target.value)}
                    style={styles.input}
                  />
                </label>
                <label style={styles.formLabel}>
                  Email:
                  <input
                    type="email"
                    value={editingSale.clientData.email}
                    onChange={(e) => handleClientChange('email', e.target.value)}
                    style={styles.input}
                  />
                </label>
                <label style={styles.formLabel}>
                  Телефон:
                  <input
                    type="tel"
                    value={editingSale.clientData.phone}
                    onChange={(e) => handleClientChange('phone', e.target.value)}
                    style={styles.input}
                  />
                </label>
              </div>
            </div>

            {/* Элементы заказа */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Товары</h3>
              {editingSale.items.map((item, index) => (
                <div key={index} style={styles.itemRow}>
                  <select
                    value={item.tourId}
                    onChange={(e) => handleItemChange(index, 'tourId', e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Выберите тур</option>
                    {tours.map((tour) => (
                      <option key={tour.id} value={tour.id}>
                        {tour.title}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                    min="1"
                    style={{ ...styles.input, width: '80px' }}
                  />
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                    min="0"
                    step="0.01"
                    style={{ ...styles.input, width: '120px' }}
                  />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    style={styles.removeItemButton}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button onClick={handleAddItem} style={styles.addItemButton}>
                + Добавить товар
              </button>
            </div>

            {/* Кнопки */}
            <div style={styles.modalActions}>
              <button
                onClick={() => setEditingSale(null)}
                style={styles.cancelButton}
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={submitting}
                style={{
                  ...styles.saveButton,
                  ...(submitting ? styles.submitButtonDisabled : {}),
                }}
              >
                {submitting ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Стили
const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '2rem',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
  },
  loading: {
    padding: '3rem',
    textAlign: 'center',
    color: '#6b7280',
  },
  table: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: '100px 150px 1fr 100px 120px 150px 150px',
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
    gridTemplateColumns: '100px 150px 1fr 100px 120px 150px 150px',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    alignItems: 'center',
  },
  cell: {
    fontSize: '0.875rem',
    color: '#4b5563',
  },
  cellTotal: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  statusSelect: {
    padding: '0.5rem',
    border: 'none',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#f59e0b',
    color: 'white',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '0.25rem',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '0.25rem',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    padding: '3rem',
    textAlign: 'center',
    color: '#6b7280',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '2rem',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1.5rem',
  },
  section: {
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '1rem',
  },
  formLabel: {
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
  select: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: 'white',
  },
  itemRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 80px 120px 40px',
    gap: '0.5rem',
    marginBottom: '0.5rem',
    alignItems: 'center',
  },
  removeItemButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  modalActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1.5rem',
  },
  cancelButton: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  saveButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitButtonDisabled: {
    backgroundColor: '#6b7280',
    cursor: 'not-allowed',
  },
}
