import session from "express-session";
import createMemoryStore from "memorystore";
import type { 
  User, InsertUser,
  Hotel, InsertHotel,
  Room, InsertRoom,
  Booking, InsertBooking,
  Review, InsertReview
} from "@shared/schema";
import { MongoDBStorage, HotelFilters } from './mongo-storage';

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
  getAllHotels(): Promise<Hotel[]>;
  approveHotel(hotelId: number): Promise<Hotel>;
  createHotel(data: any): Promise<Hotel>;

  // Room operations
  getRoomsByHotelId(hotelId: number): Promise<Room[]>;
  getRoomById(id: number): Promise<Room | undefined>;

  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  updatePaymentStatus(id: number, paymentStatus: string, paymentIntentId?: string): Promise<Booking>;
  getBookingById(id: number): Promise<Booking | null>;

  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByHotelId(hotelId: number): Promise<Review[]>;
  createPayment(data: any): Promise<any>;

  sessionStore: session.Store;
}

// Fallback memory storage implementation
export class MemStorage implements IStorage {
  private users: User[] = [];
  private hotels: Hotel[] = [];
  private rooms: Room[] = [];
  private bookings: Booking[] = [];
  private reviews: Review[] = [];
  private payments: any[] = []; // Added payments array
  sessionStore: session.Store;

  constructor() {
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h
    });
    this.initializeSampleData();
  }

  private nextId(items: any[]): number {
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
  }

  private initializeSampleData() {
    // Sample hotels
    const hotels: Hotel[] = [
      {
        id: 1,
        name: 'Royal Azur Thalasso',
        description: 'Luxurious beachfront resort with a spa and multiple pools',
        location: 'Hammamet',
        city: 'Hammamet',
        address: '123 Beach Road, Hammamet',
        stars: 5,
        rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80',
        amenities: ['Spa', 'Pool', 'Restaurant', 'WiFi', 'Beach Access'],
        reviewCount: 0,
        approved: true //Adding an approved field
      },
      {
        id: 2,
        name: 'Movenpick Resort & Marine Spa',
        description: 'Elegant hotel with excellent service and Mediterranean views',
        location: 'Sousse',
        city: 'Sousse',
        address: '45 Marina Avenue, Sousse',
        stars: 5,
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80',
        amenities: ['Spa', 'Pool', 'Restaurant', 'WiFi', 'Gym'],
        reviewCount: 0,
        approved: true //Adding an approved field
      },
      {
        id: 3,
        name: 'Diar Lemdina Hotel',
        description: 'Family-friendly resort with entertainment and water parks',
        location: 'Yasmine Hammamet',
        city: 'Yasmine Hammamet',
        address: '789 Resort Drive, Yasmine Hammamet',
        stars: 4,
        rating: 4.2,
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80',
        amenities: ['Water Park', 'Kid\'s Club', 'Restaurant', 'WiFi', 'Entertainment'],
        reviewCount: 0,
        approved: true //Adding an approved field
      }
    ];
    this.hotels = hotels;

    // Sample rooms
    const rooms: Room[] = [];
    for (const hotel of hotels) {
      rooms.push(
        {
          id: rooms.length + 1,
          hotelId: hotel.id,
          roomType: 'Standard',
          description: 'Comfortable room with basic amenities',
          price: 90,
          capacity: 2,
          available: true,
          imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80',
          amenities: ['WiFi', 'TV', 'Air Conditioning']
        },
        {
          id: rooms.length + 2,
          hotelId: hotel.id,
          roomType: 'Deluxe',
          description: 'Spacious room with premium amenities and views',
          price: 150,
          capacity: 3,
          available: true,
          imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80',
          amenities: ['WiFi', 'TV', 'Mini Bar', 'Air Conditioning', 'Sea View']
        },
        {
          id: rooms.length + 3,
          hotelId: hotel.id,
          roomType: 'Suite',
          description: 'Luxury suite with separate living area and premium services',
          price: 250,
          capacity: 4,
          available: true,
          imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80',
          amenities: ['WiFi', 'TV', 'Mini Bar', 'Air Conditioning', 'Sea View', 'Living Room', 'Butler Service']
        }
      );
    }
    this.rooms = rooms;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.nextId(this.users),
      isAdmin: false,
      stripeCustomerId: null,
      fullName: user.fullName || null,
      phoneNumber: user.phoneNumber || null
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.stripeCustomerId = stripeCustomerId;
    return user;
  }

  // Hotel operations
  async getHotels(filters?: HotelFilters): Promise<Hotel[]> {
    if (!filters) return this.hotels.filter(hotel => hotel.approved); // only return approved hotels

    let filteredHotels = [...this.hotels].filter(hotel => hotel.approved); // only return approved hotels

    if (filters.city) {
      filteredHotels = filteredHotels.filter(hotel => 
        hotel.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters.minPrice) {
      // Filter by rooms with price >= minPrice
      const hotelIdsWithMatchingRooms = this.rooms
        .filter(room => room.price >= filters.minPrice!)
        .map(room => room.hotelId);

      filteredHotels = filteredHotels.filter(hotel => 
        hotelIdsWithMatchingRooms.includes(hotel.id)
      );
    }

    if (filters.maxPrice) {
      // Filter by rooms with price <= maxPrice
      const hotelIdsWithMatchingRooms = this.rooms
        .filter(room => room.price <= filters.maxPrice!)
        .map(room => room.hotelId);

      filteredHotels = filteredHotels.filter(hotel => 
        hotelIdsWithMatchingRooms.includes(hotel.id)
      );
    }

    if (filters.stars) {
      filteredHotels = filteredHotels.filter(hotel => hotel.stars === filters.stars);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filteredHotels = filteredHotels.filter(hotel => 
        hotel.name.toLowerCase().includes(query) ||
        hotel.description.toLowerCase().includes(query) ||
        hotel.location.toLowerCase().includes(query) ||
        hotel.city.toLowerCase().includes(query)
      );
    }

    return filteredHotels;
  }

  async getHotelById(id: number): Promise<Hotel | undefined> {
    return this.hotels.find(hotel => hotel.id === id);
  }

  async getHotelsByCity(city: string): Promise<Hotel[]> {
    return this.hotels.filter(hotel => 
      hotel.city.toLowerCase().includes(city.toLowerCase())
    );
  }

  async getAllHotels(): Promise<Hotel[]> {
    return this.hotels;
  }

  async approveHotel(hotelId: number): Promise<Hotel> {
    const hotel = this.hotels.find(hotel => hotel.id === hotelId);
    if (!hotel) {
      throw new Error('Hotel not found');
    }
    hotel.approved = true;
    return hotel;
  }

  async createHotel(hotelData: any): Promise<Hotel> {
    const newHotel: Hotel = {
      ...hotelData,
      id: this.nextId(this.hotels),
      approved: false, //Initially not approved
      reviewCount: 0,
      rating: 0,
      imageUrl: hotelData.imageUrl || null,
    };
    this.hotels.push(newHotel);
    return newHotel;
  }

  // Room operations
  async getRoomsByHotelId(hotelId: number): Promise<Room[]> {
    return this.rooms.filter(room => room.hotelId === hotelId);
  }

  async getRoomById(id: number): Promise<Room | undefined> {
    return this.rooms.find(room => room.id === id);
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const newBooking: Booking = {
      ...booking,
      id: this.nextId(this.bookings),
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date(),
      paymentIntentId: null
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return this.bookings.filter(booking => booking.userId === userId);
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.status = status;
    return booking;
  }

  async updatePaymentStatus(id: number, paymentStatus: string, paymentIntentId?: string): Promise<Booking> {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.paymentStatus = paymentStatus;
    if (paymentIntentId) {
      booking.paymentIntentId = paymentIntentId;
    }

    return booking;
  }

  async getBookingById(id: number): Promise<Booking | null> {
    return this.bookings.find(booking => booking.id === id) || null;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const newReview: Review = {
      ...review,
      id: this.nextId(this.reviews),
      createdAt: new Date(),
      comment: review.comment || null
    };
    this.reviews.push(newReview);

    // Update hotel review count
    const hotel = this.hotels.find(h => h.id === review.hotelId);
    if (hotel) {
      hotel.reviewCount = (hotel.reviewCount || 0) + 1;
    }

    return newReview;
  }

  async getReviewsByHotelId(hotelId: number): Promise<Review[]> {
    return this.reviews.filter(review => review.hotelId === hotelId);
  }

  async createPayment(paymentData: any): Promise<any> {
    const newPayment = {
      ...paymentData,
      id: this.nextId(this.payments),
      createdAt: new Date()
    };
    this.payments.push(newPayment);
    return newPayment;
  }
}

// Create an instance of the storage class
// If MongoDB connection fails, we'll use the in-memory storage
let storageInstance: IStorage;

try {
  storageInstance = new MongoDBStorage();
  console.log('Using MongoDB storage');
} catch (error) {
  console.warn('Failed to initialize MongoDB storage, falling back to in-memory storage');
  storageInstance = new MemStorage();
  console.log('Using in-memory storage');
}

export const storage = storageInstance;