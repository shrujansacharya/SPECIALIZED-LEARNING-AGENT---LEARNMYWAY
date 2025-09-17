// Maps and Nearby Stores Service for Project Builder
export interface Store {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  lat: number;
  lng: number;
  phone?: string;
  website?: string;
  openNow?: boolean;
  priceLevel?: number;
  types: string[];
  photos?: string[];
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export class MapsService {
  private googleMapsApiKey: string;
  private placesApiKey: string;

  constructor(apiKey: string) {
    this.googleMapsApiKey = apiKey;
    this.placesApiKey = apiKey;
  }

  // Get user's current location
  async getCurrentLocation(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          // Fallback to a default location (San Francisco)
          console.warn('Geolocation error:', error);
          resolve({ lat: 37.7749, lng: -122.4194 });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Search for nearby stores using Google Places API
  async findNearbyStores(
    location: UserLocation, 
    radius: number = 5000, // 5km default
    storeTypes: string[] = ['electronics_store', 'hardware_store', 'home_goods_store']
  ): Promise<Store[]> {
    try {
      const stores: Store[] = [];
      
      // Search for each store type
      for (const type of storeTypes) {
        const url = `/api/google-places/nearbysearch?` +
          `location=${location.lat},${location.lng}&` +
          `radius=${radius}&` +
          `type=${type}`;

        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`Places API error for ${type}:`, response.statusText);
          continue;
        }

        const data = await response.json();
        
        if (data.results) {
          const typeStores = data.results.map((place: any) => ({
            id: place.place_id,
            name: place.name,
            address: place.vicinity || place.formatted_address || 'Address not available',
            distance: this.calculateDistance(
              location.lat, 
              location.lng, 
              place.geometry.location.lat, 
              place.geometry.location.lng
            ),
            rating: place.rating || 0,
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
            openNow: place.opening_hours?.open_now,
            priceLevel: place.price_level,
            types: place.types || [],
            photos: place.photos?.map((photo: any) => 
              `/api/google-places/photo?maxwidth=400&photoreference=${photo.photo_reference}`
            ) || []
          }));
          
          stores.push(...typeStores);
        }
      }

      // Remove duplicates and sort by distance
      const uniqueStores = stores.filter((store, index, self) => 
        index === self.findIndex(s => s.id === store.id)
      );

      return uniqueStores
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10); // Return top 10 closest stores

    } catch (error) {
      console.error('Error fetching nearby stores:', error);
      
      // Return mock data as fallback
      return this.getMockStores(location);
    }
  }

  // Get detailed information about a specific store
  async getStoreDetails(storeId: string): Promise<Store | null> {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?` +
        `place_id=${storeId}&` +
        `fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,price_level,geometry,photos&` +
        `key=${this.placesApiKey}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Places API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.result) {
        const place = data.result;
        return {
          id: storeId,
          name: place.name,
          address: place.formatted_address,
          distance: 0, // Would need user location to calculate
          rating: place.rating || 0,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          phone: place.formatted_phone_number,
          website: place.website,
          openNow: place.opening_hours?.open_now,
          priceLevel: place.price_level,
          types: [],
          photos: place.photos?.map((photo: any) => 
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.placesApiKey}`
          ) || []
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching store details:', error);
      return null;
    }
  }

  // Generate Google Maps URL for directions
  getDirectionsUrl(destination: Store, origin?: UserLocation): string {
    const destCoords = `${destination.lat},${destination.lng}`;
    const originCoords = origin ? `${origin.lat},${origin.lng}` : '';
    
    if (originCoords) {
      return `https://www.google.com/maps/dir/${originCoords}/${destCoords}`;
    } else {
      return `https://www.google.com/maps/search/?api=1&query=${destCoords}`;
    }
  }

  // Generate embeddable map URL
  getEmbedMapUrl(stores: Store[], center?: UserLocation): string {
    const centerCoords = center ? `${center.lat},${center.lng}` : 
      stores.length > 0 ? `${stores[0].lat},${stores[0].lng}` : '37.7749,-122.4194';
    
    let url = `https://www.google.com/maps/embed/v1/search?key=${this.googleMapsApiKey}&q=electronics+stores&center=${centerCoords}&zoom=12`;
    
    return url;
  }

  // Get fallback stores when API is not available
  getFallbackStores(location: UserLocation): Store[] {
    return this.getMockStores(location);
  }

  // Mock data for fallback when API is not available
  private getMockStores(location: UserLocation): Store[] {
    const mockStores: Store[] = [
      {
        id: 'mock-store-1',
        name: 'TechHub Electronics',
        address: '123 Innovation Drive, Tech District',
        distance: this.calculateDistance(location.lat, location.lng, location.lat + 0.01, location.lng + 0.01),
        rating: 4.5,
        lat: location.lat + 0.01,
        lng: location.lng + 0.01,
        phone: '(555) 123-4567',
        openNow: true,
        priceLevel: 2,
        types: ['electronics_store'],
        photos: ['https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']
      },
      {
        id: 'mock-store-2',
        name: 'Maker Space Supply Co.',
        address: '456 Creator Avenue, Maker Quarter',
        distance: this.calculateDistance(location.lat, location.lng, location.lat + 0.02, location.lng - 0.01),
        rating: 4.8,
        lat: location.lat + 0.02,
        lng: location.lng - 0.01,
        phone: '(555) 234-5678',
        openNow: true,
        priceLevel: 2,
        types: ['electronics_store', 'hardware_store'],
        photos: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']
      },
      {
        id: 'mock-store-3',
        name: 'Science & Craft Hub',
        address: '789 Learning Boulevard, Education District',
        distance: this.calculateDistance(location.lat, location.lng, location.lat - 0.01, location.lng + 0.02),
        rating: 4.3,
        lat: location.lat - 0.01,
        lng: location.lng + 0.02,
        phone: '(555) 345-6789',
        openNow: false,
        priceLevel: 1,
        types: ['home_goods_store'],
        photos: ['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']
      },
      {
        id: 'mock-store-4',
        name: 'Circuit City Express',
        address: '321 Component Street, Electronics Row',
        distance: this.calculateDistance(location.lat, location.lng, location.lat + 0.005, location.lng - 0.015),
        rating: 4.1,
        lat: location.lat + 0.005,
        lng: location.lng - 0.015,
        phone: '(555) 456-7890',
        openNow: true,
        priceLevel: 3,
        types: ['electronics_store'],
        photos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']
      },
      {
        id: 'mock-store-5',
        name: 'DIY Workshop Supplies',
        address: '654 Craft Lane, Artisan District',
        distance: this.calculateDistance(location.lat, location.lng, location.lat - 0.015, location.lng - 0.005),
        rating: 4.6,
        lat: location.lat - 0.015,
        lng: location.lng - 0.005,
        phone: '(555) 567-8901',
        openNow: true,
        priceLevel: 2,
        types: ['hardware_store', 'home_goods_store'],
        photos: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']
      }
    ];

    return mockStores.sort((a, b) => a.distance - b.distance);
  }

  // Search stores by name or type
  async searchStores(query: string, location: UserLocation, radius: number = 5000): Promise<Store[]> {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?` +
        `query=${encodeURIComponent(query)}&` +
        `location=${location.lat},${location.lng}&` +
        `radius=${radius}&` +
        `key=${this.placesApiKey}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Places API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.results) {
        return data.results.map((place: any) => ({
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          distance: this.calculateDistance(
            location.lat,
            location.lng,
            place.geometry.location.lat,
            place.geometry.location.lng
          ),
          rating: place.rating || 0,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
          openNow: place.opening_hours?.open_now,
          priceLevel: place.price_level,
          types: place.types || [],
          photos: place.photos?.map((photo: any) =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.placesApiKey}`
          ) || []
        })).sort((a: Store, b: Store) => a.distance - b.distance);
      }

      return [];
    } catch (error) {
      console.error('Error searching stores:', error);
      return this.getMockStores(location).filter(store =>
        store.name.toLowerCase().includes(query.toLowerCase()) ||
        store.types.some(type => type.includes(query.toLowerCase()))
      );
    }
  }

}

// Export a singleton instance
let mapsService: MapsService | null = null;

export const getMapsService = (apiKey: string): MapsService => {
  if (!mapsService) {
    mapsService = new MapsService(apiKey);
  }
  return mapsService;
};

export default MapsService;

