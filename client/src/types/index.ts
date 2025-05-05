// User types
export interface User {
  id: string;
  _id?: string;
  username: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  isAdmin: boolean;
  stripeCustomerId: string | null;
}

// Hotel types
export interface Hotel {
  id: string;
  _id?: string;
  name: string;
  description: string;
  location: string;
  city: string;
  address: string;
  rating: number | null;
  stars: number | null;
  imageUrl: string | null;
  amenities: string[] | null;
  reviewCount: number;
}

// Room types
export interface Room {
  id: string;
  _id?: string;
  hotelId: string;
  roomType: string;
  description: string;
  price: number;
  capacity: number;
  available: boolean;
  imageUrl: string | null;
  amenities: string[] | null;
}

// Booking types
export interface Booking {
  id: string;
  _id?: string;
  userId: string;
  roomId: string;
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  numberOfGuests: number;
  status: string;
  paymentStatus: string;
  paymentIntentId: string | null;
  createdAt: string;
}

export interface BookingFormData {
  roomId: string;
  hotelId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
}

// Review types
export interface Review {
  id: string;
  _id?: string;
  userId: string;
  hotelId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Search filters
export interface HotelFilters {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  stars?: number;
  searchQuery?: string;
}

// Destination type for homepage
export interface Destination {
  city: string;
  image: string;
  properties: number;
}

// Testimonial type for homepage
export interface Testimonial {
  id: string;
  hotel: string;
  location: string;
  comment: string;
  rating: number;
  avatar: string;
}
