import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-key-12345") as { userId: string };
    return await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true }
    });
  } catch {
    return null;
  }
}

// GET /api/user/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        broker: { select: { id: true, name: true, slug: true, logo: true, rating: true, avgTrustScore: true } },
        propFirm: { select: { id: true, name: true, slug: true, logo: true, rating: true, avgTrustScore: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedFavorites = favorites.map(fav => ({
      id: fav.id,
      entityId: fav.brokerId || fav.propFirmId,
      entityName: fav.broker?.name || fav.propFirm?.name,
      entityType: fav.brokerId ? 'broker' : 'propFirm',
      entitySlug: fav.broker?.slug || fav.propFirm?.slug,
      entityLogo: fav.broker?.logo || fav.propFirm?.logo,
      rating: fav.broker?.rating || fav.propFirm?.rating,
      trustScore: fav.broker?.avgTrustScore || fav.propFirm?.avgTrustScore,
      createdAt: fav.createdAt,
      notes: fav.notes,
      tags: fav.tags,
    }));

    return NextResponse.json({
      success: true,
      favorites: formattedFavorites,
      total: favorites.length
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/user/favorites - Add a favorite
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { entityType, entityId, notes, tags } = body;

    if (!entityType || !entityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if favorite already exists
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: user.id,
        ...(entityType === 'broker' ? { brokerId: entityId } : { propFirmId: entityId })
      }
    });

    if (existingFavorite) {
      return NextResponse.json({ error: 'Favorite already exists' }, { status: 400 });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        ...(entityType === 'broker' ? { brokerId: entityId } : { propFirmId: entityId }),
        notes: notes || null,
        tags: tags || [],
      }
    });

    return NextResponse.json({ success: true, favorite }, { status: 201 });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/user/favorites - Remove a favorite
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get('id');
    const entityType = searchParams.get('type');
    const entityId = searchParams.get('entityId');

    let whereCondition = {};

    if (favoriteId) {
      whereCondition = { id: parseInt(favoriteId) };
    } else if (entityType && entityId) {
      whereCondition = {
        userId: user.id,
        ...(entityType === 'broker' ? { brokerId: parseInt(entityId) } : { propFirmId: parseInt(entityId) })
      };
    } else {
      return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
    }

    await prisma.favorite.deleteMany({ where: whereCondition });

    return NextResponse.json({ success: true, message: 'Favorite removed successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}