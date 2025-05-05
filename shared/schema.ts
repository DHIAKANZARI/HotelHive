import { z } from "zod";
import { ObjectId } from "mongodb";

// Convert ObjectId to/from string for Zod
const objectIdSchema = z.string().transform((str) => new ObjectId(str));

// Base schema for MongoDB documents
const baseSchema = z.object({
  _id: objectIdSchema.optional(),
  id: z.string().optional(),
});

// Transform function to add id from _id
const addIdFromObjectId = (data: any) => {
  if (data._id && !data.id) {
    return { ...data, id: data._id.toString() };
  }
  return data;
};

// User schema
const rawUserSchema = baseSchema.extend({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
  fullName: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  isAdmin: z.boolean().default(false),
  stripeCustomerId: z.string().nullable(),
});

export const userSchema = rawUserSchema.transform(addIdFromObjectId);
export const insertUserSchema = rawUserSchema.omit({ _id: true, id: true });

// Hotel schema
const rawHotelSchema = baseSchema.extend({
  name: z.string(),
  description: z.string(),
  location: z.string(),
  city: z.string(),
  address: z.string(),
  rating: z.number().nullable(),
  stars: z.number().nullable(),
  imageUrl: z.string().nullable(),
  amenities: z.array(z.string()).nullable(),
  reviewCount: z.number().default(0),
});

export const hotelSchema = rawHotelSchema.transform(addIdFromObjectId);
export const insertHotelSchema = rawHotelSchema.omit({ _id: true, id: true });

// Room schema
const rawRoomSchema = baseSchema.extend({
  hotelId: z.string(),
  roomType: z.string(),
  description: z.string(),
  price: z.number(),
  capacity: z.number(),
  available: z.boolean().default(true),
  imageUrl: z.string().nullable(),
  amenities: z.array(z.string()).nullable(),
});

export const roomSchema = rawRoomSchema.transform(addIdFromObjectId);
export const insertRoomSchema = rawRoomSchema.omit({ _id: true, id: true });

// Booking schema
const rawBookingSchema = baseSchema.extend({
  hotelId: z.string(),
  userId: z.string(),
  roomId: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  totalPrice: z.number(),
  numberOfGuests: z.number(),
  status: z.string(),
  paymentStatus: z.string(),
  paymentIntentId: z.string().nullable(),
  createdAt: z.date().nullable(),
});

export const bookingSchema = rawBookingSchema.transform(addIdFromObjectId);
export const insertBookingSchema = rawBookingSchema.omit({ _id: true, id: true, status: true, paymentStatus: true, paymentIntentId: true, createdAt: true });

// Review schema
const rawReviewSchema = baseSchema.extend({
  hotelId: z.string(),
  userId: z.string(),
  rating: z.number(),
  comment: z.string(),
  createdAt: z.date(),
});

export const reviewSchema = rawReviewSchema.transform(addIdFromObjectId);
export const insertReviewSchema = rawReviewSchema.omit({ _id: true, id: true, createdAt: true });

// Export types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Hotel = z.infer<typeof hotelSchema>;
export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type Room = z.infer<typeof roomSchema>;
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Booking = z.infer<typeof bookingSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
