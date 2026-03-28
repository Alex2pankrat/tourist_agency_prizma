/**
 * API endpoint для операций с отдельным туром
 * GET /api/tours/[id] - получить тур по ID
 * PUT /api/tours/[id] - обновить тур
 * DELETE /api/tours/[id] - удалить тур
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET handler для получения тура по ID
 * @param {Request} request - HTTP запрос
 * @param {{ params: { id: string } }} context - Контекст с параметрами маршрута
 * @returns {Promise<NextResponse>} Данные тура или ошибка
 */
export async function GET(request, { params }) {
  try {
    const { id } = params
    
    // Ищем тур в базе данных
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    
    // Если тур не найден
    if (!tour) {
      return NextResponse.json(
        { error: 'Тур не найден' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(tour)
  } catch (error) {
    console.error('Ошибка при получении тура:', error)
    return NextResponse.json(
      { error: 'Не удалось получить тур' },
      { status: 500 }
    )
  }
}

/**
 * PUT handler для обновления тура
 * @param {Request} request - HTTP запрос с данными для обновления
 * @param {{ params: { id: string } }} context - Контекст с параметрами маршрута
 * @returns {Promise<NextResponse>} Обновленный тур или ошибка
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Проверяем существование тура
    const existingTour = await prisma.tour.findUnique({
      where: { id },
    })
    
    if (!existingTour) {
      return NextResponse.json(
        { error: 'Тур не найден' },
        { status: 404 }
      )
    }
    
    // Деструктурируем данные для обновления
    const { title, description, price, duration, categoryId, imageUrl } = body
    
    // Если указана новая категория, проверяем её существование
    if (categoryId && categoryId !== existingTour.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      })
      
      if (!category) {
        return NextResponse.json(
          { error: 'Категория не найдена' },
          { status: 404 }
        )
      }
    }
    
    // Валидация цены
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
      return NextResponse.json(
        { error: 'Цена должна быть положительным числом' },
        { status: 400 }
      )
    }
    
    // Валидация длительности
    if (duration !== undefined && (typeof duration !== 'number' || duration <= 0)) {
      return NextResponse.json(
        { error: 'Длительность должна быть положительным числом' },
        { status: 400 }
      )
    }
    
    // Обновляем тур в базе данных
    const updatedTour = await prisma.tour.update({
      where: { id },
      data: {
        title,
        description,
        price,
        duration,
        categoryId,
        imageUrl,
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
    
    return NextResponse.json(updatedTour)
  } catch (error) {
    console.error('Ошибка при обновлении тура:', error)
    return NextResponse.json(
      { error: 'Не удалось обновить тур' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler для удаления тура
 * @param {{ params: { id: string } }} context - Контекст с параметрами маршрута
 * @returns {Promise<NextResponse>} Сообщение об успехе или ошибка
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    
    // Проверяем существование тура
    const tour = await prisma.tour.findUnique({
      where: { id },
    })
    
    if (!tour) {
      return NextResponse.json(
        { error: 'Тур не найден' },
        { status: 404 }
      )
    }
    
    // Проверяем, есть ли связанные продажи
    const relatedSales = await prisma.saleItem.count({
      where: { tourId: id },
    })
    
    if (relatedSales > 0) {
      return NextResponse.json(
        { 
          error: 'Невозможно удалить тур: он присутствует в историях продаж',
          relatedSales 
        },
        { status: 409 }
      )
    }
    
    // Удаляем тур (Prisma автоматически удалит связанные записи при каскадном удалении)
    await prisma.tour.delete({
      where: { id },
    })
    
    return NextResponse.json({ 
      message: 'Тур успешно удален',
      id 
    })
  } catch (error) {
    console.error('Ошибка при удалении тура:', error)
    return NextResponse.json(
      { error: 'Не удалось удалить тур' },
      { status: 500 }
    )
  }
}
