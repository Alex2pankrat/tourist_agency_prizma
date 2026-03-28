/**
 * API endpoint для работы с продажами
 * GET /api/sales - получить список продаж
 * POST /api/sales - создать новую продажу
 *
 * Query параметры для GET:
 * - status - фильтр по статусу
 * - limit - количество на странице
 */

import { saleController } from '@/controllers/SaleController.js'
import { withLogger } from '@/middleware/logger.js'

/**
 * GET handler для получения списка продаж
 * @param {Request} request - HTTP запрос
 * @returns {Promise<Response>} Список продаж в формате JSON
 */
export async function GET(request) {
  return withLogger(async () => {
    return await saleController.getAll(request)
  }, request)
}

/**
 * POST handler для создания новой продажи
 * @param {Request} request - HTTP запрос
 * @returns {Promise<Response>} Созданная продажа в формате JSON
 */
export async function POST(request) {
  return withLogger(async () => {
    return await saleController.create(request)
  }, request)
}
