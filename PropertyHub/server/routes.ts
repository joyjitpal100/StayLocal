import { Request, Response, Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertPropertySchema,
  insertBookingSchema,
  insertReviewSchema,
  insertPaymentSchema,
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session and authentication
  setupAuth(app);

  // User routes
  app.post("/api/users/register", registerUser);
  app.post("/api/users/login", passport.authenticate("local"), loginUser);
  app.post("/api/users/logout", logoutUser);
  app.get("/api/users/current", getCurrentUser);
  app.put("/api/users/current", updateCurrentUser);
  
  // Google OAuth routes
  app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
  app.get("/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );

  // Property routes
  app.get("/api/properties", getProperties);
  app.get("/api/properties/:id", getProperty);
  app.post("/api/properties", requireAuth, createProperty);
  app.put("/api/properties/:id", requireAuth, updateProperty);
  app.delete("/api/properties/:id", requireAuth, deleteProperty);
  app.get("/api/hosts/:hostId/properties", getHostProperties);

  // Booking routes
  app.get("/api/bookings", requireAuth, getUserBookings);
  app.post("/api/bookings", requireAuth, createBooking);
  app.get("/api/properties/:propertyId/bookings", getPropertyBookings);
  app.put("/api/bookings/:id", requireAuth, updateBooking);

  // Review routes
  app.get("/api/properties/:propertyId/reviews", getPropertyReviews);
  app.post("/api/reviews", requireAuth, createReview);

  // Payment routes
  app.post("/api/payments", requireAuth, createPayment);
  app.put("/api/payments/:id", requireAuth, updatePayment);
  app.get("/api/bookings/:bookingId/payment", requireAuth, getBookingPayment);

  const httpServer = createServer(app);
  return httpServer;
}

// Auth setup
function setupAuth(app: Express) {
  app.use(
    session({
      secret: "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
      store: new SessionStore({ checkPeriod: 86400000 }),
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy Setup
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        if (user.password !== password) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Google OAuth Strategy Setup
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await storage.getUserByGoogleId(profile.id);
          
          if (!user) {
            // Check if user with same email exists
            if (profile.emails && profile.emails.length > 0) {
              const email = profile.emails[0].value;
              user = await storage.getUserByEmail(email);
              
              if (user) {
                // If user exists but doesn't have Google ID, update it
                user = await storage.updateUser(user.id, {
                  googleId: profile.id,
                  authProvider: "google"
                });
              } else {
                // Create a new user
                const newUser = {
                  username: profile.emails ? profile.emails[0].value.split('@')[0] : `google_${profile.id}`,
                  email: profile.emails ? profile.emails[0].value : "",
                  name: profile.displayName || "",
                  password: null,
                  isHost: false,
                  googleId: profile.id,
                  authProvider: "google",
                  profileImage: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null
                };
                
                user = await storage.createUser(newUser);
              }
            }
          }
          
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Middleware for requiring authentication
function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// Helper for handling validation errors
function handleValidationError(err: unknown, res: Response) {
  if (err instanceof ZodError) {
    const validationError = fromZodError(err);
    return res.status(400).json({ message: validationError.message });
  }
  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
}

// User routes implementations
async function registerUser(req: Request, res: Response) {
  try {
    const userData = insertUserSchema.parse(req.body);
    
    const existingUsername = await storage.getUserByUsername(userData.username);
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }
    
    const existingEmail = await storage.getUserByEmail(userData.email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    
    const user = await storage.createUser(userData);
    const { password, ...userWithoutPassword } = user;
    
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error during login" });
      }
      return res.status(201).json(userWithoutPassword);
    });
  } catch (err) {
    handleValidationError(err, res);
  }
}

async function loginUser(req: Request, res: Response) {
  const user = req.user as any;
  if (user) {
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  }
  return res.status(400).json({ message: "Login failed" });
}

function logoutUser(req: Request, res: Response) {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error during logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
}

function getCurrentUser(req: Request, res: Response) {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  }
  return res.status(401).json(null);
}

async function updateCurrentUser(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const user = req.user as any;
    const userData = req.body;
    
    // Don't allow changing username or email to existing values
    if (userData.username && userData.username !== user.username) {
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
    }
    
    if (userData.email && userData.email !== user.email) {
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }
    
    const updatedUser = await storage.updateUser(user.id, userData);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password, ...userWithoutPassword } = updatedUser;
    return res.json(userWithoutPassword);
  } catch (err) {
    handleValidationError(err, res);
  }
}

// Property routes implementations
async function getProperties(req: Request, res: Response) {
  try {
    const filters = req.query;
    const properties = await storage.getAllProperties(filters as any);
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getProperty(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const property = await storage.getProperty(Number(id));
    
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    res.json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function createProperty(req: Request, res: Response) {
  try {
    const user = req.user as any;
    if (!user.isHost) {
      return res.status(403).json({ message: "Only hosts can create properties" });
    }
    
    const propertyData = insertPropertySchema.parse({
      ...req.body,
      hostId: user.id
    });
    
    const property = await storage.createProperty(propertyData);
    res.status(201).json(property);
  } catch (err) {
    handleValidationError(err, res);
  }
}

async function updateProperty(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const propertyId = Number(id);
    const user = req.user as any;
    
    const property = await storage.getProperty(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    if (property.hostId !== user.id) {
      return res.status(403).json({ message: "Not authorized to update this property" });
    }
    
    const updatedProperty = await storage.updateProperty(propertyId, req.body);
    res.json(updatedProperty);
  } catch (err) {
    handleValidationError(err, res);
  }
}

async function deleteProperty(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const propertyId = Number(id);
    const user = req.user as any;
    
    const property = await storage.getProperty(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    if (property.hostId !== user.id) {
      return res.status(403).json({ message: "Not authorized to delete this property" });
    }
    
    await storage.deleteProperty(propertyId);
    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getHostProperties(req: Request, res: Response) {
  try {
    const { hostId } = req.params;
    const properties = await storage.getPropertiesByHost(Number(hostId));
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Booking routes implementations
async function getUserBookings(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const bookings = await storage.getBookingsByUser(user.id);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function createBooking(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const bookingData = insertBookingSchema.parse({
      ...req.body,
      userId: user.id,
    });
    
    // Check if property exists
    const property = await storage.getProperty(bookingData.propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    
    // Check if dates are available
    const existingBookings = await storage.getBookingsByProperty(bookingData.propertyId);
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    
    // Validate dates
    if (checkIn >= checkOut) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }
    
    // Check for overlapping bookings
    const isOverlapping = existingBookings.some(booking => {
      const existingCheckIn = new Date(booking.checkInDate);
      const existingCheckOut = new Date(booking.checkOutDate);
      
      return (
        (checkIn >= existingCheckIn && checkIn < existingCheckOut) ||
        (checkOut > existingCheckIn && checkOut <= existingCheckOut) ||
        (checkIn <= existingCheckIn && checkOut >= existingCheckOut)
      );
    });
    
    if (isOverlapping) {
      return res.status(400).json({ message: "Selected dates are not available" });
    }
    
    const booking = await storage.createBooking(bookingData);
    res.status(201).json(booking);
  } catch (err) {
    handleValidationError(err, res);
  }
}

async function getPropertyBookings(req: Request, res: Response) {
  try {
    const { propertyId } = req.params;
    const bookings = await storage.getBookingsByProperty(Number(propertyId));
    
    // If user is not authenticated or not the host, only return dates (not full booking details)
    if (!req.isAuthenticated()) {
      const bookingDates = bookings.map(booking => ({
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        status: booking.status
      }));
      return res.json(bookingDates);
    }
    
    const user = req.user as any;
    const property = await storage.getProperty(Number(propertyId));
    
    if (property && property.hostId === user.id) {
      // Host can see full booking details
      return res.json(bookings);
    } else {
      // Regular user only sees dates
      const bookingDates = bookings.map(booking => ({
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        status: booking.status
      }));
      return res.json(bookingDates);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function updateBooking(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const bookingId = Number(id);
    const user = req.user as any;
    
    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Check if user is the booking owner or the property host
    const property = await storage.getProperty(booking.propertyId);
    if (booking.userId !== user.id && property?.hostId !== user.id) {
      return res.status(403).json({ message: "Not authorized to update this booking" });
    }
    
    const updatedBooking = await storage.updateBooking(bookingId, req.body);
    res.json(updatedBooking);
  } catch (err) {
    handleValidationError(err, res);
  }
}

// Review routes implementations
async function getPropertyReviews(req: Request, res: Response) {
  try {
    const { propertyId } = req.params;
    const reviews = await storage.getReviewsByProperty(Number(propertyId));
    
    // Get user details for each review
    const reviewsWithUserDetails = await Promise.all(
      reviews.map(async (review) => {
        const user = await storage.getUser(review.userId);
        return {
          ...review,
          user: user ? {
            id: user.id,
            name: user.name,
            profileImage: user.profileImage
          } : null
        };
      })
    );
    
    res.json(reviewsWithUserDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

async function createReview(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const reviewData = insertReviewSchema.parse({
      ...req.body,
      userId: user.id
    });
    
    // Check if the booking exists and belongs to the user
    const booking = await storage.getBooking(reviewData.bookingId);
    if (!booking || booking.userId !== user.id) {
      return res.status(403).json({ message: "Can only review properties you've booked" });
    }
    
    // Check if the booking status is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: "Can only review after completing your stay" });
    }
    
    const review = await storage.createReview(reviewData);
    
    // Update property rating
    const property = await storage.getProperty(reviewData.propertyId);
    if (property) {
      const reviews = await storage.getReviewsByProperty(reviewData.propertyId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = (totalRating / reviews.length).toFixed(2);
      
      await storage.updateProperty(reviewData.propertyId, {
        rating: averageRating
      });
    }
    
    res.status(201).json(review);
  } catch (err) {
    handleValidationError(err, res);
  }
}

// Payment routes implementations
async function createPayment(req: Request, res: Response) {
  try {
    const user = req.user as any;
    const paymentData = insertPaymentSchema.parse(req.body);
    
    // Check if the booking exists and belongs to the user
    const booking = await storage.getBooking(paymentData.bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    if (booking.userId !== user.id) {
      return res.status(403).json({ message: "Not authorized to make payment for this booking" });
    }
    
    // Check if payment already exists
    const existingPayment = await storage.getPaymentByBooking(paymentData.bookingId);
    if (existingPayment) {
      return res.status(400).json({ message: "Payment already exists for this booking" });
    }
    
    // In a real app, we would integrate with a UPI payment gateway here
    // For demo purposes, we'll simulate a successful payment
    const payment = await storage.createPayment({
      ...paymentData,
      status: "success",
      transactionId: `TX${Date.now()}`
    });
    
    // Update booking payment status
    await storage.updateBooking(booking.id, {
      paymentStatus: "paid",
      status: "confirmed"
    });
    
    res.status(201).json(payment);
  } catch (err) {
    handleValidationError(err, res);
  }
}

async function updatePayment(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const paymentId = Number(id);
    
    const payment = await storage.getPayment(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    // In a real app, we would verify payment status with the payment gateway
    const updatedPayment = await storage.updatePayment(paymentId, req.body);
    
    // Update booking status if payment is successful
    if (updatedPayment?.status === "success") {
      await storage.updateBooking(payment.bookingId, {
        paymentStatus: "paid",
        status: "confirmed"
      });
    }
    
    res.json(updatedPayment);
  } catch (err) {
    handleValidationError(err, res);
  }
}

async function getBookingPayment(req: Request, res: Response) {
  try {
    const { bookingId } = req.params;
    const user = req.user as any;
    
    const booking = await storage.getBooking(Number(bookingId));
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    if (booking.userId !== user.id) {
      return res.status(403).json({ message: "Not authorized to view this payment" });
    }
    
    const payment = await storage.getPaymentByBooking(Number(bookingId));
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
