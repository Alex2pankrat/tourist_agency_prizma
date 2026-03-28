/**
 * Сервис для управления корзиной
 * Содержит бизнес-логику для операций с корзиной покупок
 */

import { tourRepository } from '../repositories/TourRepository.js'
import { BaseService, BusinessError, ValidationError } from './BaseService.js'

/**
 * Класс CartService для бизнес-логики корзины
 */
export class CartService extends BaseService {
  constructor() {
    super()
    this.tourRepository = tourRepository
  }

  /**
   * Получить содержимое корзины
   * @param {Array} cartItems - Элементы корзины из состояния
   * @returns {Promise<Object>} Результат с корзиной
   */
  async getCartContents(cartItems) {
    try {
      if (!cartItems || cartItems.length === 0) {
        return this.successResponse(
          {
            items: [],
            totalAmount: 0,
            itemCount: 0,
          },
          'Корзина пуста'
        )
      }

      // Получаем информацию о турах из корзины
      const tourIds = cartItems.map((item) => item.tourId)
      const tours = await this.tourRepository.findAll({
        where: {
          id: {
            in: tourIds,
          },
        },
        include: {
          category: true,
        },
      })

      // Формируем ответ с элементами корзины
      const items = cartItems
        .map((cartItem) => {
          const tour = tours.find((t) => t.id === cartItem.tourId)
          if (!tour) {
            return null // Тур больше не существует
          }

          return {
            tourId: tour.id,
            title: tour.title,
            price: Number(tour.price),
            imageUrl: tour.imageUrl,
            quantity: cartItem.quantity || 1,
            category: tour.category,
            duration: tour.duration,
          }
        })
        .filter((item) => item !== null)

      // Считаем общую сумму
      const totalAmount = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )

      return this.successResponse(
        {
          items,
          totalAmount,
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
        },
        'Содержимое корзины успешно получено'
      )
    } catch (error) {
      return this.handleError(error, 'getCartContents')
    }
  }

  /**
   * Добавить товар в корзину
   * @param {Array} cartItems - Текущие элементы корзины
   * @param {string} tourId - ID тура
   * @param {Object} tourData - Данные тура (для отображения)
   * @param {number} quantity - Количество
   * @returns {Promise<Object>} Результат с обновлённой корзиной
   */
  async addToCart(cartItems, tourId, tourData, quantity = 1) {
    try {
      // Валидация
      if (!tourId) {
        throw new ValidationError('ID тура не указан')
      }

      const quantityValidation = this.validateNumber(quantity, {
        min: 1,
        fieldName: 'Количество',
      })

      if (!quantityValidation.isValid) {
        throw new ValidationError('Ошибка валидации количества', quantityValidation.errors)
      }

      // Проверяем существование тура
      const tour = await this.tourRepository.findById(tourId)
      if (!tour) {
        throw new BusinessError('Тур не найден', 'TOUR_NOT_FOUND')
      }

      // Ищем существующий элемент в корзине
      const existingItemIndex = cartItems.findIndex((item) => item.tourId === tourId)

      let updatedCart

      if (existingItemIndex !== -1) {
        // Обновляем количество существующего элемента
        updatedCart = cartItems.map((item, index) => {
          if (index === existingItemIndex) {
            return {
              ...item,
              quantity: item.quantity + Number(quantity),
            }
          }
          return item
        })
      } else {
        // Добавляем новый элемент
        updatedCart = [
          ...cartItems,
          {
            tourId,
            quantity: Number(quantity),
            title: tourData.title || tour.title,
            price: Number(tourData.price || tour.price),
            imageUrl: tourData.imageUrl || tour.imageUrl,
          },
        ]
      }

      return this.successResponse(
        {
          cart: updatedCart,
          message: 'Тур успешно добавлен в корзину',
        },
        'Тур добавлен в корзину'
      )
    } catch (error) {
      return this.handleError(error, 'addToCart')
    }
  }

  /**
   * Обновить количество товара в корзине
   * @param {Array} cartItems - Текущие элементы корзины
   * @param {string} tourId - ID тура
   * @param {number} quantity - Новое количество
   * @returns {Promise<Object>} Результат с обновлённой корзиной
   */
  async updateQuantity(cartItems, tourId, quantity) {
    try {
      // Валидация
      if (!tourId) {
        throw new ValidationError('ID тура не указан')
      }

      const quantityValidation = this.validateNumber(quantity, {
        min: 0,
        fieldName: 'Количество',
      })

      if (!quantityValidation.isValid) {
        throw new ValidationError('Ошибка валидации количества', quantityValidation.errors)
      }

      // Находим элемент в корзине
      const itemIndex = cartItems.findIndex((item) => item.tourId === tourId)

      if (itemIndex === -1) {
        throw new BusinessError('Товар не найден в корзине', 'ITEM_NOT_FOUND')
      }

      let updatedCart

      if (quantity === 0) {
        // Если количество 0, удаляем элемент
        updatedCart = cartItems.filter((item) => item.tourId !== tourId)
      } else {
        // Обновляем количество
        updatedCart = cartItems.map((item, index) => {
          if (index === itemIndex) {
            return {
              ...item,
              quantity: Number(quantity),
            }
          }
          return item
        })
      }

      return this.successResponse(
        {
          cart: updatedCart,
          message: quantity === 0 ? 'Товар удалён из корзины' : 'Количество обновлено',
        },
        'Корзина обновлена'
      )
    } catch (error) {
      return this.handleError(error, 'updateQuantity')
    }
  }

  /**
   * Удалить товар из корзины
   * @param {Array} cartItems - Текущие элементы корзины
   * @param {string} tourId - ID тура
   * @returns {Promise<Object>} Результат с обновлённой корзиной
   */
  async removeFromCart(cartItems, tourId) {
    try {
      if (!tourId) {
        throw new ValidationError('ID тура не указан')
      }

      const updatedCart = cartItems.filter((item) => item.tourId !== tourId)

      return this.successResponse(
        {
          cart: updatedCart,
          message: 'Товар удалён из корзины',
        },
        'Товар удалён'
      )
    } catch (error) {
      return this.handleError(error, 'removeFromCart')
    }
  }

  /**
   * Очистить корзину
   * @param {Array} cartItems - Текущие элементы корзины
   * @returns {Promise<Object>} Результат с пустой корзиной
   */
  async clearCart(cartItems) {
    try {
      return this.successResponse(
        {
          cart: [],
          message: 'Корзина очищена',
        },
        'Корзина очищена'
      )
    } catch (error) {
      return this.handleError(error, 'clearCart')
    }
  }

  /**
   * Проверить доступность товаров в корзине
   * @param {Array} cartItems - Элементы корзины
   * @returns {Promise<Object>} Результат проверки
   */
  async checkCartAvailability(cartItems) {
    try {
      if (!cartItems || cartItems.length === 0) {
        return this.successResponse(
          {
            available: true,
            items: [],
            unavailableItems: [],
          },
          'Корзина пуста'
        )
      }

      const tourIds = cartItems.map((item) => item.tourId)
      const tours = await this.tourRepository.findAll({
        where: {
          id: {
            in: tourIds,
          },
        },
      })

      const availableItems = []
      const unavailableItems = []

      for (const cartItem of cartItems) {
        const tour = tours.find((t) => t.id === cartItem.tourId)

        if (!tour) {
          unavailableItems.push({
            ...cartItem,
            reason: 'Тур больше не существует',
          })
        } else {
          availableItems.push({
            ...cartItem,
            tour,
          })
        }
      }

      return this.successResponse(
        {
          available: unavailableItems.length === 0,
          items: availableItems,
          unavailableItems,
        },
        unavailableItems.length === 0
          ? 'Все товары доступны'
          : `Недоступно товаров: ${unavailableItems.length}`
      )
    } catch (error) {
      return this.handleError(error, 'checkCartAvailability')
    }
  }

  /**
   * Подсчитать общую сумму корзины
   * @param {Array} cartItems - Элементы корзины
   * @returns {Promise<Object>} Результат с суммой
   */
  async calculateTotal(cartItems) {
    try {
      if (!cartItems || cartItems.length === 0) {
        return this.successResponse(
          {
            totalAmount: 0,
            itemCount: 0,
          },
          'Корзина пуста'
        )
      }

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      )

      const itemCount = cartItems.reduce((sum, item) => sum + Number(item.quantity), 0)

      return this.successResponse(
        {
          totalAmount,
          itemCount,
        },
        `Общая сумма: ${totalAmount.toLocaleString('ru-RU')} ₽`
      )
    } catch (error) {
      return this.handleError(error, 'calculateTotal')
    }
  }
}

// Экспорт singleton экземпляра
export const cartService = new CartService()
