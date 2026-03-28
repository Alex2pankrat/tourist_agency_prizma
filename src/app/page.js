/**
 * Главная страница туристического агентства
 * Приветственная страница с информацией о проекте
 */
export default function HomePage() {
  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.title}>Добро пожаловать в Prizma Travel!</h1>
        <p style={styles.subtitle}>Ваше идеальное путешествие начинается здесь</p>
        <a href="/tours" style={styles.button}>
          Смотреть каталог туров
        </a>
      </section>

      {/* Навигация по разделам */}
      <section style={styles.navigation}>
        <h2 style={styles.navigationTitle}>Разделы сайта</h2>
        <div style={styles.navGrid}>
          <a href="/tours" style={styles.navCard}>
            <span style={styles.navIcon}>🏖️</span>
            <h3 style={styles.navTitle}>Каталог туров</h3>
            <p style={styles.navText}>
              Просмотр и фильтрация туров по категориям, цене и длительности
            </p>
          </a>
          <a href="/cart" style={styles.navCard}>
            <span style={styles.navIcon}>🛒</span>
            <h3 style={styles.navTitle}>Корзина</h3>
            <p style={styles.navText}>
              Управление выбранными турами и оформление заказа
            </p>
          </a>
          <a href="/sales" style={styles.navCard}>
            <span style={styles.navIcon}>📋</span>
            <h3 style={styles.navTitle}>История продаж</h3>
            <p style={styles.navText}>
              Просмотр всех оформленных заказов и их деталей
            </p>
          </a>
          <a href="/admin/tours" style={styles.navCard}>
            <span style={styles.navIcon}>⚙️</span>
            <h3 style={styles.navTitle}>Админ-панель</h3>
            <p style={styles.navText}>
              Управление турами: создание, редактирование, удаление
            </p>
          </a>
        </div>
      </section>

      <section style={styles.features}>
        <h2 style={styles.featuresTitle}>Почему выбирают нас?</h2>
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>🌍 Широкий выбор туров</h3>
            <p style={styles.featureText}>
              Более 100 направлений по всему миру
            </p>
          </div>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>💰 Лучшие цены</h3>
            <p style={styles.featureText}>
              Гарантируем оптимальное соотношение цены и качества
            </p>
          </div>
          <div style={styles.featureCard}>
            <h3 style={styles.featureTitle}>🛡️ Надежность</h3>
            <p style={styles.featureText}>
              Полная поддержка на всех этапах путешествия
            </p>
          </div>
        </div>
      </section>

      <section style={styles.info}>
        <h2 style={styles.infoTitle}>О проекте</h2>
        <p style={styles.infoText}>
          Prizma Travel — это современное туристическое агентство, 
          которое помогает вам найти и забронировать идеальный тур. 
          Мы предлагаем удобный поиск по категориям, простое оформление 
          заказа и полную историю ваших покупок.
        </p>
      </section>
    </div>
  )
}

// Стили для главной страницы
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },
  hero: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '4rem 2rem',
    borderRadius: '1rem',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  title: {
    fontSize: '3rem',
    color: 'white',
    marginBottom: '1rem',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '2rem',
  },
  button: {
    display: 'inline-block',
    backgroundColor: 'white',
    color: '#667eea',
    padding: '1rem 2rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    transition: 'transform 0.2s',
  },
  navigation: {
    padding: '2rem 0',
  },
  navigationTitle: {
    fontSize: '2rem',
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#1e3a8a',
  },
  navGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  navCard: {
    backgroundColor: '#f9fafb',
    padding: '2rem',
    borderRadius: '0.5rem',
    textAlign: 'center',
    textDecoration: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  navIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    display: 'block',
  },
  navTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '0.5rem',
  },
  navText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: '1.5',
  },
  features: {
    padding: '2rem 0',
  },
  featuresTitle: {
    fontSize: '2rem',
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#1e3a8a',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  featureCard: {
    padding: '2rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.5rem',
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#1e3a8a',
  },
  featureText: {
    color: '#4b5563',
    lineHeight: '1.6',
  },
  info: {
    padding: '2rem',
    backgroundColor: '#eff6ff',
    borderRadius: '0.5rem',
  },
  infoTitle: {
    fontSize: '2rem',
    color: '#1e3a8a',
    marginBottom: '1rem',
  },
  infoText: {
    fontSize: '1.1rem',
    color: '#4b5563',
    lineHeight: '1.8',
  },
}
