export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  isHost: boolean;
  phone?: string;
  profileImage?: string;
}

export interface Property {
  id: number;
  hostId: number;
  title: string;
  description: string;
  location: string;
  latitude?: string;
  longitude?: string;
  pricePerNight: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  propertyType: string;
  images: string[];
  amenities: string[];
  status: 'active' | 'draft' | 'inactive';
  rating?: string;
  createdAt: string;
}

export interface PropertyFilter {
  location?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  propertyType?: string;
  pricePerNight?: number;
}

export interface Booking {
  id: number;
  propertyId: number;
  userId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}

export interface BookingDate {
  checkInDate: string;
  checkOutDate: string;
  status: string;
}

export interface Review {
  id: number;
  propertyId: number;
  userId: number;
  bookingId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    profileImage?: string;
  };
}

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  upiId?: string;
  status: 'pending' | 'success' | 'failed';
  transactionId?: string;
  createdAt: string;
}

export interface SearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}
