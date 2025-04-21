import { useQuery } from "@tanstack/react-query";
import { Hotel } from "@/types";
import { Link } from "wouter";
import HotelCard from "./HotelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

const FeaturedHotels = () => {
  const { data: hotels, isLoading } = useQuery<Hotel[]>({
    queryKey: ["/api/hotels"],
  });

  // Show only the first 3 hotels for the featured section
  const featuredHotels = hotels?.slice(0, 3);

  return (
    <div className="py-12 bg-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 font-heading">
            Featured Hotels
          </h2>
          <Link href="/hotels">
            <a className="text-primary hover:text-primary-dark font-medium flex items-center">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-2/4 mb-4" />
                  <Skeleton className="h-4 w-1/4 mb-2" />
                  <div className="border-t border-neutral-200 my-4"></div>
                  <div className="flex justify-between">
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-10 w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {featuredHotels?.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedHotels;
