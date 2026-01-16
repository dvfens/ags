'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { useCartStore } from '@/lib/store/cart'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  image: string
  images: string[]
  imageAlt?: string
  isVeg: boolean
  prepTime: number
  tags: string[]
  discount: number
  isAvailable: boolean
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price - (product.price * (product.discount || 0) / 100),
      image: product.image,
      isVeg: true,
      quantity
    })
    router.push('/cart')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="spinner"></div>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!product) {
    return null
  }

  const allImages = [product.image, ...(product.images || [])].filter(Boolean)
  const finalPrice = product.price - (product.price * (product.discount || 0) / 100)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-xl p-6 shadow-sm">
          {/* Images Section */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4"
            >
              <Image
                src={allImages[selectedImage]}
                alt={product.imageAlt || product.name}
                fill
                className="object-cover"
                priority
              />
              {product.discount > 0 && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {product.discount}% OFF
                </div>
              )}
            </motion.div>

            {/* Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                      selectedImage === idx ? 'border-pink-500' : 'border-gray-200'
                    }`}
                  >
                    <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              {product.isVeg && (
                <div className="w-5 h-5 border-2 border-green-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                </div>
              )}
              <span className="text-sm text-gray-500">{product.category}</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-pink-600">₹{finalPrice.toFixed(2)}</span>
              {product.discount > 0 && (
                <span className="text-xl text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
              )}
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-600">Prep time: {product.prepTime} mins</span>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold py-4 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {product.isAvailable ? 'Add to Cart' : 'Currently Unavailable'}
            </motion.button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
