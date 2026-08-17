// API helper functions for data formatting and validation

// Format currency
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (!amount && amount !== 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format percentage
export function formatPercentage(value: number): string {
  if (!value && value !== 0) return 'N/A';
  return `${value.toFixed(1)}%`;
}

// Format rating
export function formatRating(rating: number): string {
  if (!rating && rating !== 0) return 'N/A';
  return rating.toFixed(1);
}

// Format spread for display
export function formatSpread(spread: any): string {
  if (!spread) return 'N/A';
  if (typeof spread === 'string') return spread;
  if (typeof spread === 'number') return spread.toFixed(2);
  if (typeof spread === 'object') {
    if (spread.min && spread.max) return `${spread.min.toFixed(2)} - ${spread.max.toFixed(2)}`;
    if (spread.typical) return spread.typical.toFixed(2);
  }
  return 'N/A';
}

// Format commission
export function formatCommission(commission: any): string {
  if (!commission) return 'N/A';
  if (typeof commission === 'string') return commission;
  if (typeof commission === 'number') return `$${commission.toFixed(2)}`;
  return 'N/A';
}

// Get broker's minimum deposit
export function getBrokerMinDeposit(broker: any): number {
  if (!broker) return 0;
  
  // Check account types first
  if (broker.accountTypes && broker.accountTypes.length > 0) {
    const deposits = broker.accountTypes
      .map((acc: any) => acc.minDeposit)
      .filter((d: any) => d !== null && d !== undefined && !isNaN(d));
    if (deposits.length > 0) return Math.min(...deposits);
  }
  
  return broker.minDeposit || 0;
}

// Get broker spreads for a specific pair
export function getBrokerSpreads(broker: any, pair: string = 'eurusd'): string {
  if (!broker) return 'N/A';
  
  if (broker.spreads && broker.spreads[pair]) {
    return broker.spreads[pair];
  }
  
  if (broker.averageSpreads && broker.averageSpreads[pair]) {
    return broker.averageSpreads[pair];
  }
  
  return 'N/A';
}

// Check if broker is regulated
export function isBrokerRegulated(broker: any): boolean {
  if (!broker) return false;
  return broker.regulated === true || 
         (broker.regulation && 
          broker.regulation.authorities && 
          broker.regulation.authorities.length > 0);
}

// Get prop firm's lowest account option
export function getLowestAccountOption(propFirm: any) {
  if (!propFirm || !propFirm.programs || propFirm.programs.length === 0) return null;
  
  let lowest = null;
  propFirm.programs.forEach((program: any) => {
    if (program.accountOptions && program.accountOptions.length > 0) {
      program.accountOptions.forEach((option: any) => {
        if (!lowest || (option.accountSize < lowest.accountSize)) {
          lowest = option;
        }
      });
    }
  });
  
  return lowest;
}

// Get prop firm's highest account option
export function getHighestAccountOption(propFirm: any) {
  if (!propFirm || !propFirm.programs || propFirm.programs.length === 0) return null;
  
  let highest = null;
  propFirm.programs.forEach((program: any) => {
    if (program.accountOptions && program.accountOptions.length > 0) {
      program.accountOptions.forEach((option: any) => {
        if (!highest || (option.accountSize > highest.accountSize)) {
          highest = option;
        }
      });
    }
  });
  
  return highest;
}

// Get unique program types from a prop firm
export function getProgramTypes(propFirm: any): string[] {
  if (!propFirm || !propFirm.programs) return [];
  return [...new Set(propFirm.programs.map((p: any) => p.type))];
}

// Check if prop firm is available in a country
export function isPropFirmAvailableInCountry(propFirm: any, country: string): boolean {
  if (!propFirm) return false;
  if (!propFirm.supportedCountries || propFirm.supportedCountries.length === 0) return true;
  if (propFirm.prohibitedCountries && propFirm.prohibitedCountries.includes(country)) return false;
  return propFirm.supportedCountries.includes('Worldwide') || 
         propFirm.supportedCountries.includes(country);
}

// Transform broker data for display
export function transformBrokerForDisplay(broker: any) {
  if (!broker) return null;
  
  return {
    ...broker,
    formattedMinDeposit: formatCurrency(getBrokerMinDeposit(broker)),
    formattedRating: formatRating(broker.rating || 0),
    formattedSpreads: broker.spreads ? 
      Object.entries(broker.spreads).reduce((acc: any, [key, value]) => {
        acc[key] = formatSpread(value);
        return acc;
      }, {}) : {},
    isRegulated: isBrokerRegulated(broker)
  };
}

// Transform prop firm data for display
export function transformPropFirmForDisplay(propFirm: any) {
  if (!propFirm) return null;
  
  const lowestOption = getLowestAccountOption(propFirm);
  const highestOption = getHighestAccountOption(propFirm);
  
  return {
    ...propFirm,
    formattedRating: formatRating(propFirm.rating || 0),
    minAccountSize: lowestOption ? formatCurrency(lowestOption.accountSize) : 'N/A',
    maxAccountSize: highestOption ? formatCurrency(highestOption.accountSize) : 'N/A',
    programTypes: getProgramTypes(propFirm)
  };
}

// Filter brokers by criteria
export function filterBrokers(brokers: any[], filters: any) {
  if (!brokers || !Array.isArray(brokers)) return [];
  
  return brokers.filter(broker => {
    if (!broker) return false;
    
    if (filters.country && broker.country !== filters.country) return false;
    if (filters.minRating && (broker.rating || 0) < filters.minRating) return false;
    if (filters.regulated !== undefined && isBrokerRegulated(broker) !== filters.regulated) return false;
    if (filters.minDeposit && getBrokerMinDeposit(broker) > filters.minDeposit) return false;
    if (filters.platform && broker.platforms && !broker.platforms.includes(filters.platform)) return false;
    
    return true;
  });
}

// Filter prop firms by criteria
export function filterPropFirms(propFirms: any[], filters: any) {
  if (!propFirms || !Array.isArray(propFirms)) return [];
  
  return propFirms.filter(firm => {
    if (!firm) return false;
    
    if (filters.country && firm.country !== filters.country) return false;
    if (filters.minRating && (firm.rating || 0) < filters.minRating) return false;
    
    if (filters.programType && firm.programs) {
      const hasProgramType = firm.programs.some((p: any) => 
        p.type && p.type.toLowerCase().includes(filters.programType.toLowerCase())
      );
      if (!hasProgramType) return false;
    }
    
    if (filters.minAccountSize) {
      const minOption = getLowestAccountOption(firm);
      if (!minOption || minOption.accountSize < filters.minAccountSize) return false;
    }
    
    return true;
  });
}

// Sort functions
export function sortByRating(items: any[], ascending: boolean = false) {
  return [...items].sort((a, b) => {
    const ratingA = a.rating || 0;
    const ratingB = b.rating || 0;
    return ascending ? ratingA - ratingB : ratingB - ratingA;
  });
}

export function sortByMinDeposit(brokers: any[], ascending: boolean = true) {
  return [...brokers].sort((a, b) => {
    const depositA = getBrokerMinDeposit(a);
    const depositB = getBrokerMinDeposit(b);
    return ascending ? depositA - depositB : depositB - depositA;
  });
}

export function sortByAccountSize(propFirms: any[], ascending: boolean = true) {
  return [...propFirms].sort((a, b) => {
    const minA = getLowestAccountOption(a)?.accountSize || 0;
    const minB = getLowestAccountOption(b)?.accountSize || 0;
    return ascending ? minA - minB : minB - minA;
  });
}

// Data validation
export function isValidBrokerData(broker: any): boolean {
  return broker && 
         typeof broker === 'object' && 
         broker.name && 
         typeof broker.name === 'string' &&
         broker.id !== undefined;
}

export function isValidPropFirmData(propFirm: any): boolean {
  return propFirm && 
         typeof propFirm === 'object' && 
         propFirm.name && 
         typeof propFirm.name === 'string' &&
         propFirm.id !== undefined;
}