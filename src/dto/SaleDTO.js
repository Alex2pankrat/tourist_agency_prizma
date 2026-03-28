/**
 * DTO (Data Transfer Objects) для продаж
 * Предназначены для валидации и преобразования данных между слоями
 */

/**
 * Базовый класс для DTO
 */
export class BaseDTO {
  /**
   * Валидировать данные
   * @param {Object} data - Данные для валидации
   * @returns {Object} Результат валидации
   */
  static validate(data) {
    throw new Error('Метод validate должен быть реализован в подклассе')
  }

  /**
   * Преобразовать из Entity в DTO
   * @param {Object} entity - Entity объект
   * @returns {Object} DTO объект
   */
  static fromEntity(entity) {
    throw new Error('Метод fromEntity должен быть реализован в подклассе')
  }
}

/**
 * DTO для элемента продажи
 */
export class SaleItemDTO extends BaseDTO {
  /**
   * Валидировать данные элемента продажи
   * @param {Object} data - Данные элемента
   * @returns {Object} Результат валидации
   */
  static validate(data) {
    const errors = []

    if (!data.tourId) {
      errors.push('ID тура обязателен')
    }

    if (data.quantity === undefined || data.quantity === null) {
      errors.push('Количество обязательно')
    } else {
      const quantity = Number(data.quantity)
      if (isNaN(quantity) || quantity < 1) {
        errors.push('Количество должно быть не менее 1')
      }
    }

    if (data.price === undefined || data.price === null) {
      errors.push('Цена обязательна')
    } else {
      const price = Number(data.price)
      if (isNaN(price) || price < 0) {
        errors.push('Цена должна быть неотрицательным числом')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? this.toEntity(data) : null,
    }
  }

  /**
   * Преобразовать в Entity
   * @param {Object} data - DTO данные
   * @returns {Object} Entity данные
   */
  static toEntity(data) {
    return {
      tourId: data.tourId,
      quantity: Number(data.quantity),
      price: Number(data.price),
    }
  }

  /**
   * Преобразовать из Entity
   * @param {Object} entity - Entity данные
   * @returns {Object} DTO данные
   */
  static fromEntity(entity) {
    return {
      id: entity.id,
      tourId: entity.tourId,
      quantity: Number(entity.quantity),
      price: Number(entity.price),
      saleId: entity.saleId,
    }
  }
}

/**
 * DTO для клиента
 */
export class ClientDTO extends BaseDTO {
  /**
   * Валидировать данные клиента
   * @param {Object} data - Данные клиента
   * @returns {Object} Результат валидации
   */
  static validate(data) {
    const errors = []

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Имя клиента обязательно')
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email клиента обязателен')
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.email)) {
        errors.push('Некорректный формат email')
      }
    }

    if (data.phone !== undefined && data.phone) {
      // Простая валидация телефона
      const phoneRegex = /^[\d\s\+\-\(\)]+$/
      if (!phoneRegex.test(data.phone)) {
        errors.push('Некорректный формат телефона')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? this.toEntity(data) : null,
    }
  }

  /**
   * Преобразовать в Entity
   * @param {Object} data - DTO данные
   * @returns {Object} Entity данные
   */
  static toEntity(data) {
    return {
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone ? data.phone.trim() : null,
    }
  }

  /**
   * Преобразовать из Entity
   * @param {Object} entity - Entity данные
   * @returns {Object} DTO данные
   */
  static fromEntity(entity) {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
    }
  }
}

/**
 * DTO для создания продажи
 */
export class CreateSaleDTO extends BaseDTO {
  /**
   * Валидировать данные для создания продажи
   * @param {Object} data - Данные продажи
   * @returns {Object} Результат валидации
   */
  static validate(data) {
    const errors = []

    // Валидация клиента
    if (!data.client) {
      errors.push('Данные клиента обязательны')
    } else {
      const clientValidation = ClientDTO.validate(data.client)
      if (!clientValidation.isValid) {
        errors.push(...clientValidation.errors)
      }
    }

    // Валидация элементов
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.push('Список товаров обязателен и не может быть пустым')
    } else {
      data.items.forEach((item, index) => {
        const itemValidation = SaleItemDTO.validate(item)
        if (!itemValidation.isValid) {
          errors.push(`Элемент ${index + 1}: ${itemValidation.errors.join(', ')}`)
        }
      })
    }

    // Валидация статуса если предоставлен
    if (data.status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
      if (!validStatuses.includes(data.status)) {
        errors.push(`Недопустимый статус. Допустимые: ${validStatuses.join(', ')}`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? this.toEntity(data) : null,
    }
  }

  /**
   * Преобразовать в Entity
   * @param {Object} data - DTO данные
   * @returns {Object} Entity данные
   */
  static toEntity(data) {
    return {
      client: ClientDTO.toEntity(data.client),
      items: data.items.map((item) => SaleItemDTO.toEntity(item)),
      status: data.status || 'pending',
    }
  }
}

/**
 * DTO для ответа с информацией о продаже
 */
export class SaleResponseDTO extends BaseDTO {
  /**
   * Преобразовать из Entity
   * @param {Object} entity - Entity данные
   * @returns {Object} DTO данные
   */
  static fromEntity(entity) {
    const dto = {
      id: entity.id,
      clientId: entity.clientId,
      totalAmount: Number(entity.totalAmount),
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }

    // Добавляем информацию о клиенте если есть
    if (entity.client) {
      dto.client = ClientDTO.fromEntity(entity.client)
    }

    // Добавляем элементы если есть
    if (entity.items && Array.isArray(entity.items)) {
      dto.items = entity.items.map((item) => {
        const itemDto = SaleItemDTO.fromEntity(item)

        // Добавляем информацию о туре если есть
        if (item.tour) {
          itemDto.tour = {
            id: item.tour.id,
            title: item.tour.title,
            imageUrl: item.tour.imageUrl,
            price: Number(item.tour.price),
          }
        }

        return itemDto
      })
    }

    return dto
  }

  /**
   * Преобразовать массив Entity в массив DTO
   * @param {Array} entities - Массив Entity
   * @returns {Array} Массив DTO
   */
  static fromEntities(entities) {
    return entities.map((entity) => this.fromEntity(entity))
  }
}

/**
 * DTO для обновления продажи
 */
export class UpdateSaleDTO extends BaseDTO {
  /**
   * Валидировать данные для обновления продажи
   * @param {Object} data - Данные для обновления
   * @returns {Object} Результат валидации
   */
  static validate(data) {
    const errors = []

    // Валидация статуса если предоставлен
    if (data.status !== undefined) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
      if (!validStatuses.includes(data.status)) {
        errors.push(`Недопустимый статус. Допустимые: ${validStatuses.join(', ')}`)
      }
    }

    // Валидация элементов если предоставлены
    if (data.items !== undefined) {
      if (!Array.isArray(data.items) || data.items.length === 0) {
        errors.push('Список товаров не может быть пустым')
      } else {
        data.items.forEach((item, index) => {
          const itemValidation = SaleItemDTO.validate(item)
          if (!itemValidation.isValid) {
            errors.push(`Элемент ${index + 1}: ${itemValidation.errors.join(', ')}`)
          }
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? this.toEntity(data) : null,
    }
  }

  /**
   * Преобразовать в Entity
   * @param {Object} data - DTO данные
   * @returns {Object} Entity данные
   */
  static toEntity(data) {
    const entity = {}

    if (data.status !== undefined) {
      entity.status = data.status
    }

    if (data.items !== undefined) {
      entity.items = data.items.map((item) => SaleItemDTO.toEntity(item))
    }

    return entity
  }
}
