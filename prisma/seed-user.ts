// prisma/seed-user.ts - UPDATED WITH REGION

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test user...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'USER',
      region: 'SA', // <-- ADDED REGION FIELD
    },
  });

  console.log('✅ Test user created:', user.email);
  console.log('📍 Region:', user.region || 'SA');
  console.log('📝 Login with: test@example.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());