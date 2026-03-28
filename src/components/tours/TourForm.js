'use client'

import { useState, useEffect } from 'react'

/**
 * Компонент формы для создания/редактирования тура
 * @param {Object} props - Свойства компонента
 * @param {Object} props.initialData - Начальные данные для редактирования
 * @param {Function} props.onSubmit - Callback при отправке формы
 * @param {Array} props.categories - Список категорий
 * @param {boolean} props.loading - Состояние загрузки
 */
export default function TourForm({ initialData, onSubmit, categories = [], loading = false }) {
  // Состояние формы
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '',
    categoryId: '',
    imageUrl: '',
  })

  const [errors, setErrors] = useState({})

  // Заполняем форму начальными данными при редактировании
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        duration: initialData.duration?.toString() || '',
        categoryId: initialData.categoryId || '',
        imageUrl: initialData.imageUrl || '',
      })
    }
  }, [initialData])

  // Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Очищаем ошибку при изменении
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  // Валидация формы
  const validate = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Введите название тура'
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Введите корректную цену'
    }

    if (!formData.duration || parseInt(formData.duration) <= 0) {
      newErrors.duration = 'Введите корректную длительность'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Выберите категорию'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    // Преобразуем данные в правильный формат
    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
    }

    onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Название */}
      <div style={styles.field}>
        <label style={styles.label}>
          Название *
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Например: Отдых в Анталье"
            style={{
              ...styles.input,
              ...(errors.title ? styles.inputError : {}),
            }}
          />
        </label>
        {errors.title && <span style={styles.errorText}>{errors.title}</span>}
      </div>

      {/* Описание */}
      <div style={styles.field}>
        <label style={styles.label}>
          Описание
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Описание тура..."
            rows={4}
            style={styles.textarea}
          />
        </label>
      </div>

      {/* Цена и длительность */}
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>
            Цена (₽) *
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="50000"
              min="0"
              step="0.01"
              style={{
                ...styles.input,
                ...(errors.price ? styles.inputError : {}),
              }}
            />
          </label>
          {errors.price && <span style={styles.errorText}>{errors.price}</span>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            Длительность (дней) *
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="7"
              min="1"
              style={{
                ...styles.input,
                ...(errors.duration ? styles.inputError : {}),
              }}
            />
          </label>
          {errors.duration && (
            <span style={styles.errorText}>{errors.duration}</span>
          )}
        </div>
      </div>

      {/* Категория */}
      <div style={styles.field}>
        <label style={styles.label}>
          Категория *
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            style={{
              ...styles.select,
              ...(errors.categoryId ? styles.inputError : {}),
            }}
          >
            <option value="">Выберите категорию</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        {errors.categoryId && (
          <span style={styles.errorText}>{errors.categoryId}</span>
        )}
      </div>

      {/* URL изображения */}
      <div style={styles.field}>
        <label style={styles.label}>
          URL изображения
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            style={styles.input}
          />
        </label>
      </div>

      {/* Кнопки */}
      <div style={styles.actions}>
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitButton,
            ...(loading ? styles.submitButtonDisabled : {}),
          }}
        >
          {loading
            ? initialData
              ? 'Сохранение...'
              : 'Создание...'
            : initialData
            ? 'Сохранить изменения'
            : 'Создать тур'}
        </button>
      </div>
    </form>
  )
}

// Стили
const styles = {
  form: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  field: {
    marginBottom: '1.25rem',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
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
  inputError: {
    borderColor: '#ef4444',
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    outline: 'none',
    backgroundColor: 'white',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '0.25rem',
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
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
