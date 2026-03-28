/**
 * Контроллер для управления турами
 * Обрабатывает HTTP запросы и координирует работу TourService
 */

import { tourService } from '../services/TourService.js'
import { BaseController } from './BaseController.js'

/**
 * Класс TourController для обработки HTTP запросов связанных с турами
 */
export class TourController extends BaseController {
  constructor() {
    super()
    this.tourService = tourService
  }

  /**
   * Получить все туры
   * GET /api/tours
   * @param {Request} request - HTTP запрос
   * @returns {NextResponse} JSON ответ со списком туров
   */
  async getAll(request) {
    try {
      const { searchParams } = new URL(request.url)

      // Получаем параметры запроса
      const limit = searchParams.get('limit')
      const category = searchParams.get('category')
      const duration = searchParams.get('duration')
      const minPrice = searchParams.get('minPrice')
      const maxPrice = searchParams.get('maxPrice')
      const search = searchParams.get('search')

      // Формируем опции запроса
      const options = {}

      if (limit) {
        options.take = parseInt(limit, 10)
      }

      // Если есть поиск по названию
      if (search) {
        const result = await this.tourService.searchTours(search)
        if (!result.success) {
          return this.errorResponse(result.message, result.errors, 400)
        }
        return this.successResponse(result.data, result.message)
      }

      // Если есть категория или фильтры по цене/длительности
      if (category || duration || minPrice || maxPrice) {
        const filters = {}

        if (category) {
          filters.categoryId = category
        }

        if (duration) {
          filters.duration = parseInt(duration, 10)
        }

        if (minPrice) {
          filters.minPrice = parseFloat(minPrice)
        }

        if (maxPrice) {
          filters.maxPrice = parseFloat(maxPrice)
        }

        const result = await this.tourService.getToursWithFilters(filters)
        if (!result.success) {
          return this.errorResponse(result.message, result.errors, 400)
        }
        return this.successResponse(result.data, result.message)
      }

      // Получаем все туры
      const result = await this.tourService.getAllTours(options)

      if (!result.success) {
        return this.handleError(new Error(result.message), 'getAll')
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'getAll')
    }
  }

  /**
   * Получить тур по ID
   * GET /api/tours/[id]
   * @param {Request} request - HTTP запрос
   * @param {Object} params - Параметры маршрута
   * @returns {NextResponse} JSON ответ с туром
   */
  async getById(request, params) {
    try {
      const id = await this.getPathParam(params, 'id')

      const result = await this.tourService.getTourById(id)

      if (!result.success) {
        const status = result.data?.code === 'TOUR_NOT_FOUND' ? 404 : 400
        return this.errorResponse(result.message, result.errors || [], status)
      }

      return this.successResponse(result.data)
    } catch (error) {
      return this.handleError(error, 'getById')
    }
  }

  /**
   * Создать новый тур
   * POST /api/tours
   * @param {Request} request - HTTP запрос
   * @returns {NextResponse} JSON ответ с созданным туром
   */
  async create(request) {
    try {
      const body = await this.parseBody(request)

      const result = await this.tourService.createTour(body)

      if (!result.success) {
        const status = result.message.includes('валидаци') ? 400 : 500
        return this.errorResponse(result.message, result.errors || [], status)
      }

      return this.successResponse(result.data, result.message, 201)
    } catch (error) {
      return this.handleError(error, 'create')
    }
  }

  /**
   * Обновить тур
   * PUT /api/tours/[id]
   * @param {Request} request - HTTP запрос
   * @param {Object} params - Параметры маршрута
   * @returns {NextResponse} JSON ответ с обновлённым туром
   */
  async update(request, params) {
    try {
      const id = await this.getPathParam(params, 'id')
      const body = await this.parseBody(request)

      const result = await this.tourService.updateTour(id, body)

      if (!result.success) {
        if (result.message.includes('не найден')) {
          return this.notFoundResponse('Тур не найден')
        }
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'update')
    }
  }

  /**
   * Удалить тур
   * DELETE /api/tours/[id]
   * @param {Request} request - HTTP запрос
   * @param {Object} params - Параметры маршрута
   * @returns {NextResponse} JSON ответ об удалении
   */
  async delete(request, params) {
    try {
      const id = await this.getPathParam(params, 'id')

      const result = await this.tourService.deleteTour(id)

      if (!result.success) {
        if (result.message.includes('не найден')) {
          return this.notFoundResponse('Тур не найден')
        }
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(null, result.message)
    } catch (error) {
      return this.handleError(error, 'delete')
    }
  }

  /**
   * Получить туры по категории
   * GET /api/tours/category/[categoryId]
   * @param {Request} request - HTTP запрос
   * @param {Object} params - Параметры маршрута
   * @returns {NextResponse} JSON ответ со списком туров
   */
  async getByCategory(request, params) {
    try {
      const categoryId = await this.getPathParam(params, 'categoryId')

      const result = await this.tourService.getToursByCategory(categoryId)

      if (!result.success) {
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'getByCategory')
    }
  }

  /**
   * Поиск туров
   * GET /api/tours/search
   * @param {Request} request - HTTP запрос
   * @returns {NextResponse} JSON ответ с результатами поиска
   */
  async search(request) {
    try {
      const searchTerm = this.getQueryParam(request, 'q')

      if (!searchTerm) {
        return this.errorResponse('Поисковый запрос не указан', [], 400)
      }

      const result = await this.tourService.searchTours(searchTerm)

      if (!result.success) {
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'search')
    }
  }

  /**
   * Проверить доступность тура
   * GET /api/tours/[id]/availability
   * @param {Request} request - HTTP запрос
   * @param {Object} params - Параметры маршрута
   * @returns {NextResponse} JSON ответ о доступности
   */
  async checkAvailability(request, params) {
    try {
      const id = await this.getPathParam(params, 'id')

      const result = await this.tourService.checkTourAvailability(id)

      if (!result.success) {
        if (result.message.includes('не найден')) {
          return this.notFoundResponse('Тур не найден')
        }
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'checkAvailability')
    }
  }
}

// Экспорт singleton экземпляра
export const tourController = new TourController()
