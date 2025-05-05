import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CardInputForm from "@/components/CardInputForm";

interface CheckoutFormProps {
  bookingId: number;
  onPaymentSuccess: (bookingId: number) => void;
}

const CheckoutForm = ({ bookingId, onPaymentSuccess }: CheckoutFormProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Confirm the booking
      const res = await apiRequest("POST", "/api/confirm-booking", {
        bookingId,
      });
      
      const data = await res.json();
      
      if (data.success) {
        onPaymentSuccess(bookingId);
      } else {
        throw new Error("Failed to confirm booking");
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium mb-1">
            Card Number
          </label>
          <Input
            id="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium mb-1">
              Expiry Date
            </label>
            <Input
              id="expiry"
              type="text"
              placeholder="MM/YY"
              required
            />
          </div>
          
          <div>
            <label htmlFor="cvc" className="block text-sm font-medium mb-1">
              CVC
            </label>
            <Input
              id="cvc"
              type="text"
              placeholder="123"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name on Card
          </label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
          />
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isProcessing}
      >
        {isProcessing ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
};

export default CheckoutForm; 