import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getAdminFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-key-12345") as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    });
    
    if (user?.role !== 'ADMIN') return null;
    return user;
  } catch { 
    return null; 
  }
}

// GET /api/admin/blog/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get distinct categories from blog posts
    const posts = await prisma.blogPost.findMany({
      select: { category: true },
      distinct: ['category']
    });

    const categories = posts.map(p => p.category).filter(Boolean);

    // If no categories exist, return default ones
    if (categories.length === 0) {
      return NextResponse.json({
        success: true,
        categories: ['Trading', 'Platforms', 'Reviews', 'Education', 'News']
      });
    }

    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}