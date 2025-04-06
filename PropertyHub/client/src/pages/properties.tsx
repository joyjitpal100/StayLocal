import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Property, PropertyFilter } from "@/lib/types";
import PropertyCard from "@/components/home/property-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { parseDateRange } from "@/lib/booking-utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Properties() {
  const [, params] = useLocation();
  const searchParams = new URLSearchParams(params);
  
  // Parse search parameters
  const [filters, setFilters] = useState<PropertyFilter>({
    location: searchParams.get("location") || "",
    checkIn: undefined,
    checkOut: undefined,
    guests: searchParams.get("guests") ? parseInt(searchParams.get("guests")!) : undefined,
    propertyType: searchParams.get("propertyType") || undefined,
    pricePerNight: 50000 // Default max price
  });

  // Set initial dates from URL if present
  useEffect(() => {
    const dateRange = parseDateRange(
      searchParams.get("checkIn") || undefined,
      searchParams.get("checkOut") || undefined
    );
    
    if (dateRange.from || dateRange.to) {
      setFilters(prev => ({
        ...prev,
        checkIn: dateRange.from,
        checkOut: dateRange.to
      }));
    }
  }, [searchParams]);

  // Fetch properties with filters
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties', filters],
    queryFn: async ({ queryKey }) => {
      const [_, filterValues] = queryKey;
      const queryParams = new URLSearchParams();
      
      if (filterValues.location) {
        queryParams.append('location', filterValues.location as string);
      }
      
      if (filterValues.propertyType) {
        queryParams.append('propertyType', filterValues.propertyType as string);
      }
      
      if (filterValues.guests) {
        queryParams.append('maxGuests', String(filterValues.guests));
      }
      
      if (filterValues.pricePerNight) {
        queryParams.append('pricePerNight', String(filterValues.pricePerNight));
      }
      
      const res = await fetch(`/api/properties?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json();
    }
  });

  // Filter locally by dates if provided
  const filteredProperties = properties.filter(property => {
    // Apply any additional client-side filters here if needed
    return true;
  });

  // Handle filter changes
  const handleFilterChange = (key: keyof PropertyFilter, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle price filter
  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, pricePerNight: value[0] }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input 
                  placeholder="Where are you going?" 
                  value={filters.location || ""}
                  onChange={(e) => handleFilterChange("location", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Check-in</label>
                <DatePicker 
                  date={filters.checkIn}
                  onSelect={(date) => handleFilterChange("checkIn", date)}
                  placeholder="Add date"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Check-out</label>
                <DatePicker 
                  date={filters.checkOut}
                  onSelect={(date) => handleFilterChange("checkOut", date)}
                  placeholder="Add date"
                  disabled={!filters.checkIn}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Guests</label>
                <Select 
                  value={filters.guests?.toString() || ""}
                  onValueChange={(value) => handleFilterChange("guests", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Number of guests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 guest</SelectItem>
                    <SelectItem value="2">2 guests</SelectItem>
                    <SelectItem value="3">3 guests</SelectItem>
                    <SelectItem value="4">4 guests</SelectItem>
                    <SelectItem value="5">5 guests</SelectItem>
                    <SelectItem value="6">6+ guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Property Type</label>
                <Select 
                  value={filters.propertyType || ""}
                  onValueChange={(value) => handleFilterChange("propertyType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any type</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="Houseboat">Houseboat</SelectItem>
                    <SelectItem value="Cottage">Cottage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Price Range (up to ₹{filters.pricePerNight.toLocaleString()})
                </label>
                <Slider
                  defaultValue={[filters.pricePerNight]}
                  max={50000}
                  step={1000}
                  onValueChange={handlePriceChange}
                  className="py-4"
                />
              </div>
              
              <Button className="w-full bg-primary hover:bg-primary/90">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Properties Grid */}
        <div className="md:col-span-3">
          <h1 className="text-2xl font-bold mb-6">
            {filters.location 
              ? `Stays in ${filters.location}`
              : "All available stays"}
          </h1>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="rounded-xl overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-xl font-medium mb-2">No properties found</h2>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search for a different location
              </p>
              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  location: "",
                  checkIn: undefined,
                  checkOut: undefined,
                  guests: undefined,
                  propertyType: undefined,
                  pricePerNight: 50000
                })}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
