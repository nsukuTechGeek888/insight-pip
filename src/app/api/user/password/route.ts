import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "development-secret-key-12345") as { userId: string };
    return await prisma.user.findUnique({ where: { id: decoded.userId } });
  } catch { return null; }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();
    
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  } finally { await prisma.$disconnect(); }
}