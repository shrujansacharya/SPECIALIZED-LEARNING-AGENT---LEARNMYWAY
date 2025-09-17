// Products and Store Service for Project Builder
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  inStock: boolean;
  stockQuantity: number;
  brand?: string;
  specifications?: { [key: string]: string };
  tags: string[];
  relatedProjects: string[];
  averageRating: number;
  reviewCount: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  shippingAddress?: Address;
  paymentMethod?: PaymentMethod;
  trackingNumber?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';
  last4?: string;
  brand?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  helpful: number;
}

export class ProductsService {
  private products: Product[] = [];
  private cart: CartItem[] = [];
  private orders: Order[] = [];

  constructor() {
    this.initializeProducts();
    this.loadCartFromStorage();
  }

  private initializeProducts(): void {
    this.products = [
      // Electronics for Software Projects
      {
        id: 'prod-001',
        name: 'Arduino Uno R3 Microcontroller',
        price: 25.99,
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'The Arduino Uno R3 is a microcontroller board based on the ATmega328P. Perfect for beginners and advanced projects.',
        category: 'Electronics',
        inStock: true,
        stockQuantity: 50,
        brand: 'Arduino',
        specifications: {
          'Microcontroller': 'ATmega328P',
          'Operating Voltage': '5V',
          'Input Voltage': '7-12V',
          'Digital I/O Pins': '14',
          'Analog Input Pins': '6',
          'Flash Memory': '32KB'
        },
        tags: ['microcontroller', 'arduino', 'programming', 'IoT'],
        relatedProjects: ['software-4', 'software-8'],
        averageRating: 4.8,
        reviewCount: 1247,
        weight: 0.025,
        dimensions: { length: 68.6, width: 53.4, height: 15 }
      },
      {
        id: 'prod-002',
        name: 'Breadboard Prototyping Kit',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Complete breadboard kit with 830 tie points, jumper wires, and power supply module.',
        category: 'Electronics',
        inStock: true,
        stockQuantity: 75,
        brand: 'ElectroCraft',
        specifications: {
          'Tie Points': '830',
          'Size': 'Full Size',
          'Jumper Wires': '65 pieces',
          'Power Supply': '3.3V/5V'
        },
        tags: ['breadboard', 'prototyping', 'circuits', 'electronics'],
        relatedProjects: ['science-6', 'software-4'],
        averageRating: 4.6,
        reviewCount: 892,
        weight: 0.15,
        dimensions: { length: 165, width: 55, height: 10 }
      },
      {
        id: 'prod-003',
        name: 'LED Assortment Pack (200 pieces)',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Variety pack of LEDs in different colors and sizes. Perfect for circuit projects and indicators.',
        category: 'Electronics',
        inStock: true,
        stockQuantity: 120,
        brand: 'LightTech',
        specifications: {
          'Quantity': '200 pieces',
          'Colors': '10 different colors',
          'Sizes': '3mm and 5mm',
          'Forward Voltage': '1.8V - 3.3V'
        },
        tags: ['LED', 'lights', 'circuits', 'indicators'],
        relatedProjects: ['science-6', 'software-9'],
        averageRating: 4.4,
        reviewCount: 567,
        weight: 0.05,
        dimensions: { length: 100, width: 80, height: 20 }
      },
      {
        id: 'prod-004',
        name: 'Resistor Kit (1000 pieces)',
        price: 6.99,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Complete resistor kit with common values from 1Ω to 1MΩ. Essential for any electronics project.',
        category: 'Electronics',
        inStock: true,
        stockQuantity: 200,
        brand: 'ResistorPro',
        specifications: {
          'Quantity': '1000 pieces',
          'Values': '50 different values',
          'Tolerance': '±5%',
          'Power Rating': '1/4W'
        },
        tags: ['resistor', 'electronics', 'circuits', 'components'],
        relatedProjects: ['science-6'],
        averageRating: 4.7,
        reviewCount: 734,
        weight: 0.1,
        dimensions: { length: 120, width: 80, height: 25 }
      },
      {
        id: 'prod-005',
        name: 'Raspberry Pi 4 Model B (4GB)',
        price: 75.99,
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Latest Raspberry Pi with 4GB RAM. Perfect for advanced software projects and IoT applications.',
        category: 'Electronics',
        inStock: true,
        stockQuantity: 30,
        brand: 'Raspberry Pi Foundation',
        specifications: {
          'Processor': 'Quad-core ARM Cortex-A72',
          'RAM': '4GB LPDDR4',
          'Storage': 'MicroSD',
          'Connectivity': 'WiFi, Bluetooth, Ethernet',
          'USB Ports': '2x USB 3.0, 2x USB 2.0'
        },
        tags: ['raspberry-pi', 'computer', 'IoT', 'programming'],
        relatedProjects: ['software-2', 'software-4', 'software-7'],
        averageRating: 4.9,
        reviewCount: 2156,
        weight: 0.046,
        dimensions: { length: 85, width: 56, height: 17 }
      },

      // Craft Supplies for Science Projects
      {
        id: 'prod-006',
        name: 'Science Model Building Kit',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Complete kit for building science models including foam boards, connectors, and tools.',
        category: 'Crafts',
        inStock: true,
        stockQuantity: 85,
        brand: 'ScienceCraft',
        specifications: {
          'Foam Boards': '10 pieces',
          'Connectors': '50 pieces',
          'Tools': 'Cutting knife, ruler, compass',
          'Glue': 'Included'
        },
        tags: ['science', 'models', 'crafts', 'education'],
        relatedProjects: ['science-1', 'science-2', 'science-3'],
        averageRating: 4.5,
        reviewCount: 423,
        weight: 0.5,
        dimensions: { length: 300, width: 200, height: 50 }
      },
      {
        id: 'prod-007',
        name: 'Modeling Clay Set (12 colors)',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Professional modeling clay in 12 vibrant colors. Non-toxic and perfect for detailed models.',
        category: 'Crafts',
        inStock: true,
        stockQuantity: 95,
        brand: 'ClayMaster',
        specifications: {
          'Colors': '12 different colors',
          'Weight': '2kg total',
          'Type': 'Air-dry clay',
          'Non-toxic': 'Yes'
        },
        tags: ['clay', 'modeling', 'sculpture', 'art'],
        relatedProjects: ['science-2', 'science-4', 'science-5'],
        averageRating: 4.3,
        reviewCount: 678,
        weight: 2.0,
        dimensions: { length: 250, width: 180, height: 60 }
      },
      {
        id: 'prod-008',
        name: 'Acrylic Paint Set (24 colors)',
        price: 16.99,
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'High-quality acrylic paints with excellent coverage and vibrant colors.',
        category: 'Crafts',
        inStock: true,
        stockQuantity: 110,
        brand: 'ArtPro',
        specifications: {
          'Colors': '24 tubes',
          'Volume': '12ml per tube',
          'Type': 'Acrylic',
          'Finish': 'Matte'
        },
        tags: ['paint', 'acrylic', 'art', 'colors'],
        relatedProjects: ['science-1', 'science-2', 'science-4'],
        averageRating: 4.6,
        reviewCount: 891,
        weight: 0.4,
        dimensions: { length: 200, width: 150, height: 40 }
      },
      {
        id: 'prod-009',
        name: 'Styrofoam Balls Assortment',
        price: 9.99,
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Various sizes of styrofoam balls perfect for planetary models and molecular structures.',
        category: 'Crafts',
        inStock: true,
        stockQuantity: 150,
        brand: 'CraftFoam',
        specifications: {
          'Sizes': '1", 2", 3", 4", 6"',
          'Quantity': '25 pieces total',
          'Material': 'Expanded polystyrene',
          'Density': 'Medium'
        },
        tags: ['styrofoam', 'balls', 'models', 'planets'],
        relatedProjects: ['science-1', 'science-5'],
        averageRating: 4.2,
        reviewCount: 345,
        weight: 0.2,
        dimensions: { length: 200, width: 200, height: 200 }
      },
      {
        id: 'prod-010',
        name: 'Wooden Dowels and Rods Set',
        price: 11.99,
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Assorted wooden dowels and rods for structural support in science models.',
        category: 'Crafts',
        inStock: true,
        stockQuantity: 80,
        brand: 'WoodCraft',
        specifications: {
          'Lengths': '6", 12", 18"',
          'Diameters': '1/8", 1/4", 3/8"',
          'Quantity': '50 pieces',
          'Material': 'Birch wood'
        },
        tags: ['wood', 'dowels', 'structure', 'support'],
        relatedProjects: ['science-1', 'science-3', 'science-7'],
        averageRating: 4.4,
        reviewCount: 267,
        weight: 0.3,
        dimensions: { length: 460, width: 50, height: 50 }
      },

      // Tools and Accessories
      {
        id: 'prod-011',
        name: 'Digital Multimeter',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Professional digital multimeter for measuring voltage, current, and resistance.',
        category: 'Tools',
        inStock: true,
        stockQuantity: 45,
        brand: 'MeterPro',
        specifications: {
          'DC Voltage': '200mV - 1000V',
          'AC Voltage': '200V - 750V',
          'DC Current': '200µA - 10A',
          'Resistance': '200Ω - 20MΩ',
          'Display': '3.5 digit LCD'
        },
        tags: ['multimeter', 'measurement', 'electronics', 'testing'],
        relatedProjects: ['science-6'],
        averageRating: 4.7,
        reviewCount: 523,
        weight: 0.3,
        dimensions: { length: 140, width: 70, height: 35 }
      },
      {
        id: 'prod-012',
        name: 'Precision Craft Knife Set',
        price: 13.99,
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        description: 'Set of precision craft knives with replaceable blades for detailed cutting work.',
        category: 'Tools',
        inStock: true,
        stockQuantity: 65,
        brand: 'CraftPrecision',
        specifications: {
          'Knives': '3 different sizes',
          'Blades': '30 replacement blades',
          'Handle': 'Non-slip grip',
          'Storage': 'Protective case included'
        },
        tags: ['knife', 'cutting', 'precision', 'crafts'],
        relatedProjects: ['science-1', 'science-2', 'science-3'],
        averageRating: 4.5,
        reviewCount: 412,
        weight: 0.15,
        dimensions: { length: 180, width: 120, height: 25 }
      }
    ];
  }

  // Product Management
  getAllProducts(): Product[] {
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(product => product.id === id);
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(product => product.category === category);
  }

  getProductsByProject(projectId: string): Product[] {
    return this.products.filter(product => 
      product.relatedProjects.includes(projectId)
    );
  }

  searchProducts(query: string): Product[] {
    const lowerQuery = query.toLowerCase();
    return this.products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      product.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Cart Management
  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('projectbuilder_cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
  }

  private saveCartToStorage(): void {
    localStorage.setItem('projectbuilder_cart', JSON.stringify(this.cart));
  }

  addToCart(productId: string, quantity: number = 1): boolean {
    const product = this.getProductById(productId);
    if (!product || !product.inStock || product.stockQuantity < quantity) {
      return false;
    }

    const existingItem = this.cart.find(item => item.productId === productId);
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity <= product.stockQuantity) {
        existingItem.quantity = newQuantity;
      } else {
        return false;
      }
    } else {
      this.cart.push({
        productId,
        quantity,
        addedAt: new Date()
      });
    }

    this.saveCartToStorage();
    return true;
  }

  removeFromCart(productId: string): void {
    this.cart = this.cart.filter(item => item.productId !== productId);
    this.saveCartToStorage();
  }

  updateCartQuantity(productId: string, quantity: number): boolean {
    const product = this.getProductById(productId);
    if (!product || quantity > product.stockQuantity || quantity < 1) {
      return false;
    }

    const item = this.cart.find(item => item.productId === productId);
    if (item) {
      item.quantity = quantity;
      this.saveCartToStorage();
      return true;
    }
    return false;
  }

  getCart(): CartItem[] {
    return this.cart;
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => {
      const product = this.getProductById(item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  }

  getCartItemCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  clearCart(): void {
    this.cart = [];
    this.saveCartToStorage();
  }

  // Order Management
  createOrder(shippingAddress: Address, paymentMethod: PaymentMethod): Order {
    const order: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      items: [...this.cart],
      total: this.getCartTotal(),
      status: 'pending',
      createdAt: new Date(),
      shippingAddress,
      paymentMethod
    };

    this.orders.push(order);
    this.clearCart();
    
    // Simulate order processing
    setTimeout(() => {
      this.updateOrderStatus(order.id, 'confirmed');
    }, 2000);

    return order;
  }

  updateOrderStatus(orderId: string, status: Order['status']): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      if (status === 'shipped') {
        order.trackingNumber = `TRK${Date.now()}`;
      }
    }
  }

  getOrders(): Order[] {
    return this.orders;
  }

  getOrderById(orderId: string): Order | undefined {
    return this.orders.find(order => order.id === orderId);
  }

  // Product Recommendations
  getRecommendedProducts(projectId: string, limit: number = 4): Product[] {
    const projectProducts = this.getProductsByProject(projectId);
    const otherProducts = this.products.filter(p => !p.relatedProjects.includes(projectId));
    
    // Sort by rating and return top products
    return [...projectProducts, ...otherProducts]
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit);
  }

  // Price and Stock Management
  updateProductPrice(productId: string, newPrice: number): boolean {
    const product = this.getProductById(productId);
    if (product) {
      product.price = newPrice;
      return true;
    }
    return false;
  }

  updateProductStock(productId: string, newStock: number): boolean {
    const product = this.getProductById(productId);
    if (product) {
      product.stockQuantity = newStock;
      product.inStock = newStock > 0;
      return true;
    }
    return false;
  }

  // Shipping Calculation
  calculateShipping(items: CartItem[], address: Address): number {
    const totalWeight = items.reduce((weight, item) => {
      const product = this.getProductById(item.productId);
      return weight + (product ? (product.weight || 0) * item.quantity : 0);
    }, 0);

    // Simple shipping calculation based on weight
    if (totalWeight === 0) return 0;
    if (totalWeight <= 0.5) return 5.99;
    if (totalWeight <= 2) return 9.99;
    if (totalWeight <= 5) return 14.99;
    return 19.99;
  }

  // Tax Calculation
  calculateTax(subtotal: number, address: Address): number {
    // Simple tax calculation - in real app, use tax service
    const taxRates: { [key: string]: number } = {
      'CA': 0.0875, // California
      'NY': 0.08,   // New York
      'TX': 0.0625, // Texas
      'FL': 0.06,   // Florida
      'WA': 0.065   // Washington
    };

    const rate = taxRates[address.state] || 0.05; // Default 5%
    return subtotal * rate;
  }

  // Inventory Management
  reserveInventory(items: CartItem[]): boolean {
    // Check if all items are available
    for (const item of items) {
      const product = this.getProductById(item.productId);
      if (!product || !product.inStock || product.stockQuantity < item.quantity) {
        return false;
      }
    }

    // Reserve inventory
    for (const item of items) {
      const product = this.getProductById(item.productId);
      if (product) {
        product.stockQuantity -= item.quantity;
        if (product.stockQuantity === 0) {
          product.inStock = false;
        }
      }
    }

    return true;
  }

  // Product Reviews
  addProductReview(productId: string, userId: string, rating: number, comment: string): ProductReview {
    const review: ProductReview = {
      id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      productId,
      userId,
      rating,
      comment,
      createdAt: new Date(),
      helpful: 0
    };

    // Update product rating (simplified calculation)
    const product = this.getProductById(productId);
    if (product) {
      const newTotal = (product.averageRating * product.reviewCount) + rating;
      product.reviewCount += 1;
      product.averageRating = newTotal / product.reviewCount;
    }

    return review;
  }
}

// Export singleton instance
let productsService: ProductsService | null = null;

export const getProductsService = (): ProductsService => {
  if (!productsService) {
    productsService = new ProductsService();
  }
  return productsService;
};

export default ProductsService;

