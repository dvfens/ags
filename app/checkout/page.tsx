'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { useLocationStore } from '@/lib/store/location'
import { useUserStore } from '@/lib/store/user'
import { formatPrice } from '@/lib/utils'
import Header from '@/components/Header'
import LocationPicker from '@/components/LocationPicker'
import BottomNav from '@/components/BottomNav'

interface GiftWrap {
  id: string
  name: string
  price: number
  type: string
  image: string
}

interface Occasion {
  id: string
  name: string
  emoji: string
}

interface Recipient {
  id: string
  name: string
  phone: string
  email?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart, giftOptions, setGiftOptions } = useCartStore()
  const { deliveryAddress } = useLocationStore()
  const { user } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE'>('CASH')
  const [giftWraps, setGiftWraps] = useState<GiftWrap[]>([])
  const [occasions, setOccasions] = useState<Occasion[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    apartment: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 0,
    longitude: 0,
    isDefault: true
  })
  
  const subtotal = getTotalPrice()
  const giftWrapPrice = giftOptions.giftWrapId ? (giftWraps.find(w => w.id === giftOptions.giftWrapId)?.price || 0) : 0
  const deliveryFee = (subtotal + giftWrapPrice) > 199 ? 0 : 40
  const tax = (subtotal + giftWrapPrice) * 0.05
  const total = subtotal + giftWrapPrice + deliveryFee + tax

  useEffect(() => {
    if (!user) {
      router.push('/auth')
    }
    if (items.length === 0) {
      router.push('/')
    }
    fetchGiftData()
    fetchAddresses()
  }, [user, items, router])

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const res = await fetch('/api/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const userAddresses = data.addresses || []
        setAddresses(userAddresses)
        
        // Auto-select default address or first address
        if (userAddresses.length > 0) {
          const defaultAddr = userAddresses.find((a: any) => a.isDefault)
          setSelectedAddressId(defaultAddr?.id || userAddresses[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    }
  }

  const fetchGiftData = async () => {
    try {
      const token = localStorage.getItem('token')
      const [wrapsRes, occasionsRes, recipientsRes] = await Promise.all([
        fetch('/api/gift-wraps'),
        fetch('/api/occasions'),
        fetch('/api/recipients', { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      if (wrapsRes.ok) setGiftWraps(await wrapsRes.json())
      if (occasionsRes.ok) setOccasions(await occasionsRes.json())
      if (recipientsRes.ok) {
        const data = await recipientsRes.json()
        setRecipients(data.recipients || [])
      }
    } catch (error) {
      console.error('Error fetching gift data:', error)
    }
  }

  const handleCreateAddress = async () => {
    if (!newAddress.label || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      alert('Please fill all address fields')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      })

      if (res.ok) {
        const data = await res.json()
        const newAddresses = [...addresses, data.address]
        setAddresses(newAddresses)
        setSelectedAddressId(data.address.id)
        setShowAddressForm(false)
        setNewAddress({ label: 'Home', street: '', apartment: '', landmark: '', city: '', state: '', pincode: '', latitude: 0, longitude: 0, isDefault: true })
        alert('Address saved successfully!')
      } else {
        const errorData = await res.json()
        console.error('Address creation error:', errorData)
        alert(errorData.error || 'Failed to create address')
      }
    } catch (error) {
      console.error('Error creating address:', error)
      alert('Failed to create address')
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && addresses.length === 0) {
      setShowAddressForm(true)
      alert('Please add a delivery address first')
      return
    }

    if (!selectedAddressId) {
      alert('Please select a delivery address')
      return
    }

    if (giftOptions.isGift && !giftOptions.recipientId) {
      alert('Please select a gift recipient')
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items,
          addressId: selectedAddressId,
          paymentMethod,
          subtotal,
          deliveryFee,
          tax,
          total,
          isGift: giftOptions.isGift,
          recipientId: giftOptions.recipientId,
          occasionId: giftOptions.occasionId,
          giftWrapId: giftOptions.giftWrapId,
          greetingMessage: giftOptions.greetingMessage,
          senderName: giftOptions.senderName,
          showSenderName: giftOptions.showSenderName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Order creation failed:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to create order')
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order')
      }

      clearCart()
      router.push(`/orders/${data.order.id}`)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!deliveryAddress) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20">
          <LocationPicker />
        </div>
        <BottomNav />
      </div>
    )
  }

  const selectedWrap = giftWraps.find(w => w.id === giftOptions.giftWrapId)
  const selectedRecipient = recipients.find(r => r.id === giftOptions.recipientId)

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
              
              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label key={addr.id} className="flex items-start space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:border-pink-500 transition-colors"
                      style={{ borderColor: selectedAddressId === addr.id ? '#ec4899' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{addr.label || 'Address'}</p>
                        <p className="text-gray-600 text-sm">{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    </label>
                  ))}
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-pink-500 hover:text-pink-600 transition-colors"
                  >
                    + Add New Address
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">No delivery address added</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-2 rounded-lg shadow-md hover:from-pink-600 hover:to-rose-700"
                  >
                    Add Delivery Address
                  </button>
                </div>
              )}

              {/* Add Address Form */}
              {showAddressForm && (
                <div className="mt-4 p-4 border-2 border-pink-200 rounded-lg bg-pink-50">
                  <h3 className="font-semibold mb-3">New Address</h3>
                  <div className="space-y-3">
                    <select
                      value={newAddress.label}
                      onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg bg-white"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Other">Other</option>
                    </select>
                    <textarea
                      placeholder="Full Address (Street, Building, etc.) *"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Apartment/Flat No."
                        value={newAddress.apartment}
                        onChange={(e) => setNewAddress({...newAddress, apartment: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Landmark"
                        value={newAddress.landmark}
                        onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="City *"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Pincode *"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateAddress}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white py-2 rounded-lg shadow-md hover:from-pink-600 hover:to-rose-700"
                      >
                        Save Address
                      </button>
                      <button
                        onClick={() => setShowAddressForm(false)}
                        className="px-6 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Gift Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">🎁 Send as Gift</h2>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftOptions.isGift}
                    onChange={(e) => setGiftOptions({ ...giftOptions, isGift: e.target.checked })}
                    className="w-5 h-5 text-pink-500 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700">Yes, this is a gift</span>
                </label>
              </div>

              {giftOptions.isGift && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 border-t pt-4"
                >
                  {/* Occasion */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Occasion
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {occasions.map((occ) => (
                        <button
                          key={occ.id}
                          onClick={() => setGiftOptions({ ...giftOptions, occasionId: occ.id })}
                          className={`flex-shrink-0 p-3 rounded-lg border-2 transition-all min-w-[100px] ${
                            giftOptions.occasionId === occ.id
                              ? 'border-primary bg-primary/10 shadow-md'
                              : 'border-gray-200 hover:border-primary'
                          }`}
                        >
                          <span className="text-2xl block mb-1">{occ.emoji}</span>
                          <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">{occ.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recipient */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Recipient
                    </label>
                    <select
                      value={giftOptions.recipientId || ''}
                      onChange={(e) => setGiftOptions({ ...giftOptions, recipientId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    >
                      <option value="">Choose a recipient...</option>
                      {recipients.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.phone})
                        </option>
                      ))}
                    </select>
                    <a
                      href="/recipients"
                      className="text-pink-600 text-xs font-semibold mt-2 hover:underline inline-block"
                    >
                      + Manage recipients
                    </a>
                  </div>

                  {/* Gift Wrapping */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Choose Gift Wrapping
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {giftWraps.map((wrap) => (
                        <button
                          key={wrap.id}
                          onClick={() => setGiftOptions({ ...giftOptions, giftWrapId: wrap.id })}
                          className={`flex-shrink-0 p-4 rounded-lg border-2 transition-all min-w-[140px] ${
                            giftOptions.giftWrapId === wrap.id
                              ? 'border-primary bg-primary/10 shadow-md'
                              : 'border-gray-200 hover:border-primary'
                          }`}
                        >
                          <div className="text-center">
                            <span className="text-3xl block mb-2">{wrap.image}</span>
                            <p className="font-semibold text-gray-900 text-sm">{wrap.name}</p>
                            <p className="text-xs text-gray-600 mb-1">{wrap.type}</p>
                            <p className="text-pink-600 font-bold">+{formatPrice(wrap.price)}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Greeting Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Greeting Message (Optional)
                    </label>
                    <textarea
                      value={giftOptions.greetingMessage || ''}
                      onChange={(e) => setGiftOptions({ ...giftOptions, greetingMessage: e.target.value })}
                      placeholder="Add a personal message on the card..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {(giftOptions.greetingMessage || '').length}/200 characters
                    </p>
                  </div>

                  {/* Sender Details */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-gray-900 text-sm">From</h3>
                    <div>
                      <input
                        type="text"
                        value={giftOptions.senderName || user?.name || ''}
                        onChange={(e) => setGiftOptions({ ...giftOptions, senderName: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 text-sm"
                      />
                    </div>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={giftOptions.showSenderName}
                        onChange={(e) => setGiftOptions({ ...giftOptions, showSenderName: e.target.checked })}
                        className="w-4 h-4 text-pink-500 rounded"
                      />
                      <span className="text-sm text-gray-700">Show my name on the card</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary smooth-transition">
                  <input
                    type="radio"
                    name="payment"
                    value="CASH"
                    checked={paymentMethod === 'CASH'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-5 h-5 text-primary"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive</p>
                  </div>
                </label>
                <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary smooth-transition">
                  <input
                    type="radio"
                    name="payment"
                    value="ONLINE"
                    checked={paymentMethod === 'ONLINE'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-5 h-5 text-primary"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Online Payment</p>
                    <p className="text-sm text-gray-600">UPI, Card, Net Banking</p>
                  </div>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-md p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({items.length})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {giftWrapPrice > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>🎁 {selectedWrap?.name}</span>
                    <span>+{formatPrice(giftWrapPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {giftOptions.isGift && selectedRecipient && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800">
                  <p className="font-semibold mb-1">🎁 Sending to:</p>
                  <p>{selectedRecipient.name}</p>
                  <p className="text-xs mt-1">📞 {selectedRecipient.phone}</p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-800 flex items-start space-x-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Estimated delivery: 20-30 minutes</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={isLoading || (giftOptions.isGift && !giftOptions.recipientId)}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white py-3 rounded-lg font-semibold shadow-md smooth-transition disabled:opacity-50 disabled:cursor-not-allowed hover:from-pink-600 hover:to-rose-700"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Placing order...</span>
                  </div>
                ) : (
                  <span>{giftOptions.isGift ? '🎁 Send as Gift' : 'Place Order'}</span>
                )}
              </motion.button>
            </motion.div>
          </div>
        </div>
      <BottomNav />
      </div>
    </div>
  )
}
