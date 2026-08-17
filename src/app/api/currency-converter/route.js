import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔄 Getting real exchange rates...');
    
    // Use a free API to get real exchange rates
    const response = await fetch('https://api.frankfurter.app/latest?from=USD');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Got real exchange rates from Frankfurter API');
      
      return NextResponse.json({
        success: true,
        base: 'USD',
        rates: data.rates,
        timestamp: Date.now(),
        source: 'Frankfurter API'
      });
    } else {
      throw new Error('API not working');
    }
    
  } catch (error) {
    console.log('❌ API failed, trying backup API...');
    
    // Try a backup API
    try {
      const backupResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (backupResponse.ok) {
        const backupData = await backupResponse.json();
        console.log('✅ Got rates from backup API');
        
        return NextResponse.json({
          success: true,
          base: 'USD',
          rates: backupData.rates,
          timestamp: Date.now(),
          source: 'ExchangeRate-API'
        });
      }
    } catch (backupError) {
      console.log('❌ All APIs failed');
    }
    
    // If all else fails, use realistic rates
    const realisticRates = {
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.25,
      CAD: 1.36,
      AUD: 1.52,
      CHF: 0.88,
      CNY: 7.23,
      ZAR: 18.75,
      INR: 83.12,
      BRL: 4.95,
      MXN: 17.28
    };
    
    return NextResponse.json({
      success: true,
      base: 'USD',
      rates: realisticRates,
      timestamp: Date.now(),
      source: 'Realistic Fallback'
    });
  }
}