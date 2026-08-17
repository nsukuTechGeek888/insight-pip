﻿// app/api/brokers/route.ts - UPDATED to include promotions and bonuses

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  getRegionFromCountry, 
  DEFAULT_REGION,
  getRegionFromCookies,
  isAvailableInRegion,
  setRegionCookie
} from '@/lib/region';

const prisma = new PrismaClient();

function safeJSONParse(value: any) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (value === '[object Object]' || value.includes('[object Object]')) {
    console.warn('⚠️ Found malformed JSON data, returning null');
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null;
  }
}

function getRegionFromRequest(request: NextRequest): string {
  const regionParam = request.nextUrl.searchParams.get('region');
  if (regionParam && regionParam !== '') {
    return regionParam;
  }
  
  const cookieRegion = getRegionFromCookies(request);
  if (cookieRegion) {
    return cookieRegion;
  }
  
  const cfCountry = request.headers.get('CF-IPCountry') || 
                    request.headers.get('x-vercel-ip-country') ||
                    request.headers.get('x-country-code');
  if (cfCountry) {
    return getRegionFromCountry(cfCountry);
  }
  
  return DEFAULT_REGION;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const regulated = searchParams.get('regulated');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const sortBy = searchParams.get('sortBy') || 'rating';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const region = getRegionFromRequest(request);
    console.log(`📍 Brokers API - Region: ${region}`);
    
    const skip = (page - 1) * limit;
    
    const where: any = { status: 'ACTIVE' };
    
    where.AND = [
      {
        OR: [
          { regions: { has: region } },
          { regions: { has: 'GLOBAL' } },
          { regions: { isEmpty: true } },
        ]
      },
      {
        NOT: {
          restrictedRegions: { has: region }
        }
      }
    ];
    
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
    
    if (regulated !== null && regulated !== undefined && regulated !== '') {
      where.regulated = regulated === 'true';
    }
    
    const [brokers, total] = await Promise.all([
      prisma.broker.findMany({
        where,
        include: {
          accountTypes: {
            select: {
              id: true,
              name: true,
              minDeposit: true,
              commission: true,
              spreadType: true,
              swapFree: true,
            }
          },
          bonuses: {
            where: {
              OR: [
                { regions: { has: region } },
                { regions: { has: 'GLOBAL' } },
                { regions: { isEmpty: true } },
              ],
              NOT: {
                restrictedRegions: { has: region }
              }
            },
            select: {
              id: true,
              type: true,
              amount: true,
              conditions: true,
              expiry: true,
              code: true,
            }
          },
          promotions: {
            where: {
              OR: [
                { regions: { has: region } },
                { regions: { has: 'GLOBAL' } },
                { regions: { isEmpty: true } },
              ],
              NOT: {
                restrictedRegions: { has: region }
              }
            },
            select: {
              id: true,
              name: true,
              description: true,
              discount: true,
              code: true,
              validUntil: true,
            }
          },
          reviews: {
            where: { status: 'APPROVED' },
            select: {
              rating: true,
              serviceRating: true,
              platformRating: true,
              valueRating: true,
              supportRating: true,
            }
          }
        },
        skip,
        take: limit,
      }),
      prisma.broker.count({ where })
    ]);
    
    console.log(`📊 Found ${brokers.length} brokers with ${brokers.reduce((acc, b) => acc + b.promotions.length, 0)} promotions and ${brokers.reduce((acc, b) => acc + b.bonuses.length, 0)} bonuses`);
    
    let parsedBrokers = brokers.map(broker => {
      const regulation = safeJSONParse(broker.regulation);
      const spreads = safeJSONParse(broker.averageSpreads) || {};
      const commissions = safeJSONParse(broker.commissions) || {};
      const instruments = safeJSONParse(broker.instruments) || {};
      const socialMedia = safeJSONParse(broker.socialMedia) || {};
      
      const approvedReviews = broker.reviews;
      const totalReviews = approvedReviews.length;
      
      const averageRating = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;
      
      const avgServiceRating = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + (r.serviceRating || 0), 0) / totalReviews
        : 0;
      
      const avgPlatformRating = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + (r.platformRating || 0), 0) / totalReviews
        : 0;
      
      const avgValueRating = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + (r.valueRating || 0), 0) / totalReviews
        : 0;
      
      const avgSupportRating = totalReviews > 0
        ? approvedReviews.reduce((sum, r) => sum + (r.supportRating || 0), 0) / totalReviews
        : 0;
      
      const ratingDistribution = Array.from({ length: 5 }, (_, i) => {
        const ratingValue = i + 1;
        const count = approvedReviews.filter(r => Math.floor(r.rating) === ratingValue).length;
        return {
          rating: ratingValue,
          count,
          percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0
        };
      });
      
      // Format bonuses with region info
      const bonuses = broker.bonuses.map(bonus => ({
        type: bonus.type,
        amount: bonus.amount,
        conditions: bonus.conditions || '',
        expiry: bonus.expiry || 'Ongoing',
        code: bonus.code || '',
        regions: bonus.regions || ['GLOBAL'],
        restrictedRegions: bonus.restrictedRegions || [],
      }));
      
      // Format promotions with region info
      const promotions = broker.promotions.map(promo => ({
        name: promo.name,
        description: promo.description || '',
        discount: promo.discount || '',
        code: promo.code || '',
        validUntil: promo.validUntil,
        regions: promo.regions || ['GLOBAL'],
        restrictedRegions: promo.restrictedRegions || [],
      }));
      
      const support = {
        languages: broker.supportLanguages || [],
        availability: broker.supportAvailability || '24/5',
        channels: ['Live Chat', 'Email', 'Phone'],
        responseTime: 'Under 5 minutes (live chat)'
      };
      
      const education = {
        learningMaterials: broker.educationTypes || [],
        researchTools: ['Daily market analysis', 'Economic calendar', 'Trading signals', 'Market news']
      };
      
      const chartingTools = (broker.features || []).filter((f: string) => 
        f && (f.includes('chart') || f.includes('indicator') || f.includes('analysis'))
      );
      
      const tradingFeatures = (broker.features || []).filter((f: string) => 
        f && (f.includes('trading') || f.includes('Advisor') || f.includes('copy') || f.includes('hedging'))
      );
      
      const slug = broker.slug || broker.name.toLowerCase().replace(/\s+/g, '-');
      
      return {
        id: broker.id,
        name: broker.name,
        slug: slug,
        description: broker.description || '',
        logo: broker.logo || '',
        founded: broker.founded || 0,
        headquarters: broker.headquarters || '',
        website: broker.website,
        accountTypes: broker.accountTypes.map(acc => ({
          name: acc.name,
          minDeposit: acc.minDeposit || 0,
          commission: acc.commission || '',
          spreadType: acc.spreadType || '',
          swapFree: acc.swapFree || false
        })),
        demoAccount: broker.demoAccount || false,
        demoAccountDuration: broker.demoAccount ? '30 days' : '',
        leverage: broker.maxLeverage || '1:100',
        minTradeSize: 0.01,
        maxTradeSize: 100,
        orderExecution: 'Market Execution',
        marginCall: 100,
        stopOutLevel: 50,
        spreads: spreads,
        commissions: commissions,
        swapFree: broker.islamicAccount || false,
        platforms: broker.platforms || [],
        mobileTrading: broker.mobileTrading || false,
        chartingTools: chartingTools.length > 0 ? chartingTools : ['Advanced charts', 'Technical indicators', 'Drawing tools'],
        tradingFeatures: tradingFeatures.length > 0 ? tradingFeatures : ['One-click trading', 'Expert Advisors', 'Copy trading'],
        instruments: instruments,
        depositMethods: broker.depositMethods || [],
        withdrawalMethods: broker.withdrawalMethods || [],
        withdrawalProcessingTime: broker.withdrawalProcessingTime || '1-3 business days',
        withdrawalFee: broker.withdrawalFee || 'No fee',
        minWithdrawal: broker.minWithdrawal || 50,
        // ✅ CRITICAL: Include bonuses and promotions with region info
        bonuses: bonuses,
        promotions: promotions,
        support: support,
        education: education,
        regulation: regulation || {
          authorities: [],
          compensationScheme: '',
          negativeBalanceProtection: false,
          segregatedAccounts: false
        },
        rating: averageRating,
        reviewsCount: totalReviews,
        avgServiceRating,
        avgPlatformRating,
        avgValueRating,
        avgSupportRating,
        ratingDistribution,
        reviewHighlights: {
          tradingConditions: avgServiceRating || averageRating,
          platformStability: avgPlatformRating || averageRating,
          customerSupport: avgSupportRating || averageRating,
          withdrawalSpeed: totalReviews > 0 ? 4.5 : 0,
          education: averageRating
        },
        awards: broker.awards || [],
        partnershipProgram: broker.partnershipProgram || false,
        affiliateProgram: broker.affiliateProgram || false,
        ibProgram: broker.ibProgram || false,
        features: broker.features || [],
        suitableFor: broker.targetAudience || [],
        socialMedia: socialMedia,
        bonusOffer: broker.bonusOffer || '',
        bonus: broker.bonus || '',
        highlight: broker.highlight || '',
        signupLink: broker.signupLink || broker.website,
        payout: broker.payout || 0,
        accountSize: broker.accountSize || 0,
        country: broker.country || '',
        maxAllocation: broker.maxAllocation || 0,
        yearsInOperation: broker.yearsInOperation || 0,
        years: broker.years || 0,
        type: broker.type || 'Broker',
        assets: broker.assets || '',
        platform: broker.platforms || [],
        programType: broker.accountTypes.map(acc => acc.name),
        promo: broker.promo || '',
        regulated: broker.regulated || false,
        minDeposit: broker.minDeposit || 0,
        regions: broker.regions || ['GLOBAL'],
        restrictedRegions: broker.restrictedRegions || [],
        availableInRegion: isAvailableInRegion(broker, region),
      };
    });
    
    if (minRating > 0) {
      parsedBrokers = parsedBrokers.filter(broker => broker.rating >= minRating);
    }
    
    if (sortBy === 'rating') {
      parsedBrokers.sort((a, b) => {
        return sortOrder === 'desc' 
          ? b.rating - a.rating 
          : a.rating - b.rating;
      });
    } else if (sortBy === 'reviews') {
      parsedBrokers.sort((a, b) => {
        return sortOrder === 'desc' 
          ? b.reviewsCount - a.reviewsCount 
          : a.reviewsCount - b.reviewsCount;
      });
    }
    
    const paginatedBrokers = parsedBrokers.slice(0, limit);
    const filteredTotal = parsedBrokers.length;
    const totalPages = Math.ceil(filteredTotal / limit);
    
    const response = NextResponse.json({
      success: true,
      data: paginatedBrokers,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      region: {
        current: region,
        available: true,
      },
      filters: {
        search,
        country,
        regulated: regulated || null,
        minRating,
        sortBy,
        sortOrder,
      }
    });
    
    if (!getRegionFromCookies(request)) {
      setRegionCookie(response, region);
    }
    
    return response;
    
  } catch (error) {
    console.error('Error fetching brokers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brokers' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const slug = body.name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const region = getRegionFromRequest(request);
    
    const broker = await prisma.broker.create({
      data: {
        name: body.name,
        slug: slug,
        description: body.description,
        logo: body.logo,
        website: body.website,
        country: body.country,
        headquarters: body.headquarters,
        founded: body.founded,
        rating: 0,
        reviewsCount: 0,
        regulated: body.regulated || false,
        minDeposit: body.minDeposit || 0,
        maxLeverage: body.maxLeverage || '1:100',
        platforms: body.platforms || [],
        status: 'ACTIVE',
        regulation: body.regulation ? JSON.stringify(body.regulation) : null,
        averageSpreads: body.spreads ? JSON.stringify(body.spreads) : null,
        commissions: body.commissions ? JSON.stringify(body.commissions) : null,
        instruments: body.instruments ? JSON.stringify(body.instruments) : null,
        features: body.features || [],
        depositMethods: body.depositMethods || [],
        withdrawalMethods: body.withdrawalMethods || [],
        withdrawalProcessingTime: body.withdrawalProcessingTime,
        withdrawalFee: body.withdrawalFee,
        minWithdrawal: body.minWithdrawal,
        supportLanguages: body.support?.languages || [],
        supportAvailability: body.support?.availability,
        educationTypes: body.education?.learningMaterials || [],
        awards: body.awards || [],
        targetAudience: body.suitableFor || [],
        socialMedia: body.socialMedia ? JSON.stringify(body.socialMedia) : null,
        regions: body.regions || ['GLOBAL'],
        restrictedRegions: body.restrictedRegions || [],
        regionNotes: body.regionNotes ? JSON.stringify(body.regionNotes) : null,
        entityMapping: body.entityMapping ? JSON.stringify(body.entityMapping) : null,
        regionDescriptions: body.regionDescriptions ? JSON.stringify(body.regionDescriptions) : null,
        regionPricing: body.regionPricing ? JSON.stringify(body.regionPricing) : null,
        regionPaymentMethods: body.regionPaymentMethods ? JSON.stringify(body.regionPaymentMethods) : null,
      },
    });
    
    return NextResponse.json({ success: true, data: broker }, { status: 201 });
  } catch (error) {
    console.error('Error creating broker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create broker' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}