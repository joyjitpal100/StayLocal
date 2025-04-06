import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User, Property, Booking } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/booking-utils";
import { Edit, Calendar, Settings, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HostDashboardProps {
  user: User;
}

export default function HostDashboard({ user }: HostDashboardProps) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("properties");
  
  // Fetch host properties
  const { data: properties = [], isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: [`/api/hosts/${user.id}/properties`]
  });
  
  // Fetch all bookings for all properties
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ['/api/bookings/host'],
    enabled: properties.length > 0,
    queryFn: async () => {
      // In a real app we would have an endpoint for all host bookings
      // Here we'll simulate by fetching for each property
      const allBookings: Booking[] = [];
      await Promise.all(
        properties.map(async (property) => {
          const res = await fetch(`/api/properties/${property.id}/bookings`);
          if (res.ok) {
            const bookings = await res.json();
            allBookings.push(...bookings);
          }
        })
      );
      return allBookings;
    }
  });
  
  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed');
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>;
      case 'draft':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Draft</span>;
      case 'inactive':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Inactive</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{status}</span>;
    }
  };
  
  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pending</span>;
      case 'confirmed':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Confirmed</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Cancelled</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Completed</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">{status}</span>;
    }
  };
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Host Dashboard</h1>
        <Button 
          onClick={() => navigate("/add-property")}
          className="bg-primary hover:bg-primary/90"
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
            className="mr-2"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Add New Property
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Active Properties</p>
              <p className="text-3xl font-bold mt-1">
                {propertiesLoading ? (
                  <Skeleton className="h-9 w-12 mx-auto" />
                ) : (
                  properties.filter(p => p.status === 'active').length
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Pending Bookings</p>
              <p className="text-3xl font-bold mt-1">
                {bookingsLoading ? (
                  <Skeleton className="h-9 w-12 mx-auto" />
                ) : (
                  pendingBookings.length
                )}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Upcoming Stays</p>
              <p className="text-3xl font-bold mt-1">
                {bookingsLoading ? (
                  <Skeleton className="h-9 w-12 mx-auto" />
                ) : (
                  confirmedBookings.length
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-gray-200">
            <TabsList className="h-auto p-0">
              <TabsTrigger
                value="properties"
                className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
              >
                Properties
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
              >
                Bookings
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
              >
                Calendar
              </TabsTrigger>
              <TabsTrigger
                value="earnings"
                className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
              >
                Earnings
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="properties" className="p-6">
            <div className="overflow-x-auto">
              {propertiesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : properties.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price/Night</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <img 
                              src={property.images[0]} 
                              alt={property.title} 
                              className="w-16 h-12 object-cover rounded mr-3" 
                            />
                            <div>
                              <p className="font-medium">{property.title}</p>
                              <p className="text-sm text-gray-600">{property.bedrooms} beds · {property.bathrooms} baths</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(property.status)}</TableCell>
                        <TableCell>{property.location}</TableCell>
                        <TableCell>₹{property.pricePerNight.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-4 h-4 text-yellow-500"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="ml-1">{property.rating || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-800">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-800">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No properties yet</h3>
                  <p className="text-gray-600 mb-6">Add your first property to start hosting</p>
                  <Button 
                    onClick={() => navigate("/add-property")}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Add Property
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="bookings" className="p-6">
            <div className="overflow-x-auto">
              {bookingsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : bookings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => {
                      const property = properties.find(p => p.id === booking.propertyId);
                      if (!property) return null;
                      
                      return (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
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
                                  className="text-gray-600"
                                >
                                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                  <circle cx="12" cy="7" r="4" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium">Guest #{booking.userId}</p>
                                <p className="text-sm text-gray-600">{booking.numberOfGuests} guests</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <img 
                                src={property.images[0]} 
                                alt={property.title} 
                                className="w-10 h-8 object-cover rounded mr-2" 
                              />
                              <span className="truncate max-w-[150px]">{property.title}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(new Date(booking.checkInDate))} - {formatDate(new Date(booking.checkOutDate))}
                          </TableCell>
                          <TableCell>{getBookingStatusBadge(booking.status)}</TableCell>
                          <TableCell>₹{booking.totalPrice.toLocaleString()}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Contact Guest</DropdownMenuItem>
                                {booking.status === 'pending' && (
                                  <>
                                    <DropdownMenuItem>Confirm Booking</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">Decline</DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                  <p className="text-gray-600">When you receive bookings, they will appear here</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Calendar View</h3>
              <p className="text-gray-600 mb-6">View and manage your property availability</p>
              <Button variant="outline">Open Calendar</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="earnings" className="p-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">Earnings Overview</h3>
              <p className="text-gray-600 mb-6">Track your earnings and payouts</p>
              <Button variant="outline">View Reports</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
