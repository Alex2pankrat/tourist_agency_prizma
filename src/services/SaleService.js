/**
 * Сервис для управления продажами
 * Содержит бизнес-логику для операций с продажами и транзакциями
 */

import { saleRepository } from '../repositories/SaleRepository.js'
import { tourRepository } from '../repositories/TourRepository.js'
import { BaseService, BusinessError, ValidationError } from './BaseService.js'

/**
 * Класс SaleService для бизнес-логики продаж
 */
export class SaleService extends BaseService {
  constructor() {
    super()
    this.saleRepository = saleRepository
    this.tourRepository = tourRepository
  }

  /**
   * Получить все продажи
   * @param {Object} options - Опции запроса
   * @returns {Promise<Object>} Результат с продажами
   */
  async getAllSales(options = {}) {
    try {
      const sales = await this.saleRepository.findAllWithDetails(options)
      return this.successResponse(sales, 'Продажи успешно получены')
    } catch (error) {
      return this.handleError(error, 'getAllSales')
    }
  }

  /**
   * Получить продажу по ID
   * @param {string} id - ID продажи
   * @returns {Promise<Object>} Результат с продажей
   */
  async getSaleById(id) {
    try {
      if (!id) {
        throw new ValidationError('ID продажи не указан')
      }

      const sale = await this.saleRepository.findByIdWithItems(id)

      if (!sale) {
        throw new BusinessError('Продажа не найдена', 'SALE_NOT_FOUND')
      }

      return this.successResponse(sale, 'Продажа успешно найдена')
    } catch (error) {
      return this.handleError(error, 'getSaleById')
    }
  }

  /**
   * Создать новую продажу
   * @param {Object} saleData - Данные продажи
   * @param {Object} saleData.client - Данные клиента
   * @param {Array} saleData.items - Элементы продажи
   * @returns {Promise<Object>} Результат с созданной продажей
   */
  async createSale({ client, items, ...saleData }) {
    try {
      // Валидация клиента
      const clientValidation = this.validateRequiredFields(client, ['name', 'email'])
      if (!clientValidation.isValid) {
        throw new ValidationError('Ошибка валидации клиента', clientValidation.errors)
      }

      // Валидация email
      const emailValidation = this.validateEmail(client.email)
      if (!emailValidation.isValid) {
        throw new ValidationError('Ошибка валидации email', emailValidation.errors)
      }

      // Валидация элементов продажи
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new ValidationError('Список товаров не указан или пуст')
      }

      // Валидация и проверка каждого элемента
      const validatedItems = []
      let totalAmount = 0

      for (const item of items) {
        // Проверяем существование тура
        const tour = await this.tourRepository.findById(item.tourId)
        if (!tour) {
          throw new BusinessError(`Тур не найден: ${item.tourId}`, 'TOUR_NOT_FOUND')
        }

        // Валидация количества
        const quantityValidation = this.validateNumber(item.quantity, {
          min: 1,
          fieldName: 'Количество',
        })

        if (!quantityValidation.isValid) {
          throw new ValidationError('Ошибка валидации количества', quantityValidation.errors)
        }

        // Используем актуальную цену из тура если не предоставлена
        const price = item.price !== undefined ? Number(item.price) : Number(tour.price)

        validatedItems.push({
          tourId: item.tourId,
          quantity: Number(item.quantity),
          price,
        })

        totalAmount += price * Number(item.quantity)
      }

      // Создаём продажу
      const sale = await this.saleRepository.createWithItems({
        client,
        items: validatedItems,
        totalAmount,
        status: saleData.status || 'pending',
      })

      return this.successResponse(sale, 'Продажа успешно оформлена')
    } catch (error) {
      return this.handleError(error, 'createSale')
    }
  }

  /**
   * Обновить продажу
   * @param {string} id - ID продажи
   * @param {Object} saleData - Данные для обновления
   * @returns {Promise<Object>} Результат с обновлённой продажей
   */
  async updateSale(id, saleData) {
    try {
      if (!id) {
        throw new ValidationError('ID продажи не указан')
      }

      // Проверяем существование продажи
      const existingSale = await this.saleRepository.findById(id)

      if (!existingSale) {
        throw new BusinessError('Продажа не найдена', 'SALE_NOT_FOUND')
      }

      // Если предоставлены новые элементы, валидируем их
      let validatedItems = null
      let totalAmount = existingSale.totalAmount

      if (saleData.items) {
        if (!Array.isArray(saleData.items) || saleData.items.length === 0) {
          throw new ValidationError('Список товаров не может быть пустым')
        }

        validatedItems = []
        totalAmount = 0

        for (const item of saleData.items) {
          // Проверяем существование тура
          const tour = await this.tourRepository.findById(item.tourId)
          if (!tour) {
            throw new BusinessError(`Тур не найден: ${item.tourId}`, 'TOUR_NOT_FOUND')
          }

          // Валидация количества
          const quantityValidation = this.validateNumber(item.quantity, {
            min: 1,
            fieldName: 'Количество',
          })

          if (!quantityValidation.isValid) {
            throw new ValidationError('Ошибка валидации количества', quantityValidation.errors)
          }

          const price = item.price !== undefined ? Number(item.price) : Number(tour.price)

          validatedItems.push({
            tourId: item.tourId,
            quantity: Number(item.quantity),
            price,
          })

          totalAmount += price * Number(item.quantity)
        }
      }

      // Обновляем продажу
      const updateData = {}

      if (saleData.status !== undefined) {
        updateData.status = saleData.status
      }

      if (validatedItems !== null) {
        updateData.totalAmount = totalAmount
      }

      const sale = await this.saleRepository.updateWithItems(id, {
        ...updateData,
        items: validatedItems,
      })

      return this.successResponse(sale, 'Продажа успешно обновлена')
    } catch (error) {
      return this.handleError(error, 'updateSale')
    }
  }

  /**
   * Удалить продажу
   * @param {string} id - ID продажи
   * @returns {Promise<Object>} Результат удаления
   */
  async deleteSale(id) {
    try {
      if (!id) {
        throw new ValidationError('ID продажи не указан')
      }

      // Проверяем существование продажи
      const sale = await this.saleRepository.findById(id)

      if (!sale) {
        throw new BusinessError('Продажа не найдена', 'SALE_NOT_FOUND')
      }

      // Удаляем продажу
      await this.saleRepository.delete(id)

      return this.successResponse(null, 'Продажа успешно удалена')
    } catch (error) {
      return this.handleError(error, 'deleteSale')
    }
  }

  /**
   * Получить продажи по статусу
   * @param {string} status - Статус продажи
   * @param {Object} options - Дополнительные опции
   * @returns {Promise<Object>} Результат с продажами
   */
  async getSalesByStatus(status, options = {}) {
    try {
      if (!status) {
        throw new ValidationError('Статус не указан')
      }

      const sales = await this.saleRepository.findByStatus(status, options)
      return this.successResponse(sales, `Продажи со статусом "${status}" успешно получены`)
    } catch (error) {
      return this.handleError(error, 'getSalesByStatus')
    }
  }

  /**
   * Обновить статус продажи
   * @param {string} id - ID продажи
   * @param {string} status - Новый статус
   * @returns {Promise<Object>} Результат с обновлённой продажей
   */
  async updateSaleStatus(id, status) {
    try {
      if (!id) {
        throw new ValidationError('ID продажи не указан')
      }

      if (!status) {
        throw new ValidationError('Статус не указан')
      }

      // Проверяем допустимые статусы
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        throw new ValidationError(
          `Недопустимый статус. Допустимые значения: ${validStatuses.join(', ')}`
        )
      }

      // Проверяем существование продажи
      const existingSale = await this.saleRepository.findById(id)

      if (!existingSale) {
        throw new BusinessError('Продажа не найдена', 'SALE_NOT_FOUND')
      }

      // Обновляем статус
      const sale = await this.saleRepository.update(id, { status })

      return this.successResponse(sale, `Статус продажи успешно изменён на "${status}"`)
    } catch (error) {
      return this.handleError(error, 'updateSaleStatus')
    }
  }

  /**
   * Получить общую сумму продаж
   * @param {Object} filters - Фильтры
   * @returns {Promise<Object>} Результат с суммой
   */
  async getTotalSalesAmount(filters = {}) {
    try {
      const totalAmount = await this.saleRepository.getTotalAmount(filters)
      return this.successResponse(
        { totalAmount },
        `Общая сумма продаж: ${totalAmount.toLocaleString('ru-RU')} ₽`
      )
    } catch (error) {
      return this.handleError(error, 'getTotalSalesAmount')
    }
  }

  /**
   * Получить статистику продаж
   * @returns {Promise<Object>} Результат со статистикой
   */
  async getSalesStatistics() {
    try {
      // Получаем все продажи
      const allSales = await this.saleRepository.findAllWithDetails()

      // Считаем статистику
      const stats = {
        total: allSales.length,
        byStatus: {
          pending: allSales.filter((s) => s.status === 'pending').length,
          confirmed: allSales.filter((s) => s.status === 'confirmed').length,
          completed: allSales.filter((s) => s.status === 'completed').length,
          cancelled: allSales.filter((s) => s.status === 'cancelled').length,
        },
        totalRevenue: allSales
          .filter((s) => s.status === 'completed')
          .reduce((sum, s) => sum + Number(s.totalAmount), 0),
      }

      return this.successResponse(stats, 'Статистика продаж успешно получена')
    } catch (error) {
      return this.handleError(error, 'getSalesStatistics')
    }
  }
}

// Экспорт singleton экземпляра
export const saleService = new SaleService()
