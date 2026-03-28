/**
 * Репозиторий для работы с турами
 * Предоставляет методы для CRUD операций и сложного поиска
 */

import { BaseRepository } from './BaseRepository.js'

/**
 * Класс TourRepository для работы с турами
 */
export class TourRepository extends BaseRepository {
  constructor() {
    super('tour')
  }

  /**
   * Получить все туры с категориями
   * @param {Object} options - Опции запроса
   * @returns {Promise<Array>} Массив туров с категориями
   */
  async findAllWithCategories(options = {}) {
    try {
      const tours = await this.findAll({
        ...options,
        include: {
          category: true,
        },
      })
      return tours
    } catch (error) {
      console.error('[TourRepository] Error in findAllWithCategories:', error)
      throw new Error(`Не удалось получить туры с категориями: ${error.message}`)
    }
  }

  /**
   * Найти туры по категории
   * @param {string} categoryId - ID категории
   * @param {Object} options - Дополнительные опции
   * @returns {Promise<Array>} Массив туров
   */
  async findByCategory(categoryId, options = {}) {
    try {
      const tours = await this.findAll({
        ...options,
        where: {
          ...options.where,
          categoryId,
        },
        include: {
          category: true,
        },
      })
      return tours
    } catch (error) {
      console.error('[TourRepository] Error in findByCategory:', error)
      throw new Error(`Не удалось найти туры по категории: ${error.message}`)
    }
  }

  /**
   * Поиск туров по названию (частичное совпадение)
   * @param {string} searchTerm - Поисковый запрос
   * @param {Object} options - Дополнительные опции
   * @returns {Promise<Array>} Массив найденных туров
   */
  async searchByName(searchTerm, options = {}) {
    try {
      const tours = await this.findAll({
        ...options,
        where: {
          ...options.where,
          title: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        include: {
          category: true,
        },
      })
      return tours
    } catch (error) {
      console.error('[TourRepository] Error in searchByName:', error)
      throw new Error(`Не удалось выполнить поиск туров: ${error.message}`)
    }
  }

  /**
   * Получить тур по ID с подробной информацией
   * @param {string} id - ID тура
   * @returns {Promise<Object|null>} Тур с деталями
   */
  async findByIdWithDetails(id) {
    try {
      const tour = await this.findById(id, {
        include: {
          category: true,
        },
      })
      return tour
    } catch (error) {
      console.error('[TourRepository] Error in findByIdWithDetails:', error)
      throw new Error(`Не удалось получить тур с деталями: ${error.message}`)
    }
  }

  /**
   * Найти туры с фильтрацией по цене и длительности
   * @param {Object} filters - Фильтры
   * @param {number} filters.minPrice - Минимальная цена
   * @param {number} filters.maxPrice - Максимальная цена
   * @param {number} filters.duration - Длительность
   * @param {Object} options - Дополнительные опции
   * @returns {Promise<Array>} Массив туров
   */
  async findByFilters({ minPrice, maxPrice, duration, ...otherFilters }, options = {}) {
    try {
      const where = {
        ...otherFilters,
      }

      // Фильтр по цене
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) {
          where.price.gte = Number(minPrice)
        }
        if (maxPrice !== undefined) {
          where.price.lte = Number(maxPrice)
        }
      }

      // Фильтр по длительности
      if (duration !== undefined) {
        where.duration = Number(duration)
      }

      const tours = await this.findAll({
        ...options,
        where,
        include: {
          category: true,
        },
      })
      return tours
    } catch (error) {
      console.error('[TourRepository] Error in findByFilters:', error)
      throw new Error(`Не удалось выполнить фильтрацию туров: ${error.message}`)
    }
  }
}

// Экспорт singleton экземпляра
export const tourRepository = new TourRepository()
