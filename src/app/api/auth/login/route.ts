// app/api/auth/login/route.ts - UPDATED WITH REGION

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getRegionFromRequest, setRegionCookie } from '@/lib/region'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 LOGIN API CALLED');
    
    // 1. Get email and password from request
    const body = await request.json()
    const { email, password } = body
    
    console.log('📧 Email:', email);
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // 2. Find user in database
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    // 3. If user doesn't exist, return error
    if (!user) {
      console.log('❌ User not found:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // 4. Compare password with hashed password in database
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    console.log('✅ Password valid for:', email);
    console.log('👤 User role:', user.role);
    
    // ====== REGION DETECTION ======
    const detectedRegion = getRegionFromRequest(request)
    console.log(`📍 Login detected region: ${detectedRegion}`)
    
    // If user has no region set, update with detected region
    let userRegion = user.region
    if (!userRegion) {
      userRegion = detectedRegion
      await prisma.user.update({
        where: { id: user.id },
        data: { region: detectedRegion }
      })
      console.log(`✅ Updated user region to: ${detectedRegion}`)
    } else {
      console.log(`✅ User already has region: ${userRegion}`)
    }
    
    // 5. Create a JWT token with region
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name,
        role: user.role,
        region: userRegion,
      },
      process.env.JWT_SECRET || "development-secret-key-12345",
      { expiresIn: '7d' }
    )
    
    console.log('✅ JWT token created with role:', user.role);
    
    // 6. Create success response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        region: userRegion,
      }
    })
    
    // 7. Set the token as a secure HTTP-only cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })
    
    // Also set a non-httpOnly cookie for client-side checks
    response.cookies.set({
      name: 'is_logged_in',
      value: 'true',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })
    
    // Set region cookie
    setRegionCookie(response, userRegion || detectedRegion)
    
    console.log('🍪 Cookies set successfully');
    
    return response
    
  } catch (error) {
    console.error('❌ Login API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}