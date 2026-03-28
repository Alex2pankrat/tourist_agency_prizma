/**
 * API endpoint для получения списка туров
 * GET /api/tours
 * 
 * Query параметры:
 * - category - фильтр по категории (ID)
 * - minPrice - минимальная цена
 * - maxPrice - максимальная цена
 * - duration - длительность в днях
 * - search - поиск по названию
 * - page - номер страницы (пагинация)
 * - limit - количество на странице
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET handler для получения списка туров
 * @param {Request} request - HTTP запрос
 * @returns {Promise<NextResponse>} Список туров в формате JSON
 */
export async function GET(request) {
  try {
    // Парсим query параметры из URL
    const { searchParams } = new URL(request.url)
    
    // Фильтры
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const duration = searchParams.get('duration')
    const search = searchParams.get('search')
    
    // Пагинация
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit
    
    // Формируем объект WHERE для Prisma
    const where = {}
    
    // Фильтр по категории
    if (category) {
      where.categoryId = category
    }
    
    // Фильтр по цене
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) {
        where.price.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice)
      }
    }
    
    // Фильтр по длительности
    if (duration) {
      where.duration = parseInt(duration)
    }
    
    // Поиск по названию (case-insensitive)
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      }
    }
    
    // Получаем общее количество туров для пагинации
    const total = await prisma.tour.count({ where })
    
    // Получаем туры с пагинацией и связанными категориями
    const tours = await prisma.tour.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    // Форматируем ответ
    const response = {
      data: tours,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Ошибка при получении туров:', error)
    return NextResponse.json(
      { error: 'Не удалось получить туры' },
      { status: 500 }
    )
  }
}

/**
 * POST handler для создания нового тура
 * @param {Request} request - HTTP запрос с данными тура
 * @returns {Promise<NextResponse>} Созданный тур или ошибка
 */
export async function POST(request) {
  try {
    // Парсим тело запроса
    const body = await request.json()
    
    // Деструктурируем данные
    const { title, description, price, duration, categoryId, imageUrl } = body
    
    // Валидация обязательных полей
    if (!title || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Обязательные поля: title, price, categoryId' },
        { status: 400 }
      )
    }
    
    // Валидация типа данных
    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Цена должна быть положительным числом' },
        { status: 400 }
      )
    }
    
    if (typeof duration !== 'number' || duration <= 0) {
      return NextResponse.json(
        { error: 'Длительность должна быть положительным числом' },
        { status: 400 }
      )
    }
    
    // Проверяем существование категории
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })
    
    if (!category) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      )
    }
    
    // Создаем тур в базе данных
    const tour = await prisma.tour.create({
      data: {
        title,
        description: description || null,
        price,
        duration,
        categoryId,
        imageUrl: imageUrl || null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    
    return NextResponse.json(tour, { status: 201 })
  } catch (error) {
    console.error('Ошибка при создании тура:', error)
    return NextResponse.json(
      { error: 'Не удалось создать тур' },
      { status: 500 }
    )
  }
}
