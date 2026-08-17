// app/api/auth/me/route.ts - UPDATED WITH REGION

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import { getRegionFromRequest, getRegionFromCookies } from '@/lib/region'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 ME API CALLED');
    
    // 1. Get the token from cookies (check both possible names)
    const token = request.cookies.get('auth_token')?.value || 
                  request.cookies.get('token')?.value ||
                  request.cookies.get('next-auth.session-token')?.value;
    
    console.log('🍪 Token from cookie:', token ? 'Present' : 'Not present');
    console.log('🍪 All cookies:', request.cookies.getAll().map(c => c.name));

    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // 2. Verify the JWT token
    let decodedToken;
    try {
      const jwtSecret = process.env.JWT_SECRET || "development-secret-key-12345";
      decodedToken = jwt.verify(token, jwtSecret) as {
        userId: string
        email: string
        name?: string
        role?: string
        region?: string
      }
      console.log('✅ Token verified for user:', decodedToken.email);
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError)
      
      // Clear invalid token
      const response = NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
      response.cookies.delete('auth_token')
      response.cookies.delete('token')
      response.cookies.delete('next-auth.session-token')
      return response
    }
    
    // 3. Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        region: true,
        createdAt: true
      }
    })
    
    if (!user) {
      console.log('❌ User not found in database:', decodedToken.userId);
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
      response.cookies.delete('auth_token')
      response.cookies.delete('token')
      response.cookies.delete('next-auth.session-token')
      return response
    }
    
    // ====== REGION SYNC ======
    // If user has no region, detect and update
    let userRegion = user.region
    if (!userRegion) {
      const detectedRegion = getRegionFromRequest(request)
      userRegion = detectedRegion
      
      // Update user in database
      await prisma.user.update({
        where: { id: user.id },
        data: { region: detectedRegion }
      })
      console.log(`✅ Updated user region to: ${detectedRegion}`)
    }
    
    console.log('✅ User found:', user.email, 'Region:', userRegion);
    
    // 4. Return user data with region
    return NextResponse.json({
      success: true,
      user: {
        ...user,
        region: userRegion,
      }
    })
    
  } catch (error) {
    console.error('❌ Get current user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}