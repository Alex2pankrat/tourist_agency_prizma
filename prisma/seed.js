/**
 * Seed файл для заполнения базы данных тестовыми данными
 * Запускается командой: npm run db:seed
 */

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

// Создаем пул подключений
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Создаем адаптер
const adapter = new PrismaPg(pool)

// Создаем клиент с адаптером
const prisma = new PrismaClient({ adapter })

/**
 * Основная функция для заполнения базы данных
 */
async function main() {
  console.log('🌱 Начало заполнения базы данных...')

  // Создаем категории туров
  console.log('📁 Создание категорий...')
  const beachCategory = await prisma.category.create({
    data: {
      name: 'Пляжный отдых',
      description: 'Туры на морские курорты для расслабленного отдыха',
    },
  })

  const mountainCategory = await prisma.category.create({
    data: {
      name: 'Горнолыжные курорты',
      description: 'Активный отдых в горах',
    },
  })

  const excursionCategory = await prisma.category.create({
    data: {
      name: 'Экскурсионные туры',
      description: 'Путешествия с познавательной программой',
    },
  })

  const exoticCategory = await prisma.category.create({
    data: {
      name: 'Экзотические туры',
      description: 'Необычные направления для особых впечатлений',
    },
  })

  console.log('✅ Категории созданы')

  // Создаем туры
  console.log('🏖️ Создание туров...')
  
  // Единое изображение для всех туров (с указанием размера)
  const defaultImageUrl = 'https://avatars.mds.yandex.net/i?id=a6c5aaa418978432ba89779d73cb9244_l-4032215-images-thumbs&n=13&w=800&h=600'
  
  const tours = await Promise.all([
    // Пляжные туры
    prisma.tour.create({
      data: {
        title: 'Отдых в Анталье (Турция)',
        description: 'Недельный отдых на берегу Средиземного моря в отеле 5*. Все включено.',
        price: 85000,
        duration: 7,
        imageUrl: defaultImageUrl,
        categoryId: beachCategory.id,
      },
    }),

    prisma.tour.create({
      data: {
        title: 'Пхукет (Таиланд)',
        description: '10 дней на тропическом острове. Экскурсия на Пхи-Пхи в подарок!',
        price: 120000,
        duration: 10,
        imageUrl: defaultImageUrl,
        categoryId: beachCategory.id,
      },
    }),

    prisma.tour.create({
      data: {
        title: 'Мальдивы - рай на земле',
        description: '7 дней в бунгало на воде. Полное уединение и кристально чистая вода.',
        price: 250000,
        duration: 7,
        imageUrl: defaultImageUrl,
        categoryId: beachCategory.id,
      },
    }),

    // Горнолыжные туры
    prisma.tour.create({
      data: {
        title: 'Альпы (Франция)',
        description: 'Неделя на лучших горнолыжных трассах Альп. Оборудование включено.',
        price: 180000,
        duration: 7,
        imageUrl: defaultImageUrl,
        categoryId: mountainCategory.id,
      },
    }),

    prisma.tour.create({
      data: {
        title: 'Шерегеш (Россия)',
        description: 'Сибирский снег и отличные трассы. 5 дней активного отдыха.',
        price: 45000,
        duration: 5,
        imageUrl: defaultImageUrl,
        categoryId: mountainCategory.id,
      },
    }),

    // Экскурсионные туры
    prisma.tour.create({
      data: {
        title: 'Золотое кольцо России',
        description: '7 древних городов за 5 дней. Автобусный тур с гидом.',
        price: 35000,
        duration: 5,
        imageUrl: defaultImageUrl,
        categoryId: excursionCategory.id,
      },
    }),

    prisma.tour.create({
      data: {
        title: 'Париж - город огней',
        description: '5 дней в столице Франции. Лувр, Эйфелева башня, Версаль.',
        price: 95000,
        duration: 5,
        imageUrl: defaultImageUrl,
        categoryId: excursionCategory.id,
      },
    }),

    // Экзотические туры
    prisma.tour.create({
      data: {
        title: 'Сафари в Кении',
        description: '10 дней в африканской саванне. Наблюдение за большой пятеркой.',
        price: 350000,
        duration: 10,
        imageUrl: defaultImageUrl,
        categoryId: exoticCategory.id,
      },
    }),

    prisma.tour.create({
      data: {
        title: 'Мачу-Пикчу (Перу)',
        description: 'Путешествие к затерянному городу инков. 8 дней приключений.',
        price: 280000,
        duration: 8,
        imageUrl: defaultImageUrl,
        categoryId: exoticCategory.id,
      },
    }),
  ])

  console.log('✅ Туры созданы')

  // Создаем тестового клиента
  console.log('👤 Создание тестового клиента...')
  const client = await prisma.client.create({
    data: {
      name: 'Иван Петров',
      email: 'ivan@example.com',
      phone: '+7 (999) 123-45-67',
    },
  })
  console.log('✅ Клиент создан')

  // Создаем тестовую продажу
  console.log('🛒 Создание тестовой продажи...')
  const sale = await prisma.sale.create({
    data: {
      clientId: client.id,
      totalAmount: 120000,
      status: 'confirmed',
      items: {
        create: {
          tourId: tours[1].id, // Пхукет
          quantity: 2,
          price: 60000,
        },
      },
    },
  })
  console.log('✅ Продажа создана')

  console.log('🎉 Заполнение базы данных завершено!')
  console.log(`Создано: ${tours.length} туров в 4 категориях`)
  console.log(`Клиентов: 1, Продаж: 1`)
}

/**
 * Обработка ошибок и закрытие соединения
 */
main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
