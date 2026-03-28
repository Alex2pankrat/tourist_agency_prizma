/**
 * Базовый контроллер для обработки HTTP запросов
 * Предоставляет базовые методы для форматирования ответов и обработки ошибок
 */

import { NextResponse } from 'next/server'

/**
 * Класс BaseController - базовый класс для всех контроллеров
 */
export class BaseController {
  /**
   * Создать успешный JSON ответ
   * @param {any} data - Данные ответа
   * @param {string} message - Сообщение
   * @param {number} status - HTTP статус
   * @returns {NextResponse} JSON ответ
   */
  successResponse(data, message = 'Успешно', status = 200) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status }
    )
  }

  /**
   * Создать ответ с ошибкой
   * @param {string} message - Сообщение об ошибке
   * @param {Array} errors - Детали ошибок
   * @param {number} status - HTTP статус
   * @returns {NextResponse} JSON ответ
   */
  errorResponse(message, errors = [], status = 400) {
    return NextResponse.json(
      {
        success: false,
        message,
        errors,
      },
      { status }
    )
  }

  /**
   * Обработать ошибку сервиса
   * @param {Error} error - Ошибка
   * @param {string} context - Контекст операции
   * @returns {NextResponse} JSON ответ с ошибкой
   */
  handleError(error, context = 'Controller') {
    console.error(`[Controller:${context}] Error:`, error.message)

    // Определяем тип ошибки и выбираем статус
    if (error.name === 'ValidationError') {
      return this.errorResponse(error.message, error.errors || [], 400)
    }

    if (error.name === 'BusinessError') {
      const status = this.getBusinessErrorStatus(error.code)
      return this.errorResponse(error.message, [], status)
    }

    if (error.name === 'ServiceError') {
      return this.errorResponse(error.message, [], 500)
    }

    // Неизвестная ошибка - 500
    return this.errorResponse('Внутренняя ошибка сервера', [], 500)
  }

  /**
   * Получить HTTP статус для бизнес-ошибки
   * @param {string} code - Код ошибки
   * @returns {number} HTTP статус
   */
  getBusinessErrorStatus(code) {
    const statusMap = {
      TOUR_NOT_FOUND: 404,
      SALE_NOT_FOUND: 404,
      CLIENT_NOT_FOUND: 404,
      ITEM_NOT_FOUND: 404,
      INVALID_DATA: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      CONFLICT: 409,
    }

    return statusMap[code] || 400
  }

  /**
   * Создать ответ "Не найдено"
   * @param {string} message - Сообщение
   * @returns {NextResponse} JSON ответ
   */
  notFoundResponse(message = 'Ресурс не найден') {
    return this.errorResponse(message, [], 404)
  }

  /**
   * Создать ответ "Неавторизован"
   * @param {string} message - Сообщение
   * @returns {NextResponse} JSON ответ
   */
  unauthorizedResponse(message = 'Необходима авторизация') {
    return this.errorResponse(message, [], 401)
  }

  /**
   * Создать ответ "Запрещено"
   * @param {string} message - Сообщение
   * @returns {NextResponse} JSON ответ
   */
  forbiddenResponse(message = 'Доступ запрещён') {
    return this.errorResponse(message, [], 403)
  }

  /**
   * Создать ответ "Пустое содержимое"
   * @param {string} message - Сообщение
   * @returns {NextResponse} JSON ответ
   */
  noContentResponse(message = 'Содержимое отсутствует') {
    return this.successResponse([], message, 200)
  }

  /**
   * Парсить JSON тело запроса
   * @param {Request} request - HTTP запрос
   * @returns {Promise<Object>} Тело запроса
   */
  async parseBody(request) {
    try {
      const body = await request.json()
      return body
    } catch (error) {
      throw new Error('Не удалось распарсить JSON тело запроса')
    }
  }

  /**
   * Получить параметры из URL
   * @param {Object} params - Параметры маршрута
   * @param {string} paramName - Имя параметра
   * @returns {string} Значение параметра
   */
  async getPathParam(params, paramName) {
    // В Next.js 15 params нужно awaited
    const resolvedParams = await params
    const value = resolvedParams?.[paramName]

    if (!value) {
      throw new Error(`Параметр "${paramName}" не указан`)
    }

    return value
  }

  /**
   * Получить query параметры
   * @param {Request} request - HTTP запрос
   * @param {string} paramName - Имя параметра
   * @param {any} defaultValue - Значение по умолчанию
   * @returns {any} Значение параметра
   */
  getQueryParam(request, paramName, defaultValue = undefined) {
    const { searchParams } = new URL(request.url)
    const value = searchParams.get(paramName)

    return value !== null ? value : defaultValue
  }

  /**
   * Получить все query параметры
   * @param {Request} request - HTTP запрос
   * @returns {Object} Объект с параметрами
   */
  getAllQueryParams(request) {
    const { searchParams } = new URL(request.url)
    const params = {}

    for (const [key, value] of searchParams.entries()) {
      params[key] = value
    }

    return params
  }
}
