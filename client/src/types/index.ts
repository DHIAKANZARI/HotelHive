// User types
export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  isAdmin: boolean;
  stripeCustomerId?: string;
}

// Hotel types
export interface Hotel {
  id: number;
  name: string;
  description: string;
  location: string;
  city: string;
  address: string;
  rating?: number;
  stars?: number;
  imageUrl?: string;
  amenities?: string[];
  reviewCount?: number;
}

// Room types
export interface Room {
  id: number;
  hotelId: number;
  roomType: string;
  description: string;
  price: number;
  capacity: number;
  available: boolean;
  imageUrl?: string;
  amenities?: string[];
}

// Booking types
export interface Booking {
  id: number;
  userId: number;
  roomId: number;
  hotelId: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  numberOfGuests: number;
  status: string;
  paymentStatus: string;
  paymentIntentId?: string;
  createdAt: string;
}

export interface BookingFormData {
  roomId: number;
  hotelId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
}

// Review types
export interface Review {
  id: number;
  userId: number;
  hotelId: number;
  rating: number;
  comment?: string;
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
  id: number;
  name: string;
  hotel: string;
  location: string;
  comment: string;
  rating: number;
  avatar: string;
}
