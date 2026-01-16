'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocationStore } from '@/lib/store/location'
import { useUserStore } from '@/lib/store/user'
import MapPicker from './MapPicker'

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { setCurrentLocation, setDeliveryAddress, deliveryAddress } = useLocationStore()
  const { user } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'form'>('select')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [formData, setFormData] = useState({
    label: 'Home',
    street: '',
    apartment: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  })

  const handleLocationSelect = async (lat: number, lng: number, address: string) => {
    setCoords({ lat, lng })
    setSelectedAddress(address)
    
    // Parse address to pre-fill form with detailed data
    try {
      const response = await fetch(
        `/api/location/reverse-geocode?lat=${lat}&lng=${lng}`
      )
      const data = await response.json()
      
      // Use the pre-parsed data from API for more accuracy
      if (data.parsed) {
        setFormData({
          ...formData,
          street: data.parsed.street || '',
          landmark: data.parsed.landmark || '',
          city: data.parsed.city || '',
          state: data.parsed.state || '',
          pincode: data.parsed.pincode || '',
        })
      } else {
        // Fallback to manual parsing
        const addressComponents = data.fullResult?.address_components || []
        const street = data.fullResult?.formatted_address?.split(',')[0] || ''
        
        let city = '', state = '', pincode = ''
        addressComponents.forEach((component: any) => {
          if (component.types.includes('locality')) {
            city = component.long_name
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name
          }
          if (component.types.includes('postal_code')) {
            pincode = component.long_name
          }
        })
        
        setFormData({
          ...formData,
          street,
          city,
          state,
          pincode,
        })
      }
    } catch (err) {
      console.error('Error parsing address:', err)
    }
  }

  const handleProceedToForm = () => {
    if (coords) {
      setStep('form')
    }
  }

  const handleBackToMap = () => {
    setStep('select')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const location = {
        latitude: coords?.lat || 0,
        longitude: coords?.lng || 0,
        address: `${formData.street}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        ...formData,
      }

      // Save to location store
      setCurrentLocation(location)
      setDeliveryAddress(location)

      // If user is logged in, save to database
      if (user) {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            latitude: coords?.lat || 0,
            longitude: coords?.lng || 0,
            isDefault: true, // Set as default address
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save address')
        }
      }

      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save address')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          {/* Bottom Sheet Modal - Mobile App Style */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed bottom-0 left-0 right-0 z-[60] lg:relative lg:inset-0 lg:flex lg:items-center lg:justify-center lg:p-4"
          >
            <div className="bg-white rounded-t-3xl lg:rounded-2xl shadow-xl w-full max-h-[92vh] overflow-hidden flex flex-col lg:max-w-2xl mb-16 lg:mb-0">
              {/* Drag Handle - Mobile Only */}
              <div className="lg:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  {step === 'form' && (
                    <button
                      onClick={handleBackToMap}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <h2 className="text-lg font-bold text-gray-900">
                    {step === 'select' ? 'Choose Location' : 'Complete Address'}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-600 p-3 mx-5 mt-4 rounded-xl text-sm flex items-start gap-2"
                >
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4">{step === 'select' ? (
                  <div className="space-y-4">
                    {selectedAddress && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-gray-200 rounded-xl p-3"
                      >
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide font-medium">Selected Location</p>
                        <p className="text-sm text-gray-900 leading-relaxed">{selectedAddress}</p>
                      </motion.div>
                    )}
                    
                    <div className="h-[280px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                      <MapPicker 
                        onLocationSelect={handleLocationSelect}
                        initialLat={deliveryAddress?.latitude || 28.6139}
                        initialLng={deliveryAddress?.longitude || 77.2090}
                      />
                    </div>
                  </div>

                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Address Type */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                        Save As
                      </label>
                      <div className="flex gap-2">
                        {['Home', 'Work', 'Other'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, label: type })}
                            className={`flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                              formData.label === type
                                ? 'bg-pink-500 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                        House/Flat/Block No. <span className="text-pink-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 transition-all"
                        placeholder="e.g. A-101"
                      />
                    </div>

                    {/* Apartment/Building */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                        Apartment/Road/Area
                      </label>
                      <input
                        type="text"
                        value={formData.apartment}
                        onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 transition-all"
                        placeholder="Building or area name"
                      />
                    </div>

                    {/* Landmark */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                        Landmark
                      </label>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 transition-all"
                        placeholder="Nearby landmark"
                      />
                    </div>

                    {/* City, State, Pincode */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                          City <span className="text-pink-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 transition-all"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                          Pincode <span className="text-pink-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 transition-all"
                          placeholder="000000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                        State <span className="text-pink-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900 transition-all"
                        placeholder="State"
                      />
                    </div>
                  </form>
                )}
              </div>

              {/* Fixed Bottom Button */}
              <div className="px-5 py-4 border-t border-gray-100 bg-white">
                {step === 'select' ? (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleProceedToForm}
                    disabled={!coords}
                    className="w-full bg-pink-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-200"
                  >
                    Confirm & Continue
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full bg-pink-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-200"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      'Save Address'
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
