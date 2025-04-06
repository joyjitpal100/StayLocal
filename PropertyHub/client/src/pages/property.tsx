import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Property, BookingDate } from "@/lib/types";
import PropertyGallery from "@/components/property/property-gallery";
import PropertyDetails from "@/components/property/property-details";
import BookingWidget from "@/components/property/booking-widget";
import CalendarAvailability from "@/components/property/calendar-availability";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  const { data: property, isLoading: isPropertyLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
  });
  
  const { data: bookingDates = [], isLoading: isBookingsLoading } = useQuery<BookingDate[]>({
    queryKey: [`/api/properties/${id}/bookings`],
    enabled: !!property,
  });
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Property</h1>
        <p className="mb-6">We couldn't find the property you're looking for.</p>
        <button 
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  if (isPropertyLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-80 w-full mb-4" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <Skeleton className="h-8 w-full mt-8 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-6" />
            
            <div className="border-b border-gray-200 pb-6">
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
              </div>
            </div>
            
            <div className="py-6 border-b border-gray-200">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          
          <div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!property) {
    return null;
  }
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Property Gallery and Details */}
        <div className="lg:col-span-3">
          <PropertyGallery 
            images={property.images} 
            title={property.title} 
          />
          
          <PropertyDetails property={property} />
        </div>
        
        {/* Booking Widget */}
        <div className="lg:col-span-2">
          <BookingWidget 
            property={property} 
            bookingDates={bookingDates}
          />
        </div>
      </div>
      
      {/* Calendar Availability */}
      <CalendarAvailability bookingDates={bookingDates} isLoading={isBookingsLoading} />
    </div>
  );
}
