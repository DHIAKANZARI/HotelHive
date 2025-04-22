import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hootili';

// Connect to MongoDB
export const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    mongoose.set('strictQuery', false);
    
    // Set connection options with timeout
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 seconds to select server
      connectTimeoutMS: 10000, // 10 seconds to establish connection
      socketTimeoutMS: 45000, // 45 seconds for operations
    });
    
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Check your MongoDB URI and make sure the database is accessible');
    console.warn('Application will continue without MongoDB connection');
    
    // Don't exit the process, we'll use a fallback storage
    return false;
  }
};

// Define schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String },
  phoneNumber: { type: String },
  isAdmin: { type: Boolean, default: false },
  stripeCustomerId: { type: String }
});

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  rating: { type: Number, default: 0 },
  stars: { type: Number, default: 3 },
  imageUrl: { type: String },
  amenities: [{ type: String }],
  reviewCount: { type: Number, default: 0 }
});

const RoomSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  roomType: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  capacity: { type: Number, required: true },
  available: { type: Boolean, default: true },
  imageUrl: { type: String },
  amenities: [{ type: String }]
});

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  checkInDate: { type: String, required: true },
  checkOutDate: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  numberOfGuests: { type: Number, required: true },
  status: { type: String, default: 'pending', required: true },
  paymentStatus: { type: String, default: 'pending', required: true },
  paymentIntentId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Create models
export const User = mongoose.model('User', UserSchema);
export const Hotel = mongoose.model('Hotel', HotelSchema);
export const Room = mongoose.model('Room', RoomSchema);
export const Booking = mongoose.model('Booking', BookingSchema);
export const Review = mongoose.model('Review', ReviewSchema);

// Export the database connection
export default mongoose;