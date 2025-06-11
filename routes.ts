import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ZodError } from "zod";
import { 
  insertUserSchema, 
  insertCartSchema, 
  insertOrderSchema, 
  insertOrderItemSchema, 
  insertAppointmentSchema, 
  insertWishlistSchema
} from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

const scryptAsync = promisify(scrypt);

// Helper functions for authentication
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "pet-sphere-secret",
      resave: false,
      saveUninitialized: false,
      store: storage.sessionStore,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    })
  );

  // Set up passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if username exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Check if email exists
      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Log in the user
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login after registration failed" });
        }

        // Don't send password to client
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        // Don't send password to client
        const { password, ...userWithoutPassword } = user;
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Don't send password to client
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      const subCategory = req.query.subCategory as string;
      const featured = req.query.featured as string;

      let products;
      if (category) {
        products = await storage.getProductsByCategory(category);
      } else if (subCategory) {
        products = await storage.getProductsBySubCategory(subCategory);
      } else if (featured === 'true') {
        products = await storage.getFeaturedProducts();
      } else {
        products = await storage.getProducts();
      }

      res.json(products);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const cart = await storage.getCart(user.id);
      res.json(cart);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const cartData = insertCartSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const cart = await storage.addToCart(cartData);
      res.status(201).json(cart);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;

      const updatedCart = await storage.updateCartItem(id, quantity);
      if (!updatedCart) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(updatedCart);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeFromCart(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      await storage.clearCart(user.id);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const orders = await storage.getOrdersByUser(user.id);
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user owns the order
      const user = req.user as any;
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const orderItems = await storage.getOrderItems(id);
      res.json({ ...order, items: orderItems });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId: user.id,
      });

      // Create order
      const order = await storage.createOrder(orderData);

      // Get cart items
      const cartItems = await storage.getCart(user.id);

      // Create order items from cart
      for (const cartItem of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: cartItem.product.isOnSale && cartItem.product.salePrice 
            ? cartItem.product.salePrice 
            : cartItem.product.price,
        });
      }

      // Clear cart
      await storage.clearCart(user.id);

      res.status(201).json(order);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/orders/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user owns the order
      const user = req.user as any;
      if (updatedOrder.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(updatedOrder);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const appointments = await storage.getAppointmentsByUser(user.id);
      res.json(appointments);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/appointments/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if user owns the appointment
      const user = req.user as any;
      if (appointment.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(appointment);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/appointments", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.put("/api/appointments/:id/status", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      const updatedAppointment = await storage.updateAppointmentStatus(id, status);
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Check if user owns the appointment
      const user = req.user as any;
      if (updatedAppointment.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(updatedAppointment);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const wishlist = await storage.getWishlist(user.id);
      res.json(wishlist);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/wishlist", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const wishlistData = insertWishlistSchema.parse({
        ...req.body,
        userId: user.id,
      });

      const wishlist = await storage.addToWishlist(wishlistData);
      res.status(201).json(wishlist);
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: err.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/wishlist/:id", isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeFromWishlist(id);
      if (!success) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
