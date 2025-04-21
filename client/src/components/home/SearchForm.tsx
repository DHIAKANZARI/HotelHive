import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HotelFilters } from "@/types";

const SearchForm = () => {
  const [_, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState<HotelFilters>({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: 1,
  });

  useEffect(() => {
    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    setSearchParams(prev => ({
      ...prev,
      checkIn: formatDate(today),
      checkOut: formatDate(tomorrow),
    }));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create query string
    const queryParams = new URLSearchParams();
    if (searchParams.city) queryParams.set("city", searchParams.city);
    if (searchParams.checkIn) queryParams.set("checkIn", searchParams.checkIn);
    if (searchParams.checkOut) queryParams.set("checkOut", searchParams.checkOut);
    if (searchParams.guests) queryParams.set("guests", searchParams.guests.toString());
    
    // Navigate to hotels page with search params
    setLocation(`/hotels?${queryParams.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <div className="md:col-span-1">
            <label htmlFor="city" className="block text-sm font-medium text-neutral-700">
              Destination
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-neutral-400" />
              </div>
              <Input
                type="text"
                name="city"
                id="city"
                value={searchParams.city}
                onChange={handleInputChange}
                className="pl-10 py-3"
                placeholder="Where are you going?"
              />
            </div>
          </div>
          
          <div className="md:col-span-1">
            <label htmlFor="checkIn" className="block text-sm font-medium text-neutral-700">
              Check In
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-neutral-400" />
              </div>
              <Input
                type="date"
                name="checkIn"
                id="checkIn"
                value={searchParams.checkIn}
                onChange={handleInputChange}
                className="pl-10 py-3 custom-date-picker"
              />
            </div>
          </div>
          
          <div className="md:col-span-1">
            <label htmlFor="checkOut" className="block text-sm font-medium text-neutral-700">
              Check Out
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-neutral-400" />
              </div>
              <Input
                type="date"
                name="checkOut"
                id="checkOut"
                value={searchParams.checkOut}
                onChange={handleInputChange}
                className="pl-10 py-3 custom-date-picker"
              />
            </div>
          </div>
          
          <div className="md:col-span-1">
            <label htmlFor="guests" className="block text-sm font-medium text-neutral-700">
              Guests
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-neutral-400" />
              </div>
              <Select 
                value={searchParams.guests?.toString()} 
                onValueChange={(value) => handleSelectChange("guests", value)}
              >
                <SelectTrigger className="pl-10 py-6">
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Adult</SelectItem>
                  <SelectItem value="2">2 Adults</SelectItem>
                  <SelectItem value="3">2 Adults, 1 Child</SelectItem>
                  <SelectItem value="4">2 Adults, 2 Children</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <label className="invisible block text-sm font-medium text-neutral-700">
              Search
            </label>
            <Button 
              type="submit" 
              className="mt-1 w-full py-6 hotel-card-animation"
            >
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchForm;
