// src/lib/api.ts
// API service layer for consistent API calls - UPDATED WITH REGION SUPPORT

class ApiService {
  private baseUrl = '/api';

  // Generic fetch wrapper with auth - UPDATED to handle your API's response format
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for cookies
    });

    // Handle 401 gracefully - your API returns { error: 'Not authenticated' }
    if (response.status === 401) {
      try {
        const errorData = await response.json();
        // Your API returns { error: 'Not authenticated' }
        return { 
          success: false, 
          error: errorData.error || 'Not authenticated' 
        } as T;
      } catch {
        return { success: false, error: 'Not authenticated' } as T;
      }
    }

    if (!response.ok) {
      const error = await response.text().catch(() => response.statusText);
      throw new Error(`API Error (${response.status}): ${error}`);
    }

    return response.json();
  }

  // Simple GET wrapper for your existing endpoints with better error handling
  private async simpleGet<T>(
    endpoint: string, 
    useFetchWrapper = false
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      if (useFetchWrapper) {
        const data = await this.fetch<T>(endpoint);
        return {
          success: true,
          data: Array.isArray(data) ? data : (data as any).data || data,
          error: undefined
        };
      } else {
        // Direct fetch for endpoints that don't need the auth wrapper
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        return {
          success: true,
          data: Array.isArray(data) ? data : (data as any).data || data,
          error: undefined
        };
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      };
    }
  }

  // ====== AUTH ENDPOINTS ======
  async login(email: string, password: string) {
    try {
      const response = await this.fetch<{ success?: boolean; user?: any; error?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      // Your API returns { success: true, user: {...} } on success
      // or { error: 'message' } on failure
      if (response && (response as any).success && (response as any).user) {
        return { 
          success: true, 
          user: (response as any).user 
        };
      } else {
        return { 
          success: false, 
          error: (response as any).error || 'Login failed' 
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed' 
      };
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.fetch<{ success?: boolean; user?: any; error?: string }>('/auth/me');
      
      // Your API returns { success: true, user: {...} } on success
      // or { error: 'Not authenticated' } on 401
      if (response && (response as any).success && (response as any).user) {
        return { 
          success: true, 
          user: (response as any).user 
        };
      } else {
        return { 
          success: false, 
          error: (response as any).error || 'Not authenticated' 
        };
      }
    } catch (error: any) {
      // Return a consistent format for any errors
      return { 
        success: false, 
        error: error.message || 'Not authenticated' 
      };
    }
  }

  async logout() {
    try {
      const response = await this.fetch<{ success?: boolean; message?: string }>('/auth/logout', {
        method: 'POST',
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Logout error:', error);
      return { success: false };
    }
  }

  // ====== BROKERS ENDPOINTS - UPDATED WITH REGION ======
  async getBrokers(region?: string) {
    try {
      const url = region ? `/brokers?region=${region}` : '/brokers';
      const response = await this.fetch<any>(url);
      
      // Handle different response formats
      if (response && response.success && response.data) {
        return { success: true, data: response.data, error: undefined };
      } else if (Array.isArray(response)) {
        return { success: true, data: response, error: undefined };
      } else if (response && response.data && Array.isArray(response.data)) {
        return { success: true, data: response.data, error: undefined };
      } else {
        console.log('Unexpected brokers response format:', response);
        return { success: false, data: [], error: 'Invalid response format' };
      }
    } catch (error) {
      console.error('Error fetching brokers:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch brokers'
      };
    }
  }

  async getBrokerById(id: string | number) {
    console.log(`🔍 API: Fetching broker by ID: ${id}`);
    try {
      const response = await this.fetch<any>(`/brokers/${id}`);
      
      // Handle the nested data structure
      if (response && response.success && response.data) {
        // If response has success and data properties, extract the data
        console.log(`✅ API: Successfully fetched broker:`, response.data.name || 'Unknown');
        return { success: true, data: response.data, error: undefined };
      } else if (response && response.id) {
        // If response is directly the broker object
        console.log(`✅ API: Successfully fetched broker:`, response.name || 'Unknown');
        return { success: true, data: response, error: undefined };
      } else {
        console.log(`❌ API: Invalid response format for broker ${id}`, response);
        return { success: false, data: undefined, error: 'Invalid response format' };
      }
    } catch (error) {
      console.error(`❌ API: Failed to fetch broker ${id}:`, error);
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch broker'
      };
    }
  }

  async getBrokerBySlug(slug: string) {
    console.log(`🔍 API: Fetching broker by slug: ${slug}`);
    try {
      // Use the same endpoint as getBrokerById - the API now handles both IDs and slugs
      const response = await this.fetch<any>(`/brokers/${slug}`);
      
      // Handle the nested data structure
      if (response && response.success && response.data) {
        // If response has success and data properties, extract the data
        console.log(`✅ API: Successfully fetched broker by slug:`, response.data.name || 'Unknown');
        return { success: true, data: response.data, error: undefined };
      } else if (response && response.id) {
        // If response is directly the broker object
        console.log(`✅ API: Successfully fetched broker by slug:`, response.name || 'Unknown');
        return { success: true, data: response, error: undefined };
      } else {
        console.log(`❌ API: Invalid response format for broker slug ${slug}`, response);
        return { success: false, data: undefined, error: 'Invalid response format' };
      }
    } catch (error) {
      console.error(`❌ API: Failed to fetch broker by slug ${slug}:`, error);
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch broker'
      };
    }
  }

  // NEW METHOD: Unified method to get broker by ID or slug
  async getBrokerByIdOrSlug(identifier: string | number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('🌐 Fetching broker with identifier:', identifier);
      
      const response = await this.fetch<any>(`/brokers/${identifier}`);
      
      // Handle the nested data structure
      if (response && response.success && response.data) {
        console.log('✅ Found broker:', response.data.name);
        return {
          success: true,
          data: response.data,
          error: undefined
        };
      } else if (response && response.id) {
        console.log('✅ Found broker:', response.name);
        return {
          success: true,
          data: response,
          error: undefined
        };
      } else {
        console.log('❌ Invalid response format for broker', identifier);
        return {
          success: false,
          data: undefined,
          error: 'Invalid response format'
        };
      }
    } catch (error) {
      console.error('❌ Error in getBrokerByIdOrSlug:', error);
      
      // Ultimate fallback: get all brokers and find manually
      try {
        console.log('🔄 Ultimate fallback: Getting all brokers...');
        const allBrokers = await this.getBrokers();
        
        if (allBrokers.success && allBrokers.data) {
          const foundBroker = allBrokers.data.find((b: any) => {
            const idMatch = b.id === identifier || b.id === Number(identifier);
            const slugMatch = b.slug === identifier;
            const nameMatch = b.name && b.name.toLowerCase().replace(/\s+/g, '-') === String(identifier).toLowerCase();
            return idMatch || slugMatch || nameMatch;
          });
          
          if (foundBroker) {
            console.log('✅ Found broker in fallback search:', foundBroker.name);
            return {
              success: true,
              data: foundBroker,
              error: undefined
            };
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
      
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch broker'
      };
    }
  }

  // ====== PROP FIRMS ENDPOINTS - UPDATED WITH REGION ======
  async getPropFirms(region?: string) {
    try {
      const url = region ? `/prop-firms?region=${region}` : '/prop-firms';
      const response = await this.fetch<any>(url);
      
      // Handle different response formats
      if (response && response.success && response.data) {
        return { success: true, data: response.data, error: undefined };
      } else if (Array.isArray(response)) {
        return { success: true, data: response, error: undefined };
      } else if (response && response.data && Array.isArray(response.data)) {
        return { success: true, data: response.data, error: undefined };
      } else {
        console.log('Unexpected prop firms response format:', response);
        return { success: false, data: [], error: 'Invalid response format' };
      }
    } catch (error) {
      console.error('Error fetching prop firms:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch prop firms'
      };
    }
  }

  async getPropFirmById(id: string | number) {
    console.log(`🔍 API: Fetching prop firm by ID: ${id}`);
    try {
      const response = await this.fetch<any>(`/prop-firms/${id}`);
      
      // Handle the nested data structure
      if (response && response.success && response.data) {
        console.log(`✅ API: Successfully fetched prop firm:`, response.data.name || 'Unknown');
        return { success: true, data: response.data, error: undefined };
      } else if (response && response.id) {
        console.log(`✅ API: Successfully fetched prop firm:`, response.name || 'Unknown');
        return { success: true, data: response, error: undefined };
      } else {
        console.log(`❌ API: Invalid response format for prop firm ${id}`, response);
        return { success: false, data: undefined, error: 'Invalid response format' };
      }
    } catch (error) {
      console.error(`❌ API: Failed to fetch prop firm ${id}:`, error);
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch prop firm'
      };
    }
  }

  async getPropFirmBySlug(slug: string) {
    console.log(`🔍 API: Fetching prop firm by slug: ${slug}`);
    try {
      // Use the same endpoint as getPropFirmById - the API now handles both IDs and slugs
      const response = await this.fetch<any>(`/prop-firms/${slug}`);
      
      // Handle the nested data structure
      if (response && response.success && response.data) {
        console.log(`✅ API: Successfully fetched prop firm by slug:`, response.data.name || 'Unknown');
        return { success: true, data: response.data, error: undefined };
      } else if (response && response.id) {
        console.log(`✅ API: Successfully fetched prop firm by slug:`, response.name || 'Unknown');
        return { success: true, data: response, error: undefined };
      } else {
        console.log(`❌ API: Invalid response format for prop firm slug ${slug}`, response);
        return { success: false, data: undefined, error: 'Invalid response format' };
      }
    } catch (error) {
      console.error(`❌ API: Failed to fetch prop firm by slug ${slug}:`, error);
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch prop firm'
      };
    }
  }

  // NEW METHOD: Unified method to get prop firm by ID or slug
  async getPropFirmByIdOrSlug(identifier: string | number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('🌐 Fetching prop firm with identifier:', identifier);
      
      const response = await this.fetch<any>(`/prop-firms/${identifier}`);
      
      // Handle the nested data structure
      if (response && response.success && response.data) {
        console.log('✅ Found prop firm:', response.data.name);
        return {
          success: true,
          data: response.data,
          error: undefined
        };
      } else if (response && response.id) {
        console.log('✅ Found prop firm:', response.name);
        return {
          success: true,
          data: response,
          error: undefined
        };
      } else {
        console.log('❌ Invalid response format for prop firm', identifier);
        return {
          success: false,
          data: undefined,
          error: 'Invalid response format'
        };
      }
    } catch (error) {
      console.error('❌ Error in getPropFirmByIdOrSlug:', error);
      
      // Ultimate fallback: get all firms and find manually
      try {
        console.log('🔄 Ultimate fallback: Getting all firms...');
        const allFirms = await this.getPropFirms();
        
        if (allFirms.success && allFirms.data) {
          const foundFirm = allFirms.data.find((f: any) => {
            const idMatch = f.id === identifier || f.id === Number(identifier);
            const slugMatch = f.slug === identifier;
            const nameMatch = f.name && f.name.toLowerCase().replace(/\s+/g, '-') === String(identifier).toLowerCase();
            return idMatch || slugMatch || nameMatch;
          });
          
          if (foundFirm) {
            console.log('✅ Found firm in fallback search:', foundFirm.name);
            return {
              success: true,
              data: foundFirm,
              error: undefined
            };
          }
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
      
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch prop firm'
      };
    }
  }

  // ====== HOMEPAGE SPECIFIC ENDPOINT ======
  async getHomePageData(region?: string) {
    // Fetch both brokers and prop firms for the homepage in parallel with region
    const [brokersResponse, propFirmsResponse] = await Promise.all([
      this.getBrokers(region),
      this.getPropFirms(region)
    ]);
    
    return {
      brokers: brokersResponse.data || [],
      propFirms: propFirmsResponse.data || [],
      featuredBroker: (brokersResponse.data || [])[0] || null,
      featuredPropFirm: (propFirmsResponse.data || [])[0] || null,
      stats: {
        totalBrokers: (brokersResponse.data || []).length,
        totalPropFirms: (propFirmsResponse.data || []).length
      }
    };
  }

  // ====== OFFERS ENDPOINTS ======
  async getOffers(region?: string) {
    try {
      const url = region ? `/offers?region=${region}` : '/offers';
      const response = await this.fetch<any>(url);
      
      if (response && response.success && response.data) {
        return { success: true, data: response.data, error: undefined };
      } else if (Array.isArray(response)) {
        return { success: true, data: response, error: undefined };
      } else {
        return { success: false, data: [], error: 'Invalid response format' };
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Failed to fetch offers'
      };
    }
  }

  async getOffersByBroker(brokerId: string | number, region?: string) {
    try {
      const url = region ? `/offers/broker/${brokerId}?region=${region}` : `/offers/broker/${brokerId}`;
      const data = await this.fetch<any>(url);
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch offers'
      };
    }
  }

  async getOffersByPropFirm(firmId: string | number, region?: string) {
    try {
      const url = region ? `/offers/prop-firm/${firmId}?region=${region}` : `/offers/prop-firm/${firmId}`;
      const data = await this.fetch<any>(url);
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch offers'
      };
    }
  }

  async getFeaturedOffers(limit = 5, region?: string) {
    try {
      const url = region ? `/offers/featured?limit=${limit}&region=${region}` : `/offers/featured?limit=${limit}`;
      const data = await this.fetch<any[]>(url);
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch featured offers'
      };
    }
  }

  // ====== REVIEWS ENDPOINTS ======
  async getReviews(entityType: 'broker' | 'prop-firm', entityId: string | number) {
    try {
      const data = await this.fetch<any[]>(`/reviews/${entityType}/${entityId}`);
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch reviews'
      };
    }
  }

  async addReview(
    entityType: 'broker' | 'prop-firm',
    entityId: string | number,
    review: { rating: number; comment: string; userId: string }
  ) {
    try {
      const data = await this.fetch<any>(`/reviews/${entityType}/${entityId}`, {
        method: 'POST',
        body: JSON.stringify(review),
      });
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to add review'
      };
    }
  }

  // ====== SEARCH ENDPOINTS ======
  async searchAll(query: string, limit = 10, region?: string) {
    const [brokersResponse, propFirmsResponse] = await Promise.all([
      this.getBrokers(region),
      this.getPropFirms(region)
    ]);
    
    const searchTerm = query.toLowerCase();
    const brokers = (brokersResponse.data || []).filter((broker: any) => 
      broker.name?.toLowerCase().includes(searchTerm)
    );
    
    const propFirms = (propFirmsResponse.data || []).filter((firm: any) => 
      firm.name?.toLowerCase().includes(searchTerm)
    );
    
    return {
      brokers: brokers.slice(0, limit),
      propFirms: propFirms.slice(0, limit),
      totalBrokers: brokers.length,
      totalPropFirms: propFirms.length
    };
  }

  async advancedSearch(params: {
    type: 'brokers' | 'prop-firms' | 'all';
    query?: string;
    minRating?: number;
    minDeposit?: number;
    regulation?: string;
    platforms?: string[];
    leverage?: string;
    accountSize?: { min?: number; max?: number };
    payoutPercentage?: number;
    sortBy?: 'rating' | 'name' | 'accountSize' | 'payoutPercentage';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    page?: number;
    region?: string;
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/search/advanced`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to perform search'
      };
    }
  }

  // ====== COMPARISON ENDPOINTS ======
  async compareBrokers(brokerIds: (string | number)[], region?: string) {
    const brokers = await Promise.all(
      brokerIds.map(id => this.getBrokerById(id))
    );
    
    const successfulBrokers = brokers
      .filter(res => res.success && res.data)
      .map(res => res.data);
    
    return {
      brokers: successfulBrokers,
      comparison: {
        minDeposits: successfulBrokers.map(b => b.minDeposit || 0),
        ratings: successfulBrokers.map(b => b.rating || 0),
        spreads: successfulBrokers.map(b => b.spreads?.eurusd || 'N/A'),
        leverages: successfulBrokers.map(b => b.leverage || 'N/A'),
        platforms: successfulBrokers.map(b => b.platforms || []),
        regulated: successfulBrokers.map(b => b.regulated || false)
      }
    };
  }

  async comparePropFirms(firmIds: (string | number)[], region?: string) {
    const propFirms = await Promise.all(
      firmIds.map(id => this.getPropFirmByIdOrSlug(id))
    );
    
    const successfulFirms = propFirms
      .filter(res => res.success && res.data)
      .map(res => res.data);
    
    return {
      propFirms: successfulFirms,
      comparison: {
        ratings: successfulFirms.map(f => f.rating || 0),
        accountSizes: successfulFirms.map(f => {
          const programs = f.programs || [];
          if (programs.length === 0) return 0;
          const accountOptions = programs.flatMap((p: any) => p.accountOptions || []);
          if (accountOptions.length === 0) return 0;
          return Math.max(...accountOptions.map((opt: any) => opt.accountSize || 0));
        }),
        payoutPercentages: successfulFirms.map(f => {
          const programs = f.programs || [];
          if (programs.length === 0) return 0;
          const accountOptions = programs.flatMap((p: any) => p.accountOptions || []);
          if (accountOptions.length === 0) return 0;
          return Math.max(...accountOptions.map((opt: any) => opt.payoutPercentage || 0));
        }),
        profitTargets: successfulFirms.map(f => {
          const programs = f.programs || [];
          if (programs.length === 0) return 'N/A';
          const firstProgram = programs[0];
          const rules = firstProgram.rules || {};
          return rules.profitTarget || 'N/A';
        })
      }
    };
  }

  // ====== FAVORITES & USER DATA ======
  async getFavorites(userId: string) {
    try {
      const data = await this.fetch<any>(`/users/${userId}/favorites`);
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch favorites'
      };
    }
  }

  async addToFavorites(userId: string, item: { type: 'broker' | 'propFirm'; id: number }) {
    try {
      const data = await this.fetch<any>(`/users/${userId}/favorites`, {
        method: 'POST',
        body: JSON.stringify(item),
      });
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to add favorite'
      };
    }
  }

  async removeFromFavorites(userId: string, itemId: number) {
    try {
      const data = await this.fetch<any>(`/users/${userId}/favorites/${itemId}`, {
        method: 'DELETE',
      });
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to remove favorite'
      };
    }
  }

  async getComparisonHistory(userId: string) {
    try {
      const data = await this.fetch<any[]>(`/users/${userId}/comparisons`);
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch comparison history'
      };
    }
  }

  // ====== ANALYTICS & INSIGHTS ======
  async getMarketInsights(region?: string) {
    try {
      const url = region ? `/analytics/market-insights?region=${region}` : '/analytics/market-insights';
      const data = await this.fetch<any>(url);
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch market insights'
      };
    }
  }

  async getTrendingBrokers(limit = 5, region?: string) {
    try {
      const url = region ? `/analytics/trending/brokers?limit=${limit}&region=${region}` : `/analytics/trending/brokers?limit=${limit}`;
      const data = await this.fetch<any[]>(url);
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch trending brokers'
      };
    }
  }

  async getTrendingPropFirms(limit = 5, region?: string) {
    try {
      const url = region ? `/analytics/trending/prop-firms?limit=${limit}&region=${region}` : `/analytics/trending/prop-firms?limit=${limit}`;
      const data = await this.fetch<any[]>(url);
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch trending prop firms'
      };
    }
  }

  async getPopularComparisons() {
    try {
      const data = await this.fetch<any[]>('/analytics/popular-comparisons');
      return { success: true, data, error: undefined };
    } catch (error) {
      return {
        success: false,
        data: undefined,
        error: error instanceof Error ? error.message : 'Failed to fetch popular comparisons'
      };
    }
  }

  // ====== UTILITY METHODS ======
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get top rated
  async getTopRatedBrokers(limit = 5, region?: string) {
    const response = await this.getBrokers(region);
    const brokers = response.data || [];
    return brokers
      .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  async getTopRatedPropFirms(limit = 5, region?: string) {
    const response = await this.getPropFirms(region);
    const propFirms = response.data || [];
    return propFirms
      .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
      .slice(0, limit);
  }

  // Get recently added
  async getRecentBrokers(limit = 5, region?: string) {
    const response = await this.getBrokers(region);
    const brokers = response.data || [];
    return brokers
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, limit);
  }

  async getRecentPropFirms(limit = 5, region?: string) {
    const response = await this.getPropFirms(region);
    const propFirms = response.data || [];
    return propFirms
      .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, limit);
  }

  // Get by trust score
  async getHighTrustBrokers(limit = 5, minTrustScore = 80, region?: string) {
    const response = await this.getBrokers(region);
    const brokers = response.data || [];
    return brokers
      .filter((b: any) => (b.avgTrustScore || 0) >= minTrustScore)
      .sort((a: any, b: any) => (b.avgTrustScore || 0) - (a.avgTrustScore || 0))
      .slice(0, limit);
  }

  async getHighTrustPropFirms(limit = 5, minTrustScore = 80, region?: string) {
    const response = await this.getPropFirms(region);
    const propFirms = response.data || [];
    return propFirms
      .filter((f: any) => (f.avgTrustScore || 0) >= minTrustScore)
      .sort((a: any, b: any) => (b.avgTrustScore || 0) - (a.avgTrustScore || 0))
      .slice(0, limit);
  }

  // Data validation helpers
  isValidBroker(broker: any): boolean {
    return !!(broker && broker.id && broker.name);
  }

  isValidPropFirm(firm: any): boolean {
    return !!(firm && firm.id && firm.name);
  }

  // Cache buster for development
  getCacheBuster(): string {
    return process.env.NODE_ENV === 'development' ? `?_=${Date.now()}` : '';
  }

  // Debug method to test API connectivity
  async testConnection() {
    console.log('🧪 Testing API connection...');
    const endpoints = [
      '/api/health',
      '/api/prop-firms',
      '/api/brokers'
    ];
    
    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const response = await fetch(endpoint);
          return {
            endpoint,
            status: response.status,
            ok: response.ok
          };
        } catch (error) {
          return {
            endpoint,
            status: 0,
            ok: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );
    
    console.log('📊 API Connection Test Results:');
    results.forEach(result => {
      console.log(`   ${result.endpoint}: ${result.ok ? '✅' : '❌'} ${result.status}`);
    });
    
    return results;
  }
}

// Create a singleton instance
export const api = new ApiService();

// Helper function to format API errors
export function formatApiError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Helper to check if API is available
export async function checkApiAvailability(): Promise<boolean> {
  try {
    const response = await fetch('/api/health');
    return response.ok;
  } catch {
    return false;
  }
}

// Helper to retry failed requests
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError!;
}

// Type definitions for better TypeScript support
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface Broker {
  id: number;
  name: string;
  slug: string;
  description: string;
  rating: number;
  minDeposit: number;
  spreads: {
    eurusd: string;
    [key: string]: string;
  };
  leverage: string;
  platforms: string[];
  regulation: string[];
  established: number;
  headquarters: string;
  tradingInstruments: string[];
  accountTypes: string[];
  depositMethods: string[];
  withdrawalMethods: string[];
  customerSupport: string[];
  website: string;
  signupLink: string;
  promotions?: Array<{
    name: string;
    description: string;
    code: string;
    validUntil: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface PropFirm {
  id: number;
  name: string;
  slug: string;
  description: string;
  rating: number;
  totalReviews: number;
  country: string;
  yearsInOperation: number;
  signupLink: string;
  tradingConditions: number;
  customerCare: number;
  payoutProcess: number;
  ruleFlexibility: number;
  educationResources: number;
  regulation: {
    authorities: string[];
    fundSecurity: boolean;
    segregatedAccounts: boolean;
  } | boolean;
  platforms: string[];
  mobileTrading: boolean;
  chartingTools: string[];
  tradingFeatures: string[];
  copyTrading: boolean;
  scalingPlan: boolean;
  payoutFrequency: string;
  payoutMethods: string[];
  minPayout: string;
  payoutProcessing: string;
  support: {
    channels: string[];
    responseTime: string;
    availability: string;
    languages: string[];
  };
  promotions: Array<{
    name: string;
    description: string;
    code: string;
    validUntil: string;
  }>;
  communityFeatures: string[];
  programs: Array<{
    id: string;
    name: string;
    type: string;
    description: string;
    timeLimit: {
      phase1?: number;
      phase2?: number;
      total: number;
      unit: string;
    };
    rules: {
      dailyDrawdown: number;
      maxDrawdown: number;
      profitTarget: {
        phase1?: number;
        phase2?: number;
        total: number;
      };
      minTradingDays: number;
      weekendHolding: boolean;
      eaTrading: boolean;
      newsTrading: boolean;
      consistencyRule?: string;
    };
    accountOptions: Array<{
      accountSize: number;
      price: number;
      leverage: string;
      payoutPercentage: number;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: number;
  title: string;
  description: string;
  type: 'broker' | 'prop-firm';
  entityId: number;
  entityName: string;
  discount?: string;
  code?: string;
  validUntil: string;
  terms: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  entityType: 'broker' | 'prop-firm';
  entityId: number;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  pros?: string[];
  cons?: string[];
  experience: string;
  profit?: string;
  createdAt: string;
  updatedAt: string;
}