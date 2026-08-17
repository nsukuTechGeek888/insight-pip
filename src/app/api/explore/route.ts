// app/api/explore/route.ts
// Homepage explore with region filtering

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getRegionFromRequest, isAvailableInRegion, DEFAULT_REGION } from '@/lib/region';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '6');
    
    // ====== REGION DETECTION ======
    const region = getRegionFromRequest(request);
    console.log(`📍 Explore API - Region: ${region}`);

    // ====== 1. FEATURED BROKERS ======
    const featuredBrokers = await prisma.broker.findMany({
      where: {
        status: 'ACTIVE',
        isRecommended: true,
        AND: [
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
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        country: true,
        rating: true,
        reviewsCount: true,
        avgTrustScore: true,
        regulated: true,
        description: true,
        shortDescription: true,
        signupLink: true,
        bonus: true,
        bonusOffer: true,
        highlight: true,
        regions: true,
        restrictedRegions: true,
      },
      take: limit,
      orderBy: { rating: 'desc' }
    });

    // ====== 2. TOP RATED BROKERS ======
    const topRatedBrokers = await prisma.broker.findMany({
      where: {
        status: 'ACTIVE',
        rating: { gte: 4.0 },
        AND: [
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
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        country: true,
        rating: true,
        reviewsCount: true,
        avgTrustScore: true,
        regulated: true,
        description: true,
        shortDescription: true,
        signupLink: true,
        bonus: true,
        bonusOffer: true,
        highlight: true,
        regions: true,
        restrictedRegions: true,
      },
      take: limit,
      orderBy: { rating: 'desc' }
    });

    // ====== 3. RECENTLY ADDED BROKERS ======
    const recentBrokers = await prisma.broker.findMany({
      where: {
        status: 'ACTIVE',
        AND: [
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
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        country: true,
        rating: true,
        reviewsCount: true,
        avgTrustScore: true,
        regulated: true,
        description: true,
        shortDescription: true,
        signupLink: true,
        bonus: true,
        bonusOffer: true,
        highlight: true,
        regions: true,
        restrictedRegions: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // ====== 4. FEATURED PROP FIRMS ======
    const featuredPropFirms = await prisma.propFirm.findMany({
      where: {
        status: 'ACTIVE',
        isRecommended: true,
        AND: [
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
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        country: true,
        rating: true,
        reviewsCount: true,
        avgTrustScore: true,
        regulated: true,
        description: true,
        shortDescription: true,
        signupLink: true,
        payout: true,
        accountSize: true,
        maxAllocation: true,
        regions: true,
        restrictedRegions: true,
      },
      take: limit,
      orderBy: { rating: 'desc' }
    });

    // ====== 5. TOP RATED PROP FIRMS ======
    const topRatedPropFirms = await prisma.propFirm.findMany({
      where: {
        status: 'ACTIVE',
        rating: { gte: 4.0 },
        AND: [
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
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        country: true,
        rating: true,
        reviewsCount: true,
        avgTrustScore: true,
        regulated: true,
        description: true,
        shortDescription: true,
        signupLink: true,
        payout: true,
        accountSize: true,
        maxAllocation: true,
        regions: true,
        restrictedRegions: true,
      },
      take: limit,
      orderBy: { rating: 'desc' }
    });

    // ====== 6. RECENTLY ADDED PROP FIRMS ======
    const recentPropFirms = await prisma.propFirm.findMany({
      where: {
        status: 'ACTIVE',
        AND: [
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
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        country: true,
        rating: true,
        reviewsCount: true,
        avgTrustScore: true,
        regulated: true,
        description: true,
        shortDescription: true,
        signupLink: true,
        payout: true,
        accountSize: true,
        maxAllocation: true,
        regions: true,
        restrictedRegions: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    // ====== 7. COMBINED OFFERS ======
    // Get brokers with promotions
    const brokersWithPromotions = await prisma.broker.findMany({
      where: {
        status: 'ACTIVE',
        AND: [
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
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
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
          take: 2
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
          take: 2
        },
        regions: true,
        restrictedRegions: true,
      },
      take: 10
    });

    const combinedOffers = brokersWithPromotions
      .filter(b => b.promotions.length > 0 || b.bonuses.length > 0)
      .map(b => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        logo: b.logo,
        type: 'broker',
        offers: {
          promotions: b.promotions,
          bonuses: b.bonuses,
        },
        availableInRegion: isAvailableInRegion(b, region),
      }))
      .slice(0, 5);

    // ====== 8. REGION STATS ======
    const totalBrokers = await prisma.broker.count({
      where: {
        status: 'ACTIVE',
        AND: [
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
        ]
      }
    });

    const totalPropFirms = await prisma.propFirm.count({
      where: {
        status: 'ACTIVE',
        AND: [
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
        ]
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        region: {
          current: region,
        },
        stats: {
          totalBrokers,
          totalPropFirms,
        },
        featured: {
          brokers: featuredBrokers,
          propFirms: featuredPropFirms,
        },
        topRated: {
          brokers: topRatedBrokers,
          propFirms: topRatedPropFirms,
        },
        recent: {
          brokers: recentBrokers,
          propFirms: recentPropFirms,
        },
        offers: combinedOffers,
      }
    });

  } catch (error) {
    console.error('Error fetching explore data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch explore data' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}