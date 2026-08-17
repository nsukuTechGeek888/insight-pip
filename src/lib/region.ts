// src/lib/region.ts - COMPLETE VERSION WITH ALL FUNCTIONS

export const DEFAULT_REGION = 'GLOBAL';

// Region codes
export const REGION_CODES = {
  GLOBAL: 'GLOBAL',
  SA: 'SA',
  EU: 'EU',
  UK: 'UK',
  UAE: 'UAE',
  KE: 'KE',
  AU: 'AU',
  SG: 'SG',
  US: 'US',
  CA: 'CA',
  MU: 'MU',
  SC: 'SC',
  BVI: 'BVI',
  NZ: 'NZ',
  HK: 'HK',
  IN: 'IN',
  BR: 'BR',
  MX: 'MX',
} as const;

export type RegionCode = keyof typeof REGION_CODES;

export const REGION_INFO: Record<RegionCode, { label: string; flag: string; currency: string; currencySymbol: string }> = {
  GLOBAL: { label: 'Global', flag: '🌍', currency: 'USD', currencySymbol: '$' },
  SA: { label: 'South Africa', flag: '🇿🇦', currency: 'ZAR', currencySymbol: 'R' },
  EU: { label: 'Europe', flag: '🇪🇺', currency: 'EUR', currencySymbol: '€' },
  UK: { label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£' },
  UAE: { label: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', currencySymbol: 'د.إ' },
  KE: { label: 'Kenya', flag: '🇰🇪', currency: 'KES', currencySymbol: 'KSh' },
  AU: { label: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: 'A$' },
  SG: { label: 'Singapore', flag: '🇸🇬', currency: 'SGD', currencySymbol: 'S$' },
  US: { label: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$' },
  CA: { label: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: 'C$' },
  MU: { label: 'Mauritius', flag: '🇲🇺', currency: 'MUR', currencySymbol: 'Rs' },
  SC: { label: 'Seychelles', flag: '🇸🇨', currency: 'SCR', currencySymbol: 'SR' },
  BVI: { label: 'British Virgin Islands', flag: '🇻🇬', currency: 'USD', currencySymbol: '$' },
  NZ: { label: 'New Zealand', flag: '🇳🇿', currency: 'NZD', currencySymbol: 'NZ$' },
  HK: { label: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', currencySymbol: 'HK$' },
  IN: { label: 'India', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹' },
  BR: { label: 'Brazil', flag: '🇧🇷', currency: 'BRL', currencySymbol: 'R$' },
  MX: { label: 'Mexico', flag: '🇲🇽', currency: 'MXN', currencySymbol: 'MX$' },
};

export const REGION_LIST = Object.entries(REGION_INFO)
  .filter(([code]) => code !== 'GLOBAL')
  .map(([code, info]) => ({
    code: code as RegionCode,
    label: info.label,
    flag: info.flag,
    currency: info.currency,
    currencySymbol: info.currencySymbol,
  }));

export function getRegionFromCountry(countryCode: string): string {
  const regionMap: Record<string, string> = {
    'ZA': 'SA',
    'KE': 'KE',
    'NG': 'NG',
    'GH': 'GH',
    'TZ': 'TZ',
    'ZW': 'ZW',
    'GB': 'UK',
    'DE': 'EU',
    'FR': 'EU',
    'IT': 'EU',
    'ES': 'EU',
    'NL': 'EU',
    'BE': 'EU',
    'PT': 'EU',
    'GR': 'EU',
    'SE': 'EU',
    'NO': 'EU',
    'DK': 'EU',
    'FI': 'EU',
    'IE': 'EU',
    'CH': 'EU',
    'AT': 'EU',
    'PL': 'EU',
    'AE': 'UAE',
    'AU': 'AU',
    'SG': 'SG',
    'US': 'US',
    'CA': 'CA',
    'IN': 'IN',
    'BR': 'BR',
    'MX': 'MX',
    'MU': 'MU',
    'SC': 'SC',
    'VG': 'BVI',
    'KY': 'BVI',
    'BS': 'BVI',
    'NZ': 'NZ',
    'HK': 'HK',
  };
  return regionMap[countryCode] || DEFAULT_REGION;
}

// ====== NEW FUNCTIONS FOR API ROUTES ======

/**
 * Get region from the request object
 * Checks: query param -> cookie -> headers (Cloudflare, Vercel) -> default
 */
export function getRegionFromRequest(request: Request): string {
  try {
    // 1. Check URL query params
    const url = new URL(request.url);
    const regionParam = url.searchParams.get('region');
    if (regionParam && regionParam !== '') {
      return regionParam;
    }
  } catch (e) {
    // URL parsing might fail in some environments
  }

  // 2. Check cookies (if request has cookies method)
  try {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => {
          const [key, ...rest] = c.split('=');
          return [key, rest.join('=')];
        })
      );
      if (cookies['user_region']) {
        return decodeURIComponent(cookies['user_region']);
      }
    }
  } catch (e) {
    // Cookie parsing might fail
  }

  // 3. Check headers (Cloudflare, Vercel, etc.)
  const cfCountry = request.headers.get('CF-IPCountry') || 
                    request.headers.get('x-vercel-ip-country') ||
                    request.headers.get('x-country-code');
  if (cfCountry) {
    return getRegionFromCountry(cfCountry);
  }

  // 4. Default
  return DEFAULT_REGION;
}

/**
 * Set region cookie in response
 */
export function setRegionCookie(response: any, region: string): void {
  if (response && typeof response.cookies?.set === 'function') {
    response.cookies.set('user_region', region, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
  }
}

/**
 * Get region from cookies
 */
export function getRegionFromCookies(request: Request): string | null {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => {
          const [key, ...rest] = c.split('=');
          return [key, rest.join('=')];
        })
      );
      if (cookies['user_region']) {
        return decodeURIComponent(cookies['user_region']);
      }
    }
  } catch (e) {
    // Cookie parsing might fail
  }
  return null;
}

/**
 * Delete region cookie from response
 */
export function deleteRegionCookie(response: any): void {
  if (response && typeof response.cookies?.delete === 'function') {
    response.cookies.delete('user_region');
  }
}

// ====== EXISTING UTILITY FUNCTIONS ======

export function isAvailableInRegion(
  entity: { regions?: string[]; restrictedRegions?: string[] },
  region: string
): boolean {
  const targetRegion = region || DEFAULT_REGION;
  
  if (entity.restrictedRegions?.includes(targetRegion)) {
    return false;
  }
  
  if (entity.regions && entity.regions.length > 0) {
    return entity.regions.includes(targetRegion) || entity.regions.includes('GLOBAL');
  }
  
  return true;
}

export function filterByRegion<T extends { regions?: string[]; restrictedRegions?: string[] }>(
  entities: T[],
  region: string
): T[] {
  return entities.filter(entity => isAvailableInRegion(entity, region));
}

export function getAvailableRegions(entity: { regions?: string[]; restrictedRegions?: string[] }): string[] {
  const allRegions = Object.keys(REGION_INFO);
  
  if (!entity.regions || entity.regions.length === 0) {
    return allRegions.filter(r => !entity.restrictedRegions?.includes(r));
  }
  
  return entity.regions
    .filter(r => !entity.restrictedRegions?.includes(r))
    .filter(r => r in REGION_INFO);
}

export function getRegionEntityName(
  entity: { entityMapping?: Record<string, string> | null },
  region: string
): string | null {
  if (!entity.entityMapping) return null;
  
  if (entity.entityMapping[region]) {
    return entity.entityMapping[region];
  }
  
  if (entity.entityMapping.GLOBAL) {
    return entity.entityMapping.GLOBAL;
  }
  
  return null;
}