import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'development-secret-key-12345');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value;
    
    // No token - redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    try {
      // Verify JWT token
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = (payload as any).role;
      
      console.log('🔐 Middleware - User role:', userRole, 'Path:', pathname);
      
      // Check if user is admin
      if (userRole !== 'ADMIN') {
        console.log('🚫 Access denied - Not admin');
        return NextResponse.redirect(new URL('/', request.url));
      }
      
      console.log('✅ Admin access granted');
    } catch (error) {
      // Invalid token - redirect to login
      console.error('❌ JWT verification failed:', error);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};