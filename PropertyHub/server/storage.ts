import {
  users, type User, type InsertUser,
  properties, type Property, type InsertProperty,
  bookings, type Booking, type InsertBooking,
  reviews, type Review, type InsertReview,
  payments, type Payment, type InsertPayment
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
  // Property methods
  getProperty(id: number): Promise<Property | undefined>;
  getPropertiesByHost(hostId: number): Promise<Property[]>;
  getAllProperties(filters?: Partial<Property>): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<Property>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  
  // Booking methods
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByUser(userId: number): Promise<Booking[]>;
  getBookingsByProperty(propertyId: number): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined>;
  
  // Review methods
  getReviewsByProperty(propertyId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Payment methods
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByBooking(bookingId: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<Payment>): Promise<Payment | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private payments: Map<number, Payment>;
  private currentUserId: number;
  private currentPropertyId: number;
  private currentBookingId: number;
  private currentReviewId: number;
  private currentPaymentId: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.payments = new Map();
    this.currentUserId = 1;
    this.currentPropertyId = 1;
    this.currentBookingId = 1;
    this.currentReviewId = 1;
    this.currentPaymentId = 1;
    
    // Add some demo data
    this.seedDemoData();
  }

  private seedDemoData() {
    // Create a host user
    const hostUser: InsertUser = {
      username: "demohost",
      password: "password123",
      email: "host@example.com",
      name: "Demo Host",
      isHost: true,
      phone: "+91 9876543210",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg"
    };
    
    const host = this.createUser(hostUser);
    
    // Create some demo properties
    const demoProperties: InsertProperty[] = [
      {
        hostId: host.id,
        title: "Spacious Beachside Villa in Goa",
        description: "This stunning 4-bedroom villa is perfect for families or groups looking for a luxurious getaway in Goa. Featuring a private pool, spacious living areas, and modern amenities, it's just a short drive from popular beaches and restaurants. The space includes a fully equipped kitchen, outdoor dining area, and high-speed WiFi throughout.",
        location: "North Goa, Goa, India",
        latitude: "15.5074",
        longitude: "73.8278",
        pricePerNight: 12000,
        bedrooms: 4,
        bathrooms: 3,
        maxGuests: 8,
        propertyType: "Villa",
        images: [
          "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80",
          "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
        ],
        amenities: ["Private pool", "WiFi", "Air conditioning", "Kitchen", "Free parking", "BBQ grill"],
        status: "active",
        rating: "4.92"
      },
      {
        hostId: host.id,
        title: "Modern Apartment with Sea View",
        description: "Enjoy the breathtaking views of the Arabian Sea from this modern apartment in the heart of Mumbai. Perfect for business travelers or couples, this apartment offers all modern amenities and is close to major attractions and business districts.",
        location: "Mumbai, Maharashtra, India",
        latitude: "19.0760",
        longitude: "72.8777",
        pricePerNight: 8500,
        bedrooms: 2,
        bathrooms: 2,
        maxGuests: 4,
        propertyType: "Apartment",
        images: [
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
        ],
        amenities: ["Sea view", "WiFi", "Air conditioning", "Kitchen", "Elevator", "Gym"],
        status: "active",
        rating: "4.78"
      },
      {
        hostId: host.id,
        title: "Luxury Houseboat in Kerala",
        description: "Experience the serene backwaters of Kerala on this traditional luxury houseboat. Enjoy delicious local cuisine prepared by our onboard chef while cruising through the picturesque canals and lagoons of Alleppey.",
        location: "Alleppey, Kerala, India",
        latitude: "9.4981",
        longitude: "76.3388",
        pricePerNight: 15000,
        bedrooms: 3,
        bathrooms: 2,
        maxGuests: 6,
        propertyType: "Houseboat",
        images: [
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80",
          "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80",
          "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
        ],
        amenities: ["Onboard dining", "Air conditioning", "Private deck", "Fishing equipment", "WiFi", "Local guide"],
        status: "draft"
      }
    ];
    
    demoProperties.forEach(property => {
      this.createProperty(property);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Property methods
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getPropertiesByHost(hostId: number): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(
      (property) => property.hostId === hostId,
    );
  }

  async getAllProperties(filters?: Partial<Property>): Promise<Property[]> {
    let allProperties = Array.from(this.properties.values());
    
    if (filters) {
      allProperties = allProperties.filter(property => {
        return Object.entries(filters).every(([key, value]) => {
          if (!value) return true; // Skip undefined or null filters
          if (key === 'propertyType' && value) {
            return property.propertyType === value;
          }
          if (key === 'location' && value) {
            return property.location.toLowerCase().includes(value.toString().toLowerCase());
          }
          if (key === 'maxGuests' && value) {
            return property.maxGuests >= Number(value);
          }
          if (key === 'pricePerNight' && value) {
            return property.pricePerNight <= Number(value);
          }
          return true;
        });
      });
    }
    
    return allProperties.filter(property => property.status === 'active');
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.currentPropertyId++;
    const now = new Date();
    const property: Property = { 
      ...insertProperty, 
      id, 
      createdAt: now
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number, propertyData: Partial<Property>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const updatedProperty = { ...property, ...propertyData };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    if (!this.properties.has(id)) return false;
    return this.properties.delete(id);
  }

  // Booking methods
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId,
    );
  }

  async getBookingsByProperty(propertyId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.propertyId === propertyId,
    );
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const now = new Date();
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt: now
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...bookingData };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Review methods
  async getReviewsByProperty(propertyId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.propertyId === propertyId,
    );
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const now = new Date();
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt: now
    };
    this.reviews.set(id, review);
    return review;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByBooking(bookingId: number): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(
      (payment) => payment.bookingId === bookingId,
    );
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const now = new Date();
    const payment: Payment = { 
      ...insertPayment, 
      id, 
      createdAt: now
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: number, paymentData: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...paymentData };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
}

export const storage = new MemStorage();
