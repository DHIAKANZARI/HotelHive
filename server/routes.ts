import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertBookingSchema, insertReviewSchema } from "@shared/schema";
import { ObjectId } from "mongodb";

// Extend Express User type
declare global {
  namespace Express {
    interface User {
      id: string;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth setup
  setupAuth(app);

  // Hotels
  app.get("/api/hotels", async (req, res) => {
    try {
      const { city, minPrice, maxPrice, stars, q } = req.query;

      const filters: {
        city?: string;
        minPrice?: number;
        maxPrice?: number;
        stars?: number;
        searchQuery?: string;
      } = {};

      if (city) filters.city = city.toString();
      if (minPrice) filters.minPrice = Number(minPrice);
      if (maxPrice) filters.maxPrice = Number(maxPrice);
      if (stars) filters.stars = Number(stars);
      if (q) filters.searchQuery = q.toString();

      console.log("Filters:", filters); // helpful debug log

      const hotels = await storage.getHotels(filters);
      res.json(hotels);
    } catch (error: any) {
      console.error("Hotel fetch error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hotels/:id", async (req, res) => {
    try {
      const hotelId = req.params.id;
      const hotel = await storage.getHotelById(hotelId);
      if (!hotel) return res.status(404).json({ message: "Hotel not found" });
      res.json(hotel);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rooms
  app.get("/api/hotels/:hotelId/rooms", async (req, res) => {
    try {
      const hotelId = req.params.hotelId;
      const rooms = await storage.getRoomsByHotelId(hotelId);
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/rooms/:id", async (req, res) => {
    try {
      const roomId = req.params.id;
      const room = await storage.getRoomById(roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });
      res.json(room);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Bookings
  app.post("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated?.()) {
      return res.status(401).json({ message: "You must be logged in to book a room" });
    }

    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const room = await storage.getRoomById(bookingData.roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });

      const hotel = await storage.getHotelById(bookingData.hotelId);
      if (!hotel) return res.status(404).json({ message: "Hotel not found" });

      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/bookings", async (req, res) => {
    if (!req.isAuthenticated?.()) {
      return res.status(401).json({ message: "You must be logged in to view bookings" });
    }

    try {
      const bookings = await storage.getBookingsByUserId(req.user!.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reviews
  app.post("/api/hotels/:hotelId/reviews", async (req, res) => {
    if (!req.isAuthenticated?.()) {
      return res.status(401).json({ message: "You must be logged in to post a review" });
    }

    try {
      const hotelId = req.params.hotelId;
      const { rating, comment } = req.body;

      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      const hotel = await storage.getHotelById(hotelId);
      if (!hotel) return res.status(404).json({ message: "Hotel not found" });

      const reviewData = insertReviewSchema.parse({
        userId: req.user!.id,
        hotelId,
        rating,
        comment,
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/hotels/:hotelId/reviews", async (req, res) => {
    try {
      const hotelId = req.params.hotelId;
      const hotel = await storage.getHotelById(hotelId);
      if (!hotel) return res.status(404).json({ message: "Hotel not found" });

      const reviews = await storage.getReviewsByHotelId(hotelId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Confirm booking (simulate payment)
  app.post("/api/confirm-booking", async (req, res) => {
    if (!req.isAuthenticated?.()) {
      return res.status(401).json({ message: "You must be logged in to confirm a booking" });
    }

    try {
      const { bookingId } = req.body;

      if (!bookingId) {
        return res.status(400).json({ message: "Invalid booking ID" });
      }

      const booking = await storage.updateBookingStatus(bookingId, "confirmed");
      await storage.updatePaymentStatus(booking.id, "paid");

      res.json({ success: true, booking });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return createServer(app);
}
