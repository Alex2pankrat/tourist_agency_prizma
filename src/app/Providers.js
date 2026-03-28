'use client'

import { CartProvider } from '@/context/CartContext'

/**
 * Провайдер для всего приложения
 * Оборачивает приложение с CartProvider
 */
export default function Providers({ children }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  )
}
