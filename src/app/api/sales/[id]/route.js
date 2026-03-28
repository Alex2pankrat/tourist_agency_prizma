/**
 * API endpoint для работы с продажей по ID
 * GET /api/sales/[id] - получить продажу
 * PUT /api/sales/[id] - обновить продажу
 * DELETE /api/sales/[id] - удалить продажу
 */

import { saleController } from '@/controllers/SaleController.js'
import { withLogger } from '@/middleware/logger.js'

/**
 * GET handler для получения продажи по ID
 * @param {Request} request - HTTP запрос
 * @param {Object} params - Параметры маршрута
 * @returns {Promise<Response>} Продажа в формате JSON
 */
export async function GET(request, { params }) {
  return withLogger(async () => {
    return await saleController.getById(request, params)
  }, request)
}

/**
 * PUT handler для обновления продажи
 * @param {Request} request - HTTP запрос
 * @param {Object} params - Параметры маршрута
 * @returns {Promise<Response>} Обновлённая продажа в формате JSON
 */
export async function PUT(request, { params }) {
  return withLogger(async () => {
    return await saleController.update(request, params)
  }, request)
}

/**
 * DELETE handler для удаления продажи
 * @param {Request} request - HTTP запрос
 * @param {Object} params - Параметры маршрута
 * @returns {Promise<Response>} Ответ об удалении
 */
export async function DELETE(request, { params }) {
  return withLogger(async () => {
    return await saleController.delete(request, params)
  }, request)
}
