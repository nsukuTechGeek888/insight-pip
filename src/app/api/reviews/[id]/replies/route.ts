// app/api/reviews/[id]/replies/route.ts - WORKING VERSION
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-key-12345") as { userId: string };
    return await prisma.user.findUnique({ where: { id: decoded.userId } });
  } catch { return null; }
}

// GET /api/reviews/[id]/replies
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get('parentId');
    
    // Build the where clause
    const where: any = { reviewId: id };
    if (parentId) {
      where.parentReplyId = parentId;
    } else {
      where.parentReplyId = null;
    }
    
    const replies = await prisma.reviewReply.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true } },
        broker: { select: { id: true, name: true, logo: true } },
        propFirm: { select: { id: true, name: true, logo: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, avatar: true, role: true } },
            broker: { select: { id: true, name: true, logo: true } },
            propFirm: { select: { id: true, name: true, logo: true } }
          }
        }
      }
    });

    // Add replyCount to each reply
    const repliesWithCount = await Promise.all(replies.map(async (reply) => {
      const replyCount = await prisma.reviewReply.count({
        where: { parentReplyId: reply.id }
      });
      return { ...reply, replyCount };
    }));

    return NextResponse.json({ success: true, replies: repliesWithCount });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/reviews/[id]/replies
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle both JSON and FormData
    let content: string;
    let parentReplyId: string | null = null;
    let mediaFiles: File[] = [];
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await request.json();
      content = body.content;
      parentReplyId = body.parentReplyId || null;
    } else {
      const formData = await request.formData();
      content = formData.get('content') as string;
      parentReplyId = formData.get('parentReplyId') as string || null;
      mediaFiles = formData.getAll('media') as File[];
    }
    
    if (!content || content.trim().length < 3) {
      return NextResponse.json({ error: 'Comment must be at least 3 characters' }, { status: 400 });
    }

    // Verify review exists
    const review = await prisma.review.findUnique({
      where: { id },
      include: { broker: true, propFirm: true }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Determine reply type
    let brokerId = null;
    let propFirmId = null;
    let replyType = 'USER';

    if (review.brokerId) {
      const broker = await prisma.broker.findUnique({ where: { id: review.brokerId } });
      if (broker && user.email?.toLowerCase().includes(broker.name?.toLowerCase().replace(/\s+/g, '.'))) {
        brokerId = review.brokerId;
        replyType = 'BROKER';
      }
    }
    
    if (review.propFirmId && !brokerId) {
      const propFirm = await prisma.propFirm.findUnique({ where: { id: review.propFirmId } });
      if (propFirm && user.email?.toLowerCase().includes(propFirm.name?.toLowerCase().replace(/\s+/g, '.'))) {
        propFirmId = review.propFirmId;
        replyType = 'PROP_FIRM';
      }
    }
    
    if (user.role === 'ADMIN') {
      replyType = 'ADMIN';
    }

    // Upload media files
    const mediaUrls: string[] = [];
    if (mediaFiles.length > 0) {
      const uploadDir = path.join(process.cwd(), 'public/uploads/replies');
      await mkdir(uploadDir, { recursive: true });

      for (const file of mediaFiles) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${safeName}`;
        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);
        mediaUrls.push(`/uploads/replies/${filename}`);
      }
    }

    // Create reply
    const reply = await prisma.reviewReply.create({
      data: {
        content: content.trim(),
        mediaUrls,
        replyType,
        reviewId: id,
        userId: user.id,
        brokerId,
        propFirmId,
        parentReplyId: parentReplyId,
        isApproved: true
      },
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true } },
        broker: { select: { id: true, name: true, logo: true } },
        propFirm: { select: { id: true, name: true, logo: true } }
      }
    });

    // Update review reply count
    await prisma.review.update({
      where: { id },
      data: { replyCount: { increment: 1 } }
    });

    // If this is a child reply, update parent's replyCount
    if (parentReplyId) {
      await prisma.reviewReply.update({
        where: { id: parentReplyId },
        data: { replyCount: { increment: 1 } }
      });
    }

    return NextResponse.json({
      success: true,
      reply
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json({ error: 'Failed to add reply' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}