'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  emoji: string
  image?: string
  type: string
}

interface CategorySectionProps {
  type: 'PRODUCT' | 'RECIPIENT' | 'OCCASION'
  title: string
}

// Default icons for categories without images
const categoryIcons: { [key: string]: JSX.Element } = {
  default: (
    <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
}

export default function CategorySection({ type, title }: CategorySectionProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    fetchCategories()
  }, [type])

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/categories?type=${type}`)
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  if (categories.length === 0) return null

  return (
    <div>
      {title && <h2 className="text-base font-semibold text-gray-900 mb-3">{title}</h2>}
      
      {/* Clean Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 flex flex-col items-center"
          >
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-all overflow-hidden ${
                selectedCategory === category.id
                  ? 'ring-2 ring-pink-500 ring-offset-2'
                  : ''
              } bg-gradient-to-br from-gray-50 to-gray-100`}
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-pink-600">
                    {category.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <span className={`text-xs font-medium text-center w-16 line-clamp-1 ${
              selectedCategory === category.id ? 'text-pink-600' : 'text-gray-600'
            }`}>
              {category.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
