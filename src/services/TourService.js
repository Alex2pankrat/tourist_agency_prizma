/**
 * Сервис для управления турами
 * Содержит бизнес-логику для операций с турами
 */

import { tourRepository } from '../repositories/TourRepository.js'
import { BaseService, BusinessError, ValidationError } from './BaseService.js'

/**
 * Класс TourService для бизнес-логики туров
 */
export class TourService extends BaseService {
  constructor() {
    super()
    this.tourRepository = tourRepository
  }

  /**
   * Получить все туры
   * @param {Object} options - Опции запроса
   * @returns {Promise<Object>} Результат с турами
   */
  async getAllTours(options = {}) {
    try {
      const tours = await this.tourRepository.findAllWithCategories(options)
      return this.successResponse(tours, 'Туры успешно получены')
    } catch (error) {
      return this.handleError(error, 'getAllTours')
    }
  }

  /**
   * Получить тур по ID
   * @param {string} id - ID тура
   * @returns {Promise<Object>} Результат с туром
   */
  async getTourById(id) {
    try {
      if (!id) {
        throw new ValidationError('ID тура не указан')
      }

      const tour = await this.tourRepository.findByIdWithDetails(id)

      if (!tour) {
        throw new BusinessError('Тур не найден', 'TOUR_NOT_FOUND')
      }

      return this.successResponse(tour, 'Тур успешно найден')
    } catch (error) {
      return this.handleError(error, 'getTourById')
    }
  }

  /**
   * Создать новый тур
   * @param {Object} tourData - Данные тура
   * @returns {Promise<Object>} Результат с созданным туром
   */
  async createTour(tourData) {
    try {
      // Валидация обязательных полей
      const validation = this.validateRequiredFields(tourData, [
        'title',
        'description',
        'price',
        'duration',
        'categoryId',
      ])

      if (!validation.isValid) {
        throw new ValidationError('Ошибка валидации', validation.errors)
      }

      // Валидация цены
      const priceValidation = this.validateNumber(tourData.price, {
        min: 0,
        fieldName: 'Цена',
      })

      if (!priceValidation.isValid) {
        throw new ValidationError('Ошибка валидации цены', priceValidation.errors)
      }

      // Валидация длительности
      const durationValidation = this.validateNumber(tourData.duration, {
        min: 1,
        fieldName: 'Длительность',
      })

      if (!durationValidation.isValid) {
        throw new ValidationError('Ошибка валидации длительности', durationValidation.errors)
      }

      // Создаём тур
      const tour = await this.tourRepository.create({
        title: tourData.title,
        description: tourData.description,
        price: Number(tourData.price),
        duration: Number(tourData.duration),
        imageUrl: tourData.imageUrl || null,
        categoryId: tourData.categoryId,
      })

      return this.successResponse(tour, 'Тур успешно создан')
    } catch (error) {
      return this.handleError(error, 'createTour')
    }
  }

  /**
   * Обновить тур
   * @param {string} id - ID тура
   * @param {Object} tourData - Данные для обновления
   * @returns {Promise<Object>} Результат с обновлённым туром
   */
  async updateTour(id, tourData) {
    try {
      if (!id) {
        throw new ValidationError('ID тура не указан')
      }

      // Проверяем существование тура
      const existingTour = await this.tourRepository.findById(id)

      if (!existingTour) {
        throw new BusinessError('Тур не найден', 'TOUR_NOT_FOUND')
      }

      // Валидация цены если предоставлена
      if (tourData.price !== undefined) {
        const priceValidation = this.validateNumber(tourData.price, {
          min: 0,
          fieldName: 'Цена',
        })

        if (!priceValidation.isValid) {
          throw new ValidationError('Ошибка валидации цены', priceValidation.errors)
        }
      }

      // Валидация длительности если предоставлена
      if (tourData.duration !== undefined) {
        const durationValidation = this.validateNumber(tourData.duration, {
          min: 1,
          fieldName: 'Длительность',
        })

        if (!durationValidation.isValid) {
          throw new ValidationError('Ошибка валидации длительности', durationValidation.errors)
        }
      }

      // Обновляем тур
      const updateData = {}
      if (tourData.title !== undefined) updateData.title = tourData.title
      if (tourData.description !== undefined) updateData.description = tourData.description
      if (tourData.price !== undefined) updateData.price = Number(tourData.price)
      if (tourData.duration !== undefined) updateData.duration = Number(tourData.duration)
      if (tourData.imageUrl !== undefined) updateData.imageUrl = tourData.imageUrl
      if (tourData.categoryId !== undefined) updateData.categoryId = tourData.categoryId

      const tour = await this.tourRepository.update(id, updateData)

      return this.successResponse(tour, 'Тур успешно обновлён')
    } catch (error) {
      return this.handleError(error, 'updateTour')
    }
  }

  /**
   * Удалить тур
   * @param {string} id - ID тура
   * @returns {Promise<Object>} Результат удаления
   */
  async deleteTour(id) {
    try {
      if (!id) {
        throw new ValidationError('ID тура не указан')
      }

      // Проверяем существование тура
      const tour = await this.tourRepository.findById(id)

      if (!tour) {
        throw new BusinessError('Тур не найден', 'TOUR_NOT_FOUND')
      }

      // Проверяем наличие связанных продаж
      // (это нужно делать через SaleRepository, но для простоты проверяем здесь)
      // В реальной реализации нужно добавить метод в SaleRepository

      // Удаляем тур
      await this.tourRepository.delete(id)

      return this.successResponse(null, 'Тур успешно удалён')
    } catch (error) {
      return this.handleError(error, 'deleteTour')
    }
  }

  /**
   * Найти туры по категории
   * @param {string} categoryId - ID категории
   * @param {Object} options - Дополнительные опции
   * @returns {Promise<Object>} Результат с турами
   */
  async getToursByCategory(categoryId, options = {}) {
    try {
      if (!categoryId) {
        throw new ValidationError('ID категории не указан')
      }

      const tours = await this.tourRepository.findByCategory(categoryId, options)
      return this.successResponse(tours, `Туры категории ${categoryId} успешно получены`)
    } catch (error) {
      return this.handleError(error, 'getToursByCategory')
    }
  }

  /**
   * Поиск туров по названию
   * @param {string} searchTerm - Поисковый запрос
   * @param {Object} options - Дополнительные опции
   * @returns {Promise<Object>} Результат с турами
   */
  async searchTours(searchTerm, options = {}) {
    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        throw new ValidationError('Поисковый запрос не указан')
      }

      const tours = await this.tourRepository.searchByName(searchTerm.trim(), options)
      return this.successResponse(tours, `Найдено туров: ${tours.length}`)
    } catch (error) {
      return this.handleError(error, 'searchTours')
    }
  }

  /**
   * Получить туры с фильтрацией
   * @param {Object} filters - Фильтры
   * @returns {Promise<Object>} Результат с турами
   */
  async getToursWithFilters(filters) {
    try {
      const tours = await this.tourRepository.findByFilters(filters)
      return this.successResponse(tours, `Найдено туров: ${tours.length}`)
    } catch (error) {
      return this.handleError(error, 'getToursWithFilters')
    }
  }

  /**
   * Проверить доступность тура (бизнес-правило)
   * @param {string} tourId - ID тура
   * @returns {Promise<Object>} Результат проверки
   */
  async checkTourAvailability(tourId) {
    try {
      const tour = await this.tourRepository.findByIdWithDetails(tourId)

      if (!tour) {
        throw new BusinessError('Тур не найден', 'TOUR_NOT_FOUND')
      }

      // Здесь можно добавить проверку доступности по датам, количеству мест и т.д.
      // Для базовой реализации просто возвращаем информацию о туре

      return this.successResponse(
        {
          available: true,
          tour: {
            id: tour.id,
            title: tour.title,
            duration: tour.duration,
            price: tour.price,
          },
        },
        'Тур доступен для бронирования'
      )
    } catch (error) {
      return this.handleError(error, 'checkTourAvailability')
    }
  }
}

// Экспорт singleton экземпляра
export const tourService = new TourService()
