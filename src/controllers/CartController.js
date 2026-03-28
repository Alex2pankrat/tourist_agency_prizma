/**
 * Контроллер для управления корзиной
 * Обрабатывает HTTP запросы и координирует работу CartService
 */

import { cartService } from '../services/CartService.js'
import { BaseController } from './BaseController.js'

/**
 * Класс CartController для обработки HTTP запросов связанных с корзиной
 */
export class CartController extends BaseController {
  constructor() {
    super()
    this.cartService = cartService
  }

  /**
   * Получить содержимое корзины
   * GET /api/cart
   * @param {Request} request - HTTP запрос
   * @returns {NextResponse} JSON ответ с корзиной
   */
  async get(request) {
    try {
      // Получаем элементы корзины из query параметров или тела запроса
      // В реальной реализации корзина хранится в сессии или localStorage клиента
      const { searchParams } = new URL(request.url)
      const cartData = searchParams.get('items')

      let cartItems = []

      if (cartData) {
        try {
          cartItems = JSON.parse(cartData)
        } catch (error) {
          return this.errorResponse('Неверный формат данных корзины', [], 400)
        }
      }

      const result = await this.cartService.getCartContents(cartItems)

      if (!result.success) {
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'get')
    }
  }

  /**
   * Добавить товар в корзину
   * POST /api/cart/items
   * @param {Request} request - HTTP запрос
   * @returns {NextResponse} JSON ответ с обновлённой корзиной
   */
  async addItem(request) {
    try {
      const body = await this.parseBody(request)

      const { cartItems = [], tourId, tourData, quantity = 1 } = body

      // Если tourData не предоставлен, это ошибка
      if (!tourId || !tourData) {
        return this.errorResponse('Необходимо указать tourId и tourData', [], 400)
      }

      const result = await this.cartService.addToCart(cartItems, tourId, tourData, quantity)

      if (!result.success) {
        if (result.message.includes('не найден')) {
          return this.notFoundResponse('Тур не найден')
        }
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'addItem')
    }
  }

  /**
   * Обновить количество товара в корзине
   * PUT /api/cart/items/[tourId]
   * @param {Request} request - HTTP запрос
   * @param {Object} params - Параметры маршрута
   * @returns {NextResponse} JSON ответ с обновлённой корзиной
   */
  async updateItem(request, params) {
    try {
      const tourId = await this.getPathParam(params, 'tourId')
      const body = await this.parseBody(request)

      const { cartItems = [], quantity } = body

      if (quantity === undefined) {
        return this.errorResponse('Необходимо указать количество', [], 400)
      }

      const result = await this.cartService.updateQuantity(cartItems, tourId, quantity)

      if (!result.success) {
        if (result.message.includes('не найден')) {
          return this.notFoundResponse('Товар не найден в корзине')
        }
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'updateItem')
    }
  }

  /**
   * Удалить товар из корзины
   * DELETE /api/cart/items/[tourId]
   * @param {Request} request - HTTP запрос
   * @param {Object} params - Параметры маршрута
   * @returns {NextResponse} JSON ответ с обновлённой корзиной
   */
  async removeItem(request, params) {
    try {
      const tourId = await this.getPathParam(params, 'tourId')

      // Получаем текущие элементы корзины
      const { searchParams } = new URL(request.url)
      const cartData = searchParams.get('items')

      let cartItems = []

      if (cartData) {
        try {
          cartItems = JSON.parse(cartData)
        } catch (error) {
          return this.errorResponse('Неверный формат данных корзины', [], 400)
        }
      }

      const result = await this.cartService.removeFromCart(cartItems, tourId)

      if (!result.success) {
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'removeItem')
    }
  }

  /**
   * Очистить корзину
   * DELETE /api/cart/clear
   * @param {Request} request - HTTP запрос
   * @returns {NextResponse} JSON ответ с очищенной корзиной
   */
  async clear(request) {
    try {
      const { searchParams } = new URL(request.url)
      const cartData = searchParams.get('items')

      let cartItems = []

      if (cartData) {
        try {
          cartItems = JSON.parse(cartData)
        } catch (error) {
          return this.errorResponse('Неверный формат данных корзины', [], 400)
        }
      }

      const result = await this.cartService.clearCart(cartItems)

      if (!result.success) {
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'clear')
    }
  }

  /**
   * Проверить доступность товаров в корзине
   * GET /api/cart/check-availability
   * @param {Request} request - HTTP запрос
   * @returns {NextResponse} JSON ответ с проверкой доступности
   */
  async checkAvailability(request) {
    try {
      const { searchParams } = new URL(request.url)
      const cartData = searchParams.get('items')

      let cartItems = []

      if (cartData) {
        try {
          cartItems = JSON.parse(cartData)
        } catch (error) {
          return this.errorResponse('Неверный формат данных корзины', [], 400)
        }
      }

      const result = await this.cartService.checkCartAvailability(cartItems)

      if (!result.success) {
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'checkAvailability')
    }
  }

  /**
   * Подсчитать общую сумму корзины
   * GET /api/cart/total
   * @param {Request} request - HTTP запрос
   * @returns {NextResponse} JSON ответ с суммой
   */
  async getTotal(request) {
    try {
      const { searchParams } = new URL(request.url)
      const cartData = searchParams.get('items')

      let cartItems = []

      if (cartData) {
        try {
          cartItems = JSON.parse(cartData)
        } catch (error) {
          return this.errorResponse('Неверный формат данных корзины', [], 400)
        }
      }

      const result = await this.cartService.calculateTotal(cartItems)

      if (!result.success) {
        return this.errorResponse(result.message, result.errors || [], 400)
      }

      return this.successResponse(result.data, result.message)
    } catch (error) {
      return this.handleError(error, 'getTotal')
    }
  }
}

// Экспорт singleton экземпляра
export const cartController = new CartController()
