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
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "development-secret-key-12345"
    ) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    return user;
  } catch {
    return null;
  }
}

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

    const incident = await prisma.incident.findUnique({
      where: { id }
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    if (incident.userId !== user.id) {
      return NextResponse.json({ error: 'Not your incident' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'public/uploads/incidents');
    await mkdir(uploadDir, { recursive: true });
    
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    
    const fileUrl = `/uploads/incidents/${filename}`;

    // Update incident with proof URL
    const proofUrls = [...(incident.proofUrls || []), fileUrl];
    await prisma.incident.update({
      where: { id },
      data: { 
        proofUrls,
        status: proofUrls.length > 0 ? 'PROOF_SUBMITTED' : incident.status
      }
    });

    return NextResponse.json({
      success: true,
      fileUrl,
      message: 'Proof uploaded successfully',
      proofProvided: true
    });

  } catch (error) {
    console.error('Error uploading proof:', error);
    return NextResponse.json({ error: 'Failed to upload proof' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const incident = await prisma.incident.findUnique({
      where: { id }
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    if (incident.userId !== user.id) {
      return NextResponse.json({ error: 'Not your incident' }, { status: 403 });
    }

    const { fileUrl } = await request.json();

    // Remove the file URL from the array
    const proofUrls = (incident.proofUrls || []).filter((url: string) => url !== fileUrl);

    await prisma.incident.update({
      where: { id },
      data: { 
        proofUrls,
        status: proofUrls.length === 0 && incident.status === 'PROOF_SUBMITTED' ? 'PENDING' : incident.status
      }
    });

    // Note: You might want to also delete the physical file from the filesystem

    return NextResponse.json({
      success: true,
      message: 'Proof removed successfully'
    });

  } catch (error) {
    console.error('Error removing proof:', error);
    return NextResponse.json({ error: 'Failed to remove proof' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}