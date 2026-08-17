// src/app/api/prop-firms/slug/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('📡 API Request for prop firm slug:', slug);
    
    const propFirm = await prisma.propFirm.findFirst({
      where: {
        OR: [
          { slug: slug },
          { name: { contains: slug.replace(/-/g, ' '), mode: 'insensitive' } }
        ]
      },
      include: {
        programs: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
            timeLimit: true,
            rules: true,
            profitTarget: true,
            accountOptions: true
          }
        },
        promotions: {
          select: {
            id: true,
            name: true,
            description: true,
            code: true,
            validUntil: true,
          }
        },
      }
    });
    
    if (!propFirm) {
      console.log('❌ Prop firm not found with slug:', slug);
      return NextResponse.json(
        { success: false, error: 'Prop firm not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Found prop firm by slug:', propFirm.name);
    
    // Return the data - we'll reuse the same transformation
    // For simplicity, redirect to the ID-based endpoint
    return NextResponse.redirect(new URL(`/api/prop-firms/${propFirm.id}`, request.url));
    
  } catch (error) {
    console.error('Error fetching prop firm by slug:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prop firm' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}