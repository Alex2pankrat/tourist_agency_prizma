/**
 * API endpoint для элементов корзины
 * POST /api/cart/items - добавить элемент в корзину
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST handler для добавления элемента в корзину
 * @param {Request} request - HTTP запрос с данными элемента
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { tourId, quantity = 1 } = body
    
    // Валидация
    if (!tourId) {
      return NextResponse.json(
        { error: 'Необходимо указать tourId' },
        { status: 400 }
      )
    }
    
    if (typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json(
        { error: 'Количество должно быть положительным числом' },
        { status: 400 }
      )
    }
    
    // Проверяем существование тура
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
      select: {
        id: true,
        title: true,
        price: true,
        imageUrl: true,
      },
    })
    
    if (!tour) {
      return NextResponse.json(
        { error: 'Тур не найден' },
        { status: 404 }
      )
    }
    
    // Возвращаем данные тура для добавления в корзину на клиенте
    return NextResponse.json({
      message: 'Тур готов к добавлению в корзину',
      item: {
        tourId: tour.id,
        title: tour.title,
        price: Number(tour.price),
        imageUrl: tour.imageUrl,
        quantity,
      },
    })
  } catch (error) {
    console.error('Ошибка при добавлении в корзину:', error)
    return NextResponse.json(
      { error: 'Не удалось добавить в корзину' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler для удаления элемента из корзины
 * @param {Request} request - HTTP запрос
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const tourId = searchParams.get('tourId')
    
    if (!tourId) {
      return NextResponse.json(
        { error: 'Необходимо указать tourId' },
        { status: 400 }
      )
    }
    
    // Возвращаем подтверждение для клиентского удаления
    return NextResponse.json({
      message: 'Элемент готов к удалению из корзины',
      tourId,
    })
  } catch (error) {
    console.error('Ошибка при удалении из корзины:', error)
    return NextResponse.json(
      { error: 'Не удалось удалить из корзины' },
      { status: 500 }
    )
  }
}
