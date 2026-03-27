# Prizma Travel - Туристическое агентство

Веб-приложение для туристического агентства с онлайн-витриной туров, корзиной и оформлением продаж.

## 🚀 Технологический стек

- **Frontend:** React + Next.js (JavaScript)
- **ORM:** Prisma 7
- **База данных:** PostgreSQL (локальный)
- **Архитектура:** MVC

## 📋 Требования

- Node.js 18+
- PostgreSQL 15+ (локальная установка)
- npm или yarn

## ⚙️ Установка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте файл `.env.example` в `.env`:

```bash
copy .env.example .env
```

Отредактируйте `.env` и укажите ваши учетные данные PostgreSQL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tourist_agency?schema=public"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 3. Создание базы данных

Создайте базу данных в PostgreSQL:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE tourist_agency;"
```

Или через PowerShell:

```powershell
$env:PGPASSWORD='your_password'; & 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -h localhost -c "CREATE DATABASE tourist_agency;"
```

### 4. Применение миграций

```bash
npx prisma migrate dev
```

### 5. Заполнение базы данных тестовыми данными

```bash
npm run db:seed
```

## 🏃 Запуск

### Режим разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

### Продакшн режим

```bash
npm run build
npm run start
```

## 🗄️ Управление базой данных

### Открыть Prisma Studio (визуальный редактор БД)

```bash
npx prisma studio
```

### Применить изменения схемы (без миграций)

```bash
npx prisma db push
```

### Создать новую миграцию

```bash
npx prisma migrate dev --name <описание_изменений>
```

## 📁 Структура проекта

```
prizma-project/
├── prisma/
│   ├── schema.prisma      # Схема базы данных
│   ├── migrations/        # Миграции БД
│   └── seed.js            # Тестовые данные
├── src/
│   ├── app/
│   │   ├── api/           # API маршруты
│   │   ├── tours/         # Страницы туров
│   │   ├── cart/          # Страницы корзины
│   │   ├── layout.js      # Корневой макет
│   │   └── page.js        # Главная страница
│   ├── components/        # React компоненты
│   ├── lib/
│   │   └── prisma.js      # Prisma клиент с адаптером
│   └── styles/            # Глобальные стили
├── public/                # Статические файлы
├── .env                   # Переменные окружения (не коммитить!)
├── .env.example           # Шаблон переменных окружения
└── package.json
```

## 🔒 Безопасность

- **Никогда не коммитьте файл `.env`** в Git
- Все секреты храните в переменных окружения
- `.env` добавлен в `.gitignore`
- Для публикации на GitHub используйте только `.env.example`

## 📦 Основные функции

- ✅ Каталог туров с фильтрацией по категориям
- ✅ Корзина для выбора туров
- ✅ Оформление продажи
- ✅ История продаж
- ✅ CRUD операции для управления турами

## 📝 Дополнительная документация

Проект настроен с использованием Conductor methodology:

- [Product Definition](../conductor/product.md)
- [Product Guidelines](../conductor/product-guidelines.md)
- [Tech Stack](../conductor/tech-stack.md)
- [Workflow](../conductor/workflow.md)
- [Tracks](../conductor/tracks.md)

## 👥 Авторы

Учебный проект для демонстрации навыков fullstack-разработки.

## 📄 Лицензия

ISC
