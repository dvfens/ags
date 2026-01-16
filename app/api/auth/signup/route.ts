import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate a unique phone placeholder if not provided
    const userPhone = phone || `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        phone: userPhone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
      },
    })

    // Generate token
    const token = await signToken({ userId: user.id, email: user.email })

    return NextResponse.json({ user, token }, { status: 201 })
  } catch (error) {
    console.error('Error during signup:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
