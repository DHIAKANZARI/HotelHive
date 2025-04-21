import { useState } from "react";
import { Room, Hotel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookingSummaryProps {
  room: Room;
  hotel: Hotel;
  bookingData: {
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
  };
  setBookingData: React.Dispatch<React.SetStateAction<{
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
  }>>;
  calculateNights: () => number;
  calculateTotalPrice: () => number;
  onBookNow: () => void;
  isLoading: boolean;
}

const BookingSummary = ({
  room,
  hotel,
  bookingData,
  setBookingData,
  calculateNights,
  calculateTotalPrice,
  onBookNow,
  isLoading,
}: BookingSummaryProps) => {
  const { toast } = useToast();
  const [guestDetails, setGuestDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setGuestDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= room.capacity) {
      setBookingData((prev) => ({ ...prev, numberOfGuests: value }));
    } else {
      toast({
        title: "Invalid guest count",
        description: `This room can accommodate up to ${room.capacity} guests`,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const today = new Date();
    
    // Clear time portion for comparison
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      toast({
        title: "Invalid check-in date",
        description: "Check-in date cannot be in the past",
        variant: "destructive",
      });
      return;
    }
    
    if (checkOut <= checkIn) {
      toast({
        title: "Invalid check-out date",
        description: "Check-out date must be after check-in date",
        variant: "destructive",
      });
      return;
    }
    
    // Validate form inputs
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestDetails.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Proceed with booking
    onBookNow();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Stay Dates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="checkInDate" className="block text-sm text-neutral-600 mb-1">
              Check-in Date*
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                id="checkInDate"
                name="checkInDate"
                type="date"
                value={bookingData.checkInDate}
                onChange={handleDateChange}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="checkOutDate" className="block text-sm text-neutral-600 mb-1">
              Check-out Date*
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                id="checkOutDate"
                name="checkOutDate"
                type="date"
                value={bookingData.checkOutDate}
                onChange={handleDateChange}
                className="pl-10"
                required
              />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-3">Guest Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm text-neutral-600 mb-1">
              First Name*
            </label>
            <Input
              id="firstName"
              name="firstName"
              value={guestDetails.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm text-neutral-600 mb-1">
              Last Name*
            </label>
            <Input
              id="lastName"
              name="lastName"
              value={guestDetails.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-neutral-600 mb-1">
              Email Address*
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={guestDetails.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm text-neutral-600 mb-1">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              value={guestDetails.phone}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-medium mb-3">Number of Guests</h3>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
          <Input
            id="numberOfGuests"
            name="numberOfGuests"
            type="number"
            min={1}
            max={room.capacity}
            value={bookingData.numberOfGuests}
            onChange={handleGuestsChange}
            className="pl-10"
            required
          />
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          This room can accommodate up to {room.capacity} guests
        </p>
      </div>
      
      <div>
        <h3 className="font-medium mb-3">Special Requests</h3>
        <textarea
          id="specialRequests"
          name="specialRequests"
          value={guestDetails.specialRequests}
          onChange={handleInputChange}
          rows={3}
          className="w-full rounded-md border-neutral-300 focus:border-primary focus:ring-primary resize-none"
          placeholder="Special requests (optional)"
        ></textarea>
      </div>
      
      <div className="border-t border-neutral-200 pt-4">
        <div className="flex items-center justify-between mb-2">
          <span>Room Rate:</span>
          <span>${room.price} per night</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span>Duration:</span>
          <span>{calculateNights()} nights</span>
        </div>
        <div className="flex items-center justify-between font-semibold text-lg mt-4">
          <span>Total:</span>
          <span>${calculateTotalPrice().toFixed(2)}</span>
        </div>
        <p className="text-sm text-neutral-500 mt-1 mb-4">
          Taxes and fees included
        </p>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Continue to Payment"
          )}
        </Button>
      </div>
    </form>
  );
};

export default BookingSummary;
