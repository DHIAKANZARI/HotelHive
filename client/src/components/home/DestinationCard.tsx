import { Destination } from "@/types";
import { Link } from "wouter";

interface DestinationCardProps {
  destination: Destination;
}

const DestinationCard = ({ destination }: DestinationCardProps) => {
  return (
    <Link href={`/hotels?city=${destination.city}`}>
      <a className="rounded-lg shadow-md overflow-hidden hotel-card-animation">
        <div className="relative h-48">
          <img
            className="w-full h-full object-cover"
            src={destination.image}
            alt={`${destination.city}, Tunisia`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black opacity-70"></div>
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h3 className="text-xl font-bold font-heading">{destination.city}</h3>
            <p className="text-sm">{destination.properties} properties</p>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default DestinationCard;
