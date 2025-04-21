import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Hotel, Room, Review } from "@/types";
import RoomCard from "@/components/hotels/RoomCard";
import { Helmet } from "react-helmet";
import { Loader2, MapPin, Star, Calendar } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const HotelDetails = () => {
  const params = useParams<{ id: string }>();
  const hotelId = parseInt(params.id);
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  // Set default dates (today and tomorrow)
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    setCheckInDate(formatDate(today));
    setCheckOutDate(formatDate(tomorrow));
  }, []);

  // Fetch hotel details
  const {
    data: hotel,
    isLoading: isHotelLoading,
    isError: isHotelError,
  } = useQuery<Hotel>({
    queryKey: [`/api/hotels/${hotelId}`],
    enabled: !!hotelId,
  });

  // Fetch hotel rooms
  const {
    data: rooms,
    isLoading: isRoomsLoading,
    isError: isRoomsError,
  } = useQuery<Room[]>({
    queryKey: [`/api/hotels/${hotelId}/rooms`],
    enabled: !!hotelId,
  });

  // Fetch hotel reviews
  const {
    data: reviews,
    isLoading: isReviewsLoading,
    isError: isReviewsError,
  } = useQuery<Review[]>({
    queryKey: [`/api/hotels/${hotelId}/reviews`],
    enabled: !!hotelId,
  });

  // Submit review
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to post a review",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }
    
    try {
      await apiRequest("POST", `/api/hotels/${hotelId}/reviews`, reviewForm);
      
      // Reset form
      setReviewForm({ rating: 5, comment: "" });
      
      // Invalidate query to refresh reviews
      queryClient.invalidateQueries({ queryKey: [`/api/hotels/${hotelId}/reviews`] });
      
      toast({
        title: "Review submitted",
        description: "Thank you for sharing your experience!",
      });
    } catch (error) {
      toast({
        title: "Failed to submit review",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Format date as Month Day, Year
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  if (isHotelLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  if (isHotelError || !hotel) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-screen">
          <h2 className="text-2xl font-bold mb-4">Hotel Not Found</h2>
          <p className="text-neutral-600 mb-6">
            The hotel you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => setLocation("/hotels")}>
            Browse Other Hotels
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{hotel.name} - Hootili</title>
        <meta name="description" content={hotel.description} />
      </Helmet>
      
      <Navbar />
      
      <main className="bg-neutral-50 min-h-screen">
        {/* Hero Banner */}
        <div className="relative h-80 md:h-96">
          <img
            src={hotel.imageUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=600&q=80"}
            alt={hotel.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="flex bg-white text-primary px-2 py-1 rounded text-sm font-bold mr-3">
                      {hotel.rating?.toFixed(1)}
                    </div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < (hotel.stars || 0) ? "fill-current" : ""}`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-white">
                      {hotel.reviewCount} reviews
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white font-heading">
                    {hotel.name}
                  </h1>
                  <div className="flex items-center mt-2">
                    <MapPin className="h-4 w-4 text-white mr-1" />
                    <p className="text-white">
                      {hotel.address}, {hotel.city}, Tunisia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="rooms">Rooms</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                
                {/* Hotel Details */}
                <TabsContent value="details" className="mt-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold mb-4 font-heading">About This Hotel</h2>
                    <p className="text-neutral-700 mb-6">{hotel.description}</p>
                    
                    <h3 className="text-xl font-semibold mb-3 font-heading">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                      {hotel.amenities?.map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 font-heading">Location</h3>
                    <p className="text-neutral-700 mb-4">{hotel.location}</p>
                    <p className="text-neutral-700">{hotel.address}, {hotel.city}, Tunisia</p>
                  </div>
                </TabsContent>
                
                {/* Rooms */}
                <TabsContent value="rooms" className="mt-6">
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-2xl font-bold mb-4 font-heading">Available Rooms</h2>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="checkIn" className="block text-sm font-medium text-neutral-700 mb-1">
                            Check In
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                            <Input
                              id="checkIn"
                              type="date"
                              value={checkInDate}
                              onChange={(e) => setCheckInDate(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="checkOut" className="block text-sm font-medium text-neutral-700 mb-1">
                            Check Out
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                            <Input
                              id="checkOut"
                              type="date"
                              value={checkOutDate}
                              onChange={(e) => setCheckOutDate(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {isRoomsLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : isRoomsError ? (
                      <div className="bg-red-50 text-red-600 p-4 rounded-md">
                        Failed to load rooms. Please try again.
                      </div>
                    ) : rooms && rooms.length > 0 ? (
                      rooms.map((room) => (
                        <RoomCard 
                          key={room.id} 
                          room={room} 
                          checkInDate={checkInDate}
                          checkOutDate={checkOutDate}
                          hotelId={hotel.id}
                        />
                      ))
                    ) : (
                      <div className="bg-neutral-100 p-6 rounded-lg text-center">
                        <h3 className="text-xl font-semibold mb-2">No rooms available</h3>
                        <p className="text-neutral-600">
                          Try changing your dates or check back later for availability
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Reviews */}
                <TabsContent value="reviews" className="mt-6">
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-6 font-heading">Guest Reviews</h2>
                    
                    {isReviewsLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : isReviewsError ? (
                      <div className="bg-red-50 text-red-600 p-4 rounded-md">
                        Failed to load reviews. Please try again.
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b border-neutral-200 pb-6 last:border-0 last:pb-0">
                            <div className="flex items-start">
                              <Avatar className="h-10 w-10 mr-4">
                                <AvatarFallback>{review.userId.toString().charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="font-medium mr-3">Guest {review.userId}</span>
                                  <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < review.rating ? "fill-current" : ""}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <p className="text-neutral-700">{review.comment}</p>
                                <p className="text-sm text-neutral-500 mt-2">
                                  {review.createdAt && formatDate(review.createdAt.toString())}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-neutral-600 mb-2">No reviews yet</p>
                        <p className="text-neutral-500">Be the first to share your experience!</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Review Form */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-semibold mb-4 font-heading">Write a Review</h3>
                    <form onSubmit={submitReview}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Rating
                        </label>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating })}
                              className="p-2"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  rating <= reviewForm.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-neutral-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="comment" className="block text-sm font-medium text-neutral-700 mb-1">
                          Your Review
                        </label>
                        <Textarea
                          id="comment"
                          placeholder="Share your experience at this hotel..."
                          rows={4}
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          className="w-full"
                        />
                      </div>
                      <Button type="submit">Submit Review</Button>
                    </form>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <h2 className="text-xl font-bold mb-4 font-heading">
                  Why Book With Hootili?
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Best price guarantee</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Free cancellation on most rooms</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No booking fees</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-primary mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Secure booking process</span>
                  </li>
                </ul>
                
                <div className="border-t border-neutral-200 my-6"></div>
                
                <h3 className="text-lg font-semibold mb-3 font-heading">
                  Need Help?
                </h3>
                <p className="text-neutral-600 mb-4">
                  Our customer service team is here to help you with any questions.
                </p>
                <div className="flex items-center text-primary font-medium">
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+216 71 234 567</span>
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

export default HotelDetails;
