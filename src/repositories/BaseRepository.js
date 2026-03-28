/**
 * Базовый репозиторий для работы с базой данных
 * Предоставляет основные CRUD операции для всех репозиториев
 */

import { prisma } from '@/lib/prisma.js'

/**
 * Базовый класс репозитория
 * @template T - Тип модели
 * @template {object} U - Prisma модель для запросов
 */
export class BaseRepository {
  /**
   * @param {string} modelName - Имя модели Prisma
   */
  constructor(modelName) {
    this.modelName = modelName
    this.prisma = prisma
    this.model = prisma[modelName]
  }

  /**
   * Найти все записи
   * @param {Object} options - Опции запроса
   * @param {Object} options.where - Условия фильтрации
   * @param {Object} options.include - Связанные модели
   * @param {Object} options.select - Выбираемые поля
   * @param {Object} options.orderBy - Сортировка
   * @param {number} options.skip - Пропустить N записей
   * @param {number} options.take - Взять N записей
   * @returns {Promise<Array>} Массив записей
   */
  async findAll({
    where = {},
    include = undefined,
    select = undefined,
    orderBy = undefined,
    skip = undefined,
    take = undefined,
  } = {}) {
    try {
      const records = await this.model.findMany({
        where,
        include,
        select,
        orderBy,
        skip,
        take,
      })
      return records
    } catch (error) {
      console.error(`[BaseRepository] Error in findAll for ${this.modelName}:`, error)
      throw new Error(`Не удалось получить записи: ${error.message}`)
    }
  }

  /**
   * Найти запись по ID
   * @param {string} id - ID записи
   * @param {Object} options - Опции запроса
   * @param {Object} options.include - Связанные модели
   * @param {Object} options.select - Выбираемые поля
   * @returns {Promise<Object|null>} Запись или null
   */
  async findById(id, { include = undefined, select = undefined } = {}) {
    try {
      const record = await this.model.findUnique({
        where: { id },
        include,
        select,
      })
      return record
    } catch (error) {
      console.error(`[BaseRepository] Error in findById for ${this.modelName}:`, error)
      throw new Error(`Не удалось найти запись по ID: ${error.message}`)
    }
  }

  /**
   * Найти одну запись по условиям
   * @param {Object} where - Условия поиска
   * @param {Object} options - Опции запроса
   * @returns {Promise<Object|null>} Запись или null
   */
  async findOne(where, { include = undefined, select = undefined } = {}) {
    try {
      const record = await this.model.findFirst({
        where,
        include,
        select,
      })
      return record
    } catch (error) {
      console.error(`[BaseRepository] Error in findOne for ${this.modelName}:`, error)
      throw new Error(`Не удалось найти запись: ${error.message}`)
    }
  }

  /**
   * Создать новую запись
   * @param {Object} data - Данные для создания
   * @returns {Promise<Object>} Созданная запись
   */
  async create(data) {
    try {
      const record = await this.model.create({
        data,
      })
      return record
    } catch (error) {
      console.error(`[BaseRepository] Error in create for ${this.modelName}:`, error)
      throw new Error(`Не удалось создать запись: ${error.message}`)
    }
  }

  /**
   * Обновить запись
   * @param {string} id - ID записи
   * @param {Object} data - Данные для обновления
   * @returns {Promise<Object>} Обновлённая запись
   */
  async update(id, data) {
    try {
      const record = await this.model.update({
        where: { id },
        data,
      })
      return record
    } catch (error) {
      console.error(`[BaseRepository] Error in update for ${this.modelName}:`, error)
      throw new Error(`Не удалось обновить запись: ${error.message}`)
    }
  }

  /**
   * Удалить запись
   * @param {string} id - ID записи
   * @returns {Promise<Object>} Удалённая запись
   */
  async delete(id) {
    try {
      const record = await this.model.delete({
        where: { id },
      })
      return record
    } catch (error) {
      console.error(`[BaseRepository] Error in delete for ${this.modelName}:`, error)
      throw new Error(`Не удалось удалить запись: ${error.message}`)
    }
  }

  /**
   * Посчитать количество записей
   * @param {Object} where - Условия фильтрации
   * @returns {Promise<number>} Количество записей
   */
  async count(where = {}) {
    try {
      const count = await this.model.count({ where })
      return count
    } catch (error) {
      console.error(`[BaseRepository] Error in count for ${this.modelName}:`, error)
      throw new Error(`Не удалось подсчитать записи: ${error.message}`)
    }
  }

  /**
   * Проверить существование записи
   * @param {Object} where - Условия поиска
   * @returns {Promise<boolean>} true если запись существует
   */
  async exists(where) {
    try {
      const count = await this.count(where)
      return count > 0
    } catch (error) {
      console.error(`[BaseRepository] Error in exists for ${this.modelName}:`, error)
      throw new Error(`Не удалось проверить существование записи: ${error.message}`)
    }
  }
}
