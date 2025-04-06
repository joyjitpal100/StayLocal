import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Booking, Property } from "@/lib/types";
import { formatDate, formatDateRange } from "@/lib/booking-utils";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Calendar, Clock, Check, X, ArrowRightCircle } from "lucide-react";

export default function BookingsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // Fetch user bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
    enabled: isAuthenticated,
  });
  
  // Map to keep track of fetched properties
  const { data: propertiesMap = {}, isLoading: propertiesLoading } = useQuery<Record<number, Property>>({
    queryKey: ['/api/bookings/properties'],
    enabled: bookings.length > 0,
    queryFn: async () => {
      const propertyIds = [...new Set(bookings.map(booking => booking.propertyId))];
      const properties: Record<number, Property> = {};
      
      // Fetch properties in parallel
      await Promise.all(
        propertyIds.map(async (id) => {
          const res = await fetch(`/api/properties/${id}`);
          if (res.ok) {
            const data = await res.json();
            properties[id] = data;
          }
        })
      );
      
      return properties;
    }
  });
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, navigate]);
  
  const isLoading = authLoading || bookingsLoading || propertiesLoading;
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-8">Your Bookings</h1>
        <div className="grid grid-cols-1 gap-6">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <Skeleton className="h-48 md:h-auto md:w-48 rounded-l-xl" />
                  <div className="p-6 flex-grow">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  if (!bookings.length) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">No Bookings Yet</h1>
        <p className="mb-6">You haven't made any bookings yet. Start exploring properties to book your next stay!</p>
        <Button 
          onClick={() => navigate("/")}
          className="bg-primary hover:bg-primary/90"
        >
          Explore Properties
        </Button>
      </div>
    );
  }
  
  // Sort bookings by check-in date (most recent first)
  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()
  );
  
  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center"><Clock className="h-3 w-3 mr-1" /> Pending</span>;
      case 'confirmed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center"><Check className="h-3 w-3 mr-1" /> Confirmed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center"><X className="h-3 w-3 mr-1" /> Cancelled</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"><Check className="h-3 w-3 mr-1" /> Completed</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{status}</span>;
    }
  };
  
  // Helper function to get payment status badge
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center"><Check className="h-3 w-3 mr-1" /> Paid</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center"><Clock className="h-3 w-3 mr-1" /> Pending</span>;
      case 'refunded':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"><ArrowRightCircle className="h-3 w-3 mr-1" /> Refunded</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{status}</span>;
    }
  };
  
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-8">Your Bookings</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {sortedBookings.map((booking) => {
          const property = propertiesMap[booking.propertyId];
          if (!property) return null;
          
          const checkInDate = new Date(booking.checkInDate);
          const checkOutDate = new Date(booking.checkOutDate);
          
          return (
            <Card key={booking.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-48 md:h-auto relative">
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-6 flex-grow">
                    <div className="flex flex-col md:flex-row md:justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{property.title}</h3>
                        <p className="text-gray-600 text-sm">{property.location}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 md:mt-0">
                        {getStatusBadge(booking.status)}
                        {getPaymentBadge(booking.paymentStatus)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                        <span className="text-sm">{formatDateRange(checkInDate, checkOutDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-sm">{booking.numberOfGuests} guest{booking.numberOfGuests !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4 flex flex-wrap justify-between items-center">
                      <div>
                        <span className="text-gray-600 text-sm">Total amount:</span>
                        <span className="ml-2 font-semibold">₹{booking.totalPrice.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex gap-2 mt-4 md:mt-0">
                        {booking.status === 'confirmed' && (
                          <Button variant="outline" size="sm" onClick={() => navigate(`/property/${property.id}`)}>
                            View Property
                          </Button>
                        )}
                        
                        {booking.paymentStatus === 'pending' && (
                          <Button 
                            className="bg-primary hover:bg-primary/90" 
                            size="sm"
                            onClick={() => navigate(`/payment/${booking.id}`)}
                          >
                            Complete Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
