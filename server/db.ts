import dotenv from "dotenv";
import { MongoClient } from "mongodb";

// Load environment variables from .env file
dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export const db = client.db("hootili");

// Connect to MongoDB
client.connect().catch((err) => {
  console.error("Failed to connect to MongoDB", err);
  process.exit(1);
});

// Export types
export type { User, InsertUser } from "@shared/schema";
export type { Hotel, InsertHotel } from "@shared/schema";
export type { Room, InsertRoom } from "@shared/schema";
export type { Booking, InsertBooking } from "@shared/schema";
export type { Review, InsertReview } from "@shared/schema";