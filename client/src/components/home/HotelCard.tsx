import { Hotel } from "@/types";
import { Link } from "wouter";
import { MapPin, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HotelCardProps {
  hotel: Hotel;
}

const HotelCard = ({ hotel }: HotelCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hotel-card-animation">
      <div className="relative">
        <img
          src={hotel.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80"}
          alt={hotel.name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-white rounded-full p-2">
          <Heart className="h-5 w-5 text-neutral-400 hover:text-secondary cursor-pointer" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold text-lg font-heading">{hotel.name}</h3>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 text-neutral-400 mr-1" />
              <p className="text-sm text-neutral-500">{hotel.city}, Tunisia</p>
            </div>
          </div>
          <div>
            <div className="flex items-center bg-primary-light text-primary px-2 py-1 rounded">
              <span className="font-bold mr-1">{hotel.rating?.toFixed(1)}</span>
              <span className="text-sm">
                {hotel.rating && hotel.rating >= 9
                  ? "Superb"
                  : hotel.rating && hotel.rating >= 8.5
                  ? "Exceptional"
                  : hotel.rating && hotel.rating >= 8
                  ? "Excellent"
                  : "Very Good"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center mt-2">
          <div className="flex text-secondary">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < (hotel.stars || 0) ? "fill-current" : ""
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-neutral-500">
            {hotel.reviewCount} reviews
          </span>
        </div>
        <div className="border-t border-neutral-200 my-4"></div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-neutral-500">Starting from</p>
            <p className="text-xl font-bold text-neutral-900">
              $120{" "}
              <span className="text-sm font-normal text-neutral-500">
                / night
              </span>
            </p>
          </div>
          <Link href={`/hotels/${hotel.id}`}>
            <Button>View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
