'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCart } from '@/context/CartContext'
import FilterPanel from '@/components/tours/FilterPanel'
import TourList from '@/components/tours/TourList'

/**
 * Страница каталога туров
 * GET /tours
 */
export default function ToursPage() {
  // Используем контекст корзины
  const { addToCart } = useCart()
  
  // Состояние для туров
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Состояние для пагинации
  const [pagination, setPagination] = useState(null)
  
  // Состояние для фильтров
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    duration: '',
    search: '',
  })
  
  // Состояние для категорий
  const [categories, setCategories] = useState([])

  /**
   * Загрузка категорий
   */
  const loadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/tours')
      const data = await response.json()
      
      if (data.data) {
        // Извлекаем уникальные категории из туров
        const uniqueCategories = []
        const categoryIds = new Set()
        
        data.data.forEach(tour => {
          if (tour.category && !categoryIds.has(tour.category.id)) {
            categoryIds.add(tour.category.id)
            uniqueCategories.push(tour.category)
          }
        })
        
        setCategories(uniqueCategories)
      }
    } catch (err) {
      console.error('Ошибка при загрузке категорий:', err)
    }
  }, [])

  /**
   * Загрузка туров с фильтрами
   */
  const loadTours = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Формируем query параметры
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      if (filters.duration) params.append('duration', filters.duration)
      if (filters.search) params.append('search', filters.search)
      params.append('limit', '20')
      
      const response = await fetch(`/api/tours?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Не удалось загрузить туры')
      }
      
      const data = await response.json()
      setTours(data.data)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
      console.error('Ошибка при загрузке туров:', err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Загрузка данных при монтировании
  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  // Загрузка туров при изменении фильтров
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadTours()
    }, 300) // Debounce 300ms
    
    return () => clearTimeout(debounceTimer)
  }, [filters, loadTours])

  /**
   * Обработчик добавления в корзину
   */
  const handleAddToCart = async (tourId, tourData) => {
    try {
      // Находим данные тура в списке
      const tour = tours.find(t => t.id === tourId)
      if (!tour) {
        throw new Error('Тур не найден')
      }
      
      // Добавляем в корзину через контекст
      const success = await addToCart(tourId, {
        title: tour.title,
        price: Number(tour.price),
        imageUrl: tour.imageUrl,
      }, 1)
      
      if (success) {
        alert('Тур добавлен в корзину!')
      }
    } catch (err) {
      console.error('Ошибка при добавлении в корзину:', err)
      throw err
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Каталог туров</h1>
      
      {/* Панель фильтров */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
      />
      
      {/* Индикатор загрузки */}
      {loading && (
        <div style={styles.loading}>
          <p>Загрузка туров...</p>
        </div>
      )}
      
      {/* Сообщение об ошибке */}
      {error && (
        <div style={styles.error}>
          <p>Ошибка: {error}</p>
        </div>
      )}
      
      {/* Список туров */}
      {!loading && !error && (
        <TourList
          tours={tours}
          onAddToCart={handleAddToCart}
          pagination={pagination}
        />
      )}
    </div>
  )
}

// Стили страницы
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
    marginBottom: '1rem',
  },
}
