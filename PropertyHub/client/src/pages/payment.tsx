import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Booking, Property, Payment } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/booking-utils";
import PaymentForm from "@/components/payment/payment-form";
import { Loader2 } from "lucide-react";

export default function PaymentPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [, navigate] = useLocation();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  
  const { data: booking, isLoading: bookingLoading } = useQuery<Booking>({
    queryKey: [`/api/bookings/${bookingId}`],
    enabled: isAuthenticated,
  });
  
  const { data: property, isLoading: propertyLoading } = useQuery<Property>({
    queryKey: [`/api/properties/${booking?.propertyId}`],
    enabled: !!booking,
  });
  
  const { data: payment, isLoading: paymentLoading } = useQuery<Payment>({
    queryKey: [`/api/bookings/${bookingId}/payment`],
    enabled: !!booking,
  });
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);
  
  // Payment already processed
  if (payment?.status === "success") {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-green-600">Payment Successful</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-green-100 text-green-800 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Your booking is confirmed!</h2>
              <p className="text-gray-600 mt-2">Transaction ID: {payment.transactionId}</p>
            </div>
            
            {property && (
              <div className="flex items-center">
                <img 
                  src={property.images[0]} 
                  alt={property.title} 
                  className="w-20 h-16 object-cover rounded mr-4" 
                />
                <div>
                  <p className="font-medium">{property.title}</p>
                  <p className="text-sm text-gray-600">{property.location}</p>
                </div>
              </div>
            )}
            
            {booking && (
              <div className="border-t border-b border-gray-200 py-4 my-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Check-in</p>
                    <p className="font-medium">{formatDate(new Date(booking.checkInDate))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Check-out</p>
                    <p className="font-medium">{formatDate(new Date(booking.checkOutDate))}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-center">
              <button 
                onClick={() => navigate("/bookings")}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium"
              >
                View Your Bookings
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isLoading = authLoading || bookingLoading || propertyLoading;
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-48 mx-auto" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!booking || !property) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Booking Not Found</h1>
        <p className="mb-6">The booking you're looking for doesn't exist or you don't have permission to view it.</p>
        <button 
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
            <div className="flex items-center">
              <img 
                src={property.images[0]} 
                alt={property.title} 
                className="w-20 h-16 object-cover rounded mr-4" 
              />
              <div>
                <p className="font-medium">{property.title}</p>
                <p className="text-sm text-gray-600">{property.location}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {formatDate(new Date(booking.checkInDate))} - {formatDate(new Date(booking.checkOutDate))} · {booking.numberOfGuests} guest{booking.numberOfGuests !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-6 border-b border-gray-200 pb-6">
            <h3 className="font-semibold mb-4">Price Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  ₹{property.pricePerNight.toLocaleString()} x {
                    Math.round((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
                  } nights
                </span>
                <span>₹{(booking.totalPrice * 0.8).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cleaning fee</span>
                <span>₹2,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service fee</span>
                <span>₹{(booking.totalPrice * 0.2 - 2500).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold">
                <span>Total (INR)</span>
                <span>₹{booking.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <PaymentForm booking={booking} />
        </CardContent>
      </Card>
    </div>
  );
}
