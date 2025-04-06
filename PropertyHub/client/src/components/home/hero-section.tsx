import { useState } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/booking-utils";

export default function HeroSection() {
  const [, navigate] = useLocation();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState("1");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const queryParams = new URLSearchParams();
    
    if (location) {
      queryParams.append("location", location);
    }
    
    if (checkIn) {
      queryParams.append("checkIn", checkIn.toISOString());
    }
    
    if (checkOut) {
      queryParams.append("checkOut", checkOut.toISOString());
    }
    
    if (guests) {
      queryParams.append("guests", guests);
    }
    
    navigate(`/properties?${queryParams.toString()}`);
  };
  
  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&h=900&q=80" 
        alt="Beautiful vacation home by the lake" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end items-center text-center p-8">
        <h1 className="text-white text-4xl md:text-5xl font-bold mb-4">Find your perfect getaway</h1>
        <p className="text-white text-xl md:text-2xl mb-8">Book unique homes with local hosts across India</p>
        <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-3xl">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-gray-700 font-medium">Location</label>
                <Input 
                  type="text" 
                  placeholder="Where are you going?" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 font-medium">Dates</label>
                <div className="flex gap-2">
                  <DatePicker
                    date={checkIn}
                    onSelect={setCheckIn}
                    placeholder={checkIn ? formatDate(checkIn) : "Check-in"}
                    className="w-full"
                  />
                  <DatePicker
                    date={checkOut}
                    onSelect={setCheckOut}
                    placeholder={checkOut ? formatDate(checkOut) : "Check-out"}
                    className="w-full"
                    disabled={!checkIn}
                    disabledDates={checkIn ? [new Date(checkIn.getTime() - 86400000)] : []}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-gray-700 font-medium">Guests</label>
                <div className="flex">
                  <Select 
                    value={guests} 
                    onValueChange={setGuests}
                  >
                    <SelectTrigger className="w-full rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary">
                      <SelectValue placeholder="Select number of guests" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 guest</SelectItem>
                      <SelectItem value="2">2 guests</SelectItem>
                      <SelectItem value="3">3 guests</SelectItem>
                      <SelectItem value="4">4 guests</SelectItem>
                      <SelectItem value="5">5 guests</SelectItem>
                      <SelectItem value="6">6 guests</SelectItem>
                      <SelectItem value="7">7 guests</SelectItem>
                      <SelectItem value="8">8+ guests</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 text-white px-6 rounded-r-md"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
