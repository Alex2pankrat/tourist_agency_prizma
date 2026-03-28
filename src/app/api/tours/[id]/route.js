/**
 * API endpoint для работы с туром по ID
 * GET /api/tours/[id] - получить тур
 * PUT /api/tours/[id] - обновить тур
 * DELETE /api/tours/[id] - удалить тур
 */

import { tourController } from '@/controllers/TourController.js'
import { withLogger } from '@/middleware/logger.js'

/**
 * GET handler для получения тура по ID
 * @param {Request} request - HTTP запрос
 * @param {Object} params - Параметры маршрута
 * @returns {Promise<Response>} Тур в формате JSON
 */
export async function GET(request, { params }) {
  return withLogger(async () => {
    return await tourController.getById(request, params)
  }, request)
}

/**
 * PUT handler для обновления тура
 * @param {Request} request - HTTP запрос
 * @param {Object} params - Параметры маршрута
 * @returns {Promise<Response>} Обновлённый тур в формате JSON
 */
export async function PUT(request, { params }) {
  return withLogger(async () => {
    return await tourController.update(request, params)
  }, request)
}

/**
 * DELETE handler для удаления тура
 * @param {Request} request - HTTP запрос
 * @param {Object} params - Параметры маршрута
 * @returns {Promise<Response>} Ответ об удалении
 */
export async function DELETE(request, { params }) {
  return withLogger(async () => {
    return await tourController.delete(request, params)
  }, request)
}
