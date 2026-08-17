// prisma/fix-promotions.ts - FIXED

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Fixing promotions and bonuses with default regions...');

  // Update broker promotions - check for empty arrays or null
  const brokerPromotions = await prisma.brokerPromotion.updateMany({
    where: {
      OR: [
        { regions: { isEmpty: true } },
        { regions: { equals: [] } },
      ]
    },
    data: {
      regions: ['GLOBAL']
    }
  });
  console.log(`✅ Updated ${brokerPromotions.count} broker promotions`);

  // Update broker bonuses
  const brokerBonuses = await prisma.brokerBonus.updateMany({
    where: {
      OR: [
        { regions: { isEmpty: true } },
        { regions: { equals: [] } },
      ]
    },
    data: {
      regions: ['GLOBAL']
    }
  });
  console.log(`✅ Updated ${brokerBonuses.count} broker bonuses`);

  // Update prop firm promotions
  const propPromotions = await prisma.propFirmPromotion.updateMany({
    where: {
      OR: [
        { regions: { isEmpty: true } },
        { regions: { equals: [] } },
      ]
    },
    data: {
      regions: ['GLOBAL']
    }
  });
  console.log(`✅ Updated ${propPromotions.count} prop firm promotions`);

  // Also check for null values by using a raw query approach
  // For PostgreSQL, we can use $executeRaw
  console.log('🔄 Also checking for null values...');
  
  await prisma.$executeRaw`
    UPDATE broker_promotions 
    SET regions = ARRAY['GLOBAL']::text[] 
    WHERE regions IS NULL;
  `;
  console.log('✅ Updated broker promotions with NULL regions');

  await prisma.$executeRaw`
    UPDATE broker_bonuses 
    SET regions = ARRAY['GLOBAL']::text[] 
    WHERE regions IS NULL;
  `;
  console.log('✅ Updated broker bonuses with NULL regions');

  await prisma.$executeRaw`
    UPDATE prop_firm_promotions 
    SET regions = ARRAY['GLOBAL']::text[] 
    WHERE regions IS NULL;
  `;
  console.log('✅ Updated prop firm promotions with NULL regions');

  // Verify
  const promoCount = await prisma.brokerPromotion.count();
  const bonusCount = await prisma.brokerBonus.count();
  const propPromoCount = await prisma.propFirmPromotion.count();
  
  console.log('🎉 All promotions and bonuses now have regions!');
  console.log(`📊 Summary: ${promoCount} promotions, ${bonusCount} bonuses, ${propPromoCount} prop promotions`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());