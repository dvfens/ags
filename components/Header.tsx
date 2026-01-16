'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart'
import { useUserStore } from '@/lib/store/user'
import { useLocationStore } from '@/lib/store/location'
import LocationModal from './LocationModal'

export default function Header() {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const totalItems = useCartStore((state) => state.getTotalItems())
  const user = useUserStore((state) => state.user)
  const deliveryAddress = useLocationStore((state) => state.deliveryAddress)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 bg-white border-b border-neutral-100 safe-area-top"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">AGS</span>
            </motion.div>
          </Link>

          {/* Location */}
          {mounted ? (
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-2 flex-1 py-2 px-3 rounded-lg hover:bg-neutral-50 transition-colors min-w-0"
            >
              <svg className="w-4 h-4 text-pink-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm text-neutral-900 truncate">
                  {deliveryAddress?.label || 'Select location'}
                </p>
              </div>
              <svg className="w-4 h-4 text-neutral-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-1 py-2 px-3 min-w-0">
              <div className="w-4 h-4 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 bg-neutral-200 rounded flex-1 animate-pulse" />
            </div>
          )}

          {/* Cart */}
          <Link href="/cart" className="hidden lg:block">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="relative p-2 hover:bg-neutral-50 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {mounted && totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-pink-500 to-rose-600 text-white text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center shadow-md">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </motion.div>
            </Link>

            {/* User - Only on desktop */}
            <Link href={user ? '/account' : '/auth'} className="hidden lg:block">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </motion.div>
            </Link>
          </div>
        </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </motion.header>
  )
}
