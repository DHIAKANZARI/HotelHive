import { db } from "./db";
import { type User, type InsertUser, type Hotel, type InsertHotel, type Room, type InsertRoom, type Booking, type InsertBooking, type Review, type InsertReview } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import bcrypt from "bcrypt";
import { ObjectId, Collection, Document } from "mongodb";
import fs from "fs";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const MemoryStore = createMemoryStore(session);

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User>;
  
  // Hotel operations
  getHotels(filters?: HotelFilters): Promise<Hotel[]>;
  getHotelById(id: string): Promise<Hotel | undefined>;
  getHotelsByCity(city: string): Promise<Hotel[]>;
  
  // Room operations
  getRoomsByHotelId(hotelId: string): Promise<Room[]>;
  getRoomById(id: string): Promise<Room | undefined>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUserId(userId: string): Promise<Booking[]>;
  updateBookingStatus(id: string, status: string): Promise<Booking>;
  updatePaymentStatus(id: string, paymentStatus: string, paymentIntentId?: string): Promise<Booking>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByHotelId(hotelId: string): Promise<Review[]>;
  
  sessionStore: session.Store;
}

// Hotel filter interface
export interface HotelFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  stars?: number;
  searchQuery?: string;
}

export class InMemoryStorage implements IStorage {
  sessionStore: session.Store;
  private users: Map<string, User>;
  private hotels: Map<string, Hotel>;
  private rooms: Map<string, Room>;
  private bookings: Map<string, Booking>;
  private reviews: Map<string, Review>;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    this.users = new Map();
    this.hotels = new Map();
    this.rooms = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    
    // Initialize storage
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      // Add initial test user if it doesn't exist
      const testUser = await this.getUserByUsername("test");
      if (!testUser) {
        const hashedPassword = await bcrypt.hash("test123", 10);
        const testUserData = {
          id: new ObjectId().toString(),
          username: "test",
          password: hashedPassword,
          email: "test@example.com",
          fullName: "Test User",
          phoneNumber: null,
          isAdmin: false,
          stripeCustomerId: null,
        } as User;
        await this.createUser(testUserData);
      }

      // Initialize hotels if collection is empty
      if (this.hotels.size === 0) {
        const hotelsData = JSON.parse(fs.readFileSync(path.join(__dirname, "../server/data/hotels.json"), "utf-8"));
        for (const hotelData of hotelsData) {
          const hotelId = new ObjectId().toString();
          const hotel: Hotel = {
            id: hotelId,
            name: hotelData.name,
            description: hotelData.description,
            location: hotelData.location,
            city: hotelData.city,
            address: hotelData.address,
            rating: hotelData.rating || null,
            stars: hotelData.stars || null,
            imageUrl: hotelData.imageUrl || null,
            amenities: hotelData.amenities || null,
            reviewCount: hotelData.reviewCount || 0,
          };
          this.hotels.set(hotelId, hotel);

          // Initialize rooms for this hotel
          for (const roomData of hotelData.rooms) {
            const roomId = new ObjectId().toString();
            const room: Room = {
              id: roomId,
              hotelId,
              roomType: roomData.roomType,
              description: roomData.description,
              price: roomData.price,
              capacity: roomData.capacity,
              available: true,
              imageUrl: roomData.imageUrl || null,
              amenities: roomData.amenities || null,
            };
            this.rooms.set(roomId, room);
          }
        }
      }
    } catch (error) {
      console.error("Failed to initialize storage:", error);
      throw error;
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = new ObjectId().toString();
    const newUser = { ...user, id } as User;
    this.users.set(id, newUser);
    return newUser;
  }

  async updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, stripeCustomerId };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Hotel operations
  async getHotels(filters?: HotelFilters): Promise<Hotel[]> {
    let hotels = Array.from(this.hotels.values());
    
    if (filters) {
      if (filters.city) {
        hotels = hotels.filter(hotel => hotel.city === filters.city);
      }
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        hotels = hotels.filter(hotel =>
          hotel.name.toLowerCase().includes(query) ||
          hotel.city.toLowerCase().includes(query) ||
          hotel.description.toLowerCase().includes(query)
        );
      }
      
      if (filters.stars) {
        hotels = hotels.filter(hotel => hotel.stars === filters.stars);
      }
      
      if (filters.minPrice || filters.maxPrice) {
        const rooms = Array.from(this.rooms.values());
        const hotelIds = new Set<string>();
        
        rooms.forEach(room => {
          if ((!filters.minPrice || room.price >= filters.minPrice) &&
              (!filters.maxPrice || room.price <= filters.maxPrice)) {
            hotelIds.add(room.hotelId);
          }
        });
        
        hotels = hotels.filter(hotel => hotelIds.has(hotel.id));
      }
    }
    
    return hotels;
  }

  async getHotelById(id: string): Promise<Hotel | undefined> {
    return this.hotels.get(id);
  }

  async getHotelsByCity(city: string): Promise<Hotel[]> {
    return Array.from(this.hotels.values()).filter(hotel => hotel.city === city);
  }

  // Room operations
  async getRoomsByHotelId(hotelId: string): Promise<Room[]> {
    return Array.from(this.rooms.values()).filter(room => room.hotelId === hotelId);
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = new ObjectId().toString();
    const newBooking = {
      ...booking,
      id,
      status: "pending",
      paymentStatus: "pending",
      paymentIntentId: null,
      createdAt: new Date(),
    } as Booking;
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.userId === userId);
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const booking = await this.getRoomById(id);
    if (!booking) throw new Error("Booking not found");
    const updatedBooking = { ...booking, status } as Booking;
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async updatePaymentStatus(id: string, paymentStatus: string, paymentIntentId?: string): Promise<Booking> {
    const booking = await this.getRoomById(id);
    if (!booking) throw new Error("Booking not found");
    const updatedBooking = { ...booking, paymentStatus, paymentIntentId } as Booking;
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const id = new ObjectId().toString();
    const newReview = {
      ...review,
      id,
      createdAt: new Date(),
    } as Review;
    this.reviews.set(id, newReview);
    return newReview;
  }

  async getReviewsByHotelId(hotelId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.hotelId === hotelId);
  }
}

export const storage = new InMemoryStorage();
