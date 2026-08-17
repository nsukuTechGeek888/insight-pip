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

// PUT /api/admin/reviews/replies - Update reply (approve/unapprove)
export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { replyId, approve } = body;

    if (!replyId) {
      return NextResponse.json({ error: 'Reply ID is required' }, { status: 400 });
    }

    // Check if reply exists
    const existingReply = await prisma.reviewReply.findUnique({
      where: { id: replyId }
    });

    if (!existingReply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    const updatedReply = await prisma.reviewReply.update({
      where: { id: replyId },
      data: { 
        isApproved: approve,
        moderatedBy: admin.id,
        moderatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      reply: updatedReply,
      message: `Reply ${approve ? 'approved' : 'unapproved'} successfully`
    });
  } catch (error) {
    console.error('Error updating reply:', error);
    return NextResponse.json({ 
      error: 'Failed to update reply',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/admin/reviews/replies - Delete a reply
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const replyId = searchParams.get('id');

    if (!replyId) {
      return NextResponse.json({ error: 'Reply ID is required' }, { status: 400 });
    }

    // Check if reply exists
    const existingReply = await prisma.reviewReply.findUnique({
      where: { id: replyId }
    });

    if (!existingReply) {
      return NextResponse.json({ error: 'Reply not found' }, { status: 404 });
    }

    // Get the review ID to update reply count
    const reviewId = existingReply.reviewId;

    // Delete the reply
    await prisma.reviewReply.delete({
      where: { id: replyId }
    });

    // Update the review's reply count
    await prisma.review.update({
      where: { id: reviewId },
      data: { replyCount: { decrement: 1 } }
    });

    return NextResponse.json({
      success: true,
      message: 'Reply deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    return NextResponse.json({ 
      error: 'Failed to delete reply',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}