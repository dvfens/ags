'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    image: string
    isVeg: boolean
    discount?: number | null
    prepTime: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, items, updateQuantity } = useCartStore()
  const cartItem = items.find((item) => item.id === product.id)
  const quantity = cartItem?.quantity || 0

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      isVeg: product.isVeg,
    })
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateQuantity(product.id, quantity + 1)
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateQuantity(product.id, quantity - 1)
  }

  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-xl overflow-hidden border border-neutral-100 cursor-pointer"
      >
      <div className="relative aspect-square w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        
        {/* Veg/Non-veg indicator */}
        <div className="absolute top-2 left-2">
          <div className={`w-4 h-4 border ${product.isVeg ? 'border-green-600' : 'border-red-500'} flex items-center justify-center bg-white rounded-sm`}>
            <div className={`w-2 h-2 rounded-full ${product.isVeg ? 'bg-green-600' : 'bg-red-500'}`} />
          </div>
        </div>

        {/* Discount badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-1.5 py-0.5 rounded text-[10px] font-medium shadow-md">
            {product.discount}% OFF
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm text-neutral-900 mb-0.5 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-neutral-400 mb-2 line-clamp-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            {product.discount && product.discount > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-neutral-900">
                  {formatPrice(discountedPrice)}
                </span>
                <span className="text-xs text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-neutral-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {quantity === 0 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium shadow-sm whitespace-nowrap"
            >
              Add
            </motion.button>
          ) : (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex items-center bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg shadow-sm overflow-hidden"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDecrement}
                className="w-5 h-6 flex items-center justify-center text-sm font-bold leading-none"
              >
                −
              </motion.button>
              <span className="text-[11px] font-semibold px-0.5 min-w-[14px] text-center">{quantity}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleIncrement}
                className="w-5 h-6 flex items-center justify-center text-sm font-bold leading-none"
              >
                &#43;
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
    </Link>
  )
}
