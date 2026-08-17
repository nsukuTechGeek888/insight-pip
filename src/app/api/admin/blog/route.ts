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
      select: { id: true, role: true, name: true, email: true }
    });
    
    if (user?.role !== 'ADMIN') return null;
    return user;
  } catch { 
    return null; 
  }
}

// GET /api/admin/blog - Get blog posts
export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status !== 'all') where.status = status;
    if (category !== 'all') where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { author: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/admin/blog - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, summary, content, category, tags, imageUrl, featured, status } = body;

    // Validate required fields
    if (!title || !summary || !content || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, summary, content, and category are required' 
      }, { status: 400 });
    }

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug }
    });

    if (existingPost) {
      return NextResponse.json({ 
        error: 'A post with this slug already exists' 
      }, { status: 400 });
    }

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        summary,
        content,
        category,
        tags: tags || [],
        imageUrl: imageUrl || '',
        featured: featured || false,
        status: status || 'DRAFT',
        authorId: admin.id,
        publishedAt: status === 'PUBLISHED' ? new Date() : null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      post,
      message: 'Blog post created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/admin/blog - Update a blog post
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { postId, action, title, slug, summary, content, category, tags, imageUrl, featured, status } = body;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let updateData: any = {};

    // Handle actions
    if (action) {
      switch(action) {
        case 'publish':
          updateData = { status: 'PUBLISHED', publishedAt: new Date() };
          break;
        case 'draft':
          updateData = { status: 'DRAFT', publishedAt: null };
          break;
        case 'archive':
          updateData = { status: 'ARCHIVED' };
          break;
        case 'feature':
          updateData = { featured: true };
          break;
        case 'unfeature':
          updateData = { featured: false };
          break;
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    } else {
      // Full update
      if (title) updateData.title = title;
      if (slug) updateData.slug = slug;
      if (summary) updateData.summary = summary;
      if (content) updateData.content = content;
      if (category) updateData.category = category;
      if (tags) updateData.tags = tags;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (featured !== undefined) updateData.featured = featured;
      if (status) {
        updateData.status = status;
        if (status === 'PUBLISHED') updateData.publishedAt = new Date();
      }
    }

    const post = await prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      post,
      message: 'Blog post updated successfully'
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/admin/blog - Delete a blog post
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const existingPost = await prisma.blogPost.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await prisma.blogPost.delete({
      where: { id: postId }
    });

    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}