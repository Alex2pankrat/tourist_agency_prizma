/**
 * API endpoint для работы с корзиной
 * GET /api/cart - получить содержимое корзины
 * DELETE /api/cart/clear - очистить корзину
 */

import { cartController } from '@/controllers/CartController.js'
import { withLogger } from '@/middleware/logger.js'

/**
 * GET handler для получения содержимого корзины
 * @param {Request} request - HTTP запрос
 * @returns {Promise<Response>} Корзина в формате JSON
 */
export async function GET(request) {
  return withLogger(async () => {
    return await cartController.get(request)
  }, request)
}

/**
 * DELETE handler для очистки корзины
 * @param {Request} request - HTTP запрос
 * @returns {Promise<Response>} Очищенная корзина в формате JSON
 */
export async function DELETE(request) {
  return withLogger(async () => {
    return await cartController.clear(request)
  }, request)
}
