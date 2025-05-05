import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Helmet } from "react-helmet";
import PaymentForm from "@/components/checkout/PaymentForm";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const Checkout = () => {
  const params = useParams<{ roomId: string }>();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const roomId = parseInt(params.roomId);
  const [bookingId, setBookingId] = useState<number | undefined>(undefined);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBooking = async () => {
    if (!user) {
      setError("You must be logged in to book.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const res = await apiRequest("POST", "/api/book-room", {
        userId: user.id,
        roomId,
        checkInDate: "2025-05-02", // Replace with state or form values
        checkOutDate: "2025-05-05",
        numberOfGuests: 2,
      });

      const data = await res.json();

      if (data.bookingId) {
        setBookingId(data.bookingId);
      } else {
        setError("Failed to create booking.");
      }
    } catch (err) {
      console.log('heloo');
      
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    handleBooking();
  }, []);

  const handlePaymentSuccess = (id: number) => {
    toast({
      title: "Booking Complete",
      description: "Thank you for booking with us!",
    });
    navigate(`/booking-confirmation?bookingId=${id}`);
  };

  return (
    <>
      <Helmet>
        <title>Checkout | HotelHive</title>
      </Helmet>
      <Navbar />
      <main className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {bookingId ? (
          <PaymentForm bookingId={bookingId} onPaymentSuccess={handlePaymentSuccess} />
        ) : (
          <p className="text-neutral-600">Preparing your booking...</p>
        )}
      </main>
      <Footer />
    </>
  );
};

export default Checkout;
