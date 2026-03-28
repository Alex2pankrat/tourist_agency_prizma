/**
 * API endpoint для деталей продажи по ID
 * GET /api/sales/[id] - получить детали заказа
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET handler для получения деталей продажи по ID
 * @param {Request} request - HTTP запрос
 * @param {{ params: { id: string } }} context - Контекст с параметрами маршрута
 */
export async function GET(request, { params }) {
  try {
    const { id } = params

    // Ищем продажу в базе данных
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            tour: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                price: true,
              },
            },
          },
        },
      },
    })

    // Если продажа не найдена
    if (!sale) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Форматируем ответ
    const formattedSale = {
      ...sale,
      totalAmount: Number(sale.totalAmount),
      items: sale.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    }

    return NextResponse.json(formattedSale)
  } catch (error) {
    console.error('Ошибка при получении деталей продажи:', error)
    return NextResponse.json(
      { error: 'Не удалось получить детали заказа' },
      { status: 500 }
    )
  }
}
