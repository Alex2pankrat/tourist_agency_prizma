'use client'

/**
 * Компонент панели фильтров для туров
 * @param {Object} props - Свойства компонента
 * @param {Object} props.filters - Текущие фильтры
 * @param {Function} props.onFilterChange - Callback для изменения фильтров
 * @param {Array} props.categories - Список категорий для фильтра
 */
export default function FilterPanel({ filters, onFilterChange, categories = [] }) {
  // Обработчик изменения текстовых полей
  const handleTextChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value })
  }

  // Обработчик изменения числовых полей
  const handleNumberChange = (field, value) => {
    const numValue = value === '' ? '' : parseFloat(value)
    onFilterChange({ ...filters, [field]: numValue })
  }

  // Сброс всех фильтров
  const handleClear = () => {
    onFilterChange({
      category: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
      search: '',
    })
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Фильтры</h2>
      
      {/* Поиск по названию */}
      <div style={styles.field}>
        <label style={styles.label}>Поиск:</label>
        <input
          type="text"
          placeholder="Название тура..."
          value={filters.search || ''}
          onChange={(e) => handleTextChange('search', e.target.value)}
          style={styles.input}
        />
      </div>

      {/* Категория */}
      <div style={styles.field}>
        <label style={styles.label}>Категория:</label>
        <select
          value={filters.category || ''}
          onChange={(e) => handleTextChange('category', e.target.value)}
          style={styles.select}
        >
          <option value="">Все категории</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Минимальная цена */}
      <div style={styles.field}>
        <label style={styles.label}>Мин. цена (₽):</label>
        <input
          type="number"
          placeholder="От"
          value={filters.minPrice || ''}
          onChange={(e) => handleNumberChange('minPrice', e.target.value)}
          style={styles.input}
          min="0"
        />
      </div>

      {/* Максимальная цена */}
      <div style={styles.field}>
        <label style={styles.label}>Макс. цена (₽):</label>
        <input
          type="number"
          placeholder="До"
          value={filters.maxPrice || ''}
          onChange={(e) => handleNumberChange('maxPrice', e.target.value)}
          style={styles.input}
          min="0"
        />
      </div>

      {/* Длительность */}
      <div style={styles.field}>
        <label style={styles.label}>Длительность (дней):</label>
        <input
          type="number"
          placeholder="Любая"
          value={filters.duration || ''}
          onChange={(e) => handleNumberChange('duration', e.target.value)}
          style={styles.input}
          min="1"
        />
      </div>

      {/* Кнопка сброса */}
      <button onClick={handleClear} style={styles.clearButton}>
        Сбросить фильтры
      </button>
    </div>
  )
}

// Стили компонента
const styles = {
  container: {
    backgroundColor: '#f9fafb',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    marginBottom: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  field: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: 'white',
  },
  clearButton: {
    width: '100%',
    padding: '0.5rem 1rem',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
}
