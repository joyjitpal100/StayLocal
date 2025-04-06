import { addDays, differenceInDays, format, parseISO } from "date-fns";
import { BookingDate, DateRange } from "./types";

// Calculate total nights between two dates
export function calculateNights(checkIn: Date, checkOut: Date): number {
  return differenceInDays(checkOut, checkIn);
}

// Calculate total price based on nightly rate and number of nights
export function calculateTotalPrice(
  pricePerNight: number,
  checkIn: Date,
  checkOut: Date,
  cleaningFee: number = 2500,
  serviceFee: number = 0
): { 
  nights: number, 
  subtotal: number, 
  cleaningFee: number, 
  serviceFee: number, 
  total: number 
} {
  const nights = calculateNights(checkIn, checkOut);
  const subtotal = pricePerNight * nights;
  
  // Calculate service fee (13% of subtotal)
  const calculatedServiceFee = serviceFee || Math.round(subtotal * 0.13);
  
  return {
    nights,
    subtotal,
    cleaningFee,
    serviceFee: calculatedServiceFee,
    total: subtotal + cleaningFee + calculatedServiceFee
  };
}

// Format date for display
export function formatDate(date: Date): string {
  return format(date, "MMM d, yyyy");
}

// Create date range string for display
export function formatDateRange(checkIn: Date, checkOut: Date): string {
  return `${format(checkIn, "MMM d")} - ${format(checkOut, "MMM d, yyyy")}`;
}

// Check if a date is booked based on existing bookings
export function isDateBooked(date: Date, bookings: BookingDate[]): boolean {
  return bookings.some(booking => {
    const checkIn = parseISO(booking.checkInDate);
    const checkOut = parseISO(booking.checkOutDate);
    return date >= checkIn && date < checkOut;
  });
}

// Generate an array of dates between start and end
export function getDatesInRange(start: Date, end: Date): Date[] {
  const dates = [];
  let currentDate = new Date(start);

  while (currentDate < end) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
}

// Get disabled dates (booked dates) for date picker
export function getDisabledDates(bookings: BookingDate[]): Date[] {
  const disabledDates: Date[] = [];
  
  bookings.forEach(booking => {
    const checkIn = parseISO(booking.checkInDate);
    const checkOut = parseISO(booking.checkOutDate);
    
    const datesInRange = getDatesInRange(checkIn, checkOut);
    disabledDates.push(...datesInRange);
  });
  
  return disabledDates;
}

// Calculate initial service fee for new bookings
export function calculateServiceFee(subtotal: number): number {
  return Math.round(subtotal * 0.13);
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Parses and validates date range
export function parseDateRange(
  checkInStr?: string,
  checkOutStr?: string
): DateRange {
  let from: Date | undefined;
  let to: Date | undefined;
  
  if (checkInStr) {
    try {
      from = new Date(checkInStr);
      if (isNaN(from.getTime())) {
        from = undefined;
      }
    } catch {
      from = undefined;
    }
  }
  
  if (checkOutStr) {
    try {
      to = new Date(checkOutStr);
      if (isNaN(to.getTime())) {
        to = undefined;
      }
    } catch {
      to = undefined;
    }
  }
  
  return { from, to };
}
