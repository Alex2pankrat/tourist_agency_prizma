/**
 * Репозиторий для работы с клиентами
 * Предоставляет методы для CRUD операций и поиска клиентов
 */

import { BaseRepository } from './BaseRepository.js'

/**
 * Класс ClientRepository для работы с клиентами
 */
export class ClientRepository extends BaseRepository {
  constructor() {
    super('client')
  }

  /**
   * Найти или создать клиента
   * @param {Object} clientData - Данные клиента
   * @param {string} clientData.email - Email клиента
   * @param {string} clientData.name - Имя клиента
   * @param {string} clientData.phone - Телефон клиента
   * @returns {Promise<Object>} Найденный или созданный клиент
   */
  async findOrCreate({ email, name, phone }) {
    try {
      // Пытаемся найти клиента по email
      let client = await this.findOne({ email })

      if (client) {
        // Клиент найден, обновляем информацию если предоставлены новые данные
        if (name || phone) {
          client = await this.update(client.id, {
            name: name || client.name,
            phone: phone || client.phone,
          })
        }
        return client
      }

      // Клиент не найден, создаём нового
      client = await this.create({
        name,
        email,
        phone,
      })

      return client
    } catch (error) {
      console.error('[ClientRepository] Error in findOrCreate:', error)
      throw new Error(`Не удалось найти или создать клиента: ${error.message}`)
    }
  }

  /**
   * Найти клиента по email
   * @param {string} email - Email клиента
   * @param {Object} options - Дополнительные опции
   * @returns {Promise<Object|null>} Клиент или null
   */
  async findByEmail(email, options = {}) {
    try {
      const client = await this.findOne(
        { email },
        {
          include: options.include,
          select: options.select,
        }
      )
      return client
    } catch (error) {
      console.error('[ClientRepository] Error in findByEmail:', error)
      throw new Error(`Не удалось найти клиента по email: ${error.message}`)
    }
  }

  /**
   * Найти клиента по телефону
   * @param {string} phone - Телефон клиента
   * @param {Object} options - Дополнительные опции
   * @returns {Promise<Object|null>} Клиент или null
   */
  async findByPhone(phone, options = {}) {
    try {
      const client = await this.findOne(
        { phone },
        {
          include: options.include,
          select: options.select,
        }
      )
      return client
    } catch (error) {
      console.error('[ClientRepository] Error in findByPhone:', error)
      throw new Error(`Не удалось найти клиента по телефону: ${error.message}`)
    }
  }

  /**
   * Получить клиента с историей продаж
   * @param {string} id - ID клиента
   * @returns {Promise<Object|null>} Клиент с продажами
   */
  async findByIdWithSales(id) {
    try {
      const client = await this.findById(id, {
        include: {
          sales: {
            include: {
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
          },
        },
      })
      return client
    } catch (error) {
      console.error('[ClientRepository] Error in findByIdWithSales:', error)
      throw new Error(`Не удалось получить клиента с историей продаж: ${error.message}`)
    }
  }

  /**
   * Обновить данные клиента
   * @param {string} id - ID клиента
   * @param {Object} data - Данные для обновления
   * @param {string} data.name - Новое имя
   * @param {string} data.email - Новый email
   * @param {string} data.phone - Новый телефон
   * @returns {Promise<Object>} Обновлённый клиент
   */
  async updateClient(id, { name, email, phone }) {
    try {
      // Проверяем, не занят ли email другим клиентом
      if (email) {
        const existingClient = await this.findByEmail(email)
        if (existingClient && existingClient.id !== id) {
          throw new Error('Клиент с таким email уже существует')
        }
      }

      const updateData = {}
      if (name !== undefined) updateData.name = name
      if (email !== undefined) updateData.email = email
      if (phone !== undefined) updateData.phone = phone

      const client = await this.update(id, updateData)
      return client
    } catch (error) {
      console.error('[ClientRepository] Error in updateClient:', error)
      throw new Error(`Не удалось обновить клиента: ${error.message}`)
    }
  }

  /**
   * Получить всех клиентов с продажами
   * @param {Object} options - Дополнительные опции
   * @returns {Promise<Array>} Массив клиентов
   */
  async findAllWithSales(options = {}) {
    try {
      const clients = await this.findAll({
        ...options,
        include: {
          ...options.include,
          sales: {
            select: {
              id: true,
              createdAt: true,
              totalAmount: true,
              status: true,
            },
          },
        },
      })
      return clients
    } catch (error) {
      console.error('[ClientRepository] Error in findAllWithSales:', error)
      throw new Error(`Не удалось получить клиентов с продажами: ${error.message}`)
    }
  }
}

// Экспорт singleton экземпляра
export const clientRepository = new ClientRepository()
