import { pgTable, text, serial, integer, boolean, date, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  isAdmin: boolean("is_admin").default(false),
  stripeCustomerId: text("stripe_customer_id"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  phoneNumber: true,
});

// Hotel schema
export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  rating: doublePrecision("rating"),
  stars: integer("stars"),
  imageUrl: text("image_url"),
  amenities: text("amenities").array(),
  reviewCount: integer("review_count").default(0),
});

export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
});

// Room schema
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  hotelId: integer("hotel_id").notNull(),
  roomType: text("room_type").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  capacity: integer("capacity").notNull(),
  available: boolean("available").default(true),
  imageUrl: text("image_url"),
  amenities: text("amenities").array(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
});

// Booking schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  roomId: integer("room_id").notNull(),
  hotelId: integer("hotel_id").notNull(),
  checkInDate: date("check_in_date").notNull(),
  checkOutDate: date("check_out_date").notNull(),
  totalPrice: doublePrecision("total_price").notNull(),
  numberOfGuests: integer("number_of_guests").notNull(),
  status: text("status").notNull(), // confirmed, cancelled, pending
  paymentStatus: text("payment_status").notNull(), // paid, pending
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

// Review schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  hotelId: integer("hotel_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertHotel = z.infer<typeof insertHotelSchema>;
export type Hotel = typeof hotels.$inferSelect;

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
