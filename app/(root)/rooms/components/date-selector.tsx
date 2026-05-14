"use client";

import React, { useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays, Search } from "lucide-react";
import { format, isBefore, parseISO, subDays, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function DateSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize dates from searchParams or default to today/tomorrow
  const [checkInDate, setCheckInDate] = React.useState<Date>(() => {
    const start = searchParams.get("startDate");
    const parsed = start ? parseISO(start) : new Date();
    return isValid(parsed) ? parsed : new Date();
  });

  const [checkOutDate, setCheckOutDate] = React.useState<Date>(() => {
    const end = searchParams.get("endDate");
    const parsed = end ? parseISO(end) : new Date();
    return isValid(parsed) ? parsed : new Date();
  });

  // Keep state in sync if URL changes externally
  useEffect(() => {
    const start = searchParams.get("startDate");
    const end = searchParams.get("endDate");
    if (start) setCheckInDate(parseISO(start));
    if (end) setCheckOutDate(parseISO(end));
  }, [searchParams]);

  const handleSearchClick = () => {
    const newCheckInDate = format(checkInDate, "yyyy-MM-dd");
    const newCheckOutDate = format(checkOutDate, "yyyy-MM-dd");
    router.push(`/rooms?startDate=${newCheckInDate}&endDate=${newCheckOutDate}`);
  };

  return (
    <div className="flex justify-center h-full w-full px-4">
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-6xl py-8 border-b">
        
        {/* Check-in Date */}
        <div className="flex gap-4 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <div className="cursor-pointer hover:bg-primary hover:text-white duration-150 p-4 bg-primary/10 rounded-full text-primary">
                <CalendarDays className="h-6 w-6 lg:h-8 lg:w-8" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkInDate}
                onSelect={(date) => date && setCheckInDate(date)}
                disabled={(date) => isBefore(date, subDays(new Date(), 1))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="flex flex-col">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Check-in</h3>
            <span className="text-lg lg:text-xl font-semibold">
              {format(checkInDate, "PPP")}
            </span>
          </div>
        </div>

        <div className="hidden md:block h-10 w-[1px] bg-border" />

        {/* Check-out Date */}
        <div className="flex gap-4 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <div className="cursor-pointer hover:bg-primary hover:text-white duration-150 p-4 bg-primary/10 rounded-full text-primary">
                <CalendarDays className="h-6 w-6 lg:h-8 lg:w-8" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOutDate}
                onSelect={(date) => date && setCheckOutDate(date)}
                disabled={(date) => 
                  isBefore(date, subDays(new Date(), 1)) || isBefore(date, checkInDate)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <div className="flex flex-col">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Check-out</h3>
            <span className="text-lg lg:text-xl font-semibold">
              {format(checkOutDate, "PPP")}
            </span>
          </div>
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearchClick} 
          className="md:ml-6 px-8 py-6 text-lg gap-2 shadow-lg"
        >
          <Search className="h-5 w-5" />
          Search
        </Button>
      </div>
    </div>
  );
}