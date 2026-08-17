import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/blog/[slug]/like - Like a blog post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (!post) {
      return NextResponse.json({ 
        error: 'Post not found' 
      }, { status: 404 });
    }

    const updated = await prisma.blogPost.update({
      where: { id: post.id },
      data: { likes: { increment: 1 } }
    });

    return NextResponse.json({
      success: true,
      likes: updated.likes
    });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ 
      error: 'Failed to like post' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}