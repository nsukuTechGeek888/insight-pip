﻿// app/api/prop-firms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to safely parse JSON fields
function safeJSONParse(value: any): any {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API: Fetching prop firms...');
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const programType = searchParams.get('programType') || '';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const skip = (page - 1) * limit;
    
    const where: any = {
      status: 'ACTIVE'
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }
    
    if (programType) {
      where.programs = {
        some: {
          type: { contains: programType, mode: 'insensitive' }
        }
      };
    }
    
    console.log('🔍 Querying database with where:', JSON.stringify(where, null, 2));
    
    // Get prop firms with pagination
    const [propFirms, total] = await Promise.all([
      prisma.propFirm.findMany({
        where,
        include: {
          programs: {
            select: {
              id: true,
              name: true,
              type: true,
              description: true,
              timeLimit: true,
              rules: true,
              accountOptions: true
            }
          },
          promotions: {
            select: {
              id: true,
              name: true,
              description: true,
              code: true,
              discount: true,
              validUntil: true,
            }
          },
          reviews: {
            where: {
              status: 'APPROVED'
            },
            select: {
              rating: true,
              tradingConditions: true,
              customerCare: true,
              userFriendliness: true,
              payoutProcess: true,
            }
          }
        },
        skip,
        take: limit,
      }),
      prisma.propFirm.count({ where })
    ]);
    
    console.log(`✅ Found ${propFirms.length} prop firms, total: ${total}`);
    
    // Parse and structure data
    const parsedPropFirms = propFirms.map(firm => {
      const approvedReviews = firm.reviews;
      const totalReviews = approvedReviews.length;
      
      const averageRating = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : firm.rating || 0;
      
      const avgTradingConditions = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + (r.tradingConditions || 0), 0) / totalReviews
        : firm.avgTradingConditions || 0;
      
      const avgCustomerCare = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + (r.customerCare || 0), 0) / totalReviews
        : firm.avgCustomerCare || 0;
      
      const avgUserFriendliness = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + (r.userFriendliness || 0), 0) / totalReviews
        : firm.avgUserFriendliness || 0;
      
      const avgPayoutProcess = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + (r.payoutProcess || 0), 0) / totalReviews
        : firm.avgPayoutProcess || 0;
      
      const programs = firm.programs.map(program => ({
        type: program.type,
        name: program.name,
        description: program.description || '',
        timeLimit: safeJSONParse(program.timeLimit),
        rules: safeJSONParse(program.rules) || {},
        accountOptions: safeJSONParse(program.accountOptions) || []
      }));
      
      const promotions = firm.promotions.map(promo => ({
        name: promo.name,
        description: promo.description || '',
        code: promo.code || '',
        discount: promo.discount || null,
        validUntil: promo.validUntil ? promo.validUntil.toISOString().split('T')[0] : ''
      }));
      
      return {
        id: firm.id,
        name: firm.name,
        slug: firm.slug,
        logo: firm.logo || '',
        description: firm.description || '',
        shortDescription: firm.shortDescription || '',
        rating: averageRating,
        reviewsCount: totalReviews,
        avgTradingConditions,
        avgCustomerCare,
        avgUserFriendliness,
        avgPayoutProcess,
        country: firm.country || '',
        yearsInOperation: firm.yearsInOperation || 0,
        type: firm.type || 'Prop Firm',
        assets: firm.assets || [],
        platforms: firm.platforms || [],
        programs: programs,
        promotions: promotions,
        signupLink: firm.signupLink || firm.website,
        payoutFrequency: firm.payoutFrequency || '',
        payoutMethods: firm.payoutMethods || [],
        minimumPayout: firm.minimumPayout || 0,
        newsTradingRestrictions: firm.newsTradingRestrictions || '',
        tradingInstruments: firm.tradingInstruments || [],
        trustpilotRating: firm.trustpilotRating || 0,
        trustpilotReviews: firm.trustpilotReviews || 0,
        founded: firm.founded || 0,
        regulation: firm.regulation || '',
        minimumAge: firm.minimumAge || 18,
        supportedCountries: firm.supportedCountries || [],
        prohibitedCountries: firm.prohibitedCountries || [],
        tradingConditions: avgTradingConditions || 0,
        customerCare: avgCustomerCare || 0,
        userFriendliness: avgUserFriendliness || 0,
        payoutProcess: avgPayoutProcess || 0,
        totalReviews: totalReviews,
        trustScore: firm.trustScore || 0,
        avgTrustScore: firm.avgTrustScore || 0,
        isRecommended: firm.isRecommended || false,
        // GFT specific fields
        ceo: firm.ceo || '',
        totalPayoutsPaid: firm.totalPayoutsPaid || '',
        totalTradersServed: firm.totalTradersServed || 0,
        countriesServed: firm.countriesServed || 0,
        riskLevel: firm.riskLevel || '',
        riskScore: firm.riskScore || 0,
        maxAccountSize: firm.maxAccountSize || 0,
        maxAccountSizeCurrency: firm.maxAccountSizeCurrency || '',
        positiveReviewThemes: firm.positiveReviewThemes || [],
        negativeReviewThemes: firm.negativeReviewThemes || [],
        supportAgents: firm.supportAgents || [],
        goatGuard: firm.goatGuard || false,
        newsTrading: firm.newsTrading || false,
        twoFactorAuth: firm.twoFactorAuth || false,
        hedgingAllowed: firm.hedgingAllowed !== undefined ? firm.hedgingAllowed : true,
        copyTradingAllowed: firm.copyTradingAllowed !== undefined ? firm.copyTradingAllowed : true,
        eaTrading: firm.eaTrading !== undefined ? firm.eaTrading : true,
        weekendHolding: firm.weekendHolding !== undefined ? firm.weekendHolding : true,
        // Scaling plan
        scalingPlan: firm.scalingPlan || {},
        scalingLevel1Months: firm.scalingLevel1Months || 0,
        scalingLevel1Payouts: firm.scalingLevel1Payouts || 0,
        scalingLevel1Boost: firm.scalingLevel1Boost || 0,
        scalingLevel1Split: firm.scalingLevel1Split || 0,
        scalingLevel1Drawdown: firm.scalingLevel1Drawdown || 0,
        scalingLevel1Benefits: firm.scalingLevel1Benefits || [],
        scalingLevel2Months: firm.scalingLevel2Months || 0,
        scalingLevel2Payouts: firm.scalingLevel2Payouts || 0,
        scalingLevel2Boost: firm.scalingLevel2Boost || 0,
        scalingLevel2Split: firm.scalingLevel2Split || 0,
        scalingLevel2Drawdown: firm.scalingLevel2Drawdown || 0,
        scalingLevel2WeeklyPayouts: firm.scalingLevel2WeeklyPayouts || false,
        scalingLevel2Benefits: firm.scalingLevel2Benefits || [],
        scalingLevel3Months: firm.scalingLevel3Months || 0,
        scalingLevel3Payouts: firm.scalingLevel3Payouts || 0,
        scalingLevel3Boost: firm.scalingLevel3Boost || 0,
        scalingLevel3Split: firm.scalingLevel3Split || 0,
        scalingLevel3Drawdown: firm.scalingLevel3Drawdown || 0,
        scalingLevel3MonthlySalary: firm.scalingLevel3MonthlySalary || 0,
        scalingLevel3FreeChallenge: firm.scalingLevel3FreeChallenge || false,
        scalingLevel3Benefits: firm.scalingLevel3Benefits || [],
        scalingLevel4Months: firm.scalingLevel4Months || 0,
        scalingLevel4Payouts: firm.scalingLevel4Payouts || 0,
        scalingLevel4Boost: firm.scalingLevel4Boost || 0,
        scalingLevel4Split: firm.scalingLevel4Split || 0,
        scalingLevel4Drawdown: firm.scalingLevel4Drawdown || 0,
        scalingLevel4MonthlySalary: firm.scalingLevel4MonthlySalary || 0,
        scalingLevel4FreeChallenge: firm.scalingLevel4FreeChallenge || false,
        scalingLevel4Benefits: firm.scalingLevel4Benefits || [],
        scalingLevelMax: firm.scalingLevelMax || 0,
        // Pay Later
        payLaterAvailable: firm.payLaterAvailable || false,
        payLaterInitialFee: firm.payLaterInitialFee || 0,
        payLaterActivationFee: firm.payLaterActivationFee || 0,
        payLaterProfitTarget: firm.payLaterProfitTarget || 0,
        payLaterMaxDrawdown: firm.payLaterMaxDrawdown || 0,
        payLaterMaxLossPerTrade: firm.payLaterMaxLossPerTrade || 0,
        payLaterConsistency: firm.payLaterConsistency || 0,
        payLaterMaxAccounts: firm.payLaterMaxAccounts || 0,
        payLaterCountryCap: firm.payLaterCountryCap || 0,
        payLaterAccountSizes: firm.payLaterAccountSizes || [],
        // BOGO
        bogoAvailable: firm.bogoAvailable || false,
        bogoDiscount: firm.bogoDiscount || 0,
        bogoFreeAccounts: firm.bogoFreeAccounts || 0,
        bogoFreeAccountTiming: firm.bogoFreeAccountTiming || '',
        affiliateDiscountCode: firm.affiliateDiscountCode || '',
        affiliateDiscountPercent: firm.affiliateDiscountPercent || 0,
        // Instant Funding
        instantFundingAvailable: firm.instantFundingAvailable || false,
        ifMaxDrawdown: firm.ifMaxDrawdown || 0,
        ifMaxLossPerTrade: firm.ifMaxLossPerTrade || 0,
        ifConsistencyRule: firm.ifConsistencyRule || 0,
        ifMinTradingDays: firm.ifMinTradingDays || 0,
        ifProfitSplit: firm.ifProfitSplit || 0,
        ifRewardCycle: firm.ifRewardCycle || '',
        // One Step
        oneStepAvailable: firm.oneStepAvailable || false,
        oneStepProfitTarget: firm.oneStepProfitTarget || 0,
        oneStepMaxDrawdown: firm.oneStepMaxDrawdown || 0,
        oneStepMaxLossPerTrade: firm.oneStepMaxLossPerTrade || 0,
        oneStepConsistency: firm.oneStepConsistency || 0,
        // Two Step
        twoStepAvailable: firm.twoStepAvailable || false,
        twoStepProfitTarget1: firm.twoStepProfitTarget1 || 0,
        twoStepProfitTarget2: firm.twoStepProfitTarget2 || 0,
        twoStepMaxDrawdown: firm.twoStepMaxDrawdown || 0,
        twoStepDailyDrawdown: firm.twoStepDailyDrawdown || 0,
        twoStepMinDays1: firm.twoStepMinDays1 || 0,
        twoStepMinDays2: firm.twoStepMinDays2 || 0,
        // News Trading
        newsTradingWindow: firm.newsTradingWindow || '',
        newsProfitCap: firm.newsProfitCap || 0,
        profitCaps: firm.profitCaps || {},
        shortTradeMinDuration: firm.shortTradeMinDuration || 0,
        consistencyRule: firm.consistencyRule || '',
        prohibitedStrategies: firm.prohibitedStrategies || [],
        copyTradingRules: firm.copyTradingRules || '',
        hftAllowed: firm.hftAllowed !== undefined ? firm.hftAllowed : true,
        martingaleAllowed: firm.martingaleAllowed !== undefined ? firm.martingaleAllowed : true,
      };
    });
    
    // Apply minRating filter after calculation
    let filteredFirms = parsedPropFirms;
    if (minRating > 0) {
      filteredFirms = filteredFirms.filter(firm => firm.rating >= minRating);
    }
    
    // Apply sorting
    if (sortBy === 'rating') {
      filteredFirms.sort((a, b) => {
        return sortOrder === 'desc' 
          ? b.rating - a.rating 
          : a.rating - b.rating;
      });
    } else if (sortBy === 'reviews') {
      filteredFirms.sort((a, b) => {
        return sortOrder === 'desc' 
          ? b.reviewsCount - a.reviewsCount 
          : a.reviewsCount - b.reviewsCount;
      });
    } else if (sortBy === 'name') {
      filteredFirms.sort((a, b) => {
        return sortOrder === 'desc' 
          ? b.name.localeCompare(a.name) 
          : a.name.localeCompare(b.name);
      });
    }
    
    // Apply pagination
    const paginatedFirms = filteredFirms.slice(0, limit);
    const filteredTotal = filteredFirms.length;
    const totalPages = Math.ceil(filteredTotal / limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedFirms,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: {
        search,
        country,
        programType,
        minRating,
        sortBy,
        sortOrder,
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching prop firms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prop firms' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const propFirm = await prisma.propFirm.create({
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: body.description || '',
        shortDescription: body.shortDescription || '',
        website: body.website || '',
        logo: body.logo || '',
        status: "ACTIVE",
        rating: 0,
        reviewsCount: 0,
      },
    });
    
    return NextResponse.json({ success: true, data: propFirm }, { status: 201 });
  } catch (error) {
    console.error('Error creating prop firm:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create prop firm' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}