import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onSelect: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  disabledDates?: Date[];
  className?: string;
}

export function DatePicker({
  date,
  onSelect,
  label,
  placeholder = "Select date",
  disabled = false,
  disabledDates = [],
  className,
}: DatePickerProps) {
  return (
    <div className={className}>
      {label && <div className="mb-1 text-sm font-medium">{label}</div>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onSelect}
            disabled={(date) => 
              date < new Date(new Date().setHours(0, 0, 0, 0)) ||
              disabledDates.some(
                disabledDate => 
                  disabledDate.getDate() === date.getDate() &&
                  disabledDate.getMonth() === date.getMonth() &&
                  disabledDate.getFullYear() === date.getFullYear()
              )
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
