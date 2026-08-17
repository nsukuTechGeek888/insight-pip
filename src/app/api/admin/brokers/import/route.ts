// app/api/admin/brokers/import/route.ts - FULLY UPDATED TO HANDLE PROMOTIONS

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

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

    const body = await request.json();
    const brokers = Array.isArray(body) ? body : [body];
    
    const results = [];
    const errors = [];

    for (const brokerData of brokers) {
      try {
        console.log(`📥 Importing broker: ${brokerData.name}`);
        
        const slug = brokerData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // Check if broker already exists
        const existingBroker = await prisma.broker.findUnique({
          where: { slug }
        });

        // If exists, delete it and all related data first (to avoid conflicts)
        if (existingBroker) {
          console.log(`🔄 Deleting existing broker: ${brokerData.name}`);
          await prisma.brokerAccountType.deleteMany({ where: { brokerId: existingBroker.id } });
          await prisma.brokerBonus.deleteMany({ where: { brokerId: existingBroker.id } });
          await prisma.brokerPromotion.deleteMany({ where: { brokerId: existingBroker.id } });
          await prisma.broker.delete({ where: { id: existingBroker.id } });
        }
        
        // Create the broker
        const broker = await prisma.broker.create({
          data: {
            name: brokerData.name,
            slug,
            status: brokerData.status || 'ACTIVE',
            description: brokerData.description || '',
            shortDescription: brokerData.shortDescription || '',
            logo: brokerData.logo || '',
            founded: brokerData.founded ? parseInt(brokerData.founded) : null,
            headquarters: brokerData.headquarters || '',
            website: brokerData.website || '',
            contactEmail: brokerData.contactEmail || '',
            contactPhone: brokerData.contactPhone || '',
            type: brokerData.type || 'Broker',
            category: brokerData.category || 'Multi-asset',
            targetAudience: brokerData.targetAudience || [],
            regulated: brokerData.regulated || false,
            regulation: brokerData.regulation || {},
            safetyScore: brokerData.safetyScore ? parseFloat(brokerData.safetyScore) : null,
            rating: brokerData.rating ? parseFloat(brokerData.rating) : null,
            reviewsCount: brokerData.reviewsCount ? parseInt(brokerData.reviewsCount) : 0,
            expertRating: brokerData.expertRating ? parseFloat(brokerData.expertRating) : null,
            avgTrustScore: brokerData.avgTrustScore ? parseFloat(brokerData.avgTrustScore) : null,
            avgWithdrawalSuccess: brokerData.avgWithdrawalSuccess ? parseFloat(brokerData.avgWithdrawalSuccess) : null,
            avgExecutionQuality: brokerData.avgExecutionQuality ? parseFloat(brokerData.avgExecutionQuality) : null,
            recommendationRate: brokerData.recommendationRate ? parseFloat(brokerData.recommendationRate) : null,
            trustScore: brokerData.trustScore ? parseInt(brokerData.trustScore) : null,
            minDeposit: brokerData.minDeposit ? parseFloat(brokerData.minDeposit) : null,
            maxLeverage: brokerData.leverage || null,
            averageSpreads: brokerData.spreads || {},
            commissions: brokerData.commissions || {},
            leverageOptions: brokerData.leverageOptions || {},
            features: brokerData.features || [],
            platforms: brokerData.platforms || [],
            instruments: brokerData.instruments || {},
            demoAccount: brokerData.demoAccount || false,
            islamicAccount: brokerData.islamicAccount || false,
            depositMethods: brokerData.depositMethods || [],
            withdrawalMethods: brokerData.withdrawalMethods || [],
            withdrawalFee: brokerData.withdrawalFee || '',
            minWithdrawal: brokerData.minWithdrawal ? parseFloat(brokerData.minWithdrawal) : null,
            supportLanguages: brokerData.supportLanguages || [],
            supportAvailability: brokerData.supportAvailability || '24/5',
            hasEducation: brokerData.hasEducation || false,
            educationTypes: brokerData.educationTypes || [],
            awards: brokerData.awards || [],
            isRecommended: brokerData.isRecommended || false,
            country: brokerData.country || '',
            yearsInOperation: brokerData.yearsInOperation ? parseInt(brokerData.yearsInOperation) : null,
            assets: brokerData.assets || '',
            promo: brokerData.promo || '',
            maxAllocation: brokerData.maxAllocation ? parseFloat(brokerData.maxAllocation) : null,
            payout: brokerData.payout ? parseFloat(brokerData.payout) : null,
            bonusOffer: brokerData.bonusOffer || '',
            bonus: brokerData.bonus || '',
            highlight: brokerData.highlight || '',
            signupLink: brokerData.signupLink || '',
            accountSize: brokerData.accountSize ? parseFloat(brokerData.accountSize) : null,
            corporateAddress: brokerData.corporateAddress || '',
            accountCurrencies: brokerData.accountCurrencies || [],
            regulatoryWarnings: brokerData.regulatoryWarnings || [],
            entityMapping: brokerData.entityMapping || {},
            minTradeSize: brokerData.minTradeSize || '',
            maxTradeSize: brokerData.maxTradeSize || '',
            marginCall: brokerData.marginCall || '',
            stopOutLevel: brokerData.stopOutLevel || '',
            orderExecution: brokerData.orderExecution || 'Market Execution',
            tradingHours: brokerData.tradingHours || '',
            swapRates: brokerData.swapRates || '',
            commissionNotes: brokerData.commissionNotes || '',
            chartingTools: brokerData.chartingTools || [],
            copyTradingAvailable: brokerData.copyTradingAvailable || false,
            socialTradingAvailable: brokerData.socialTradingAvailable || false,
            vpsAvailable: brokerData.vpsAvailable || false,
            apiAvailable: brokerData.apiAvailable || false,
            economicCalendar: brokerData.economicCalendar || false,
            newsTrading: brokerData.newsTrading || false,
            depositMethodsDetails: brokerData.depositMethodsDetails || [],
            withdrawalMethodsDetails: brokerData.withdrawalMethodsDetails || [],
            withdrawalProcessingTime: brokerData.withdrawalProcessingTime || '',
            depositProcessingTime: brokerData.depositProcessingTime || '',
            inactivityFee: brokerData.inactivityFee || '',
            accountClosurePolicy: brokerData.accountClosurePolicy || '',
            partnershipPrograms: brokerData.partnershipPrograms || [],
            ibProgramAvailable: brokerData.ibProgramAvailable || false,
            affiliateProgramAvailable: brokerData.affiliateProgramAvailable || false,
            securityFeatures: brokerData.securityFeatures || [],
            accountVerification: brokerData.accountVerification || '',
            twoFactorAuth: brokerData.twoFactorAuth || false,
            socialMedia: brokerData.socialMedia || {},
            pressReleases: brokerData.pressReleases || [],
            regions: brokerData.regions || ['GLOBAL'],
            restrictedRegions: brokerData.restrictedRegions || [],
            regionNotes: brokerData.regionNotes || null,
            regionDescriptions: brokerData.regionDescriptions || null,
            regionPricing: brokerData.regionPricing || null,
            regionPaymentMethods: brokerData.regionPaymentMethods || null,
          },
        });
        
        console.log(`✅ Created broker: ${broker.name} (ID: ${broker.id})`);

        // ====== ✅ ACCOUNT TYPES ======
        if (brokerData.accountTypes && brokerData.accountTypes.length > 0) {
          for (const account of brokerData.accountTypes) {
            await prisma.brokerAccountType.create({
              data: {
                name: account.name,
                minDeposit: account.minDeposit ? parseFloat(account.minDeposit) : null,
                commission: account.commission || '',
                spreadType: account.spreadType || '',
                swapFree: account.swapFree || false,
                brokerId: broker.id,
              },
            });
          }
          console.log(`   ↳ Created ${brokerData.accountTypes.length} account types`);
        }
        
        // ====== ✅ BONUSES WITH REGION FIELDS ======
        if (brokerData.bonuses && brokerData.bonuses.length > 0) {
          for (const bonus of brokerData.bonuses) {
            await prisma.brokerBonus.create({
              data: {
                type: bonus.type || '',
                amount: bonus.amount || '',
                conditions: bonus.conditions || '',
                expiry: bonus.expiry || 'Ongoing',
                code: bonus.code || '',
                brokerId: broker.id,
                regions: brokerData.regions || ['GLOBAL'],
                restrictedRegions: brokerData.restrictedRegions || [],
              },
            });
          }
          console.log(`   ↳ Created ${brokerData.bonuses.length} bonuses`);
        }
        
        // ====== ✅ PROMOTIONS WITH REGION FIELDS ======
        if (brokerData.promotions && brokerData.promotions.length > 0) {
          for (const promo of brokerData.promotions) {
            await prisma.brokerPromotion.create({
              data: {
                name: promo.name || '',
                description: promo.description || '',
                discount: promo.discount || '',
                code: promo.code || '',
                validUntil: promo.validUntil ? new Date(promo.validUntil) : null,
                brokerId: broker.id,
                regions: brokerData.regions || ['GLOBAL'],
                restrictedRegions: brokerData.restrictedRegions || [],
              },
            });
          }
          console.log(`   ↳ Created ${brokerData.promotions.length} promotions`);
        }
        
        const fullBroker = await prisma.broker.findUnique({
          where: { id: broker.id },
          include: { accountTypes: true, bonuses: true, promotions: true },
        });
        
        results.push(fullBroker);
        
      } catch (err: any) {
        console.error(`❌ Error importing ${brokerData.name}:`, err.message);
        errors.push({ name: brokerData.name, error: err.message });
      }
    }
    
    console.log(`📊 Import complete: ${results.length} imported, ${errors.length} errors`);
    
    return NextResponse.json({ 
      success: true, 
      imported: results.length, 
      errors, 
      brokers: results 
    });
    
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import brokers' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}