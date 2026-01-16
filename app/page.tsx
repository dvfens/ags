import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'
import CategorySection from '@/components/CategorySection'
import SearchBar from '@/components/SearchBar'
import { prisma } from '@/lib/prisma'

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function Home() {
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-neutral-50">
      <Header />
      
      {/* Search Bar */}
      <SearchBar />

      {/* Hero Banner - Pink Theme */}
      <div className="px-4 pt-3 pb-2">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 rounded-2xl p-5 relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <p className="text-pink-100 text-xs font-medium tracking-wide uppercase">Free Delivery</p>
              <h2 className="text-white text-xl font-semibold mt-1">Same Day Gifts</h2>
              <p className="text-pink-100 text-sm mt-1">Express delivery available</p>
              <button className="mt-4 bg-white text-pink-600 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-pink-50 transition-colors shadow-md">
                Shop Now
              </button>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
              <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Minimal */}
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-4 gap-3">
            <button className="flex flex-col items-center group">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl flex items-center justify-center group-active:scale-95 transition-transform">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xs text-gray-700 mt-2 font-medium">Express</span>
            </button>
            
            <button className="flex flex-col items-center group">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl flex items-center justify-center group-active:scale-95 transition-transform">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2zm0-18C8.13 4 5 7.13 5 11c0 2.38 1.19 4.47 3 5.74V19c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-700 mt-2 font-medium">Flowers</span>
            </button>
            
            <button className="flex flex-col items-center group">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl flex items-center justify-center group-active:scale-95 transition-transform">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2zm6 9h-5V7h-2v8H6c-1.66 0-3 1.34-3 3v1c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-1c0-1.66-1.34-3-3-3z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-700 mt-2 font-medium">Cakes</span>
            </button>
            
            <button className="flex flex-col items-center group">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl flex items-center justify-center group-active:scale-95 transition-transform">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9zM5.6 10.25c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 4.12 13.38 3 12 3S9.5 4.12 9.5 5.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25zM3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-700 mt-2 font-medium">Plants</span>
            </button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <CategorySection type="PRODUCT" title="" />
        </div>
      </div>

      {/* Promo Banner - Pink Theme */}
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-pink-600 text-xs font-medium">Limited Time</p>
              <h3 className="text-gray-900 text-base font-semibold">20% Off First Order</h3>
            </div>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Shop by Occasion */}
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900">Occasions</h2>
            <button className="text-xs text-pink-600 font-medium">See All</button>
          </div>
          <CategorySection type="OCCASION" title="" />
        </div>
      </div>

      {/* Shop by Recipient */}
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-900">For Whom?</h2>
            <button className="text-xs text-pink-600 font-medium">See All</button>
          </div>
          <CategorySection type="RECIPIENT" title="" />
        </div>
      </div>

      {/* Trending Products */}
      <div className="px-4 py-5 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-900">Trending</h2>
            <button className="text-xs text-pink-600 font-medium">View All</button>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}

