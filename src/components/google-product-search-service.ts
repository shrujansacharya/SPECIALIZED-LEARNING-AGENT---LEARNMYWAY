// Google Product Search Service for Project Builder
export interface ProductSearchResult {
  id: string;
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl: string;
  htmlTitle: string;
  htmlSnippet: string;
  cacheId?: string;
  pagemap?: {
    cse_image?: Array<{ src: string }>;
    cse_thumbnail?: Array<{ src: string; width: string; height: string }>;
    metatags?: Array<{ [key: string]: string }>;
    product?: Array<{
      name?: string;
      brand?: string;
      price?: string;
      availability?: string;
      image?: string;
    }>;
  };
  location?: {
    city?: string;
    state?: string;
    country?: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
}

export interface ProductSearchResponse {
  items: ProductSearchResult[];
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  queries: {
    request: Array<{
      title: string;
      totalResults: string;
      searchTerms: string;
      count: number;
      startIndex: number;
      inputEncoding: string;
      outputEncoding: string;
      safe: string;
      cx: string;
    }>;
  };
}

export class GoogleProductSearchService {
  private apiKey: string;
  private searchEngineId: string;
  private baseUrl = 'https://www.googleapis.com/customsearch/v1';

  constructor(apiKey: string, searchEngineId: string) {
    this.apiKey = apiKey;
    this.searchEngineId = searchEngineId;
  }

  // Search for products using Google Custom Search API
  async searchProducts(
    query: string,
    location?: string,
    num: number = 10,
    start: number = 1
  ): Promise<ProductSearchResult[]> {
    try {
      // Build search query with location if provided
      let searchQuery = query;
      if (location) {
        searchQuery += ` near ${location}`;
      }

      // Add product-specific search terms to improve results
      searchQuery += ' product buy purchase store';

      const params = new URLSearchParams({
        key: this.apiKey,
        cx: this.searchEngineId,
        q: searchQuery,
        num: num.toString(),
        start: start.toString(),
        safe: 'active',
        fields: 'items(id,title,link,snippet,displayLink,formattedUrl,htmlTitle,htmlSnippet,cacheId,pagemap),searchInformation,queries'
      });

      const url = `${this.baseUrl}?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Custom Search API error: ${response.status} ${response.statusText}`);
      }

      const data: ProductSearchResponse = await response.json();

      if (!data.items) {
        console.warn('No search results found');
        return [];
      }

      // Process and enhance search results with location information
      const processedResults = await this.processSearchResults(data.items);

      return processedResults;
    } catch (error) {
      console.error('Error searching products:', error);
      throw new Error(`Failed to search products: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Process search results to extract location information
  private async processSearchResults(results: ProductSearchResult[]): Promise<ProductSearchResult[]> {
    const processedResults = await Promise.all(
      results.map(async (result) => {
        // Extract location information from the result
        const location = await this.extractLocationFromResult(result);

        return {
          ...result,
          location
        };
      })
    );

    return processedResults;
  }

  // Extract location information from search result
  private async extractLocationFromResult(result: ProductSearchResult): Promise<ProductSearchResult['location']> {
    try {
      // Try to extract location from various sources
      const location: ProductSearchResult['location'] = {};

      // Extract from snippet and title
      const text = `${result.title} ${result.snippet}`.toLowerCase();

      // Look for common location patterns
      const cityStatePattern = /([A-Za-z\s]+),\s*([A-Z]{2})\s*\d{5}/g;
      const cityPattern = /([A-Za-z\s]+),\s*([A-Z]{2})/g;
      const addressPattern = /(\d+\s+[A-Za-z0-9\s,.-]+),\s*([A-Za-z\s]+),\s*([A-Z]{2})\s*\d{5}/g;

      // Try to match address pattern first
      const addressMatch = addressPattern.exec(text);
      if (addressMatch) {
        location.address = addressMatch[0];
        location.city = addressMatch[2]?.trim();
        location.state = addressMatch[3]?.trim();
      } else {
        // Try city, state pattern
        const cityMatch = cityStatePattern.exec(text) || cityPattern.exec(text);
        if (cityMatch) {
          location.city = cityMatch[1]?.trim();
          location.state = cityMatch[2]?.trim();
        }
      }

      // If we have location info, try to get coordinates
      if (location.city && location.state) {
        const coordinates = await this.getCoordinatesFromLocation(`${location.city}, ${location.state}`);
        if (coordinates) {
          location.lat = coordinates.lat;
          location.lng = coordinates.lng;
        }
      }

      return location;
    } catch (error) {
      console.warn('Error extracting location from result:', error);
      return undefined;
    }
  }

  // Get coordinates from location string using Google Geocoding API
  private async getCoordinatesFromLocation(location: string): Promise<{ lat: number; lng: number } | null> {
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${this.apiKey}`;

      const response = await fetch(geocodeUrl);

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      }

      return null;
    } catch (error) {
      console.warn('Error getting coordinates:', error);
      return null;
    }
  }

  // Search for products with location-based filtering
  async searchProductsByLocation(
    query: string,
    userLocation: { lat: number; lng: number },
    radius: number = 50 // miles
  ): Promise<ProductSearchResult[]> {
    try {
      // First get user's location as address
      const userAddress = await this.getAddressFromCoordinates(userLocation.lat, userLocation.lng);

      if (userAddress) {
        // Search with location context
        return await this.searchProducts(query, userAddress, 10, 1);
      } else {
        // Fallback to regular search
        return await this.searchProducts(query, undefined, 10, 1);
      }
    } catch (error) {
      console.error('Error searching products by location:', error);
      return await this.searchProducts(query, undefined, 10, 1);
    }
  }

  // Search for products specifically from Amazon and Flipkart
  async searchProductsFromAmazonFlipkart(
    query: string,
    num: number = 10,
    start: number = 1
  ): Promise<ProductSearchResult[]> {
    try {
      // Build search query restricted to Amazon and Flipkart
      let searchQuery = query;

      // Add product-specific search terms
      searchQuery += ' product buy purchase store';

      // Restrict to Amazon and Flipkart sites
      searchQuery += ' site:amazon.in OR site:flipkart.com';

      const params = new URLSearchParams({
        key: this.apiKey,
        cx: this.searchEngineId,
        q: searchQuery,
        num: num.toString(),
        start: start.toString(),
        safe: 'active',
        fields: 'items(id,title,link,snippet,displayLink,formattedUrl,htmlTitle,htmlSnippet,cacheId,pagemap),searchInformation,queries'
      });

      const url = `${this.baseUrl}?${params.toString()}`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Custom Search API error: ${response.status} ${response.statusText}`);
      }

      const data: ProductSearchResponse = await response.json();

      if (!data.items) {
        console.warn('No search results found');
        return [];
      }

      // Process and enhance search results
      const processedResults = await this.processSearchResults(data.items);

      return processedResults;
    } catch (error) {
      console.error('Error searching products from Amazon/Flipkart:', error);
      throw new Error(`Failed to search products from Amazon/Flipkart: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get address from coordinates using reverse geocoding
  private async getAddressFromCoordinates(lat: number, lng: number): Promise<string | null> {
    try {
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`;

      const response = await fetch(geocodeUrl);

      if (!response.ok) {
        throw new Error(`Reverse geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Get the most specific address component
        const address = data.results[0].formatted_address;
        return address;
      }

      return null;
    } catch (error) {
      console.warn('Error getting address from coordinates:', error);
      return null;
    }
  }

  // Get product details from a specific URL
  async getProductDetails(url: string): Promise<any> {
    try {
      // Note: This is a simplified implementation
      // In a real application, you might want to use a web scraping service
      // or implement server-side scraping for better results

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch product details: ${response.status}`);
      }

      const html = await response.text();

      // Extract basic information from HTML (simplified)
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : 'Unknown Product';

      return {
        title,
        url,
        html
      };
    } catch (error) {
      console.error('Error getting product details:', error);
      return null;
    }
  }
}

// Export singleton instance
let googleProductSearchService: GoogleProductSearchService | null = null;

export const getGoogleProductSearchService = (apiKey: string, searchEngineId: string): GoogleProductSearchService => {
  if (!googleProductSearchService) {
    googleProductSearchService = new GoogleProductSearchService(apiKey, searchEngineId);
  }
  return googleProductSearchService;
};

export default GoogleProductSearchService;
