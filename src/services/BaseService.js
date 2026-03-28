/**
 * Базовый сервис для общей бизнес-логики
 * Предоставляет базовые методы валидации и обработки ошибок
 */

/**
 * Класс BaseService - базовый класс для всех сервисов
 */
export class BaseService {
  /**
   * Базовая валидация данных
   * @param {Object} data - Данные для валидации
   * @param {Array} requiredFields - Обязательные поля
   * @returns {Object} Результат валидации
   */
  validateRequiredFields(data, requiredFields) {
    const errors = []

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        errors.push(`Поле "${field}" является обязательным`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Валидация числа
   * @param {number} value - Значение для проверки
   * @param {Object} options - Опции валидации
   * @param {number} options.min - Минимальное значение
   * @param {number} options.max - Максимальное значение
   * @param {string} fieldName - Имя поля для сообщения об ошибке
   * @returns {Object} Результат валидации
   */
  validateNumber(value, { min, max, fieldName = 'Значение' } = {}) {
    const errors = []

    if (value === undefined || value === null) {
      errors.push(`${fieldName} не указано`)
      return { isValid: false, errors }
    }

    const numValue = Number(value)

    if (isNaN(numValue)) {
      errors.push(`${fieldName} должно быть числом`)
      return { isValid: false, errors }
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
    }
  }

  /**
   * Валидация email
   * @param {string} email - Email для проверки
   * @returns {Object} Результат валидации
   */
  validateEmail(email) {
    const errors = []

    if (!email) {
      errors.push('Email не указан')
      return { isValid: false, errors }
    }

    // Простая проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('Некорректный формат email')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Валидация строки
   * @param {string} value - Значение для проверки
   * @param {Object} options - Опции валидации
   * @param {number} options.minLength - Минимальная длина
   * @param {number} options.maxLength - Максимальная длина
   * @param {string} fieldName - Имя поля для сообщения об ошибке
   * @returns {Object} Результат валидации
   */
  validateString(value, { minLength, maxLength, fieldName = 'Значение' } = {}) {
    const errors = []

    if (value === undefined || value === null) {
      errors.push(`${fieldName} не указано`)
      return { isValid: false, errors }
    }

    const strValue = String(value)

    if (minLength !== undefined && strValue.length < minLength) {
      errors.push(`${fieldName} должно быть не менее ${minLength} символов`)
    }

    if (maxLength !== undefined && strValue.length > maxLength) {
      errors.push(`${fieldName} должно быть не более ${maxLength} символов`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Обработать ошибку сервиса
   * @param {Error} error - Ошибка
   * @param {string} context - Контекст возникновения ошибки
   * @throws {Error} Перебрасывает ошибку с дополнительным контекстом
   */
  handleError(error, context) {
    console.error(`[Service:${context}] Error:`, error.message)

    // Если это уже ошибка сервиса, просто перебрасываем её
    if (error instanceof ServiceError) {
      throw error
    }

    // Иначе оборачиваем в ServiceError
    throw new ServiceError(error.message, context)
  }

  /**
   * Создать успешный ответ
   * @param {any} data - Данные ответа
   * @param {string} message - Сообщение
   * @returns {Object} Объект ответа
   */
  successResponse(data, message = 'Операция выполнена успешно') {
    return {
      success: true,
      message,
      data,
    }
  }

  /**
   * Создать ответ с ошибкой
   * @param {string} message - Сообщение об ошибке
   * @param {Array} errors - Детали ошибок
   * @returns {Object} Объект ответа
   */
  errorResponse(message, errors = []) {
    return {
      success: false,
      message,
      errors,
    }
  }
}

/**
 * Класс ошибки сервиса
 */
export class ServiceError extends Error {
  /**
   * @param {string} message - Сообщение об ошибке
   * @param {string} context - Контекст возникновения ошибки
   */
  constructor(message, context = 'BaseService') {
    super(message)
    this.name = 'ServiceError'
    this.context = context
  }
}

/**
 * Класс ошибки валидации
 */
export class ValidationError extends ServiceError {
  /**
   * @param {string} message - Сообщение об ошибке
   * @param {Array} errors - Детали ошибок валидации
   */
  constructor(message, errors = []) {
    super(message, 'Validation')
    this.name = 'ValidationError'
    this.errors = errors
  }
}

/**
 * Класс ошибки бизнес-логики
 */
export class BusinessError extends ServiceError {
  /**
   * @param {string} message - Сообщение об ошибке
   * @param {string} code - Код ошибки
   */
  constructor(message, code = 'BUSINESS_ERROR') {
    super(message, 'Business')
    this.name = 'BusinessError'
    this.code = code
  }
}
