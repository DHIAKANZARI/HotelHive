import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Room, Hotel } from "@/types";
import { Helmet } from "react-helmet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import BookingSummary from "@/components/checkout/BookingSummary";
import { Loader2 } from "lucide-react";

const Checkout = () => {
  const params = useParams<{ roomId: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const roomId = parseInt(params.roomId);
  const [clientSecret, setClientSecret] = useState("");
  const [bookingData, setBookingData] = useState({
    checkInDate: "",
    checkOutDate: "",
    numberOfGuests: 1,
  });
  
  // Get query parameters from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    
    if (searchParams.has("checkIn")) {
      setBookingData(prev => ({ ...prev, checkInDate: searchParams.get("checkIn") || "" }));
    }
    
    if (searchParams.has("checkOut")) {
      setBookingData(prev => ({ ...prev, checkOutDate: searchParams.get("checkOut") || "" }));
    }
    
    if (searchParams.has("guests")) {
      setBookingData(prev => ({ ...prev, numberOfGuests: parseInt(searchParams.get("guests") || "1") }));
    }
  }, []);

  // Fetch room data
  const { data: room, isLoading: isRoomLoading, isError: isRoomError } = useQuery<Room>({
    queryKey: [`/api/rooms/${roomId}`],
    enabled: !!roomId,
  });

  // Fetch hotel data once we have the room
  const { data: hotel, isLoading: isHotelLoading, isError: isHotelError } = useQuery<Hotel>({
    queryKey: [`/api/hotels/${room?.hotelId}`],
    enabled: !!room?.hotelId,
  });

  // Calculate number of nights
  const calculateNights = () => {
    if (!bookingData.checkInDate || !bookingData.checkOutDate) return 1;
    
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 1;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!room) return 0;
    return room.price * calculateNights();
  };

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/bookings", data);
      return await res.json();
    },
    onSuccess: (data) => {
      // Show checkout form
      setClientSecret("confirmed");
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle booking submission
  const handleBooking = () => {
    if (!room || !hotel) {
      toast({
        title: "Error",
        description: "Room or hotel information is missing",
        variant: "destructive",
      });
      return;
    }
    
    // Create booking
    createBookingMutation.mutate({
      roomId: room.id,
      hotelId: hotel.id,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      numberOfGuests: bookingData.numberOfGuests,
      totalPrice: calculateTotalPrice(),
      status: "pending",
      paymentStatus: "pending",
    });
  };

  // Handle booking confirmation
  const handleBookingConfirmation = (bookingId: number) => {
    navigate(`/booking-confirmation/${bookingId}`);
  };

  if (isRoomLoading || isHotelLoading) {
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

  if (isRoomError || isHotelError || !room || !hotel) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center min-h-screen px-4">
          <h2 className="text-2xl font-bold mb-4">Room Not Found</h2>
          <p className="text-neutral-600 mb-6 text-center">
            The room you're trying to book doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/hotels")}
            className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
          >
            Browse Hotels
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Hootili</title>
        <meta
          name="description"
          content="Complete your booking and secure your reservation."
        />
      </Helmet>
      
      <Navbar />
      
      <main className="bg-neutral-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8 font-heading">Complete Your Booking</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 font-heading">Booking Details</h2>
                
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Selected Room</h3>
                  <div className="flex items-center p-4 border border-neutral-200 rounded-md">
                    <div className="flex-shrink-0 w-24 h-24 bg-neutral-100 rounded-md overflow-hidden mr-4">
                      <img
                        src={room.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80"}
                        alt={room.roomType}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{room.roomType}</p>
                      <p className="text-neutral-600 text-sm">{hotel.name}</p>
                      <p className="text-neutral-600 text-sm">{hotel.address}, {hotel.city}</p>
                    </div>
                  </div>
                </div>
                
                {/* If booking is created, show confirmation form */}
                {clientSecret ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 font-heading">Confirm Booking</h2>
                    <CheckoutForm
                      bookingId={createBookingMutation.data?.id}
                      onPaymentSuccess={handleBookingConfirmation}
                    />
                  </div>
                ) : (
                  <BookingSummary
                    room={room}
                    hotel={hotel}
                    bookingData={bookingData}
                    setBookingData={setBookingData}
                    calculateNights={calculateNights}
                    calculateTotalPrice={calculateTotalPrice}
                    onBookNow={handleBooking}
                    isLoading={createBookingMutation.isPending}
                  />
                )}
              </div>
            </div>
            
            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-xl font-semibold mb-4 font-heading">Price Summary</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">
                      {room.price} x {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
                    </span>
                    <span>${(room.price * calculateNights()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Taxes and fees</span>
                    <span>Included</span>
                  </div>
                </div>
                
                <div className="border-t border-neutral-200 pt-4 mb-6">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="bg-neutral-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Cancellation Policy</h3>
                  <p className="text-sm text-neutral-600">
                    Free cancellation up to 48 hours before check-in. After that, you will be charged the first night's stay.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Checkout;
