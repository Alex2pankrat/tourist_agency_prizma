/**
 * Middleware для централизованной обработки ошибок
 * Перехватывает и обрабатывает ошибки в API routes
 */

import { NextResponse } from 'next/server'

/**
 * Типы ошибок и соответствующие им HTTP статусы
 */
const ERROR_STATUS_MAP = {
  // Ошибки валидации (400)
  ValidationError: 400,
  ValidationException: 400,

  // Ошибки аутентификации (401)
  UnauthorizedError: 401,
  AuthenticationError: 401,

  // Ошибки авторизации (403)
  ForbiddenError: 403,
  AuthorizationError: 403,

  // Ошибки не найдено (404)
  NotFoundError: 404,
  ResourceNotFoundError: 404,

  // Ошибки конфликта (409)
  ConflictError: 409,
  DuplicateError: 409,

  // Ошибки бизнес-логики (422)
  BusinessError: 422,
  BusinessLogicError: 422,

  // Ошибки сервиса (500)
  ServiceError: 500,
  InternalError: 500,
}

/**
 * Обработчик ошибок для API routes
 * Оборачивает handler функцию и перехватывает ошибки
 * 
 * @param {Function} handler - Handler функция API route
 * @param {Object} options - Опции обработчика
 * @param {boolean} options.logErrors - Логировать ошибки
 * @param {boolean} options.includeStack - Включать стек в ответ (только для dev)
 * @returns {Function} Обёрнутая handler функция
 */
export function withErrorHandler(handler, options = {}) {
  const {
    logErrors = true,
    includeStack = process.env.NODE_ENV === 'development',
  } = options

  return async function errorHandlerWrapper(request, context) {
    try {
      // Вызываем оригинальный handler
      const result = await handler(request, context)
      return result
    } catch (error) {
      // Логируем ошибку
      if (logErrors) {
        logError(error, request)
      }

      // Определяем HTTP статус
      const status = getErrorStatus(error)

      // Формируем ответ
      const response = formatErrorResponse(error, status, includeStack)

      return NextResponse.json(response, { status })
    }
  }
}

/**
 * Получить HTTP статус для ошибки
 * @param {Error} error - Объект ошибки
 * @returns {number} HTTP статус
 */
function getErrorStatus(error) {
  // Проверяем имя ошибки
  if (error.name && ERROR_STATUS_MAP[error.name]) {
    return ERROR_STATUS_MAP[error.name]
  }

  // Проверяем код ошибки
  if (error.code && ERROR_STATUS_MAP[error.code]) {
    return ERROR_STATUS_MAP[error.code]
  }

  // Проверяем кастомное свойство status
  if (error.status && typeof error.status === 'number') {
    return error.status
  }

  // Проверяем сообщение на наличие ключевых слов
  const message = error.message?.toLowerCase() || ''

  if (message.includes('не найден') || message.includes('not found')) {
    return 404
  }

  if (message.includes('валидаци') || message.includes('invalid')) {
    return 400
  }

  if (message.includes('авторизаци') || message.includes('unauthorized')) {
    return 401
  }

  if (message.includes('запрещено') || message.includes('forbidden')) {
    return 403
  }

  // По умолчанию - 500 Internal Server Error
  return 500
}

/**
 * Форматировать ответ с ошибкой
 * @param {Error} error - Объект ошибки
 * @param {number} status - HTTP статус
 * @param {boolean} includeStack - Включать стек
 * @returns {Object} Объект ответа
 */
function formatErrorResponse(error, status, includeStack) {
  const response = {
    success: false,
    message: error.message || 'Произошла неизвестная ошибка',
  }

  // Добавляем код ошибки если есть
  if (error.code) {
    response.code = error.code
  }

  // Добавляем детали ошибки если есть
  if (error.details) {
    response.details = error.details
  }

  // Добавляем ошибки валидации если есть
  if (error.errors && Array.isArray(error.errors)) {
    response.errors = error.errors
  }

  // Добавляем стек только для development
  if (includeStack && error.stack) {
    response.stack = error.stack
  }

  // Добавляем метку времени
  response.timestamp = new Date().toISOString()

  return response
}

/**
 * Логировать ошибку
 * @param {Error} error - Объект ошибки
 * @param {Request} request - HTTP запрос
 */
function logError(error, request) {
  const timestamp = new Date().toISOString()
  const method = request?.method || 'UNKNOWN'
  const url = request?.url || 'UNKNOWN'

  console.error('\n=== ERROR LOG ===')
  console.error(`[${timestamp}] ${error.name}: ${error.message}`)
  console.error(`Method: ${method}`)
  console.error(`URL: ${url}`)
  console.error('Stack:', error.stack)
  console.error('==============\n')
}

/**
 * Создать кастомную ошибку
 * @param {string} message - Сообщение об ошибке
 * @param {Object} options - Опции ошибки
 * @param {string} options.name - Имя ошибки
 * @param {string} options.code - Код ошибки
 * @param {number} options.status - HTTP статус
 * @param {Array} options.errors - Детали ошибок
 * @returns {Error} Объект ошибки
 */
export function createError(message, options = {}) {
  const {
    name = 'Error',
    code = null,
    status = 500,
    errors = [],
    details = null,
  } = options

  const error = new Error(message)
  error.name = name
  error.code = code
  error.status = status
  error.errors = errors
  error.details = details

  return error
}

/**
 * Создать ошибку валидации
 * @param {string} message - Сообщение
 * @param {Array} errors - Детали ошибок
 * @returns {Error} Объект ошибки
 */
export function createValidationError(message = 'Ошибка валидации', errors = []) {
  return createError(message, {
    name: 'ValidationError',
    code: 'VALIDATION_ERROR',
    status: 400,
    errors,
  })
}

/**
 * Создать ошибку не найдено
 * @param {string} resource - Название ресурса
 * @returns {Error} Объект ошибки
 */
export function createNotFoundError(resource = 'Ресурс') {
  return createError(`${resource} не найден`, {
    name: 'NotFoundError',
    code: 'NOT_FOUND',
    status: 404,
  })
}

/**
 * Создать ошибку авторизации
 * @param {string} message - Сообщение
 * @returns {Error} Объект ошибки
 */
export function createUnauthorizedError(message = 'Необходима авторизация') {
  return createError(message, {
    name: 'UnauthorizedError',
    code: 'UNAUTHORIZED',
    status: 401,
  })
}

/**
 * Создать ошибку бизнес-логики
 * @param {string} message - Сообщение
 * @param {string} code - Код ошибки
 * @returns {Error} Объект ошибки
 */
export function createBusinessError(message, code = 'BUSINESS_ERROR') {
  return createError(message, {
    name: 'BusinessError',
    code,
    status: 422,
  })
}

/**
 * Middleware для логирования запросов
 * @param {Request} request - HTTP запрос
 * @param {Function} handler - Handler функция
 * @returns {Promise<NextResponse>} Ответ
 */
export async function withRequestLogging(handler, request, context) {
  const timestamp = new Date().toISOString()
  const method = request.method
  const url = request.url

  console.log(`[${timestamp}] ${method} ${url}`)

  const startTime = Date.now()

  try {
    const response = await handler(request, context)
    const duration = Date.now() - startTime

    console.log(
      `[${timestamp}] ${method} ${url} - ${response.status} (${duration}ms)`
    )

    return response
  } catch (error) {
    const duration = Date.now() - startTime
    console.log(
      `[${timestamp}] ${method} ${url} - ERROR (${duration}ms): ${error.message}`
    )
    throw error
  }
}
