import SalesHistory from '@/components/sales/SalesHistory'

/**
 * Страница истории продаж
 * GET /sales
 */
export default function SalesPage() {
  return (
    <div style={styles.container}>
      <SalesHistory />
    </div>
  )
}

// Стили
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
  },
}
