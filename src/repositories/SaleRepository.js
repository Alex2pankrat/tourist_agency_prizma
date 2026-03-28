/**
 * Репозиторий для работы с продажами
 * Предоставляет методы для CRUD операций и работы с элементами продаж
 */

import { BaseRepository } from './BaseRepository.js'

/**
 * Класс SaleRepository для работы с продажами
 */
export class SaleRepository extends BaseRepository {
  constructor() {
    super('sale')
  }

  /**
   * Получить все продажи с деталями
   * @param {Object} options - Опции запроса
   * @returns {Promise<Array>} Массив продаж с элементами и клиентами
   */
  async findAllWithDetails(options = {}) {
    try {
      const sales = await this.findAll({
        ...options,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              tour: {
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                  price: true,
                },
              },
            },
          },
        },
      })
      return sales
    } catch (error) {
      console.error('[SaleRepository] Error in findAllWithDetails:', error)
      throw new Error(`Не удалось получить продажи с деталями: ${error.message}`)
    }
  }

  /**
   * Получить продажу по ID с элементами
   * @param {string} id - ID продажи
   * @returns {Promise<Object|null>} Продажа с деталями
   */
  async findByIdWithItems(id) {
    try {
      const sale = await this.findById(id, {
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              tour: {
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                  price: true,
                },
              },
            },
          },
        },
      })
      return sale
    } catch (error) {
      console.error('[SaleRepository] Error in findByIdWithItems:', error)
      throw new Error(`Не удалось получить продажу с элементами: ${error.message}`)
    }
  }

  /**
   * Создать продажу с элементами
   * @param {Object} data - Данные для создания
   * @param {Object} data.client - Данные клиента
   * @param {Array} data.items - Элементы продажи
   * @returns {Promise<Object>} Созданная продажа
   */
  async createWithItems({ client, items, ...saleData }) {
    try {
      // Создаем продажу в транзакции
      const sale = await this.prisma.$transaction(async (tx) => {
        // Создаем или находим клиента
        let clientId

        // Проверяем существует ли клиент с таким email
        const existingClient = await tx.client.findFirst({
          where: { email: client.email },
        })

        if (existingClient) {
          clientId = existingClient.id
        } else {
          // Создаем нового клиента
          const newClient = await tx.client.create({
            data: {
              name: client.name,
              email: client.email,
              phone: client.phone,
            },
          })
          clientId = newClient.id
        }

        // Создаем продажу
        const newSale = await tx.sale.create({
          data: {
            ...saleData,
            clientId,
            items: {
              create: items.map((item) => ({
                tourId: item.tourId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            items: {
              include: {
                tour: {
                  select: {
                    id: true,
                    title: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        })

        return newSale
      })

      return sale
    } catch (error) {
      console.error('[SaleRepository] Error in createWithItems:', error)
      throw new Error(`Не удалось создать продажу: ${error.message}`)
    }
  }

  /**
   * Обновить продажу с элементами
   * @param {string} id - ID продажи
   * @param {Object} data - Данные для обновления
   * @param {Array} data.items - Новые элементы продажи (опционально)
   * @returns {Promise<Object>} Обновлённая продажа
   */
  async updateWithItems(id, { items, ...saleData }) {
    try {
      const updatedSale = await this.prisma.$transaction(async (tx) => {
        // Обновляем основные данные продажи
        const sale = await tx.sale.update({
          where: { id },
          data: saleData,
        })

        // Если предоставлены новые элементы, обновляем их
        if (items && Array.isArray(items)) {
          // Удаляем старые элементы
          await tx.saleItem.deleteMany({
            where: { saleId: id },
          })

          // Создаем новые элементы
          await tx.saleItem.createMany({
            data: items.map((item) => ({
              saleId: id,
              tourId: item.tourId,
              quantity: item.quantity,
              price: item.price,
            })),
          })
        }

        // Возвращаем обновлённую продажу с деталями
        return await tx.sale.findUnique({
          where: { id },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            items: {
              include: {
                tour: {
                  select: {
                    id: true,
                    title: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        })
      })

      return updatedSale
    } catch (error) {
      console.error('[SaleRepository] Error in updateWithItems:', error)
      throw new Error(`Не удалось обновить продажу: ${error.message}`)
    }
  }

  /**
   * Получить продажи по статусу
   * @param {string} status - Статус продажи
   * @param {Object} options - Дополнительные опции
   * @returns {Promise<Array>} Массив продаж
   */
  async findByStatus(status, options = {}) {
    try {
      const sales = await this.findAll({
        ...options,
        where: {
          ...options.where,
          status,
        },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          items: {
            include: {
              tour: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      })
      return sales
    } catch (error) {
      console.error('[SaleRepository] Error in findByStatus:', error)
      throw new Error(`Не удалось получить продажи по статусу: ${error.message}`)
    }
  }

  /**
   * Получить общую сумму продаж
   * @param {Object} where - Условия фильтрации
   * @returns {Promise<number>} Общая сумма
   */
  async getTotalAmount(where = {}) {
    try {
      const sales = await this.findAll({
        where,
        select: {
          totalAmount: true,
        },
      })
      return sales.reduce((total, sale) => total + Number(sale.totalAmount), 0)
    } catch (error) {
      console.error('[SaleRepository] Error in getTotalAmount:', error)
      throw new Error(`Не удалось подсчитать общую сумму: ${error.message}`)
    }
  }
}

// Экспорт singleton экземпляра
export const saleRepository = new SaleRepository()
