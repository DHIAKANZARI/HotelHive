
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import HotelListing from "@/pages/hotel-listing";
import HotelDetails from "@/pages/hotel-details";
import Checkout from "@/pages/checkout";
import BookingConfirmation from "@/pages/booking-confirmation";
import UserDashboard from "@/pages/user-dashboard";
import NotFound from "@/pages/not-found";
import FakePaymentPage from "@/pages/FakePaymentPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/hotels" component={HotelListing} />
      <Route path="/hotels/:id" component={HotelDetails} />
      
      <ProtectedRoute path="/checkout/:roomId" component={Checkout} />
      <ProtectedRoute path="/booking-confirmation/:bookingId" component={BookingConfirmation} />
      <ProtectedRoute path="/dashboard" component={UserDashboard} />

      {/* Fake payment simulation page */}
      <Route path="/fake-payment" component={FakePaymentPage} />

      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

