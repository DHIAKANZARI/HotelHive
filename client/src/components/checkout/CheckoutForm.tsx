import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CheckoutFormProps {
  bookingId?: number;
  onPaymentSuccess: (bookingId: number) => void;
}

const CheckoutForm = ({ bookingId, onPaymentSuccess }: CheckoutFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!bookingId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const res = await apiRequest("POST", "/api/confirm-booking", { bookingId });
      const data = await res.json();
      
      if (data.success) {
        // Booking confirmed successfully
        onPaymentSuccess(bookingId);
        toast({
          title: "Booking Confirmed",
          description: "Your booking has been successfully confirmed!",
        });
      } else {
        setErrorMessage("Failed to confirm booking. Please try again.");
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 p-4 rounded-md flex items-start">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{errorMessage}</p>
        </div>
      )}
      
      <div className="bg-green-50 p-6 rounded-lg border border-green-100">
        <div className="flex items-center mb-4">
          <CheckCircle className="text-green-500 h-6 w-6 mr-2" />
          <h3 className="font-medium text-green-800">Simplified Booking Process</h3>
        </div>
        <p className="text-green-700 mb-4">
          We've simplified our booking process. Click the button below to confirm your booking without payment processing.
        </p>
        <div className="bg-white p-4 rounded-md border border-green-100">
          <p className="text-sm text-neutral-700 mb-2">
            <span className="font-medium">Note:</span> In a real-world application, this would be a secure payment form.
          </p>
          <p className="text-sm text-neutral-700">
            For this demo, we're automatically confirming your booking when you click the button below.
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Confirm Booking"
          )}
        </Button>
        <p className="text-xs text-neutral-500 text-center">
          By clicking the button above, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </form>
  );
};

export default CheckoutForm;
