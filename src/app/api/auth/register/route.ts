// app/api/auth/register/route.ts - UPDATED WITH REGION

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getRegionFromRequest, setRegionCookie } from '@/lib/region'

export async function POST(request: NextRequest) {
  console.log("🔐 REGISTER API CALLED")
  
  try {
    // 1. Parse request body
    const body = await request.json()
    console.log("📦 Raw request body:", JSON.stringify(body, null, 2))
    
    // 2. Extract fields - accept both 'name' and 'fullName' from frontend
    const { email, password } = body
    
    // Accept both 'name' and 'fullName' for maximum compatibility
    const name = body.name || body.fullName || ''
    
    console.log("📝 Extracted values:", {
      email: email || '(missing)',
      password: password ? `***${password.slice(-3)}` : '(missing)',
      name: name || '(missing)',
      receivedAs: body.fullName ? 'fullName' : body.name ? 'name' : 'none'
    })
    
    // 3. Validate required fields
    const validationErrors = []
    
    if (!email) validationErrors.push('Email is required')
    if (!password) validationErrors.push('Password is required')
    if (!name) validationErrors.push('Name is required')
    
    if (validationErrors.length > 0) {
      console.log("❌ Validation failed:", validationErrors)
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      )
    }
    
    // 4. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Invalid email format:", email)
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }
    
    // 5. Validate password strength
    if (password.length < 6) {
      console.log("❌ Password too short:", password.length)
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }
    
    // 6. Check if user already exists
    console.log("🔍 Checking for existing user...")
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log("❌ User already exists:", email)
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }
    
    // ====== REGION DETECTION ======
    const region = getRegionFromRequest(request)
    console.log(`📍 Registering user with region: ${region}`)
    
    // 7. Hash the password
    console.log("🔒 Hashing password...")
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // 8. Create user in database with region
    console.log("📝 Creating user with:", {
      email,
      name,
      region,
      passwordHash: hashedPassword.substring(0, 20) + '...'
    })
    
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password: hashedPassword,
        region: region, // Store the region
      },
      select: {
        id: true,
        email: true,
        name: true,
        region: true,
        createdAt: true
      }
    })
    
    console.log("✅ User created successfully:", {
      id: user.id,
      email: user.email,
      name: user.name,
      region: user.region
    })
    
    // 9. Create response with region cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Account created successfully!',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          region: user.region,
          createdAt: user.createdAt
        }
      },
      { status: 201 }
    )
    
    // Set region cookie
    setRegionCookie(response, region)
    
    return response
    
  } catch (error: any) {
    console.error("💥 Registration error:", error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      console.log("❌ Duplicate email (Prisma error)")
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }
    
    if (error.code === 'P1001') {
      console.log("❌ Database connection error")
      return NextResponse.json(
        { error: 'Database connection failed. Please try again.' },
        { status: 500 }
      )
    }
    
    // Log unexpected errors
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}