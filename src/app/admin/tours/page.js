'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TourForm from '@/components/tours/TourForm'

/**
 * Страница управления турами (админ-панель)
 * GET /admin/tours
 */
export default function AdminToursPage() {
  const router = useRouter()
  const [tours, setTours] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTour, setEditingTour] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Загрузка туров и категорий
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Загружаем туры
      const toursResponse = await fetch('/api/tours?limit=100')
      if (!toursResponse.ok) throw new Error('Не удалось загрузить туры')
      const toursData = await toursResponse.json()
      setTours(toursData.data)

      // Загружаем категории
      const categoryIds = [...new Set(toursData.data.map((t) => t.categoryId))]
      const categoriesResponse = await fetch('/api/tours')
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json()
        const uniqueCategories = []
        const seenIds = new Set()
        categoriesData.data.forEach((tour) => {
          if (tour.category && !seenIds.has(tour.category.id)) {
            seenIds.add(tour.category.id)
            uniqueCategories.push(tour.category)
          }
        })
        setCategories(uniqueCategories)
      }
    } catch (err) {
      console.error('Ошибка при загрузке:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Обработчик создания/редактирования тура
  const handleSubmit = async (data) => {
    setSubmitting(true)

    try {
      const url = editingTour ? `/api/tours/${editingTour.id}` : '/api/tours'
      const method = editingTour ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось сохранить тур')
      }

      // Обновляем список
      loadData()
      setShowForm(false)
      setEditingTour(null)
    } catch (err) {
      console.error('Ошибка при сохранении:', err)
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Обработчик удаления
  const handleDelete = async (tourId, tourTitle) => {
    if (!confirm(`Вы уверены, что хотите удалить тур "${tourTitle}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/tours/${tourId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось удалить тур')
      }

      // Обновляем список
      loadData()
    } catch (err) {
      console.error('Ошибка при удалении:', err)
      alert(err.message)
    }
  }

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price)
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
      <div style={styles.header}>
        <h1 style={styles.title}>Управление турами</h1>
        <button
          onClick={() => {
            setEditingTour(null)
            setShowForm(true)
          }}
          style={styles.addButton}
        >
          + Добавить тур
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          <p>Ошибка: {error}</p>
        </div>
      )}

      {showForm ? (
        <div>
          <button
            onClick={() => {
              setShowForm(false)
              setEditingTour(null)
            }}
            style={styles.backButton}
          >
            ← Назад к списку
          </button>
          <h2 style={styles.formTitle}>
            {editingTour ? 'Редактирование тура' : 'Новый тур'}
          </h2>
          <TourForm
            initialData={editingTour}
            onSubmit={handleSubmit}
            categories={categories}
            loading={submitting}
          />
        </div>
      ) : (
        <div style={styles.table}>
          {/* Заголовок таблицы */}
          <div style={styles.headerRow}>
            <span style={styles.headerCell}>Название</span>
            <span style={styles.headerCell}>Категория</span>
            <span style={styles.headerCell}>Цена</span>
            <span style={styles.headerCell}>Длительность</span>
            <span style={styles.headerCell}>Действия</span>
          </div>

          {/* Список туров */}
          {tours.length === 0 ? (
            <div style={styles.empty}>
              <p>Туры не найдены</p>
            </div>
          ) : (
            tours.map((tour) => (
              <div key={tour.id} style={styles.row}>
                <span style={styles.cell}>{tour.title}</span>
                <span style={styles.cell}>
                  {tour.category?.name || '—'}
                </span>
                <span style={styles.cell}>{formatPrice(tour.price)}</span>
                <span style={styles.cell}>{tour.duration} дн.</span>
                <div style={styles.actions}>
                  <button
                    onClick={() => {
                      setEditingTour(tour)
                      setShowForm(true)
                    }}
                    style={styles.editButton}
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(tour.id, tour.title)}
                    style={styles.deleteButton}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
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
  formTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1.5rem',
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
    gridTemplateColumns: '2fr 1fr 1fr 1fr 150px',
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
    gridTemplateColumns: '2fr 1fr 1fr 1fr 150px',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    alignItems: 'center',
  },
  cell: {
    fontSize: '0.875rem',
    color: '#4b5563',
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
}
