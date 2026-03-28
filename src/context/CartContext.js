'use client'

import { createContext, useContext, useState, useEffect } from 'react'

/**
 * Контекст корзины для глобального управления состоянием
 */
const CartContext = createContext(null)

/**
 * Провайдер корзины
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Дочерние элементы
 */
export function CartProvider({ children }) {
  const [cart, setCart] = useState({
    items: [],
    total: 0,
    itemCount: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Загрузка корзины из localStorage при монтировании
   */
  useEffect(() => {
    loadCart()
  }, [])

  /**
   * Загрузка корзины из localStorage
   */
  const loadCart = () => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        setCart(parsed)
      }
    } catch (err) {
      console.error('Ошибка при загрузке корзины:', err)
      setError('Не удалось загрузить корзину')
    }
  }

  /**
   * Сохранение корзины в localStorage
   */
  const saveCart = (newCart) => {
    try {
      localStorage.setItem('cart', JSON.stringify(newCart))
      setCart(newCart)
    } catch (err) {
      console.error('Ошибка при сохранении корзины:', err)
      setError('Не удалось сохранить корзину')
    }
  }

  /**
   * Добавление элемента в корзину
   * @param {string} tourId - ID тура
   * @param {Object} tourData - Данные тура (title, price, imageUrl)
   * @param {number} quantity - Количество
   */
  const addToCart = async (tourId, tourData, quantity = 1) => {
    setLoading(true)
    setError(null)
    
    try {
      // Проверяем, есть ли уже такой тур в корзине
      const existingItemIndex = cart.items.findIndex(
        (item) => item.tourId === tourId
      )
      
      let newItems
      
      if (existingItemIndex >= 0) {
        // Обновляем количество существующего элемента
        newItems = cart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Добавляем новый элемент
        newItems = [
          ...cart.items,
          {
            tourId,
            title: tourData.title,
            price: tourData.price,
            imageUrl: tourData.imageUrl,
            quantity,
          },
        ]
      }
      
      // Пересчитываем общую стоимость
      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      
      const itemCount = newItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      )
      
      // Сохраняем обновленную корзину
      saveCart({
        items: newItems,
        total,
        itemCount,
      })
      
      return true
    } catch (err) {
      console.error('Ошибка при добавлении в корзину:', err)
      setError('Не удалось добавить в корзину')
      return false
    } finally {
      setLoading(false)
    }
  }

  /**
   * Обновление количества элемента
   * @param {string} tourId - ID тура
   * @param {number} quantity - Новое количество
   */
  const updateQuantity = (tourId, quantity) => {
    try {
      if (quantity < 1) {
        return removeFromCart(tourId)
      }
      
      const newItems = cart.items.map((item) =>
        item.tourId === tourId ? { ...item, quantity } : item
      )
      
      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      
      const itemCount = newItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      )
      
      saveCart({
        items: newItems,
        total,
        itemCount,
      })
    } catch (err) {
      console.error('Ошибка при обновлении количества:', err)
      setError('Не удалось обновить количество')
    }
  }

  /**
   * Удаление элемента из корзины
   * @param {string} tourId - ID тура
   */
  const removeFromCart = (tourId) => {
    try {
      const newItems = cart.items.filter((item) => item.tourId !== tourId)
      
      const total = newItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      
      const itemCount = newItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      )
      
      saveCart({
        items: newItems,
        total,
        itemCount,
      })
    } catch (err) {
      console.error('Ошибка при удалении из корзины:', err)
      setError('Не удалось удалить из корзины')
    }
  }

  /**
   * Очистка корзины
   */
  const clearCart = () => {
    try {
      saveCart({
        items: [],
        total: 0,
        itemCount: 0,
      })
    } catch (err) {
      console.error('Ошибка при очистке корзины:', err)
      setError('Не удалось очистить корзину')
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

/**
 * Хук для использования контекста корзины
 */
export function useCart() {
  const context = useContext(CartContext)
  
  if (!context) {
    throw new Error('useCart должен использоваться внутри CartProvider')
  }
  
  return context
}
