'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { useUserStore } from '@/lib/store/user'
import { motion } from 'framer-motion'

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { getTotalItems } = useCartStore()
  const { user } = useUserStore()
  const cartCount = getTotalItems()

  const navItems = [
    {
      icon: (active: boolean) => (
        <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
      label: 'Home',
      path: '/',
      active: pathname === '/'
    },
    {
      icon: (active: boolean) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
      label: 'Search',
      path: '/search',
      active: pathname === '/search'
    },
    {
      icon: (active: boolean) => (
        <div className="relative">
          <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-pink-500 to-rose-600 text-white text-[10px] font-medium rounded-full h-4 w-4 flex items-center justify-center shadow-md">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </div>
      ),
      label: 'Cart',
      path: '/cart',
      active: pathname === '/cart'
    },
    {
      icon: (active: boolean) => (
        <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      ),
      label: 'Orders',
      path: '/orders',
      active: pathname === '/orders'
    },
    {
      icon: (active: boolean) => (
        <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      label: 'Account',
      path: user ? '/profile' : '/auth',
      active: pathname === '/profile' || pathname === '/auth'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-neutral-100 z-50 lg:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => (
          <motion.button
            key={item.path}
            onClick={() => router.push(item.path)}
            whileTap={{ scale: 0.9 }}
            className={`flex flex-col items-center justify-center gap-0.5 ${
              item.active ? 'text-pink-600' : 'text-neutral-400'
            }`}
          >
            {item.icon(item.active)}
            <span className="text-[10px]">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
