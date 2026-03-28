/**
 * DTO (Data Transfer Objects) для туров
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

  /**
   * Преобразовать из DTO в Entity
   * @param {Object} dto - DTO объект
   * @returns {Object} Entity объект
   */
  static toEntity(dto) {
    throw new Error('Метод toEntity должен быть реализован в подклассе')
  }
}

/**
 * DTO для создания тура
 */
export class CreateTourDTO extends BaseDTO {
  /**
   * Валидировать данные для создания тура
   * @param {Object} data - Данные тура
   * @returns {Object} Результат валидации
   */
  static validate(data) {
    const errors = []

    // Проверка обязательных полей
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Название тура обязательно')
    } else if (data.title.length < 5) {
      errors.push('Название тура должно быть не менее 5 символов')
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Описание тура обязательно')
    } else if (data.description.length < 10) {
      errors.push('Описание тура должно быть не менее 10 символов')
    }

    if (data.price === undefined || data.price === null) {
      errors.push('Цена тура обязательна')
    } else {
      const price = Number(data.price)
      if (isNaN(price) || price <= 0) {
        errors.push('Цена тура должна быть положительным числом')
      }
    }

    if (data.duration === undefined || data.duration === null) {
      errors.push('Длительность тура обязательна')
    } else {
      const duration = Number(data.duration)
      if (isNaN(duration) || duration < 1) {
        errors.push('Длительность тура должна быть не менее 1 дня')
      }
    }

    if (!data.categoryId) {
      errors.push('Категория тура обязательна')
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
      title: data.title.trim(),
      description: data.description.trim(),
      price: Number(data.price),
      duration: Number(data.duration),
      imageUrl: data.imageUrl || null,
      categoryId: data.categoryId,
    }
  }

  /**
   * Преобразовать из Entity
   * @param {Object} entity - Entity данные
   * @returns {Object} DTO данные
   */
  static fromEntity(entity) {
    return {
      title: entity.title,
      description: entity.description,
      price: entity.price,
      duration: entity.duration,
      imageUrl: entity.imageUrl,
      categoryId: entity.categoryId,
    }
  }
}

/**
 * DTO для обновления тура
 */
export class UpdateTourDTO extends BaseDTO {
  /**
   * Валидировать данные для обновления тура
   * @param {Object} data - Данные тура
   * @returns {Object} Результат валидации
   */
  static validate(data) {
    const errors = []

    // Проверка названия если предоставлено
    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        errors.push('Название тура не может быть пустым')
      } else if (data.title.length < 5) {
        errors.push('Название тура должно быть не менее 5 символов')
      }
    }

    // Проверка описания если предоставлено
    if (data.description !== undefined) {
      if (data.description.trim().length === 0) {
        errors.push('Описание тура не может быть пустым')
      } else if (data.description.length < 10) {
        errors.push('Описание тура должно быть не менее 10 символов')
      }
    }

    // Проверка цены если предоставлена
    if (data.price !== undefined) {
      const price = Number(data.price)
      if (isNaN(price) || price <= 0) {
        errors.push('Цена тура должна быть положительным числом')
      }
    }

    // Проверка длительности если предоставлена
    if (data.duration !== undefined) {
      const duration = Number(data.duration)
      if (isNaN(duration) || duration < 1) {
        errors.push('Длительность тура должна быть не менее 1 дня')
      }
    }

    // Проверка категории если предоставлена
    if (data.categoryId !== undefined && !data.categoryId) {
      errors.push('ID категории не может быть пустым')
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

    if (data.title !== undefined) {
      entity.title = data.title.trim()
    }

    if (data.description !== undefined) {
      entity.description = data.description.trim()
    }

    if (data.price !== undefined) {
      entity.price = Number(data.price)
    }

    if (data.duration !== undefined) {
      entity.duration = Number(data.duration)
    }

    if (data.imageUrl !== undefined) {
      entity.imageUrl = data.imageUrl
    }

    if (data.categoryId !== undefined) {
      entity.categoryId = data.categoryId
    }

    return entity
  }

  /**
   * Преобразовать из Entity
   * @param {Object} entity - Entity данные
   * @returns {Object} DTO данные
   */
  static fromEntity(entity) {
    return {
      title: entity.title,
      description: entity.description,
      price: entity.price,
      duration: entity.duration,
      imageUrl: entity.imageUrl,
      categoryId: entity.categoryId,
    }
  }
}

/**
 * DTO для ответа с информацией о туре
 */
export class TourResponseDTO extends BaseDTO {
  /**
   * Преобразовать из Entity
   * @param {Object} entity - Entity данные
   * @param {boolean} includeCategory - Включать ли категорию
   * @returns {Object} DTO данные
   */
  static fromEntity(entity, includeCategory = true) {
    const dto = {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      price: Number(entity.price),
      duration: Number(entity.duration),
      imageUrl: entity.imageUrl,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }

    if (includeCategory && entity.category) {
      dto.category = {
        id: entity.category.id,
        name: entity.category.name,
        description: entity.category.description,
      }
    }

    return dto
  }

  /**
   * Преобразовать массив Entity в массив DTO
   * @param {Array} entities - Массив Entity
   * @param {boolean} includeCategory - Включать ли категорию
   * @returns {Array} Массив DTO
   */
  static fromEntities(entities, includeCategory = true) {
    return entities.map((entity) => this.fromEntity(entity, includeCategory))
  }
}
