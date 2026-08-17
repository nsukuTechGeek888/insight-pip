import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getAdminUser(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-key-12345") as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true }
    });
    return user;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser(request);
    
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, reason, details } = body;

    if (!reviewId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Create report
    const report = await prisma.reviewReport.create({
      data: {
        reviewId,
        userId: admin.id,
        reason,
        details: details || null,
        status: 'PENDING'
      }
    });

    // Update review report count
    await prisma.review.update({
      where: { id: reviewId },
      data: { reportCount: { increment: 1 } }
    });

    // Log the action (you could add audit logging here)

    return NextResponse.json({
      success: true,
      report,
      message: 'Review flagged successfully'
    });
  } catch (error) {
    console.error('Error flagging review:', error);
    return NextResponse.json({ error: 'Failed to flag review' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}