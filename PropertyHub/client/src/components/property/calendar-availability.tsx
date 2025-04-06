import { useState } from "react";
import { BookingDate } from "@/lib/types";
import { format, addMonths, isBefore, isSameDay, isWithinInterval, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CalendarAvailabilityProps {
  bookingDates: BookingDate[];
  isLoading: boolean;
}

export default function CalendarAvailability({ bookingDates, isLoading }: CalendarAvailabilityProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Function to navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const prevMonth = new Date(prev);
      prevMonth.setMonth(prev.getMonth() - 1);
      return prevMonth;
    });
  };
  
  // Function to navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const nextMonth = new Date(prev);
      nextMonth.setMonth(prev.getMonth() + 1);
      return nextMonth;
    });
  };
  
  // Create calendar days for current month
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  
  // Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  
  // Get days from previous month to fill in first row
  const prevMonthDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      -i
    );
    prevMonthDays.unshift(date);
  }
  
  // Current month days
  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      i
    );
    currentMonthDays.push(date);
  }
  
  // Next month days to fill out the last row
  const nextMonthDays = [];
  const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
  const remainingCells = Math.ceil(totalDaysDisplayed / 7) * 7 - totalDaysDisplayed;
  
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      i
    );
    nextMonthDays.push(date);
  }
  
  // Function to check if a date is booked
  const isDateBooked = (date: Date) => {
    return bookingDates.some(booking => {
      const checkIn = parseISO(booking.checkInDate);
      const checkOut = parseISO(booking.checkOutDate);
      return isWithinInterval(date, { start: checkIn, end: new Date(checkOut.getTime() - 1) });
    });
  };
  
  // Determine day class based on availability and selection
  const getDayClass = (date: Date, isCurrentMonth: boolean) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!isCurrentMonth) {
      return "p-2 text-gray-300";
    }
    
    if (isBefore(date, today) && !isSameDay(date, today)) {
      return "p-2 text-gray-300";
    }
    
    if (isDateBooked(date)) {
      return "p-2 calendar-day booked";
    }
    
    return "p-2 calendar-day available";
  };
  
  if (isLoading) {
    return (
      <section className="container mx-auto py-12 px-4">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </section>
    );
  }
  
  return (
    <section className="container mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Check Availability</h2>
      
      <div className="mb-4">
        <p className="text-gray-600 mb-2">Select check-in date</p>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <Button variant="ghost" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-medium text-lg">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <Button variant="ghost" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            <div className="font-medium">Su</div>
            <div className="font-medium">Mo</div>
            <div className="font-medium">Tu</div>
            <div className="font-medium">We</div>
            <div className="font-medium">Th</div>
            <div className="font-medium">Fr</div>
            <div className="font-medium">Sa</div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 text-center">
            {prevMonthDays.map((date, i) => (
              <div key={`prev-${i}`} className={getDayClass(date, false)}>
                {date.getDate()}
              </div>
            ))}
            
            {currentMonthDays.map((date, i) => (
              <div key={`curr-${i}`} className={getDayClass(date, true)}>
                {date.getDate()}
              </div>
            ))}
            
            {nextMonthDays.map((date, i) => (
              <div key={`next-${i}`} className={getDayClass(date, false)}>
                {date.getDate()}
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-white border border-gray-300 rounded-sm mr-2"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded-sm mr-2"></div>
                <span className="text-sm">Booked</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#00A699] border border-[#00A699] rounded-sm mr-2"></div>
                <span className="text-sm">Selected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
