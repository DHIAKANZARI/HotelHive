import { useState } from "react";
import { useLocation } from "wouter";
import { Room } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Maximize2, 
  CheckCircle,
  Coffee,
  Wifi,
  Tv,
  Wind,
  Utensils
} from "lucide-react";

interface RoomCardProps {
  room: Room;
  checkInDate: string;
  checkOutDate: string;
  hotelId: number;
}

const RoomCard = ({ room, checkInDate, checkOutDate, hotelId }: RoomCardProps) => {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [extraOptions, setExtraOptions] = useState({
    breakfast: false,
    parking: false,
    wifi: false,
  });

  // Calculate nights
  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 1;
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 1;
  };

  // Get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    
    if (amenityLower.includes("wifi") || amenityLower.includes("internet")) {
      return <Wifi className="h-4 w-4 mr-2 text-neutral-400" />;
    } else if (amenityLower.includes("tv") || amenityLower.includes("television")) {
      return <Tv className="h-4 w-4 mr-2 text-neutral-400" />;
    } else if (amenityLower.includes("ac") || amenityLower.includes("air")) {
      return <Wind className="h-4 w-4 mr-2 text-neutral-400" />;
    } else if (amenityLower.includes("breakfast") || amenityLower.includes("coffee")) {
      return <Coffee className="h-4 w-4 mr-2 text-neutral-400" />;
    } else if (amenityLower.includes("minibar") || amenityLower.includes("fridge")) {
      return <Utensils className="h-4 w-4 mr-2 text-neutral-400" />;
    } else {
      return <CheckCircle className="h-4 w-4 mr-2 text-neutral-400" />;
    }
  };

  // Handle booking
  const handleBookNow = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a room",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    // Navigate to checkout page with parameters
    const params = new URLSearchParams();
    params.append("checkIn", checkInDate);
    params.append("checkOut", checkOutDate);
    params.append("guests", room.capacity.toString());
    
    // Add extra options if selected
    if (extraOptions.breakfast) params.append("breakfast", "true");
    if (extraOptions.parking) params.append("parking", "true");
    if (extraOptions.wifi) params.append("wifi", "true");
    
    navigate(`/checkout/${room.id}?${params.toString()}`);
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    let price = room.price * calculateNights();
    
    // Add extra options
    if (extraOptions.breakfast) price += 15 * calculateNights();
    if (extraOptions.parking) price += 10 * calculateNights();
    if (extraOptions.wifi) price += 5 * calculateNights();
    
    return price;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Room Image */}
        <div className="md:w-1/3">
          <div className="h-48 md:h-full rounded-md overflow-hidden">
            <img
              src={room.imageUrl || "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80"}
              alt={room.roomType}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* Room Details */}
        <div className="md:w-2/3">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold font-heading">{room.roomType}</h3>
            <div className="flex flex-col items-end">
              <div className="text-xl font-bold">${room.price}<span className="text-sm font-normal text-neutral-500">/night</span></div>
              <div className="text-sm text-neutral-500">
                ${calculateTotalPrice()} total for {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
              </div>
            </div>
          </div>
          
          <p className="text-neutral-600 mt-2 mb-4">{room.description}</p>
          
          {/* Room Features */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-neutral-400" />
              <span className="text-sm">{room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
            </div>
            <div className="flex items-center">
              <Maximize2 className="h-4 w-4 mr-2 text-neutral-400" />
              <span className="text-sm">
                {/* This is usually provided in real data, mocked for now */}
                {room.roomType.includes("Suite") ? "45m²" : room.roomType.includes("Deluxe") ? "35m²" : "25m²"}
              </span>
            </div>
            
            {room.amenities?.slice(0, 4).map((amenity, index) => (
              <div key={index} className="flex items-center">
                {getAmenityIcon(amenity)}
                <span className="text-sm">{amenity}</span>
              </div>
            ))}
          </div>
          
          {/* Extra Options */}
          <div className="bg-neutral-50 rounded-md p-3 mb-4">
            <h4 className="text-sm font-medium mb-2">Extra Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="flex items-center">
                <Checkbox
                  id={`breakfast-${room.id}`}
                  checked={extraOptions.breakfast}
                  onCheckedChange={(checked) => 
                    setExtraOptions({ ...extraOptions, breakfast: checked as boolean })
                  }
                />
                <Label htmlFor={`breakfast-${room.id}`} className="ml-2 text-sm">
                  Breakfast (+$15/night)
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id={`parking-${room.id}`}
                  checked={extraOptions.parking}
                  onCheckedChange={(checked) => 
                    setExtraOptions({ ...extraOptions, parking: checked as boolean })
                  }
                />
                <Label htmlFor={`parking-${room.id}`} className="ml-2 text-sm">
                  Parking (+$10/night)
                </Label>
              </div>
              <div className="flex items-center">
                <Checkbox
                  id={`wifi-${room.id}`}
                  checked={extraOptions.wifi}
                  onCheckedChange={(checked) => 
                    setExtraOptions({ ...extraOptions, wifi: checked as boolean })
                  }
                />
                <Label htmlFor={`wifi-${room.id}`} className="ml-2 text-sm">
                  Premium WiFi (+$5/night)
                </Label>
              </div>
            </div>
          </div>
          
          {/* Booking Button */}
          <Button onClick={handleBookNow} className="w-full">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
