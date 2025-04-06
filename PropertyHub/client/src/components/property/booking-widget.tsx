import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/calendar-range";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Property, BookingDate } from "@/lib/types";
import { 
  calculateTotalPrice, 
  getDisabledDates, 
  formatCurrency 
} from "@/lib/booking-utils";
import { Star } from "lucide-react";

interface BookingWidgetProps {
  property: Property;
  bookingDates?: BookingDate[];
}

export default function BookingWidget({ property, bookingDates = [] }: BookingWidgetProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState("1");
  const [price, setPrice] = useState({
    nights: 0,
    subtotal: 0,
    cleaningFee: 2500,
    serviceFee: 0,
    total: 0
  });
  
  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Booking created",
        description: "Redirecting to payment page",
      });
      navigate(`/payment/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create booking",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    }
  });
  
  // Calculate price whenever date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange.to) {
      const { nights, subtotal, cleaningFee, serviceFee, total } = calculateTotalPrice(
        property.pricePerNight,
        dateRange.from,
        dateRange.to
      );
      
      setPrice({ nights, subtotal, cleaningFee, serviceFee, total });
    } else {
      setPrice({
        nights: 0,
        subtotal: 0,
        cleaningFee: 2500,
        serviceFee: 0,
        total: 0
      });
    }
  }, [dateRange, property.pricePerNight]);
  
  // Get disabled dates from booking dates
  const disabledDates = bookingDates ? getDisabledDates(bookingDates) : [];
  
  // Handle booking
  const handleBooking = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to book this property",
        variant: "destructive",
      });
      return;
    }
    
    if (!dateRange?.from || !dateRange.to) {
      toast({
        title: "Select dates",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      });
      return;
    }
    
    // Create booking
    createBookingMutation.mutate({
      propertyId: property.id,
      checkInDate: dateRange.from.toISOString(),
      checkOutDate: dateRange.to.toISOString(),
      numberOfGuests: parseInt(guests),
      totalPrice: price.total
    });
  };
  
  // Check if user is the host of this property
  const isHost = user?.id === property.hostId;
  
  return (
    <div className="sticky top-24 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xl font-bold text-gray-900">₹{property.pricePerNight.toLocaleString()}</span>
          <span className="text-gray-600"> night</span>
        </div>
        <div className="flex items-center">
          <Star className="text-yellow-500" size={16} />
          <span className="ml-1">{property.rating || "New"}</span>
        </div>
      </div>
      
      <div className="space-y-4 mb-4">
        <DateRangePicker
          dateRange={dateRange}
          onRangeChange={setDateRange}
          disabledDates={disabledDates}
          className="w-full"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GUESTS</label>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="w-full border border-gray-300 rounded-lg p-3">
              <SelectValue placeholder="Select number of guests" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(property.maxGuests)].map((_, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {i + 1} {i === 0 ? 'guest' : 'guests'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={handleBooking}
          disabled={isHost || createBookingMutation.isPending}
          className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-medium transition"
        >
          {isHost ? "You own this property" : "Reserve"}
        </Button>
        
        {!isHost && <p className="text-center text-gray-600 text-sm">You won't be charged yet</p>}
      </div>
      
      {dateRange?.from && dateRange.to && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">₹{property.pricePerNight.toLocaleString()} x {price.nights} nights</span>
            <span>{formatCurrency(price.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Cleaning fee</span>
            <span>{formatCurrency(price.cleaningFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Service fee</span>
            <span>{formatCurrency(price.serviceFee)}</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-gray-200 font-semibold">
            <span>Total (INR)</span>
            <span>{formatCurrency(price.total)}</span>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm font-medium">Pay with:</span>
          <div className="flex space-x-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="h-6" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png" alt="Google Pay" className="h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
