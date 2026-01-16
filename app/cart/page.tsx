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
      
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Cart ({totalItems})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4"
              >
                <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                      <p className="text-pink-600 font-bold">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-2 flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="bg-gray-200 text-gray-900 w-8 h-8 rounded-lg font-bold hover:bg-gray-300 smooth-transition"
                    >
                      −
                    </motion.button>
                    <span className="font-semibold px-4">{item.quantity}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="bg-gradient-to-r from-pink-500 to-rose-600 text-white w-8 h-8 rounded-lg font-bold shadow-md smooth-transition"
                    >
                      +
                    </motion.button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {giftWrapPrice > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>🎁 {selectedWrap?.name}</span>
                    <span>+{formatPrice(giftWrapPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (5%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {subtotal < 199 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
                  Add {formatPrice(199 - subtotal)} more to get free delivery!
                </div>
              )}

              {/* Gift Option Toggle */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-lg p-4 mb-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <p className="font-semibold text-gray-900">Send as Gift</p>
                      <p className="text-xs text-gray-600">Add gift wrapping</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={giftOptions.isGift}
                    onChange={(e) => setGiftOptions({ ...giftOptions, isGift: e.target.checked, giftWrapId: e.target.checked ? giftOptions.giftWrapId : undefined })}
                    className="w-6 h-6 text-pink-500 rounded focus:ring-2 focus:ring-pink-500"
                  />
                </label>
                {giftOptions.isGift && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-pink-200 space-y-3"
                  >
                    <p className="text-sm font-semibold text-gray-900">Choose Gift Wrap:</p>
                    {/* Horizontal scrollable gift wraps */}
                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                      {Array.isArray(giftWraps) && giftWraps.length > 0 ? (
                        giftWraps.map((wrap) => (
                          <label
                            key={wrap.id}
                            className={`flex-shrink-0 w-28 p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                              giftOptions.giftWrapId === wrap.id
                                ? 'border-pink-500 bg-pink-50 shadow-md'
                                : 'border-gray-200 hover:border-pink-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="giftwrap"
                              checked={giftOptions.giftWrapId === wrap.id}
                              onChange={() => setGiftOptions({ ...giftOptions, giftWrapId: wrap.id })}
                              className="sr-only"
                            />
                            <span className="text-3xl block mb-1">{wrap.image}</span>
                            <p className="text-xs font-semibold text-gray-900 truncate">{wrap.name}</p>
                            <p className="text-pink-600 font-bold text-sm mt-1">+₹{wrap.price}</p>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Loading...</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 flex items-center space-x-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>Personalize with message & recipient in checkout</span>
                    </p>
                  </motion.div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/checkout')}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 rounded-lg font-semibold shadow-md smooth-transition mb-3"
              >
                Proceed to Checkout
              </motion.button>

              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 smooth-transition"
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
