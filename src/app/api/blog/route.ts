import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/blog - Get published blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const exclude = searchParams.get('exclude') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const status = searchParams.get('status') || 'PUBLISHED';

    const where: any = {};
    
    // Only show published posts for public, but allow status override
    if (status) {
      where.status = status;
    } else {
      where.status = 'PUBLISHED';
    }
    
    if (category) {
      where.category = category;
    }
    
    if (exclude) {
      where.id = { not: exclude };
    }

    console.log('Fetching posts with where:', where);

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true
            }
          }
        }
      }),
      prisma.blogPost.count({ where })
    ]);

    console.log(`Found ${posts.length} posts`);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch blog posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}