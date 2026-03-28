/**
 * Middleware для логирования запросов и ответов
 * Предоставляет детальную информацию о выполнении запросов
 */

import { NextResponse } from 'next/server'

/**
 * Конфигурация логгера
 */
const loggerConfig = {
  enabled: true,
  logLevel: 'info', // 'debug', 'info', 'warn', 'error'
  includeBody: process.env.NODE_ENV === 'development',
  includeQueryParams: true,
  includeResponseTime: true,
  includeUserAgent: true,
}

/**
 * Уровни логирования
 */
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * Middleware для логирования HTTP запросов
 * 
 * @param {Request} request - HTTP запрос
 * @param {Function} handler - Handler функция
 * @returns {Promise<NextResponse>} Ответ
 */
export async function withLogger(handler, request, context) {
  if (!loggerConfig.enabled) {
    return handler(request, context)
  }

  const startTime = Date.now()
  const timestamp = new Date().toISOString()
  const requestId = generateRequestId()

  // Логируем входящий запрос
  logRequest(request, requestId, timestamp)

  try {
    // Вызываем handler
    const response = await handler(request, context)

    // Логируем ответ
    logResponse(response, requestId, startTime, timestamp)

    return response
  } catch (error) {
    // Логируем ошибку
    logError(error, requestId, startTime, timestamp)
    throw error
  }
}

/**
 * Сгенерировать уникальный ID запроса
 * @returns {string} Request ID
 */
function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Логировать входящий запрос
 * 
 * @param {Request} request - HTTP запрос
 * @param {string} requestId - ID запроса
 * @param {string} timestamp - Временная метка
 */
function logRequest(request, requestId, timestamp) {
  if (!shouldLog('info')) return

  const method = request.method
  const url = new URL(request.url)
  const path = url.pathname
  const queryParams = loggerConfig.includeQueryParams ? Object.fromEntries(url.searchParams) : {}

  const logData = {
    timestamp,
    requestId,
    type: 'REQUEST',
    method,
    path,
    ...(queryParams && Object.keys(queryParams).length > 0 ? { queryParams } : {}),
  }

  // Добавляем User-Agent если включено
  if (loggerConfig.includeUserAgent) {
    logData.userAgent = request.headers.get('user-agent') || 'Unknown'
  }

  // Логируем тело запроса для методов POST, PUT, PATCH
  if (loggerConfig.includeBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
    logData.body = 'Смотрите отдельный лог тела запроса'
  }

  console.log(formatLog(logData))
}

/**
 * Логировать ответ
 * 
 * @param {NextResponse} response - HTTP ответ
 * @param {string} requestId - ID запроса
 * @param {number} startTime - Время начала
 * @param {string} timestamp - Временная метка
 */
function logResponse(response, requestId, startTime, timestamp) {
  if (!shouldLog('info')) return

  const duration = Date.now() - startTime
  const status = response.status

  const logData = {
    timestamp,
    requestId,
    type: 'RESPONSE',
    status,
    duration: loggerConfig.includeResponseTime ? `${duration}ms` : undefined,
  }

  console.log(formatLog(logData))

  // Логируем медленные запросы
  if (duration > 1000) {
    logWarn(`Медленный запрос: ${duration}ms`, { requestId, duration })
  }
}

/**
 * Логировать ошибку
 * 
 * @param {Error} error - Объект ошибки
 * @param {string} requestId - ID запроса
 * @param {number} startTime - Время начала
 * @param {string} timestamp - Временная метка
 */
function logError(error, requestId, startTime, timestamp) {
  if (!shouldLog('error')) return

  const duration = Date.now() - startTime

  const logData = {
    timestamp,
    requestId,
    type: 'ERROR',
    duration: loggerConfig.includeResponseTime ? `${duration}ms` : undefined,
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  }

  console.error(formatLog(logData, 'error'))
}

/**
 * Логировать предупреждение
 * 
 * @param {string} message - Сообщение
 * @param {Object} data - Дополнительные данные
 */
function logWarn(message, data = {}) {
  if (!shouldLog('warn')) return

  const logData = {
    timestamp: new Date().toISOString(),
    type: 'WARN',
    message,
    ...data,
  }

  console.warn(formatLog(logData, 'warn'))
}

/**
 * Проверить, нужно ли логировать на данном уровне
 * 
 * @param {string} level - Уровень логирования
 * @returns {boolean} Нужно ли логировать
 */
function shouldLog(level) {
  const configLevel = LOG_LEVELS[loggerConfig.logLevel]
  const checkLevel = LOG_LEVELS[level]

  return configLevel !== undefined && checkLevel !== undefined && checkLevel >= configLevel
}

/**
 * Форматировать лог для вывода
 * 
 * @param {Object} logData - Данные лога
 * @param {string} type - Тип лога (info, warn, error)
 * @returns {string} Форматированный лог
 */
function formatLog(logData, type = 'info') {
  const parts = []

  // Временная метка
  if (logData.timestamp) {
    parts.push(`[${logData.timestamp}]`)
  }

  // Request ID
  if (logData.requestId) {
    parts.push(`{${logData.requestId}}`)
  }

  // Тип
  if (logData.type) {
    parts.push(`[${logData.type}]`)
  }

  // Метод и путь для запросов
  if (logData.method && logData.path) {
    parts.push(`${logData.method} ${logData.path}`)
  }

  // Статус для ответов
  if (logData.status) {
    parts.push(`-> ${logData.status}`)
  }

  // Длительность
  if (logData.duration) {
    parts.push(`(${logData.duration})`)
  }

  // Сообщение для ошибок и предупреждений
  if (logData.message) {
    parts.push(logData.message)
  }

  // Имя ошибки
  if (logData.name) {
    parts.push(`(${logData.name})`)
  }

  // Дополнительные данные
  const extraData = { ...logData }
  delete extraData.timestamp
  delete extraData.requestId
  delete extraData.type
  delete extraData.method
  delete extraData.path
  delete extraData.status
  delete extraData.duration
  delete extraData.message
  delete extraData.name

  let logString = parts.join(' ')

  if (Object.keys(extraData).length > 0) {
    logString += ' ' + JSON.stringify(extraData)
  }

  return logString
}

/**
 * Создать логгер для конкретного контекста
 * 
 * @param {string} context - Контекст логгера (например, имя контроллера)
 * @returns {Object} Объект логгера
 */
export function createLogger(context) {
  return {
    /**
     * Логировать сообщение уровня debug
     * @param {string} message - Сообщение
     * @param {Object} data - Дополнительные данные
     */
    debug(message, data = {}) {
      if (shouldLog('debug')) {
        console.log(`[${new Date().toISOString()}] [${context}] [DEBUG] ${message}`, data)
      }
    },

    /**
     * Логировать сообщение уровня info
     * @param {string} message - Сообщение
     * @param {Object} data - Дополнительные данные
     */
    info(message, data = {}) {
      if (shouldLog('info')) {
        console.log(`[${new Date().toISOString()}] [${context}] [INFO] ${message}`, data)
      }
    },

    /**
     * Логировать сообщение уровня warn
     * @param {string} message - Сообщение
     * @param {Object} data - Дополнительные данные
     */
    warn(message, data = {}) {
      if (shouldLog('warn')) {
        console.warn(`[${new Date().toISOString()}] [${context}] [WARN] ${message}`, data)
      }
    },

    /**
     * Логировать сообщение уровня error
     * @param {string} message - Сообщение
     * @param {Error|Object} error - Ошибка или данные
     */
    error(message, error = {}) {
      if (shouldLog('error')) {
        console.error(`[${new Date().toISOString()}] [${context}] [ERROR] ${message}`, error)
      }
    },
  }
}

/**
 * Middleware для подсчёта метрик запросов
 * 
 * @param {Function} handler - Handler функция
 * @param {Request} request - HTTP запрос
 * @returns {Promise<NextResponse>} Ответ
 */
export async function withMetrics(handler, request, context) {
  const startTime = performance.now()

  try {
    const response = await handler(request, context)

    const duration = performance.now() - startTime

    // Логируем метрики
    if (shouldLog('info')) {
      console.log(
        `[METRICS] ${request.method} ${request.url} - Duration: ${duration.toFixed(2)}ms - Status: ${response.status}`
      )
    }

    return response
  } catch (error) {
    const duration = performance.now() - startTime

    console.error(
      `[METRICS] ${request.method} ${request.url} - Duration: ${duration.toFixed(2)}ms - Error: ${error.message}`
    )

    throw error
  }
}

export default withLogger
