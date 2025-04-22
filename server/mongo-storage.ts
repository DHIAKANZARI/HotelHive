import session from "express-session";
import { User, Hotel, Room, Booking, Review } from "./db";
import { type User as UserType, type Hotel as HotelType, type Room as RoomType, type Booking as BookingType, type Review as ReviewType } from "@shared/schema";
import { type InsertUser, type InsertHotel, type InsertRoom, type InsertBooking, type InsertReview } from "@shared/schema";
export interface HotelFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  stars?: number;
  searchQuery?: string;
}
import MongoStore from "connect-mongo";
import mongoose from "mongoose";

// MongoDB implementation of IStorage
export class MongoDBStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/hootili',
      collectionName: 'sessions',
    });
  }

  // Helper method to convert MongoDB object to schema type
  private convertUser(user: any): UserType {
    return {
      id: user._id.toString(),
      username: user.username,
      password: user.password,
      email: user.email,
      fullName: user.fullName || null,
      phoneNumber: user.phoneNumber || null,
      isAdmin: user.isAdmin || false,
      stripeCustomerId: user.stripeCustomerId || null
    };
  }

  private convertHotel(hotel: any): HotelType {
    return {
      id: hotel._id.toString(),
      name: hotel.name,
      description: hotel.description,
      location: hotel.location,
      city: hotel.city,
      address: hotel.address,
      rating: hotel.rating || 0,
      stars: hotel.stars || 3,
      imageUrl: hotel.imageUrl || null,
      amenities: hotel.amenities || [],
      reviewCount: hotel.reviewCount || 0
    };
  }

  private convertRoom(room: any): RoomType {
    return {
      id: room._id.toString(),
      hotelId: room.hotelId.toString(),
      roomType: room.roomType,
      description: room.description,
      price: room.price,
      capacity: room.capacity,
      available: room.available,
      imageUrl: room.imageUrl || null,
      amenities: room.amenities || []
    };
  }

  private convertBooking(booking: any): BookingType {
    return {
      id: booking._id.toString(),
      userId: booking.userId.toString(),
      roomId: booking.roomId.toString(),
      hotelId: booking.hotelId.toString(),
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      totalPrice: booking.totalPrice,
      numberOfGuests: booking.numberOfGuests,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      paymentIntentId: booking.paymentIntentId || null,
      createdAt: booking.createdAt
    };
  }

  private convertReview(review: any): ReviewType {
    return {
      id: review._id.toString(),
      userId: review.userId.toString(),
      hotelId: review.hotelId.toString(),
      rating: review.rating,
      comment: review.comment || null,
      createdAt: review.createdAt
    };
  }

  // User operations
  async getUser(id: number): Promise<UserType | undefined> {
    try {
      // Convert string ID to MongoDB ObjectId if needed
      let query = {};
      try {
        if (mongoose.Types.ObjectId.isValid(id.toString())) {
          query = { _id: id.toString() };
        } else {
          query = { _id: id };
        }
      } catch (err) {
        query = { _id: id };
      }

      const user = await User.findOne(query);
      return user ? this.convertUser(user) : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<UserType | undefined> {
    try {
      const user = await User.findOne({ username });
      return user ? this.convertUser(user) : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<UserType | undefined> {
    try {
      const user = await User.findOne({ email });
      return user ? this.convertUser(user) : undefined;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<UserType> {
    try {
      const newUser = await User.create(user);
      return this.convertUser(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<UserType> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        { stripeCustomerId },
        { new: true }
      );
      if (!user) {
        throw new Error('User not found');
      }
      return this.convertUser(user);
    } catch (error) {
      console.error('Error updating stripe customer ID:', error);
      throw error;
    }
  }

  // Hotel operations
  async getHotels(filters?: HotelFilters): Promise<HotelType[]> {
    try {
      let query: any = {};

      if (filters) {
        if (filters.city) {
          query.city = { $regex: filters.city, $options: 'i' };
        }

        if (filters.stars) {
          query.stars = filters.stars;
        }

        if (filters.searchQuery) {
          query.$or = [
            { name: { $regex: filters.searchQuery, $options: 'i' } },
            { description: { $regex: filters.searchQuery, $options: 'i' } },
            { location: { $regex: filters.searchQuery, $options: 'i' } }
          ];
        }

        // Note: price filtering would need to join with Rooms collection
        // This is a simplified implementation
      }

      const hotels = await Hotel.find(query);
      return hotels.map(hotel => this.convertHotel(hotel));
    } catch (error) {
      console.error('Error getting hotels:', error);
      return [];
    }
  }

  async getHotelById(id: number): Promise<HotelType | undefined> {
    try {
      // Convert string ID to MongoDB ObjectId if needed
      let query = {};
      try {
        if (mongoose.Types.ObjectId.isValid(id.toString())) {
          query = { _id: id.toString() };
        } else {
          query = { _id: id };
        }
      } catch (err) {
        query = { _id: id };
      }
      
      const hotel = await Hotel.findOne(query);
      return hotel ? this.convertHotel(hotel) : undefined;
    } catch (error) {
      console.error('Error getting hotel by ID:', error);
      return undefined;
    }
  }

  async getHotelsByCity(city: string): Promise<HotelType[]> {
    try {
      const hotels = await Hotel.find({ city: { $regex: city, $options: 'i' } });
      return hotels.map(hotel => this.convertHotel(hotel));
    } catch (error) {
      console.error('Error getting hotels by city:', error);
      return [];
    }
  }

  // Room operations
  async getRoomsByHotelId(hotelId: number): Promise<RoomType[]> {
    try {
      // Convert string ID to MongoDB ObjectId if needed
      let query = {};
      try {
        if (mongoose.Types.ObjectId.isValid(hotelId.toString())) {
          query = { hotelId: hotelId.toString() };
        } else {
          query = { hotelId: hotelId };
        }
      } catch (err) {
        query = { hotelId: hotelId };
      }
      
      const rooms = await Room.find(query);
      return rooms.map(room => this.convertRoom(room));
    } catch (error) {
      console.error('Error getting rooms by hotel ID:', error);
      return [];
    }
  }

  async getRoomById(id: number): Promise<RoomType | undefined> {
    try {
      // Convert string ID to MongoDB ObjectId if needed
      let query = {};
      try {
        if (mongoose.Types.ObjectId.isValid(id.toString())) {
          query = { _id: id.toString() };
        } else {
          query = { _id: id };
        }
      } catch (err) {
        query = { _id: id };
      }
      
      const room = await Room.findOne(query);
      return room ? this.convertRoom(room) : undefined;
    } catch (error) {
      console.error('Error getting room by ID:', error);
      return undefined;
    }
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<BookingType> {
    try {
      const newBooking = await Booking.create({
        ...booking,
        createdAt: new Date()
      });
      return this.convertBooking(newBooking);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async getBookingsByUserId(userId: number): Promise<BookingType[]> {
    try {
      // Convert string ID to MongoDB ObjectId if needed
      let query = {};
      try {
        if (mongoose.Types.ObjectId.isValid(userId.toString())) {
          query = { userId: userId.toString() };
        } else {
          query = { userId: userId };
        }
      } catch (err) {
        query = { userId: userId };
      }
      
      const bookings = await Booking.find(query);
      return bookings.map(booking => this.convertBooking(booking));
    } catch (error) {
      console.error('Error getting bookings by user ID:', error);
      return [];
    }
  }

  async updateBookingStatus(id: number, status: string): Promise<BookingType> {
    try {
      // Convert string ID to MongoDB ObjectId if needed
      let queryId: string | number = id;
      try {
        if (mongoose.Types.ObjectId.isValid(id.toString())) {
          queryId = id.toString();
        }
      } catch (err) {
        // Keep original id
      }
      
      const booking = await Booking.findByIdAndUpdate(
        queryId,
        { status },
        { new: true }
      );
      if (!booking) {
        throw new Error('Booking not found');
      }
      return this.convertBooking(booking);
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  async updatePaymentStatus(id: number, paymentStatus: string, paymentIntentId?: string): Promise<BookingType> {
    try {
      const updateData: any = { paymentStatus };
      if (paymentIntentId) {
        updateData.paymentIntentId = paymentIntentId;
      }

      // Convert string ID to MongoDB ObjectId if needed
      let queryId: string | number = id;
      try {
        if (mongoose.Types.ObjectId.isValid(id.toString())) {
          queryId = id.toString();
        }
      } catch (err) {
        // Keep original id
      }

      const booking = await Booking.findByIdAndUpdate(
        queryId,
        updateData,
        { new: true }
      );
      if (!booking) {
        throw new Error('Booking not found');
      }
      return this.convertBooking(booking);
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Review operations
  async createReview(review: InsertReview): Promise<ReviewType> {
    try {
      const newReview = await Review.create({
        ...review,
        createdAt: new Date()
      });
      return this.convertReview(newReview);
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  async getReviewsByHotelId(hotelId: number): Promise<ReviewType[]> {
    try {
      // Convert string ID to MongoDB ObjectId if needed
      let query = {};
      try {
        if (mongoose.Types.ObjectId.isValid(hotelId.toString())) {
          query = { hotelId: hotelId.toString() };
        } else {
          query = { hotelId: hotelId };
        }
      } catch (err) {
        query = { hotelId: hotelId };
      }
      
      const reviews = await Review.find(query);
      return reviews.map(review => this.convertReview(review));
    } catch (error) {
      console.error('Error getting reviews by hotel ID:', error);
      return [];
    }
  }

  // Data initialization (load sample data if needed)
  async loadInitialData() {
    try {
      // Check if data already exists
      const hotelCount = await Hotel.countDocuments();
      
      if (hotelCount > 0) {
        console.log('Data already initialized');
        return;
      }
      
      console.log('Initializing sample data...');

      // Sample hotels
      const hotels = [
        {
          name: 'Royal Azur Thalasso',
          description: 'Luxurious beachfront resort with a spa and multiple pools',
          location: 'Hammamet',
          city: 'Hammamet',
          address: '123 Beach Road, Hammamet',
          stars: 5,
          imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80',
          amenities: ['Spa', 'Pool', 'Restaurant', 'WiFi', 'Beach Access'],
        },
        {
          name: 'Movenpick Resort & Marine Spa',
          description: 'Elegant hotel with excellent service and Mediterranean views',
          location: 'Sousse',
          city: 'Sousse',
          address: '45 Marina Avenue, Sousse',
          stars: 5,
          imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80',
          amenities: ['Spa', 'Pool', 'Restaurant', 'WiFi', 'Gym'],
        },
        {
          name: 'Diar Lemdina Hotel',
          description: 'Family-friendly resort with entertainment and water parks',
          location: 'Yasmine Hammamet',
          city: 'Yasmine Hammamet',
          address: '789 Resort Drive, Yasmine Hammamet',
          stars: 4,
          imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80',
          amenities: ['Water Park', 'Kid\'s Club', 'Restaurant', 'WiFi', 'Entertainment'],
        }
      ];
      
      // Create sample hotels
      const createdHotels = await Hotel.insertMany(hotels);
      
      // Sample rooms for each hotel
      const rooms = [];
      
      for (const hotel of createdHotels) {
        rooms.push(
          {
            hotelId: hotel._id,
            roomType: 'Standard',
            description: 'Comfortable room with basic amenities',
            price: 90,
            capacity: 2,
            available: true,
            imageUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80',
            amenities: ['WiFi', 'TV', 'Air Conditioning']
          },
          {
            hotelId: hotel._id,
            roomType: 'Deluxe',
            description: 'Spacious room with premium amenities and views',
            price: 150,
            capacity: 3,
            available: true,
            imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80',
            amenities: ['WiFi', 'TV', 'Mini Bar', 'Air Conditioning', 'Sea View']
          },
          {
            hotelId: hotel._id,
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
      
      // Create sample rooms
      await Room.insertMany(rooms);
      
      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  }
}