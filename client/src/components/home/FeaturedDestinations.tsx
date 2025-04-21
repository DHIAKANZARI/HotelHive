import { Destination } from "@/types";
import DestinationCard from "./DestinationCard";

const FeaturedDestinations = () => {
  const destinations: Destination[] = [
    {
      city: "Hammamet",
      image: "https://images.unsplash.com/photo-1565689876697-e467b6c54da2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=350&q=80",
      properties: 142,
    },
    {
      city: "Djerba",
      image: "https://images.unsplash.com/photo-1548574505-12caf0050b5b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=350&q=80",
      properties: 98,
    },
    {
      city: "Tunis",
      image: "https://images.unsplash.com/photo-1587974958419-b11437e65896?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=350&q=80",
      properties: 215,
    },
  ];

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 font-heading">
            Popular Destinations
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-neutral-500 sm:mt-4">
            Discover Tunisia's most beloved travel spots
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination, index) => (
            <DestinationCard key={index} destination={destination} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedDestinations;
