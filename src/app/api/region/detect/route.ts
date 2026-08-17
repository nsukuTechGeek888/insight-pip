// src/app/api/region/detect/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getRegionFromRequest, setRegionCookie, DEFAULT_REGION } from '@/lib/region';

export async function GET(request: NextRequest) {
  try {
    // Get region from headers
    const region = getRegionFromRequest(request);
    
    // Get country from headers for additional info
    const country = request.headers.get('CF-IPCountry') || 
                    request.headers.get('x-vercel-ip-country') ||
                    request.headers.get('x-country-code') ||
                    'Unknown';
    
    const response = NextResponse.json({
      success: true,
      region: region,
      country: country,
      method: 'ip-geolocation',
    });
    
    // Set region cookie
    setRegionCookie(response, region);
    
    return response;
  } catch (error) {
    console.error('Error detecting region:', error);
    return NextResponse.json({
      success: false,
      region: DEFAULT_REGION,
      error: 'Failed to detect region',
    });
  }
}