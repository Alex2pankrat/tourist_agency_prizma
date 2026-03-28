'use client'

import { useState } from 'react'

/**
 * Компонент карточки тура
 * @param {Object} props - Свойства компонента
 * @param {Object} props.tour - Данные тура
 * @param {Function} props.onAddToCart - Callback для добавления в корзину (без параметров, уже привязан к туру)
 */
export default function TourCard({ tour, onAddToCart }) {
  const [isAdding, setIsAdding] = useState(false)

  // Обработчик добавления в корзину
  const handleAddToCart = async () => {
    setIsAdding(true)
    try {
      await onAddToCart()
    } catch (error) {
      console.error('Ошибка при добавлении в корзину:', error)
    } finally {
      setIsAdding(false)
    }
  }

  // Форматирование цены
  const formattedPrice = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(tour.price)

  return (
    <div style={styles.card}>
      {/* Изображение тура */}
      <div style={styles.imageContainer}>
        {tour.imageUrl ? (
          <img
            src={tour.imageUrl}
            alt={tour.title}
            style={styles.image}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x250?text=Нет+фото'
            }}
          />
        ) : (
          <div style={styles.imagePlaceholder}>
            <span>Нет фото</span>
          </div>
        )}
      </div>

      {/* Информация о туре */}
      <div style={styles.content}>
        {/* Категория */}
        {tour.category && (
          <span style={styles.category}>{tour.category.name}</span>
        )}

        {/* Название */}
        <h3 style={styles.title}>{tour.title}</h3>

        {/* Описание */}
        {tour.description && (
          <p style={styles.description}>{tour.description}</p>
        )}

        {/* Детали */}
        <div style={styles.details}>
          <div style={styles.detail}>
            <span style={styles.detailIcon}>📅</span>
            <span>{tour.duration} дн.</span>
          </div>
        </div>

        {/* Цена и кнопка */}
        <div style={styles.footer}>
          <span style={styles.price}>{formattedPrice}</span>
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            style={{
              ...styles.button,
              ...(isAdding ? styles.buttonDisabled : {}),
            }}
          >
            {isAdding ? 'Добавление...' : 'В корзину'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Стили компонента
const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
  },
  imageContainer: {
    width: '100%',
    height: '200px',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    fontSize: '0.875rem',
  },
  content: {
    padding: '1rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  category: {
    display: 'inline-block',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    fontSize: '0.75rem',
    fontWeight: '500',
    padding: '0.25rem 0.5rem',
    borderRadius: '9999px',
    marginBottom: '0.5rem',
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
    lineHeight: '1.4',
  },
  description: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.75rem',
    lineHeight: '1.5',
    flex: 1,
  },
  details: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  detail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.875rem',
    color: '#4b5563',
  },
  detailIcon: {
    fontSize: '1rem',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '0.75rem',
    borderTop: '1px solid #e5e7eb',
  },
  price: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
}
