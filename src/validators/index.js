/**
 * Общие валидаторы для приложения
 * Предоставляют функции для валидации различных типов данных
 */

/**
 * Валидатор для проверки email
 */
export class EmailValidator {
  /**
   * Проверить формат email
   * @param {string} email - Email для проверки
   * @returns {Object} Результат валидации
   */
  static validate(email) {
    const errors = []

    if (!email || email.trim().length === 0) {
      errors.push('Email не указан')
      return { isValid: false, errors }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      errors.push('Некорректный формат email')
    }

    return {
      isValid: errors.length === 0,
      errors,
      value: errors.length === 0 ? email.trim() : null,
    }
  }
}

/**
 * Валидатор для проверки телефона
 */
export class PhoneValidator {
  /**
   * Проверить формат телефона
   * @param {string} phone - Телефон для проверки
   * @param {Object} options - Опции валидации
   * @param {boolean} options.required - Обязательное ли поле
   * @returns {Object} Результат валидации
   */
  static validate(phone, { required = false } = {}) {
    const errors = []

    if (!phone || phone.trim().length === 0) {
      if (required) {
        errors.push('Телефон обязателен')
      }
      return { isValid: errors.length === 0, errors, value: null }
    }

    // Простая валидация - разрешаем цифры, пробелы, +, -, (, )
    const phoneRegex = /^[\d\s\+\-\(\)]+$/
    if (!phoneRegex.test(phone.trim())) {
      errors.push('Некорректный формат телефона')
    }

    // Проверка минимальной длины
    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length < 10) {
      errors.push('Телефон должен содержать не менее 10 цифр')
    }

    return {
      isValid: errors.length === 0,
      errors,
      value: errors.length === 0 ? phone.trim() : null,
    }
  }
}

/**
 * Валидатор для проверки числа
 */
export class NumberValidator {
  /**
   * Проверить число
   * @param {number|string} value - Значение для проверки
   * @param {Object} options - Опции валидации
   * @param {number} options.min - Минимальное значение
   * @param {number} options.max - Максимальное значение
   * @param {boolean} options.required - Обязательное ли поле
   * @param {string} options.fieldName - Имя поля для сообщения
   * @returns {Object} Результат валидации
   */
  static validate(value, { min, max, required = false, fieldName = 'Значение' } = {}) {
    const errors = []

    if (value === undefined || value === null || value === '') {
      if (required) {
        errors.push(`${fieldName} обязательно`)
      }
      return { isValid: errors.length === 0, errors, value: null }
    }

    const numValue = Number(value)

    if (isNaN(numValue)) {
      errors.push(`${fieldName} должно быть числом`)
      return { isValid: false, errors, value: null }
    }

    if (min !== undefined && numValue < min) {
      errors.push(`${fieldName} должно быть не менее ${min}`)
    }

    if (max !== undefined && numValue > max) {
      errors.push(`${fieldName} должно быть не более ${max}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      value: errors.length === 0 ? numValue : null,
    }
  }
}

/**
 * Валидатор для проверки строки
 */
export class StringValidator {
  /**
   * Проверить строку
   * @param {string} value - Значение для проверки
   * @param {Object} options - Опции валидации
   * @param {number} options.minLength - Минимальная длина
   * @param {number} options.maxLength - Максимальная длина
   * @param {boolean} options.required - Обязательное ли поле
   * @param {string} options.fieldName - Имя поля для сообщения
   * @param {RegExp} options.pattern - Регулярное выражение для проверки
   * @returns {Object} Результат валидации
   */
  static validate(value, {
    minLength,
    maxLength,
    required = false,
    fieldName = 'Значение',
    pattern,
  } = {}) {
    const errors = []

    if (value === undefined || value === null || value === '') {
      if (required) {
        errors.push(`${fieldName} обязательно`)
      }
      return { isValid: errors.length === 0, errors, value: null }
    }

    const strValue = String(value)

    if (minLength !== undefined && strValue.length < minLength) {
      errors.push(`${fieldName} должно быть не менее ${minLength} символов`)
    }

    if (maxLength !== undefined && strValue.length > maxLength) {
      errors.push(`${fieldName} должно быть не более ${maxLength} символов`)
    }

    if (pattern && !pattern.test(strValue)) {
      errors.push(`${fieldName} не соответствует требуемому формату`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      value: errors.length === 0 ? strValue : null,
    }
  }
}

/**
 * Валидатор для проверки массива
 */
export class ArrayValidator {
  /**
   * Проверить массив
   * @param {Array} value - Массив для проверки
   * @param {Object} options - Опции валидации
   * @param {number} options.minLength - Минимальная длина
   * @param {number} options.maxLength - Максимальная длина
   * @param {boolean} options.required - Обязательное ли поле
   * @param {Function} options.itemValidator - Функция валидации каждого элемента
   * @param {string} options.fieldName - Имя поля для сообщения
   * @returns {Object} Результат валидации
   */
  static validate(value, {
    minLength,
    maxLength,
    required = false,
    itemValidator,
    fieldName = 'Массив',
  } = {}) {
    const errors = []

    if (!Array.isArray(value)) {
      errors.push(`${fieldName} должен быть массивом`)
      return { isValid: false, errors, value: null }
    }

    if (value.length === 0) {
      if (required) {
        errors.push(`${fieldName} не может быть пустым`)
      }
      return { isValid: !required, errors, value: required ? null : value }
    }

    if (minLength !== undefined && value.length < minLength) {
      errors.push(`${fieldName} должен содержать не менее ${minLength} элементов`)
    }

    if (maxLength !== undefined && value.length > maxLength) {
      errors.push(`${fieldName} должен содержать не более ${maxLength} элементов`)
    }

    // Валидация каждого элемента
    if (itemValidator && value.length > 0) {
      const itemErrors = []

      value.forEach((item, index) => {
        const result = itemValidator(item)
        if (!result.isValid) {
          itemErrors.push(`Элемент ${index + 1}: ${result.errors.join(', ')}`)
        }
      })

      if (itemErrors.length > 0) {
        errors.push(...itemErrors)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      value: errors.length === 0 ? value : null,
    }
  }
}

/**
 * Валидатор для проверки объекта
 */
export class ObjectValidator {
  /**
   * Проверить объект
   * @param {Object} value - Объект для проверки
   * @param {Object} schema - Схема валидации
   * @param {boolean} options.required - Обязательное ли поле
   * @returns {Object} Результат валидации
   */
  static validate(value, schema, { required = false } = {}) {
    const errors = []

    if (value === undefined || value === null) {
      if (required) {
        errors.push('Объект обязателен')
      }
      return { isValid: !required, errors, value: null }
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
      errors.push('Значение должно быть объектом')
      return { isValid: false, errors, value: null }
    }

    // Валидация полей согласно схеме
    for (const [field, rules] of Object.entries(schema)) {
      const fieldValue = value[field]
      const fieldErrors = []

      // Проверка обязательности
      if (rules.required && (fieldValue === undefined || fieldValue === null)) {
        fieldErrors.push(`Поле "${field}" обязательно`)
      }

      // Проверка типа
      if (fieldValue !== undefined && fieldValue !== null) {
        if (rules.type === 'string' && typeof fieldValue !== 'string') {
          fieldErrors.push(`Поле "${field}" должно быть строкой`)
        } else if (rules.type === 'number' && typeof fieldValue !== 'number') {
          fieldErrors.push(`Поле "${field}" должно быть числом`)
        } else if (rules.type === 'boolean' && typeof fieldValue !== 'boolean') {
          fieldErrors.push(`Поле "${field}" должно быть булевым`)
        } else if (rules.type === 'array' && !Array.isArray(fieldValue)) {
          fieldErrors.push(`Поле "${field}" должно быть массивом`)
        }
      }

      // Проверка минимальной/максимальной длины для строк
      if (typeof fieldValue === 'string') {
        if (rules.minLength !== undefined && fieldValue.length < rules.minLength) {
          fieldErrors.push(`Поле "${field}" должно быть не менее ${rules.minLength} символов`)
        }
        if (rules.maxLength !== undefined && fieldValue.length > rules.maxLength) {
          fieldErrors.push(`Поле "${field}" должно быть не более ${rules.maxLength} символов`)
        }
      }

      // Проверка минимального/максимального значения для чисел
      if (typeof fieldValue === 'number') {
        if (rules.min !== undefined && fieldValue < rules.min) {
          fieldErrors.push(`Поле "${field}" должно быть не менее ${rules.min}`)
        }
        if (rules.max !== undefined && fieldValue > rules.max) {
          fieldErrors.push(`Поле "${field}" должно быть не более ${rules.max}`)
        }
      }

      // Пользовательская валидация
      if (rules.validate && typeof rules.validate === 'function') {
        const customResult = rules.validate(fieldValue)
        if (!customResult.isValid) {
          fieldErrors.push(...customResult.errors)
        }
      }

      errors.push(...fieldErrors)
    }

    return {
      isValid: errors.length === 0,
      errors,
      value: errors.length === 0 ? value : null,
    }
  }
}
