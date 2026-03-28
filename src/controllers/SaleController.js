/**
 * Контроллер для управления продажами
 * Обрабатывает HTTP запросы и координирует работу SaleService
 */

import { saleService } from '../services/SaleService.js'
import { BaseController } from './BaseController.js'

/**
 * Класс SaleController для обработки HTTP запросов связанных с продажами
 */
export class SaleController extends BaseController {
  constructor() {
    super()
    this.saleService = saleService
  }

  /**
   * Получить все продажи
   * GET /api/sales
   * @param {Request} request - HTTP запрос
   * @returns {NextResponse} JSON ответ со списком продаж
   */
  async getAll(request) {
    try {
      const { searchParams } = new URL(request.url)

      // Получаем параметры запроса
      const limit = searchParams.get('limit')
      const status = searchParams.get('status')

      const options = {}

      if (limit) {
        options.take = parseInt(limit, 10)
      }

      // Если есть фильтр по статусу
      if (status) {
        const result = await this.saleService.getSalesByStatus(status, options)

        if (!result.success) {
          return this.errorResponse(result.message, result.errors || [], 400)
        }

        return this.successResponse(result.data, result.message)
      }

      // Получаем все продажи
      const result = await this.saleService.getAllSales(options)

      if (!result.success) {
        return this.handleError(new Error(result.message), 'getAll')
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'getAll')
    }
  }

  /**
   * Получить продажу по ID
   * GET /api/sales/[id]
   * @param {Request} request - HTTP запрос
   * @param {Object} params - Параметры маршрута
   * @returns {NextResponse} JSON ответ с продажей
   */
  async getById(request, params) {
    try {
      const id = await this.getPathParam(params, 'id')

      const result = await this.saleService.getSaleById(id)

      if (!result.success) {
        if (result.message.includes('не найдена')) {
          return this.notFoundResponse('Продажа не найдена')
        }
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data)
    } catch (error) {
      return this.handleError(error, 'getById')
    }
  }

  /**
   * Создать новую продажу
   * POST /api/sales
   * @param {Request} request - HTTP запрос
   * @returns {NextResponse} JSON ответ с созданной продажей
   */
  async create(request) {
    try {
      const body = await this.parseBody(request)

      const result = await this.saleService.createSale(body)

      if (!result.success) {
        if (result.message.includes('валидаци')) {
          return this.errorResponse(result.message, result.errors || [], 400)
        }
        if (result.message.includes('не найден')) {
          return this.notFoundResponse(result.message)
        }
        return this.errorResponse(result.message, result.errors || [], 500)
      }

      return this.successResponse(result.data, result.message, 201)
    } catch (error) {
      return this.handleError(error, 'create')
    }
  }

  /**
   * Обновить продажу
   * PUT /api/sales/[id]
   * @param {Request} request - HTTP запрос
   * @param {Object} params - Параметры маршрута
   * @returns {NextResponse} JSON ответ с обновлённой продажей
   */
  async update(request, params) {
    try {
      const id = await this.getPathParam(params, 'id')
      const body = await this.parseBody(request)

      const result = await this.saleService.updateSale(id, body)

      if (!result.success) {
        if (result.message.includes('не найдена')) {
          return this.notFoundResponse('Продажа не найдена')
        }
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'update')
    }
  }

  /**
   * Удалить продажу
   * DELETE /api/sales/[id]
   * @param {Request} request - HTTP запрос
   * @param {Object} params - Параметры маршрута
   * @returns {NextResponse} JSON ответ об удалении
   */
  async delete(request, params) {
    try {
      const id = await this.getPathParam(params, 'id')

      const result = await this.saleService.deleteSale(id)

      if (!result.success) {
        if (result.message.includes('не найдена')) {
          return this.notFoundResponse('Продажа не найдена')
        }
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(null, result.message)
    } catch (error) {
      return this.handleError(error, 'delete')
    }
  }

  /**
   * Обновить статус продажи
   * PATCH /api/sales/[id]/status
   * @param {Request} request - HTTP запрос
   * @param {Object} params - Параметры маршрута
   * @returns {NextResponse} JSON ответ с обновлённой продажей
   */
  async updateStatus(request, params) {
    try {
      const id = await this.getPathParam(params, 'id')
      const body = await this.parseBody(request)

      const { status } = body

      if (!status) {
        return this.errorResponse('Статус не указан', [], 400)
      }

      const result = await this.saleService.updateSaleStatus(id, status)

      if (!result.success) {
        if (result.message.includes('не найдена')) {
          return this.notFoundResponse('Продажа не найдена')
        }
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'updateStatus')
    }
  }

  /**
   * Получить продажи по статусу
   * GET /api/sales/status/[status]
   * @param {Request} request - HTTP запрос
   * @param {Object} params - Параметры маршрута
   * @returns {NextResponse} JSON ответ со списком продаж
   */
  async getByStatus(request, params) {
    try {
      const status = await this.getPathParam(params, 'status')

      const result = await this.saleService.getSalesByStatus(status)

      if (!result.success) {
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'getByStatus')
    }
  }

  /**
   * Получить общую сумму продаж
   * GET /api/sales/total
   * @param {Request} request - HTTP запрос
   * @returns {NextResponse} JSON ответ с суммой
   */
  async getTotal(request) {
    try {
      const { searchParams } = new URL(request.url)
      const status = searchParams.get('status')

      const filters = {}

      if (status) {
        filters.status = status
      }

      const result = await this.saleService.getTotalSalesAmount(filters)

      if (!result.success) {
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'getTotal')
    }
  }

  /**
   * Получить статистику продаж
   * GET /api/sales/statistics
   * @param {Request} request - HTTP запрос
   * @returns {NextResponse} JSON ответ со статистикой
   */
  async getStatistics(request) {
    try {
      const result = await this.saleService.getSalesStatistics()

      if (!result.success) {
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'getStatistics')
    }
  }
}

// Экспорт singleton экземпляра
export const saleController = new SaleController()
