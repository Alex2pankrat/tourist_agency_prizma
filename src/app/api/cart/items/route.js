/**
 * API endpoint для работы с элементами корзины
 * POST /api/cart/items - добавить товар в корзину
 * PUT /api/cart/items/[tourId] - обновить количество
 * DELETE /api/cart/items/[tourId] - удалить товар
 */

import { cartController } from '@/controllers/CartController.js'
import { withLogger } from '@/middleware/logger.js'

/**
 * POST handler для добавления товара в корзину
 * @param {Request} request - HTTP запрос
 * @returns {Promise<Response>} Обновлённая корзина в формате JSON
 */
export async function POST(request, { params }) {
  return withLogger(async () => {
    // Если есть params.tourId, это обновление конкретного элемента
    if (params?.tourId) {
      return await cartController.updateItem(request, params)
    }
    return await cartController.addItem(request)
  }, request)
}

/**
 * PUT handler для обновления количества товара
 * @param {Request} request - HTTP запрос
 * @param {Object} params - Параметры маршрута
 * @returns {Promise<Response>} Обновлённая корзина в формате JSON
 */
export async function PUT(request, { params }) {
  return withLogger(async () => {
    return await cartController.updateItem(request, params)
  }, request)
}

/**
 * DELETE handler для удаления товара из корзины
 * @param {Request} request - HTTP запрос
 * @param {Object} params - Параметры маршрута
 * @returns {Promise<Response>} Обновлённая корзина в формате JSON
 */
export async function DELETE(request, { params }) {
  return withLogger(async () => {
    return await cartController.removeItem(request, params)
  }, request)
}
