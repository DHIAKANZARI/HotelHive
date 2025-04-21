import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertBookingSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Hotels API
  app.get("/api/hotels", async (req, res) => {
    try {
      const { city, minPrice, maxPrice, stars, q } = req.query;
      
      const filters: any = {};
      if (city) filters.city = city.toString();
      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);
      if (stars) filters.stars = Number(stars);
      if (q) filters.searchQuery = q.toString();
      
      const hotels = await storage.getHotels(filters);
      res.json(hotels);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/hotels/:id", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.id, 10);
      const hotel = await storage.getHotelById(hotelId);
      
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      
      res.json(hotel);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Rooms API
  app.get("/api/hotels/:hotelId/rooms", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId, 10);
      const rooms = await storage.getRoomsByHotelId(hotelId);
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const roomId = parseInt(req.params.id, 10);
      const room = await storage.getRoomById(roomId);
      
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      res.json(room);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Bookings API
  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to book a room" });
    }
    
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Check if room exists
      const room = await storage.getRoomById(bookingData.roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      // Check if hotel exists
      const hotel = await storage.getHotelById(bookingData.hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      
      // Create booking
      const booking = await storage.createBooking({
        ...bookingData,
        userId: req.user.id,
        status: "pending",
        paymentStatus: "pending",
      });
      
      res.status(201).json(booking);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to view bookings" });
    }
    
    try {
      const bookings = await storage.getBookingsByUserId(req.user.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Reviews API
  app.post("/api/hotels/:hotelId/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to post a review" });
    }
    
    try {
      const hotelId = parseInt(req.params.hotelId, 10);
      const { rating, comment } = req.body;
      
      // Validate input
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
      }
      
      // Check if hotel exists
      const hotel = await storage.getHotelById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      
      // Create review
      const review = await storage.createReview({
        userId: req.user.id,
        hotelId,
        rating,
        comment,
      });
      
      res.status(201).json(review);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  app.get("/api/hotels/:hotelId/reviews", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.hotelId, 10);
      
      // Check if hotel exists
      const hotel = await storage.getHotelById(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: "Hotel not found" });
      }
      
      const reviews = await storage.getReviewsByHotelId(hotelId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Simple booking confirmation endpoint to replace Stripe payment
  app.post("/api/confirm-booking", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "You must be logged in to confirm a booking" });
    }
    
    try {
      const { bookingId } = req.body;
      
      if (!bookingId) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }
      
      // Update booking status to confirmed
      const booking = await storage.updateBookingStatus(
        bookingId, 
        "confirmed"
      );
      
      // Update payment status to paid (simulating payment)
      await storage.updatePaymentStatus(
        booking.id,
        "paid"
      );
      
      res.json({
        success: true,
        booking
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
