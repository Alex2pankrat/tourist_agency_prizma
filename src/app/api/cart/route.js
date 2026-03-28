/**
 * API endpoint для корзины
 * GET /api/cart - получить корзину (для серверных операций)
 * 
 * Примечание: Корзина хранится в localStorage на клиенте
 * Этот endpoint используется для серверной валидации и синхронизации
 */

import { NextResponse } from 'next/server'

/**
 * GET handler для получения информации о корзине
 * Возвращает пустую структуру для клиентской синхронизации
 */
export async function GET() {
  try {
    // На сервере корзина пуста (клиентское хранилище)
    // Клиент сам управляет корзиной через localStorage
    return NextResponse.json({
      items: [],
      total: 0,
      itemCount: 0,
    })
  } catch (error) {
    console.error('Ошибка при получении корзины:', error)
    return NextResponse.json(
      { error: 'Не удалось получить корзину' },
      { status: 500 }
    )
  }
}

/**
 * POST handler для оформления заказа из корзины
 * @param {Request} request - HTTP запрос с данными заказа
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { items, clientData } = body
    
    // Валидация
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Корзина пуста' },
        { status: 400 }
      )
    }
    
    // Возвращаем данные для клиентской обработки
    return NextResponse.json({
      message: 'Корзина готова к оформлению',
      items,
    })
  } catch (error) {
    console.error('Ошибка при обработке корзины:', error)
    return NextResponse.json(
      { error: 'Не удалось обработать корзину' },
      { status: 500 }
    )
  }
}
