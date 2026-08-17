import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Helper function to verify custom JWT token
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "development-secret-key-12345"
    ) as { userId: string; email: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true }
    });
    
    return user;
  } catch (error) {
    console.error('❌ Token verification failed:', error);
    return null;
  }
}

// POST /api/reviews/[id]/helpful - Mark a review as helpful/not helpful
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to vote' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { voteType } = body; // 'HELPFUL' or 'NOT_HELPFUL'

    if (!['HELPFUL', 'NOT_HELPFUL'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      );
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user already voted
    const existingVote = await prisma.helpfulVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: id,
          userId: user.id
        }
      }
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if same type (toggle off)
        await prisma.$transaction([
          prisma.helpfulVote.delete({
            where: { id: existingVote.id }
          }),
          prisma.review.update({
            where: { id },
            data: {
              helpfulCount: voteType === 'HELPFUL' ? { decrement: 1 } : undefined,
              notHelpfulCount: voteType === 'NOT_HELPFUL' ? { decrement: 1 } : undefined
            }
          })
        ]);

        const updatedReview = await prisma.review.findUnique({
          where: { id }
        });

        return NextResponse.json({ 
          success: true,
          message: 'Vote removed',
          helpfulCount: updatedReview?.helpfulCount || 0,
          notHelpfulCount: updatedReview?.notHelpfulCount || 0,
          userVote: null
        });
      } else {
        // Change vote type
        await prisma.$transaction([
          prisma.helpfulVote.update({
            where: { id: existingVote.id },
            data: { voteType }
          }),
          prisma.review.update({
            where: { id },
            data: {
              helpfulCount: voteType === 'HELPFUL' ? { increment: 1 } : { decrement: 1 },
              notHelpfulCount: voteType === 'NOT_HELPFUL' ? { increment: 1 } : { decrement: 1 }
            }
          })
        ]);

        const updatedReview = await prisma.review.findUnique({
          where: { id }
        });

        return NextResponse.json({
          success: true,
          message: 'Vote updated',
          helpfulCount: updatedReview?.helpfulCount || 0,
          notHelpfulCount: updatedReview?.notHelpfulCount || 0,
          userVote: voteType
        });
      }
    } else {
      // Create new vote
      await prisma.$transaction([
        prisma.helpfulVote.create({
          data: {
            voteType,
            reviewId: id,
            userId: user.id
          }
        }),
        prisma.review.update({
          where: { id },
          data: {
            helpfulCount: voteType === 'HELPFUL' ? { increment: 1 } : undefined,
            notHelpfulCount: voteType === 'NOT_HELPFUL' ? { increment: 1 } : undefined
          }
        })
      ]);

      const updatedReview = await prisma.review.findUnique({
        where: { id }
      });

      return NextResponse.json({
        success: true,
        message: 'Vote recorded',
        helpfulCount: updatedReview?.helpfulCount || 0,
        notHelpfulCount: updatedReview?.notHelpfulCount || 0,
        userVote: voteType
      });
    }
  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json(
      { error: 'Failed to vote on review' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/reviews/[id]/helpful - Get user's vote on a review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ userVote: null });
    }

    const vote = await prisma.helpfulVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: id,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({
      userVote: vote?.voteType || null,
    });

  } catch (error) {
    console.error('Error fetching user vote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user vote' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}