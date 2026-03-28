'use client'

import { useCart } from '@/context/CartContext'
import { useRouter } from 'next/navigation'

/**
 * Страница корзины
 * GET /cart
 */
export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart()
  const router = useRouter()

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Обработчик оформления заказа
  const handleCheckout = () => {
    if (cart.items.length === 0) {
      alert('Корзина пуста')
      return
    }
    router.push('/checkout')
  }

  // Если корзина пуста
  if (cart.items.length === 0) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Корзина</h1>
        <div style={styles.empty}>
          <p style={styles.emptyText}>Ваша корзина пуста</p>
          <button
            onClick={() => router.push('/tours')}
            style={styles.button}
          >
            Перейти в каталог
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Корзина</h1>

      <div style={styles.content}>
        {/* Список элементов */}
        <div style={styles.items}>
          {cart.items.map((item) => (
            <div key={item.tourId} style={styles.item}>
              {/* Изображение */}
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={styles.itemImage}
                />
              ) : (
                <div style={styles.itemImagePlaceholder}>
                  <span>Нет фото</span>
                </div>
              )}

              {/* Информация */}
              <div style={styles.itemInfo}>
                <h3 style={styles.itemTitle}>{item.title}</h3>
                <p style={styles.itemPrice}>{formatPrice(item.price)}</p>
              </div>

              {/* Количество */}
              <div style={styles.quantity}>
                <button
                  onClick={() =>
                    updateQuantity(item.tourId, item.quantity - 1)
                  }
                  style={styles.quantityButton}
                >
                  −
                </button>
                <span style={styles.quantityValue}>{item.quantity}</span>
                <button
                  onClick={() =>
                    updateQuantity(item.tourId, item.quantity + 1)
                  }
                  style={styles.quantityButton}
                >
                  +
                </button>
              </div>

              {/* Итого для элемента */}
              <div style={styles.itemTotal}>
                {formatPrice(item.price * item.quantity)}
              </div>

              {/* Удалить */}
              <button
                onClick={() => removeFromCart(item.tourId)}
                style={styles.removeButton}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Итого */}
        <div style={styles.summary}>
          <h2 style={styles.summaryTitle}>Итого</h2>
          <div style={styles.summaryRow}>
            <span>Товаров:</span>
            <span>{cart.itemCount}</span>
          </div>
          <div style={styles.summaryRow}>
            <span>Общая сумма:</span>
            <span style={styles.summaryTotal}>{formatPrice(cart.total)}</span>
          </div>

          <div style={styles.actions}>
            <button
              onClick={clearCart}
              style={styles.clearButton}
            >
              Очистить корзину
            </button>
            <button
              onClick={handleCheckout}
              style={styles.checkoutButton}
            >
              Оформить заказ
            </button>
          </div>
        </div>
      </div>
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
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '2rem',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '2rem',
  },
  empty: {
    padding: '3rem',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
  },
  emptyText: {
    fontSize: '1.125rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  items: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
  },
  item: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr auto auto auto',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    alignItems: 'center',
  },
  itemImage: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: '0.375rem',
  },
  itemImagePlaceholder: {
    width: '100px',
    height: '100px',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    borderRadius: '0.375rem',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  itemTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
  },
  itemPrice: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  quantity: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  quantityButton: {
    width: '32px',
    height: '32px',
    backgroundColor: '#e5e7eb',
    border: 'none',
    borderRadius: '0.25rem',
    fontSize: '1.25rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontSize: '1rem',
    fontWeight: '500',
    minWidth: '32px',
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1f2937',
    minWidth: '100px',
    textAlign: 'right',
  },
  removeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  summary: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    height: 'fit-content',
  },
  summaryTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '1rem',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    fontSize: '0.875rem',
    color: '#4b5563',
  },
  summaryTotal: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1f2937',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  clearButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  checkoutButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
}
