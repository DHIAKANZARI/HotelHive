import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Booking, Hotel, Room } from "@/types";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  CheckCircle, 
  ChevronRight, 
  Clock, 
  Loader2, 
  MapPin, 
  Users 
} from "lucide-react";
import { format } from "date-fns";

const BookingConfirmation = () => {
  const params = useParams<{ bookingId: string }>();
  const [_, navigate] = useLocation();
  const bookingId = parseInt(params.bookingId);

  // Fetch booking details
  const { data: booking, isLoading: isBookingLoading, isError: isBookingError } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
  });

  // Fetch hotel details once we have the booking
  const { data: hotel, isLoading: isHotelLoading } = useQuery<Hotel>({
    queryKey: [`/api/hotels/${booking?.hotelId}`],
    enabled: !!booking?.hotelId,
  });

  // Fetch room details once we have the booking
  const { data: room, isLoading: isRoomLoading } = useQuery<Room>({
    queryKey: [`/api/rooms/${booking?.roomId}`],
    enabled: !!booking?.roomId,
  });

  const isLoading = isBookingLoading || isHotelLoading || isRoomLoading;
  const isError = isBookingError || !booking;

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Calculate nights
  const calculateNights = (checkIn: string, checkOut: string) => {
    try {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch (error) {
      return 1;
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center min-h-screen px-4">
          <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
          <p className="text-neutral-600 mb-6 text-center">
            The booking you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            View My Bookings
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Booking Confirmation - Hootili</title>
        <meta
          name="description"
          content="Your hotel booking has been confirmed. View your reservation details."
        />
      </Helmet>
      
      <Navbar />
      
      <main className="bg-neutral-50 min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Banner */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-center mb-8">
            <CheckCircle className="h-8 w-8 text-green-500 mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-green-800 font-heading">
                Your booking is confirmed!
              </h2>
              <p className="text-green-700">
                An email with your booking details has been sent to your email address.
              </p>
            </div>
          </div>
          
          {/* Booking Reference */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold font-heading">Booking Details</h2>
              <span className="text-sm text-neutral-500">
                Reference: #{booking.id}
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center border-b border-neutral-200 pb-4 mb-4">
              <div className="flex-shrink-0 w-full md:w-24 h-24 bg-neutral-100 rounded-md overflow-hidden mb-4 md:mb-0 md:mr-4">
                <img
                  src={room?.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80"}
                  alt={room?.roomType || "Room"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow">
                <h3 className="font-semibold text-lg">{hotel?.name}</h3>
                <div className="flex items-center text-neutral-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <p className="text-sm">{hotel?.address}, {hotel?.city}, Tunisia</p>
                </div>
                <p className="mt-2 font-medium">{room?.roomType}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-neutral-500 mr-2" />
                  <span className="font-medium">Check-in</span>
                </div>
                <p>{formatDate(booking.checkInDate)}</p>
              </div>
              
              <div>
                <div className="flex items-center mb-3">
                  <Calendar className="h-5 w-5 text-neutral-500 mr-2" />
                  <span className="font-medium">Check-out</span>
                </div>
                <p>{formatDate(booking.checkOutDate)}</p>
              </div>
              
              <div>
                <div className="flex items-center mb-3">
                  <Clock className="h-5 w-5 text-neutral-500 mr-2" />
                  <span className="font-medium">Duration</span>
                </div>
                <p>{calculateNights(booking.checkInDate, booking.checkOutDate)} nights</p>
              </div>
              
              <div>
                <div className="flex items-center mb-3">
                  <Users className="h-5 w-5 text-neutral-500 mr-2" />
                  <span className="font-medium">Guests</span>
                </div>
                <p>{booking.numberOfGuests} {booking.numberOfGuests === 1 ? 'guest' : 'guests'}</p>
              </div>
            </div>
            
            <div className="border-t border-neutral-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-neutral-600">Room Price</span>
                <span>${room?.price.toFixed(2)} per night</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-neutral-600">
                  {room?.price.toFixed(2)} x {calculateNights(booking.checkInDate, booking.checkOutDate)} nights
                </span>
                <span>
                  ${(room?.price || 0) * calculateNights(booking.checkInDate, booking.checkOutDate)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-neutral-600">Taxes and fees</span>
                <span>Included</span>
              </div>
              <div className="border-t border-neutral-200 pt-4 mt-4">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>${booking.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 font-heading">Payment Information</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Payment Status</p>
                  <p className="text-sm text-neutral-600">{booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium text-right">${booking.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button onClick={() => navigate("/dashboard")} className="flex-1">
              View My Bookings
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="flex-1">
              Print Confirmation
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default BookingConfirmation;
