// src/app/api/region/current/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getRegionFromRequest, setRegionCookie, DEFAULT_REGION } from '@/lib/region';

// GET - Get current region
export async function GET(request: NextRequest) {
  try {
    const region = getRegionFromRequest(request);
    
    return NextResponse.json({
      success: true,
      region: region,
    });
  } catch (error) {
    console.error('Error getting region:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get region' },
      { status: 500 }
    );
  }
}

// POST - Set current region
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region } = body;
    
    if (!region) {
      return NextResponse.json(
        { success: false, error: 'Region is required' },
        { status: 400 }
      );
    }
    
    const response = NextResponse.json({
      success: true,
      region: region,
    });
    
    setRegionCookie(response, region);
    
    return response;
  } catch (error) {
    console.error('Error setting region:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set region' },
      { status: 500 }
    );
  }
}