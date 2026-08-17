// app/api/admin/brokers/[id]/route.ts - COMPLETE UPDATED FILE

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

// GET /api/admin/brokers/[id] - Get single broker
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const broker = await prisma.broker.findUnique({
      where: { id: parseInt(id) },
      include: {
        accountTypes: true,
        bonuses: true,
        promotions: true,
      },
    });

    if (!broker) {
      return NextResponse.json({ error: 'Broker not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, broker });
  } catch (error) {
    console.error('Error fetching broker:', error);
    return NextResponse.json({ error: 'Failed to fetch broker' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/admin/brokers/[id] - Update broker
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    // Update broker
    await prisma.broker.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        slug,
        status: body.status,
        description: body.description || '',
        shortDescription: body.shortDescription,
        logo: body.logo,
        founded: body.founded ? parseInt(body.founded) : null,
        headquarters: body.headquarters,
        website: body.website,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        type: body.type,
        category: body.category,
        targetAudience: body.targetAudience || [],
        regulated: body.regulated === true,
        regulation: body.regulation,
        safetyScore: body.safetyScore ? parseFloat(body.safetyScore) : null,
        rating: body.rating ? parseFloat(body.rating) : null,
        reviewsCount: body.reviewsCount ? parseInt(body.reviewsCount) : 0,
        expertRating: body.expertRating ? parseFloat(body.expertRating) : null,
        avgOverallRating: body.avgOverallRating ? parseFloat(body.avgOverallRating) : null,
        avgServiceRating: body.avgServiceRating ? parseFloat(body.avgServiceRating) : null,
        avgPlatformRating: body.avgPlatformRating ? parseFloat(body.avgPlatformRating) : null,
        avgValueRating: body.avgValueRating ? parseFloat(body.avgValueRating) : null,
        avgSupportRating: body.avgSupportRating ? parseFloat(body.avgSupportRating) : null,
        avgWithdrawalExperience: body.avgWithdrawalExperience ? parseFloat(body.avgWithdrawalExperience) : null,
        avgDepositExperience: body.avgDepositExperience ? parseFloat(body.avgDepositExperience) : null,
        avgCustomerSupport: body.avgCustomerSupport ? parseFloat(body.avgCustomerSupport) : null,
        avgTradingExperience: body.avgTradingExperience ? parseFloat(body.avgTradingExperience) : null,
        avgReliability: body.avgReliability ? parseFloat(body.avgReliability) : null,
        avgTrustScore: body.avgTrustScore ? parseFloat(body.avgTrustScore) : null,
        avgWithdrawalSuccess: body.avgWithdrawalSuccess ? parseFloat(body.avgWithdrawalSuccess) : null,
        avgExecutionQuality: body.avgExecutionQuality ? parseFloat(body.avgExecutionQuality) : null,
        recommendationRate: body.recommendationRate ? parseFloat(body.recommendationRate) : null,
        withdrawalStats: body.withdrawalStats,
        accountIssueStats: body.accountIssueStats,
        totalIncidents: body.totalIncidents ? parseInt(body.totalIncidents) : 0,
        incidentsLast7Days: body.incidentsLast7Days ? parseInt(body.incidentsLast7Days) : 0,
        incidentsLast30Days: body.incidentsLast30Days ? parseInt(body.incidentsLast30Days) : 0,
        withdrawalReports: body.withdrawalReports ? parseInt(body.withdrawalReports) : 0,
        withdrawalDelays: body.withdrawalDelays ? parseInt(body.withdrawalDelays) : 0,
        withdrawalConfirmed: body.withdrawalConfirmed ? parseInt(body.withdrawalConfirmed) : 0,
        withdrawalRejected: body.withdrawalRejected ? parseInt(body.withdrawalRejected) : 0,
        executionComplaints: body.executionComplaints ? parseInt(body.executionComplaints) : 0,
        slippageReports: body.slippageReports ? parseInt(body.slippageReports) : 0,
        spreadSpikeReports: body.spreadSpikeReports ? parseInt(body.spreadSpikeReports) : 0,
        platformIssues: body.platformIssues ? parseInt(body.platformIssues) : 0,
        serverDownReports: body.serverDownReports ? parseInt(body.serverDownReports) : 0,
        accountBansReported: body.accountBansReported ? parseInt(body.accountBansReported) : 0,
        accountSuspensions: body.accountSuspensions ? parseInt(body.accountSuspensions) : 0,
        resolvedIncidents: body.resolvedIncidents ? parseInt(body.resolvedIncidents) : 0,
        disputedIncidents: body.disputedIncidents ? parseInt(body.disputedIncidents) : 0,
        lastIncidentAt: body.lastIncidentAt ? new Date(body.lastIncidentAt) : null,
        minDeposit: body.minDeposit ? parseFloat(body.minDeposit) : null,
        maxLeverage: body.leverage,
        averageSpreads: body.spreads,
        commissions: body.commissions,
        leverageOptions: body.leverageOptions,
        features: body.features || [],
        platforms: body.platforms || [],
        instruments: body.instruments,
        demoAccount: body.demoAccount === true,
        islamicAccount: body.islamicAccount === true,
        depositMethods: body.depositMethods || [],
        withdrawalMethods: body.withdrawalMethods || [],
        withdrawalFee: body.withdrawalFee,
        minWithdrawal: body.minWithdrawal ? parseFloat(body.minWithdrawal) : null,
        supportLanguages: body.supportLanguages || [],
        supportAvailability: body.supportAvailability,
        hasEducation: body.hasEducation === true,
        educationTypes: body.educationTypes || [],
        trustScore: body.trustScore ? parseInt(body.trustScore) : null,
        awards: body.awards || [],
        isRecommended: body.isRecommended === true,
        country: body.country,
        yearsInOperation: body.yearsInOperation ? parseInt(body.yearsInOperation) : null,
        assets: body.assets,
        promo: body.promo,
        maxAllocation: body.maxAllocation ? parseFloat(body.maxAllocation) : null,
        payout: body.payout ? parseFloat(body.payout) : null,
        bonusOffer: body.bonusOffer,
        bonus: body.bonus,
        highlight: body.highlight,
        signupLink: body.signupLink,
        accountSize: body.accountSize ? parseFloat(body.accountSize) : null,
        corporateAddress: body.corporateAddress,
        accountCurrencies: body.accountCurrencies || [],
        regulatoryWarnings: body.regulatoryWarnings || [],
        entityMapping: body.entityMapping,
        minTradeSize: body.minTradeSize,
        maxTradeSize: body.maxTradeSize,
        marginCall: body.marginCall,
        stopOutLevel: body.stopOutLevel,
        orderExecution: body.orderExecution,
        tradingHours: body.tradingHours,
        swapRates: body.swapRates,
        commissionNotes: body.commissionNotes,
        chartingTools: body.chartingTools || [],
        copyTradingAvailable: body.copyTradingAvailable === true,
        socialTradingAvailable: body.socialTradingAvailable === true,
        vpsAvailable: body.vpsAvailable === true,
        apiAvailable: body.apiAvailable === true,
        economicCalendar: body.economicCalendar === true,
        newsTrading: body.newsTrading === true,
        depositMethodsDetails: body.depositMethodsDetails,
        withdrawalMethodsDetails: body.withdrawalMethodsDetails,
        withdrawalProcessingTime: body.withdrawalProcessingTime,
        depositProcessingTime: body.depositProcessingTime,
        inactivityFee: body.inactivityFee,
        accountClosurePolicy: body.accountClosurePolicy,
        partnershipPrograms: body.partnershipPrograms || [],
        ibProgramAvailable: body.ibProgramAvailable === true,
        affiliateProgramAvailable: body.affiliateProgramAvailable === true,
        securityFeatures: body.securityFeatures || [],
        accountVerification: body.accountVerification,
        twoFactorAuth: body.twoFactorAuth === true,
        socialMedia: body.socialMedia,
        pressReleases: body.pressReleases,
        // ✅ REGION FIELDS
        regions: body.regions || ['GLOBAL'],
        restrictedRegions: body.restrictedRegions || [],
        regionNotes: body.regionNotes || null,
        regionDescriptions: body.regionDescriptions || null,
        regionPricing: body.regionPricing || null,
        regionPaymentMethods: body.regionPaymentMethods || null,
      },
    });

    // ✅ Handle accountTypes
    if (body.accountTypes) {
      await prisma.brokerAccountType.deleteMany({ where: { brokerId: parseInt(id) } });
      for (const account of body.accountTypes) {
        await prisma.brokerAccountType.create({
          data: {
            name: account.name,
            minDeposit: account.minDeposit ? parseFloat(account.minDeposit) : null,
            commission: account.commission,
            spreadType: account.spreadType,
            swapFree: account.swapFree === true,
            brokerId: parseInt(id),
          },
        });
      }
    }

    // ✅ Handle bonuses WITH REGION FIELDS
    if (body.bonuses) {
      await prisma.brokerBonus.deleteMany({ where: { brokerId: parseInt(id) } });
      for (const bonus of body.bonuses) {
        await prisma.brokerBonus.create({
          data: {
            type: bonus.type,
            amount: bonus.amount,
            conditions: bonus.conditions || '',
            expiry: bonus.expiry || 'Ongoing',
            code: bonus.code || '',
            brokerId: parseInt(id),
            // ✅ REGION FIELDS FOR BONUSES
            regions: bonus.regions || body.regions || ['GLOBAL'],
            restrictedRegions: bonus.restrictedRegions || body.restrictedRegions || [],
          },
        });
      }
    }

    // ✅ Handle promotions WITH REGION FIELDS
    if (body.promotions) {
      await prisma.brokerPromotion.deleteMany({ where: { brokerId: parseInt(id) } });
      for (const promo of body.promotions) {
        await prisma.brokerPromotion.create({
          data: {
            name: promo.name || '',
            description: promo.description || '',
            discount: promo.discount || '',
            code: promo.code || '',
            validUntil: promo.validUntil ? new Date(promo.validUntil) : null,
            brokerId: parseInt(id),
            // ✅ REGION FIELDS FOR PROMOTIONS
            regions: promo.regions || body.regions || ['GLOBAL'],
            restrictedRegions: promo.restrictedRegions || body.restrictedRegions || [],
          },
        });
      }
    }

    const updatedBroker = await prisma.broker.findUnique({
      where: { id: parseInt(id) },
      include: {
        accountTypes: true,
        bonuses: true,
        promotions: true,
      },
    });

    return NextResponse.json({ success: true, broker: updatedBroker });
  } catch (error) {
    console.error('Error updating broker:', error);
    return NextResponse.json({ error: 'Failed to update broker' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/admin/brokers/[id] - Delete broker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminFromToken(request);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    
    await prisma.brokerAccountType.deleteMany({ where: { brokerId: parseInt(id) } });
    await prisma.brokerBonus.deleteMany({ where: { brokerId: parseInt(id) } });
    await prisma.brokerPromotion.deleteMany({ where: { brokerId: parseInt(id) } });
    
    await prisma.broker.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting broker:', error);
    return NextResponse.json({ error: 'Failed to delete broker' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}