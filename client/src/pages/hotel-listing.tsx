import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Hotel, HotelFilters } from "@/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HotelCard from "@/components/home/HotelCard";
import HotelFilter from "@/components/hotels/HotelFilter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const HotelListing = () => {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState<HotelFilters>({});
  const [searchQuery, setSearchQuery] = useState("");

  // Parse URL search params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filters: HotelFilters = {};

    if (params.has("city")) filters.city = params.get("city") || undefined;
    if (params.has("checkIn")) filters.checkIn = params.get("checkIn") || undefined;
    if (params.has("checkOut")) filters.checkOut = params.get("checkOut") || undefined;
    if (params.has("guests")) filters.guests = parseInt(params.get("guests") || "0") || undefined;
    if (params.has("minPrice")) filters.minPrice = parseInt(params.get("minPrice") || "0") || undefined;
    if (params.has("maxPrice")) filters.maxPrice = parseInt(params.get("maxPrice") || "0") || undefined;
    if (params.has("stars")) filters.stars = parseInt(params.get("stars") || "0") || undefined;
    if (params.has("q")) {
      filters.searchQuery = params.get("q") || undefined;
      setSearchQuery(params.get("q") || "");
    }

    setSearchParams(filters);
  }, [location]);

  // Build query parameters for the API request
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchParams.city) params.append("city", searchParams.city);
    if (searchParams.minPrice) params.append("minPrice", searchParams.minPrice.toString());
    if (searchParams.maxPrice) params.append("maxPrice", searchParams.maxPrice.toString());
    if (searchParams.stars) params.append("stars", searchParams.stars.toString());
    if (searchParams.searchQuery) params.append("q", searchParams.searchQuery);
    
    return params.toString();
  };

  // Fetch hotels with filters
  const { data: hotels, isLoading, isError } = useQuery<Hotel[]>({
    queryKey: ["/api/hotels", searchParams],
    queryFn: async () => {
      const queryString = buildQueryParams();
      const response = await fetch(`/api/hotels${queryString ? `?${queryString}` : ""}`);
      if (!response.ok) {
        throw new Error("Failed to fetch hotels");
      }
      return response.json();
    },
  });

  // Handle filter changes
  const handleFilterChange = (filters: HotelFilters) => {
    setSearchParams((prev) => ({ ...prev, ...filters }));
    
    // Update URL with new search params
    const params = new URLSearchParams(window.location.search);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    
    window.history.pushState({}, "", `${window.location.pathname}?${params.toString()}`);
  };

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange({ searchQuery });
  };

  return (
    <>
      <Helmet>
        <title>
          {searchParams.city 
            ? `Hotels in ${searchParams.city} - Hootili` 
            : "Browse Hotels - Hootili"}
        </title>
        <meta
          name="description"
          content="Browse and book hotels across Tunisia. Filter by price, rating, and amenities to find your perfect stay."
        />
      </Helmet>
      
      <Navbar />
      
      <main className="bg-neutral-50 min-h-screen">
        {/* Hero Banner */}
        <div className="bg-primary py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-heading">
              {searchParams.city 
                ? `Hotels in ${searchParams.city}`
                : "Find Your Perfect Hotel"}
            </h1>
            <p className="text-white/80 mt-2">
              {searchParams.city 
                ? `Discover amazing places to stay in ${searchParams.city}, Tunisia`
                : "Browse our selection of the finest hotels across Tunisia"}
            </p>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <HotelFilter 
                filters={searchParams} 
                onFilterChange={handleFilterChange}
              />
            </div>
            
            {/* Hotel Listings */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="mb-6">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search hotels by name or location"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </form>
              </div>
              
              {/* Results Count */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold font-heading">
                  {isLoading 
                    ? "Loading hotels..." 
                    : isError 
                      ? "Error loading hotels" 
                      : `${hotels?.length || 0} Hotels Found`}
                </h2>
              </div>
              
              {/* Hotel Cards */}
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : isError ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-md">
                  Failed to load hotels. Please try again.
                </div>
              ) : hotels?.length === 0 ? (
                <div className="bg-neutral-100 p-8 rounded-lg text-center">
                  <h3 className="text-xl font-semibold mb-2">No hotels found</h3>
                  <p className="text-neutral-600 mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button
                    onClick={() => {
                      setSearchParams({});
                      setSearchQuery("");
                      window.history.pushState({}, "", window.location.pathname);
                    }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                  {hotels?.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default HotelListing;
