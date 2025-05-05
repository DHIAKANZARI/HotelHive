import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

export default function FakePaymentPage() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [booking, setBooking] = useState({
    checkIn: '',
    checkOut: '',
    guests: '1',
    breakfast: 'false',
    parking: 'false',
    wifi: 'false',
  });
  const [, setLocation] = useLocation();

  // parse query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setBooking({
      checkIn: params.get('checkIn') || '',
      checkOut: params.get('checkOut') || '',
      guests: params.get('guests') || '1',
      breakfast: params.get('breakfast') || 'false',
      parking: params.get('parking') || 'false',
      wifi: params.get('wifi') || 'false',
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setTimeout(() => {
      if (Math.random() < 0.9) {
        setStatus('success');
        // after success, redirect to confirmation or dashboard
        setTimeout(() => setLocation('/booking-confirmation/12345'), 2000);
      } else {
        setStatus('error');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Review & Pay</h2>

        {/* Booking summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p><strong>Check-In:</strong> {booking.checkIn}</p>
          <p><strong>Check-Out:</strong> {booking.checkOut}</p>
          <p><strong>Guests:</strong> {booking.guests}</p>
          <p><strong>Breakfast:</strong> {booking.breakfast === 'true' ? 'Yes' : 'No'}</p>
          <p><strong>Parking:</strong> {booking.parking === 'true' ? 'Yes' : 'No'}</p>
          <p><strong>WiFi:</strong> {booking.wifi === 'true' ? 'Yes' : 'No'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            className="space-y-2"
          >
            <label className="block text-sm" htmlFor="cardName">Cardholder Name</label>
            <input
              id="cardName"
              name="cardName"
              type="text"
              required
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </motion.div>

          <motion.div
            className="space-y-2"
          >
            <label className="block text-sm" htmlFor="cardNumber">Card Number</label>
            <input
              id="cardNumber"
              name="cardNumber"
              type="text"
              pattern="[0-9]{16}"
              placeholder="1234 5678 9012 3456"
              required
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </motion.div>

          <div className="flex space-x-4">
            <div className="flex-1 space-y-2">
              <label className="block text-sm" htmlFor="expiry">Expiry Date</label>
              <input
                id="expiry"
                name="expiry"
                type="text"
                placeholder="MM/YY"
                pattern="(0[1-9]|1[0-2])/[0-9]{2}"
                required
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="block text-sm" htmlFor="cvv">CVV</label>
              <input
                id="cvv"
                name="cvv"
                type="password"
                pattern="[0-9]{3,4}"
                placeholder="123"
                required
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'processing'}
            className="w-full bg-indigo-600 text-white rounded-xl p-3 font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {status === 'processing' ? 'Processing...' : 'Pay Now'}
          </button>
        </form>

        {status === 'success' && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-4 text-green-600 text-center"
          >
            Payment Successful! Redirecting... ✅
          </motion.p>
        )}
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-4 text-red-600 text-center"
          >
            Payment Failed. Please try again. ❌
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
