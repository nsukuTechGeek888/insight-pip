import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';

async function getAdminFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-key-12345") as { userId: string; role: string };
    if (decoded.role !== 'ADMIN') return null;
    return decoded;
  } catch { return null; }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'broker';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Use PNG, JPG, SVG, or WEBP' }, { status: 400 });
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 2MB' }, { status: 400 });
    }

    // Create unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `${type}-${timestamp}-${safeName}`;
    
    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);
    
    // Return the public URL
    const url = `/uploads/${type}/${filename}`;
    
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}