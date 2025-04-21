import { hotels, users, rooms, bookings, reviews } from "@shared/schema";
import { type User, type InsertUser, type Hotel, type InsertHotel, type Room, type InsertRoom, type Booking, type InsertBooking, type Review, type InsertReview } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import fs from 'fs/promises';
import path from 'path';

const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
  
  // Hotel operations
  getHotels(filters?: HotelFilters): Promise<Hotel[]>;
  getHotelById(id: number): Promise<Hotel | undefined>;
  getHotelsByCity(city: string): Promise<Hotel[]>;
  
  // Room operations
  getRoomsByHotelId(hotelId: number): Promise<Room[]>;
  getRoomById(id: number): Promise<Room | undefined>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  updatePaymentStatus(id: number, paymentStatus: string, paymentIntentId?: string): Promise<Booking>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByHotelId(hotelId: number): Promise<Review[]>;
  
  sessionStore: session.SessionStore;
}

// Hotel filter interface
export interface HotelFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  stars?: number;
  searchQuery?: string;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private hotels: Map<number, Hotel>;
  private rooms: Map<number, Room>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  currentUserId: number;
  currentHotelId: number;
  currentRoomId: number;
  currentBookingId: number;
  currentReviewId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.hotels = new Map();
    this.rooms = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.currentUserId = 1;
    this.currentHotelId = 1;
    this.currentRoomId = 1;
    this.currentBookingId = 1;
    this.currentReviewId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Load initial hotel data from JSON file
    this.loadInitialData();
  }

  private async loadInitialData() {
    try {
      const dataPath = path.join(process.cwd(), 'server', 'data', 'hotels.json');
      const data = await fs.readFile(dataPath, 'utf-8');
      const hotelData = JSON.parse(data);
      
      for (const hotel of hotelData) {
        const hotelId = this.currentHotelId++;
        const newHotel: Hotel = {
          ...hotel,
          id: hotelId,
          amenities: hotel.amenities || [],
        };
        this.hotels.set(hotelId, newHotel);
        
        // Create rooms for each hotel
        if (hotel.rooms) {
          for (const room of hotel.rooms) {
            const roomId = this.currentRoomId++;
            const newRoom: Room = {
              ...room,
              id: roomId,
              hotelId,
              amenities: room.amenities || [],
            };
            this.rooms.set(roomId, newRoom);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load initial hotel data:', error);
    }
  }

  // User operations
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updatedUser = { ...user, stripeCustomerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Hotel operations
  async getHotels(filters?: HotelFilters): Promise<Hotel[]> {
    let filteredHotels = Array.from(this.hotels.values());
    
    if (filters) {
      if (filters.city) {
        filteredHotels = filteredHotels.filter(hotel => 
          hotel.city.toLowerCase() === filters.city?.toLowerCase());
      }
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredHotels = filteredHotels.filter(hotel => 
          hotel.name.toLowerCase().includes(query) || 
          hotel.city.toLowerCase().includes(query) ||
          hotel.description.toLowerCase().includes(query));
      }
      
      if (filters.stars) {
        filteredHotels = filteredHotels.filter(hotel => hotel.stars === filters.stars);
      }
      
      if (filters.minPrice || filters.maxPrice) {
        // This requires additional logic to filter based on room prices
        // Since rooms are in a separate collection, we need a more complex filtering logic
        const hotelIds = new Set<number>();
        
        Array.from(this.rooms.values()).forEach(room => {
          if (
            (!filters.minPrice || room.price >= filters.minPrice) &&
            (!filters.maxPrice || room.price <= filters.maxPrice)
          ) {
            hotelIds.add(room.hotelId);
          }
        });
        
        filteredHotels = filteredHotels.filter(hotel => hotelIds.has(hotel.id));
      }
    }
    
    return filteredHotels;
  }

  async getHotelById(id: number): Promise<Hotel | undefined> {
    return this.hotels.get(id);
  }

  async getHotelsByCity(city: string): Promise<Hotel[]> {
    return Array.from(this.hotels.values()).filter(
      (hotel) => hotel.city.toLowerCase() === city.toLowerCase(),
    );
  }

  // Room operations
  async getRoomsByHotelId(hotelId: number): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(
      (room) => room.hotelId === hotelId,
    );
  }

  async getRoomById(id: number): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const newBooking: Booking = { 
      ...booking, 
      id, 
      createdAt: new Date() 
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId,
    );
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    const updatedBooking = { ...booking, status };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async updatePaymentStatus(id: number, paymentStatus: string, paymentIntentId?: string): Promise<Booking> {
    const booking = this.bookings.get(id);
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    const updatedBooking = { 
      ...booking, 
      paymentStatus,
      ...(paymentIntentId && { paymentIntentId }),
    };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview: Review = { ...review, id, createdAt: new Date() };
    this.reviews.set(id, newReview);
    
    // Update hotel review count
    const hotel = await this.getHotelById(review.hotelId);
    if (hotel) {
      const updatedHotel = { 
        ...hotel, 
        reviewCount: hotel.reviewCount ? hotel.reviewCount + 1 : 1 
      };
      this.hotels.set(hotel.id, updatedHotel);
    }
    
    return newReview;
  }

  async getReviewsByHotelId(hotelId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.hotelId === hotelId,
    );
  }
}

export const storage = new MemStorage();
