import { 
  users, type User, type InsertUser,
  products, type Product, type InsertProduct,
  carts, type Cart, type InsertCart,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  appointments, type Appointment, type InsertAppointment,
  wishlists, type Wishlist, type InsertWishlist
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Create memory store for session
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsBySubCategory(subCategory: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cart methods
  getCart(userId: number): Promise<(Cart & { product: Product })[]>;
  addToCart(cart: InsertCart): Promise<Cart>;
  updateCartItem(id: number, quantity: number): Promise<Cart | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Item methods
  getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Appointment methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByUser(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  
  // Wishlist methods
  getWishlist(userId: number): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private carts: Map<number, Cart>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private appointments: Map<number, Appointment>;
  private wishlists: Map<number, Wishlist>;
  
  sessionStore: session.SessionStore;
  
  private userCurrentId: number;
  private productCurrentId: number;
  private cartCurrentId: number;
  private orderCurrentId: number;
  private orderItemCurrentId: number;
  private appointmentCurrentId: number;
  private wishlistCurrentId: number;
  
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.carts = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.appointments = new Map();
    this.wishlists = new Map();
    
    this.userCurrentId = 1;
    this.productCurrentId = 1;
    this.cartCurrentId = 1;
    this.orderCurrentId = 1;
    this.orderItemCurrentId = 1;
    this.appointmentCurrentId = 1;
    this.wishlistCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with some products
    this.initializeProducts();
  }
  
  // Initialize some products for demonstration
  private async initializeProducts() {
    const productsList: InsertProduct[] = [
      {
        name: "Premium Organic Dog Treats",
        description: "All-natural ingredients, perfect for training.",
        price: 14.99,
        imageUrl: "https://images.unsplash.com/photo-1601758124277-f0086d5ab050",
        category: "dog",
        subCategory: "food",
        isFeatured: true,
        isOnSale: false,
        stock: 50,
        rating: 4.5,
        reviewCount: 42
      },
      {
        name: "Plush Cat Bed",
        description: "Ultra-soft cushioning for ultimate comfort.",
        price: 29.99,
        imageUrl: "https://images.unsplash.com/photo-1615678815958-5910c6811c25",
        category: "cat",
        subCategory: "accessory",
        isFeatured: true,
        isOnSale: false,
        stock: 30,
        rating: 4.0,
        reviewCount: 28
      },
      {
        name: "Automatic Fish Feeder",
        description: "Programmable feeding times for fish tanks.",
        price: 19.99,
        imageUrl: "https://images.unsplash.com/photo-1535591273668-578e31182c4f",
        category: "fish",
        subCategory: "accessory",
        isFeatured: true,
        isOnSale: true,
        salePrice: 15.99,
        stock: 25,
        rating: 5.0,
        reviewCount: 56
      },
      {
        name: "Durable Dog Chew Toy",
        description: "Long-lasting rubber toy for aggressive chewers.",
        price: 12.99,
        imageUrl: "https://images.unsplash.com/photo-1560743641-3914f2c45636",
        category: "dog",
        subCategory: "toy",
        isFeatured: true,
        isOnSale: false,
        stock: 45,
        rating: 3.5,
        reviewCount: 34
      },
      {
        name: "Interactive Cat Toy",
        description: "Feather Wand with Bell to keep your cat entertained.",
        price: 12.99,
        imageUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5",
        category: "cat",
        subCategory: "toy",
        isFeatured: true,
        isOnSale: false,
        stock: 40,
        rating: 4.2,
        reviewCount: 21
      },
      {
        name: "Premium Dry Dog Food",
        description: "5kg bag, Chicken Flavor, nutritionally complete.",
        price: 24.99,
        imageUrl: "https://images.unsplash.com/photo-1597843786411-a7fa8ad44a95",
        category: "dog",
        subCategory: "food",
        isFeatured: false,
        isOnSale: false,
        stock: 60,
        rating: 4.7,
        reviewCount: 38
      }
    ];
    
    for (const product of productsList) {
      await this.createProduct(product);
    }
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }
  
  async getProductsBySubCategory(subCategory: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.subCategory === subCategory
    );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.isFeatured
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Cart methods
  async getCart(userId: number): Promise<(Cart & { product: Product })[]> {
    const cartItems = Array.from(this.carts.values()).filter(
      (cart) => cart.userId === userId
    );
    
    return cartItems.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product not found for cart item: ${item.id}`);
      
      return {
        ...item,
        product
      };
    });
  }
  
  async addToCart(cart: InsertCart): Promise<Cart> {
    // Check if product exists
    const product = this.products.get(cart.productId);
    if (!product) throw new Error(`Product not found: ${cart.productId}`);
    
    // Check if item already in cart
    const existingCartItem = Array.from(this.carts.values()).find(
      item => item.userId === cart.userId && item.productId === cart.productId
    );
    
    if (existingCartItem) {
      // Update quantity
      const updatedCartItem = {
        ...existingCartItem,
        quantity: existingCartItem.quantity + cart.quantity
      };
      this.carts.set(existingCartItem.id, updatedCartItem);
      return updatedCartItem;
    } else {
      // Create new cart item
      const id = this.cartCurrentId++;
      const newCart: Cart = { ...cart, id };
      this.carts.set(id, newCart);
      return newCart;
    }
  }
  
  async updateCartItem(id: number, quantity: number): Promise<Cart | undefined> {
    const cartItem = this.carts.get(id);
    if (!cartItem) return undefined;
    
    const updatedCartItem = { ...cartItem, quantity };
    this.carts.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async removeFromCart(id: number): Promise<boolean> {
    return this.carts.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const cartItems = Array.from(this.carts.values()).filter(
      (cart) => cart.userId === userId
    );
    
    for (const item of cartItems) {
      this.carts.delete(item.id);
    }
    
    return true;
  }
  
  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId
    );
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order Item methods
  async getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    const items = Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
    
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product not found for order item: ${item.id}`);
      
      return {
        ...item,
        product
      };
    });
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemCurrentId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
  
  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }
  
  async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.userId === userId
    );
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentCurrentId++;
    const newAppointment: Appointment = { 
      ...appointment, 
      id, 
      createdAt: new Date() 
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }
  
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, status };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
  
  // Wishlist methods
  async getWishlist(userId: number): Promise<(Wishlist & { product: Product })[]> {
    const wishlistItems = Array.from(this.wishlists.values()).filter(
      (wishlist) => wishlist.userId === userId
    );
    
    return wishlistItems.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product not found for wishlist item: ${item.id}`);
      
      return {
        ...item,
        product
      };
    });
  }
  
  async addToWishlist(wishlist: InsertWishlist): Promise<Wishlist> {
    // Check if product exists
    const product = this.products.get(wishlist.productId);
    if (!product) throw new Error(`Product not found: ${wishlist.productId}`);
    
    // Check if item already in wishlist
    const existingWishlistItem = Array.from(this.wishlists.values()).find(
      item => item.userId === wishlist.userId && item.productId === wishlist.productId
    );
    
    if (existingWishlistItem) {
      return existingWishlistItem;
    } else {
      // Create new wishlist item
      const id = this.wishlistCurrentId++;
      const newWishlist: Wishlist = { ...wishlist, id };
      this.wishlists.set(id, newWishlist);
      return newWishlist;
    }
  }
  
  async removeFromWishlist(id: number): Promise<boolean> {
    return this.wishlists.delete(id);
  }
}

export const storage = new MemStorage();
