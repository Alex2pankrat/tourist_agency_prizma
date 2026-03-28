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
        <style>{dropdownHoverCSS}</style>
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
                <div style={styles.adminDropdown} data-admin-dropdown>
                  <span style={styles.adminLink}>⚙️ Админ</span>
                  <div style={styles.dropdownContent} data-dropdown-content>
                    <a href="/admin/tours" style={styles.dropdownLink}>Управление турами</a>
                    <a href="/admin/sales" style={styles.dropdownLink}>Управление продажами</a>
                  </div>
                </div>
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
    alignItems: 'center',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem',
  },
  adminDropdown: {
    position: 'relative',
    display: 'inline-block',
  },
  adminLink: {
    color: '#fbbf24',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  dropdownContent: {
    display: 'none',
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    minWidth: '200px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    borderRadius: '0.375rem',
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownLink: {
    display: 'block',
    padding: '0.75rem 1rem',
    color: '#1f2937',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'background-color 0.2s',
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

// CSS для hover эффекта выпадающего меню
const dropdownHoverCSS = `
  [data-admin-dropdown]:hover [data-dropdown-content] {
    display: block !important;
  }
  .dropdownLink:hover {
    background-color: #f3f4f6;
  }
`
