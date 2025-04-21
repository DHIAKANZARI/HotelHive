import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Booking, Hotel, Room } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BookingCardProps {
  booking: Booking;
  isPast?: boolean;
  isCancelled?: boolean;
}

const BookingCard = ({ booking, isPast = false, isCancelled = false }: BookingCardProps) => {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch hotel details
  const { data: hotel, isLoading: isHotelLoading } = useQuery<Hotel>({
    queryKey: [`/api/hotels/${booking.hotelId}`],
  });

  // Fetch room details
  const { data: room, isLoading: isRoomLoading } = useQuery<Room>({
    queryKey: [`/api/rooms/${booking.roomId}`],
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/bookings/${booking.id}/cancel`, {});
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been successfully cancelled.",
      });
      
      // Invalidate bookings query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Format date as Month Day, Year
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Calculate nights
  const calculateNights = () => {
    try {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch (error) {
      return 1;
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = () => {
    cancelBookingMutation.mutate();
    setIsDialogOpen(false);
  };

  const handleViewBooking = () => {
    navigate(`/booking-confirmation/${booking.id}`);
  };

  if (isHotelLoading || isRoomLoading) {
    return (
      <div className="flex justify-center p-6 border rounded-lg shadow-sm bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <div className="flex items-center text-red-600 mb-2">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Booking information unavailable</span>
        </div>
        <p className="text-neutral-500 text-sm">
          Could not load the booking details for booking #{booking.id}
        </p>
      </div>
    );
  }

  return (
    <div className={`p-6 border rounded-lg shadow-sm ${isCancelled ? 'bg-neutral-50' : 'bg-white'}`}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: Image */}
        <div className="md:w-1/4 lg:w-1/5">
          <div className="h-24 md:h-full rounded-md overflow-hidden">
            <img
              src={hotel.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80"}
              alt={hotel.name}
              className={`w-full h-full object-cover ${isCancelled ? 'opacity-60' : ''}`}
            />
          </div>
        </div>
        
        {/* Middle: Details */}
        <div className="md:w-2/4 lg:w-3/5">
          <h3 className="text-lg font-semibold font-heading">{hotel.name}</h3>
          <div className="flex items-center text-neutral-600 text-sm mt-1">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span>{hotel.city}, Tunisia</span>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 text-neutral-500 mr-1" />
              <span>
                {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
              </span>
            </div>
            <div>
              <span className="text-neutral-500">Room:</span> {room.roomType}
            </div>
            <div>
              <span className="text-neutral-500">Guests:</span> {booking.numberOfGuests}
            </div>
            <div>
              <span className="text-neutral-500">Nights:</span> {calculateNights()}
            </div>
          </div>
          
          {isCancelled && (
            <div className="mt-3 text-red-600 text-sm font-medium">
              This booking was cancelled
            </div>
          )}
          
          {isPast && !isCancelled && (
            <div className="mt-3 text-neutral-600 text-sm">
              Stay completed on {formatDate(booking.checkOutDate)}
            </div>
          )}
        </div>
        
        {/* Right: Price and Actions */}
        <div className="md:w-1/4 lg:w-1/5 flex flex-col justify-between">
          <div className="text-right">
            <div className="font-semibold">${booking.totalPrice.toFixed(2)}</div>
            <div className="text-sm text-neutral-500">
              {booking.paymentStatus === 'paid' ? 'Paid' : 'Payment pending'}
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleViewBooking}
            >
              View Details
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            
            {!isPast && !isCancelled && (
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    disabled={cancelBookingMutation.isPending}
                  >
                    {cancelBookingMutation.isPending ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Booking"
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Your Booking</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your booking at {hotel.name}? 
                      This action cannot be undone and refunds will be processed according 
                      to the cancellation policy.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleCancelBooking}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Yes, Cancel Booking
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
