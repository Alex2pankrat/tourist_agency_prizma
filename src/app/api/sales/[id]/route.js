/**
 * API endpoint для деталей продажи по ID
 * GET /api/sales/[id] - получить детали заказа
 * PUT /api/sales/[id] - обновить заказ
 * DELETE /api/sales/[id] - удалить заказ
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET handler для получения деталей продажи по ID
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

/**
 * PUT handler для обновления продажи
 * @param {Request} request - HTTP запрос с данными для обновления
 */
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const body = await request.json()
    
    const { status, clientData, items } = body

    // Проверяем существование продажи
    const existingSale = await prisma.sale.findUnique({
      where: { id },
    })

    if (!existingSale) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Обновляем продажу в транзакции
    const updatedSale = await prisma.$transaction(async (tx) => {
      // Обновляем данные клиента если предоставлены
      if (clientData) {
        await tx.client.update({
          where: { id: existingSale.clientId },
          data: {
            name: clientData.name,
            email: clientData.email,
            phone: clientData.phone,
          },
        })
      }

      // Если предоставлены новые элементы, обновляем их
      if (items && Array.isArray(items)) {
        // Удаляем старые элементы
        await tx.saleItem.deleteMany({
          where: { saleId: id },
        })

        // Создаем новые элементы
        await tx.saleItem.createMany({
          data: items.map((item) => ({
            saleId: id,
            tourId: item.tourId,
            quantity: item.quantity,
            price: item.price,
          })),
        })
      }

      // Обновляем статус и сумму
      const saleUpdate = await tx.sale.update({
        where: { id },
        data: {
          status: status || existingSale.status,
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

      return saleUpdate
    })

    // Пересчитываем общую сумму
    const totalAmount = updatedSale.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    )

    const finalSale = await prisma.sale.update({
      where: { id },
      data: { totalAmount },
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

    return NextResponse.json({
      ...finalSale,
      totalAmount: Number(finalSale.totalAmount),
      items: finalSale.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    })
  } catch (error) {
    console.error('Ошибка при обновлении продажи:', error)
    return NextResponse.json(
      { error: 'Не удалось обновить заказ' },
      { status: 500 }
    )
  }
}

/**
 * DELETE handler для удаления продажи
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    // Проверяем существование продажи
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: true,
      },
    })

    if (!sale) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Удаляем продажу (Prisma автоматически удалит связанные SaleItem из-за cascade)
    await prisma.sale.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'Заказ успешно удалён',
      id,
    })
  } catch (error) {
    console.error('Ошибка при удалении продажи:', error)
    return NextResponse.json(
      { error: 'Не удалось удалить заказ' },
      { status: 500 }
    )
  }
}
