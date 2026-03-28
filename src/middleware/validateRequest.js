/**
 * Middleware для валидации запросов
 * Проверяет входящие данные согласно схеме валидации
 */

import { NextResponse } from 'next/server'

/**
 * Создать middleware для валидации запроса
 * @param {Object} schema - Схема валидации
 * @param {Object} schema.params - Валидация параметров маршрута
 * @param {Object} schema.query - Валидация query параметров
 * @param {Object} schema.body - Валидация тела запроса
 * @returns {Function} Middleware функция
 */
export function createValidator(schema = {}) {
  return async function validateRequest(request, context) {
    const errors = []
    const validatedData = {}

    // Валидация параметров маршрута
    if (schema.params && context?.params) {
      const paramsValidation = validateObject(context.params, schema.params, 'params')
      if (!paramsValidation.isValid) {
        errors.push(...paramsValidation.errors)
      } else {
        validatedData.params = paramsValidation.value
      }
    }

    // Валидация query параметров
    if (schema.query) {
      const { searchParams } = new URL(request.url)
      const query = {}

      for (const [key, value] of searchParams.entries()) {
        query[key] = value
      }

      const queryValidation = validateObject(query, schema.query, 'query')
      if (!queryValidation.isValid) {
        errors.push(...queryValidation.errors)
      } else {
        validatedData.query = queryValidation.value
      }
    }

    // Валидация тела запроса
    if (schema.body) {
      try {
        const body = await request.json()
        const bodyValidation = validateObject(body, schema.body, 'body')
        if (!bodyValidation.isValid) {
          errors.push(...bodyValidation.errors)
        } else {
          validatedData.body = bodyValidation.value
        }
      } catch (error) {
        if (schema.body.required !== false) {
          errors.push('Не удалось распарсить JSON тело запроса')
        }
      }
    }

    // Если есть ошибки, возвращаем ответ с ошибкой
    if (errors.length > 0) {
      return {
        isValid: false,
        response: NextResponse.json(
          {
            success: false,
            message: 'Ошибка валидации',
            errors,
          },
          { status: 400 }
        ),
      }
    }

    // Возвращаем успешный результат с валидированными данными
    return {
      isValid: true,
      data: validatedData,
      response: null,
    }
  }
}

/**
 * Валидировать объект согласно схеме
 * @param {Object} data - Данные для валидации
 * @param {Object} schema - Схема валидации
 * @param {string} dataType - Тип данных для сообщений об ошибках
 * @returns {Object} Результат валидации
 */
function validateObject(data, schema, dataType = 'data') {
  const errors = []
  const validatedData = {}

  for (const [field, rules] of Object.entries(schema)) {
    const value = data?.[field]
    const fieldErrors = validateField(value, rules, field, dataType)
    
    if (fieldErrors.length > 0) {
      errors.push(...fieldErrors)
    } else if (value !== undefined) {
      validatedData[field] = value
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    value: errors.length === 0 ? validatedData : null,
  }
}

/**
 * Валидировать поле
 * @param {any} value - Значение поля
 * @param {Object} rules - Правила валидации
 * @param {string} field - Имя поля
 * @param {string} dataType - Тип данных для сообщений
 * @returns {Array} Массив ошибок
 */
function validateField(value, rules, field, dataType) {
  const errors = []
  const location = dataType === 'body' ? field : `${dataType}.${field}`

  // Проверка обязательности
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push(`Поле "${location}" обязательно`)
    return errors
  }

  // Если поле не обязательное и не предоставлено, пропускаем
  if (value === undefined || value === null || value === '') {
    return errors
  }

  // Проверка типа
  if (rules.type) {
    const typeError = validateType(value, rules.type, location)
    if (typeError) {
      errors.push(typeError)
      return errors // Если тип неверный, дальнейшая валидация не имеет смысла
    }
  }

  // Проверка для строк
  if (typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      errors.push(`Поле "${location}" должно быть не менее ${rules.minLength} символов`)
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      errors.push(`Поле "${location}" должно быть не более ${rules.maxLength} символов`)
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(`Поле "${location}" не соответствует требуемому формату`)
    }
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`Поле "${location}" должно быть одним из: ${rules.enum.join(', ')}`)
    }
  }

  // Проверка для чисел
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`Поле "${location}" должно быть не менее ${rules.min}`)
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`Поле "${location}" должно быть не более ${rules.max}`)
    }
  }

  // Проверка для массивов
  if (Array.isArray(value)) {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      errors.push(`Поле "${location}" должно содержать не менее ${rules.minLength} элементов`)
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      errors.push(`Поле "${location}" должно содержать не более ${rules.maxLength} элементов`)
    }
    if (rules.items && rules.items.validate) {
      value.forEach((item, index) => {
        const itemValidation = rules.items.validate(item)
        if (!itemValidation.isValid) {
          errors.push(`${location}[${index}]: ${itemValidation.errors.join(', ')}`)
        }
      })
    }
  }

  // Пользовательская валидация
  if (rules.validate && typeof rules.validate === 'function') {
    const customValidation = rules.validate(value)
    if (!customValidation.isValid) {
      errors.push(...customValidation.errors.map(err => `${location}: ${err}`))
    }
  }

  return errors
}

/**
 * Проверить тип значения
 * @param {any} value - Значение
 * @param {string} expectedType - Ожидаемый тип
 * @param {string} field - Имя поля
 * @returns {string|null} Сообщение об ошибке или null
 */
function validateType(value, expectedType, field) {
  const actualType = Array.isArray(value) ? 'array' : typeof value

  const typeMap = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    array: 'array',
    object: 'object',
    integer: (v) => typeof v === 'number' && Number.isInteger(v),
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    date: (v) => !isNaN(Date.parse(v)),
  }

  const validator = typeMap[expectedType]

  if (typeof validator === 'string') {
    if (actualType !== validator) {
      return `Поле "${field}" должно быть типа ${expectedType}`
    }
  } else if (typeof validator === 'function') {
    if (!validator(value)) {
      return `Поле "${field}" должно быть типа ${expectedType}`
    }
  }

  return null
}

/**
 * Middleware для валидации JSON тела
 * @param {Request} request - HTTP запрос
 * @returns {Promise<Object>} Распарсенное тело запроса
 */
export async function validateJsonBody(request) {
  try {
    const contentType = request.headers.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      return {
        isValid: false,
        response: NextResponse.json(
          {
            success: false,
            message: 'Content-Type должен быть application/json',
          },
          { status: 400 }
        ),
      }
    }

    const body = await request.json()
    return {
      isValid: true,
      data: body,
      response: null,
    }
  } catch (error) {
    return {
      isValid: false,
      response: NextResponse.json(
        {
          success: false,
          message: 'Неверный формат JSON',
        },
        { status: 400 }
      ),
    }
  }
}
