/**
 * Prisma клиент для подключения к базе данных
 * Настроен для работы с Prisma 7 и локальным PostgreSQL
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

/**
 * Глобальный экземпляр Prisma Client для разработки
 * Предотвращает создание нескольких экземпляров в режиме hot-reload
 */
const globalForPrisma = globalThis

// Создаем пул подключений только один раз
let pool = globalForPrisma.pool
if (!pool) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  globalForPrisma.pool = pool
}

// Создаем адаптер
const adapter = new PrismaPg(pool)

// Создаем клиент с адаптером
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

// Сохраняем экземпляр в глобальной области для разработки
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

/**
 * Функция для безопасного отключения клиента
 * Используется при завершении работы приложения
 */
export async function disconnectPrisma() {
  await prisma.$disconnect()
  await pool.end()
}
