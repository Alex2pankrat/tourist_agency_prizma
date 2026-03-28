import '../styles/globals.css'
import Providers from './Providers'

/**
 * Метаданные для всего приложения
 * Используются для SEO и отображения в браузере
 */
export const metadata = {
  title: 'Туристическое агентство Prizma',
  description: 'Онлайн-витрина туров - выберите свой идеальный отпуск',
  keywords: 'туры, путешествия, отдых, туристическое агентство',
}

/**
 * Корневой макет приложения
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы
 */
export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Providers>
          <header style={styles.header}>
            <nav style={styles.nav}>
              <a href="/" style={styles.logo}>Prizma Travel</a>
              <div style={styles.links}>
                <a href="/tours" style={styles.link}>Каталог туров</a>
                <a href="/cart" style={styles.link}>Корзина</a>
                <a href="/sales" style={styles.link}>История продаж</a>
                <a href="/admin/tours" style={styles.adminLink}>Админ-панель</a>
              </div>
            </nav>
          </header>
          <main style={styles.main}>
            {children}
          </main>
          <footer style={styles.footer}>
            <p>&copy; 2026 Prizma Travel. Все права защищены.</p>
          </footer>
        </Providers>
      </body>
    </html>
  )
}

// Стили для макета (инлайн для простоты)
const styles = {
  header: {
    backgroundColor: '#1e40af',
    padding: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  nav: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  links: {
    display: 'flex',
    gap: '2rem',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
  },
  adminLink: {
    color: '#fbbf24',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
  },
  main: {
    minHeight: 'calc(100vh - 200px)',
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  footer: {
    backgroundColor: '#1e3a8a',
    color: 'white',
    textAlign: 'center',
    padding: '1rem',
    marginTop: '2rem',
  },
}
