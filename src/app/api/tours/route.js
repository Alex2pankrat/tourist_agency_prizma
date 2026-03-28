/**
 * API endpoint для работы с турами
 * GET /api/tours - получить список туров
 * POST /api/tours - создать новый тур
 *
 * Query параметры для GET:
 * - category - фильтр по категории (ID)
 * - minPrice - минимальная цена
 * - maxPrice - максимальная цена
 * - duration - длительность в днях
 * - search - поиск по названию
 * - limit - количество на странице
 */

import { tourController } from '@/controllers/TourController.js'
import { withLogger } from '@/middleware/logger.js'

/**
 * GET handler для получения списка туров
 * @param {Request} request - HTTP запрос
 * @returns {Promise<Response>} Список туров в формате JSON
 */
export async function GET(request) {
  return withLogger(async () => {
    return await tourController.getAll(request)
  }, request)
}

/**
 * POST handler для создания нового тура
 * @param {Request} request - HTTP запрос
 * @returns {Promise<Response>} Созданный тур в формате JSON
 */
export async function POST(request) {
  return withLogger(async () => {
    return await tourController.create(request)
  }, request)
}
