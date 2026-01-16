'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

interface GiftWrap {
  id: string
  name: string
  price: number
  type: string
  image: string
}

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart, giftOptions, setGiftOptions } = useCartStore()
  const [giftWraps, setGiftWraps] = useState<GiftWrap[]>([])
  const [mounted, setMounted] = useState(false)
  const totalItems = getTotalItems()
  const subtotal = getTotalPrice()
  const selectedWrap = Array.isArray(giftWraps) ? giftWraps.find(w => w.id === giftOptions.giftWrapId) : null
  const giftWrapPrice = selectedWrap?.price || 0
  const deliveryFee = (subtotal + giftWrapPrice) > 199 ? 0 : 40
  const tax = (subtotal + giftWrapPrice) * 0.05
  const total = subtotal + giftWrapPrice + deliveryFee + tax

  useEffect(() => {
    setMounted(true)
    const fetchGiftWraps = async () => {
      try {
        const res = await fetch('/api/gift-wraps')
        if (res.ok) {
          const data = await res.json()
          setGiftWraps(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching gift wraps:', error)
      }
    }
    fetchGiftWraps()
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-8xl mb-4"
            >
              🛍️
            </motion.div>
            <h1 className="text-xl font-bold text-gray-900 mb-6">Cart is empty</h1>
            <Link href="/">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg"
              >
                Browse Gifts
              </motion.button>
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-4 py-3">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3">Your Cart ({totalItems})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 p-3 flex items-start space-x-3"
              >
                <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h3>
                      <p className="text-pink-600 font-bold text-sm">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1 -mr-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-white text-gray-700 w-7 h-7 rounded-md font-bold shadow-sm border border-gray-200 hover:bg-gray-50"
                      >
                        −
                      </motion.button>
                      <span className="font-semibold text-sm px-3 min-w-[2rem] text-center">{item.quantity}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-pink-500 text-white w-7 h-7 rounded-md font-bold shadow-sm hover:bg-pink-600"
                      >
                        +
                      </motion.button>
                    </div>
                    <p className="text-base font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20"
            >
              <h2 className="text-base font-bold text-gray-900 mb-3">Summary</h2>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                {giftWrapPrice > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>🎁 {selectedWrap?.name}</span>
                    <span className="font-medium text-gray-900">+{formatPrice(giftWrapPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : 'font-medium text-gray-900'}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (5%)</span>
                  <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-base font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-pink-600">{formatPrice(total)}</span>
                </div>
              </div>

              {subtotal < 199 && (
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-2.5 mb-3 text-xs text-pink-800 flex items-center space-x-2">
                  <span>🎉</span>
                  <span>Add {formatPrice(199 - subtotal)} more for free delivery!</span>
                </div>
              )}

              {/* Gift Option Toggle */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mb-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">🎁</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Send as Gift</p>
                      <p className="text-xs text-gray-500">Add wrapping & card</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={giftOptions.isGift}
                    onChange={(e) => setGiftOptions({ ...giftOptions, isGift: e.target.checked, giftWrapId: e.target.checked ? giftOptions.giftWrapId : undefined })}
                    className="w-5 h-5 text-pink-500 rounded focus:ring-2 focus:ring-pink-500"
                  />
                </label>
                {giftOptions.isGift && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-pink-200 space-y-2"
                  >
                    <p className="text-xs font-semibold text-gray-700">Choose Wrap:</p>
                    {/* Horizontal scrollable gift wraps */}
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-hide">
                      {Array.isArray(giftWraps) && giftWraps.length > 0 ? (
                        giftWraps.map((wrap) => (
                          <label
                            key={wrap.id}
                            className={`flex-shrink-0 w-20 p-2 rounded-lg border cursor-pointer transition-all text-center ${
                              giftOptions.giftWrapId === wrap.id
                                ? 'border-pink-500 bg-white shadow-sm'
                                : 'border-gray-200 bg-white hover:border-pink-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="giftwrap"
                              checked={giftOptions.giftWrapId === wrap.id}
                              onChange={() => setGiftOptions({ ...giftOptions, giftWrapId: wrap.id })}
                              className="sr-only"
                            />
                            <span className="text-2xl block mb-0.5">{wrap.image}</span>
                            <p className="text-[10px] font-medium text-gray-900 truncate">{wrap.name}</p>
                            <p className="text-pink-600 font-bold text-xs">+₹{wrap.price}</p>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">Loading...</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/checkout')}
                className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold shadow-sm hover:bg-pink-600 transition-colors mb-2"
              >
                Checkout • {formatPrice(total)}
              </motion.button>

              <button
                onClick={() => router.push('/')}
                className="w-full text-pink-600 py-2.5 rounded-lg font-medium text-sm hover:bg-pink-50 transition-colors"
              >
                Continue Shopping
              </button>
            </motion.div>
          </div>
        </div>
      <BottomNav />
      </div>
    </div>
  )
}
