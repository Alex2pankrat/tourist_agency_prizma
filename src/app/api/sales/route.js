/**
 * API endpoint для продаж
 * POST /api/sales - оформить заказ
 * GET /api/sales - получить историю продаж
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST handler для оформления заказа
 * @param {Request} request - HTTP запрос с данными заказа
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { clientData, items } = body

    // Валидация данных клиента
    if (!clientData || !clientData.name) {
      return NextResponse.json(
        { error: 'Необходимо указать имя клиента' },
        { status: 400 }
      )
    }

    // Валидация корзины
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Корзина пуста' },
        { status: 400 }
      )
    }

    // Проверяем наличие всех туров и собираем данные
    const tourIds = items.map((item) => item.tourId)
    const tours = await prisma.tour.findMany({
      where: {
        id: { in: tourIds },
      },
      select: {
        id: true,
        price: true,
        title: true,
      },
    })

    // Проверяем, все ли туры найдены
    if (tours.length !== tourIds.length) {
      return NextResponse.json(
        { error: 'Некоторые туры больше не доступны' },
        { status: 400 }
      )
    }

    // Создаем мапу туров для быстрого доступа
    const tourMap = new Map(tours.map((t) => [t.id, t]))

    // Рассчитываем общую сумму и проверяем цены
    let totalAmount = 0
    const saleItemsData = []

    for (const item of items) {
      const tour = tourMap.get(item.tourId)
      if (!tour) {
        return NextResponse.json(
          { error: `Тур ${item.tourId} не найден` },
          { status: 400 }
        )
      }

      const itemTotal = Number(tour.price) * item.quantity
      totalAmount += itemTotal

      saleItemsData.push({
        tourId: item.tourId,
        quantity: item.quantity,
        price: tour.price,
      })
    }

    // Создаем продажу в транзакции
    const sale = await prisma.$transaction(async (tx) => {
      // Создаем клиента или находим существующего
      let client
      if (clientData.email) {
        client = await tx.client.findFirst({
          where: { email: clientData.email },
        })

        if (client) {
          // Обновляем данные клиента
          client = await tx.client.update({
            where: { id: client.id },
            data: {
              name: clientData.name,
              phone: clientData.phone || null,
            },
          })
        } else {
          // Создаем нового клиента
          client = await tx.client.create({
            data: {
              name: clientData.name,
              email: clientData.email || null,
              phone: clientData.phone || null,
            },
          })
        }
      } else {
        // Создаем клиента без email
        client = await tx.client.create({
          data: {
            name: clientData.name,
            phone: clientData.phone || null,
          },
        })
      }

      // Создаем продажу
      const newSale = await tx.sale.create({
        data: {
          clientId: client.id,
          totalAmount,
          status: 'confirmed',
          items: {
            create: saleItemsData,
          },
        },
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
                },
              },
            },
          },
        },
      })

      return newSale
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Ошибка при оформлении заказа:', error)
    return NextResponse.json(
      { error: 'Не удалось оформить заказ' },
      { status: 500 }
    )
  }
}

/**
 * GET handler для получения истории продаж
 * @param {Request} request - HTTP запрос
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Пагинация
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const skip = (page - 1) * limit

    // Получаем продажи с пагинацией
    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              tour: {
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      }),
      prisma.sale.count(),
    ])

    // Форматируем ответ
    const response = {
      data: sales.map((sale) => ({
        ...sale,
        totalAmount: Number(sale.totalAmount),
        items: sale.items.map((item) => ({
          ...item,
          price: Number(item.price),
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Ошибка при получении истории продаж:', error)
    return NextResponse.json(
      { error: 'Не удалось получить историю продаж' },
      { status: 500 }
    )
  }
}
