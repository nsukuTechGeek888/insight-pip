import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/blog/[slug] - Get a single blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ 
        success: false,
        error: 'Slug is required' 
      }, { status: 400 });
    }

    console.log('Fetching post with slug:', slug);

    const post = await prisma.blogPost.findUnique({
      where: { 
        slug,
        status: 'PUBLISHED'
      },
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
    });

    if (!post) {
      console.log('Post not found for slug:', slug);
      return NextResponse.json({ 
        success: false,
        error: 'Post not found' 
      }, { status: 404 });
    }

    console.log('Post found:', post.id);

    // Increment views
    await prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      post: {
        ...post,
        views: post.views + 1
      }
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch blog post',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}