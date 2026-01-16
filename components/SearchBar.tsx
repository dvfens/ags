'use client'

import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const router = useRouter()

  return (
    <div className="sticky top-14 z-30 bg-white px-4 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search gifts, flowers, cakes..."
            className="w-full pl-9 pr-4 py-2.5 bg-neutral-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-neutral-200 text-neutral-900 placeholder-neutral-400 cursor-pointer"
            onClick={() => router.push('/search')}
            readOnly
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
