'use client'

import TourCard from './TourCard'

/**
 * Компонент списка туров
 * @param {Object} props - Свойства компонента
 * @param {Array} props.tours - Массив туров для отображения
 * @param {Function} props.onAddToCart - Callback для добавления в корзину (принимает tourId и tourData)
 * @param {Object} props.pagination - Информация о пагинации
 */
export default function TourList({ tours = [], onAddToCart, pagination }) {
  // Если туры не загружены
  if (!tours || tours.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyText}>Туры не найдены</p>
      </div>
    )
  }

  return (
    <div>
      {/* Сетка туров */}
      <div style={styles.grid}>
        {tours.map((tour) => (
          <TourCard
            key={tour.id}
            tour={tour}
            onAddToCart={() => onAddToCart(tour.id, tour)}
          />
        ))}
      </div>

      {/* Пагинация */}
      {pagination && pagination.totalPages > 1 && (
        <div style={styles.pagination}>
          <span style={styles.paginationInfo}>
            Страница {pagination.page} из {pagination.totalPages} (всего: {pagination.total})
          </span>
        </div>
      )}
    </div>
  )
}

// Стили компонента
const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
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
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
  },
  paginationInfo: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
}
