"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"

import { cn } from "../../../lib/utils"
import { buttonVariants } from "./button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays={showOutsideDays}
      className={cn("p-1", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-3",
        month_caption: "relative flex justify-center items-center pt-1",
        caption_label: "text-[0.85rem] font-small",
        nav: "absolute top-4 left-0 right-0 flex justify-between items-center w-full px-2 z-10",

        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-2 top-1/2 -translate-y-1/2"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-2 top-1/2 -translate-y-1/2"
        ),        

        /* Estructura del mes */
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-[2.35rem] font-normal text-[0.8rem]",
        week: "flex w-full mt-0.5",

        /* Días */
        day: "h-[2.35rem] w-[2.35rem] text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-[#1C1C29]/50 [&:has([aria-selected])]:bg-[#1C1C29] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-md",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-[2.35rem] w-[2.35rem] p-0 font-normal aria-selected:opacity-100 rounded-md"
        ),

        /* Modificadores de rango y estado */
        range_end: "day-range-end",
        selected:
          "bg-[#6e4ba3] text-secundary-foreground hover:bg-[#6e4ba3] hover:text-secundary-foreground focus:bg-[#6e4ba3] focus:text-secundary-foreground focus:border-0 rounded-md focus:text-white",
        today: "bg-[#1C1C29] text-accent-foreground",
        outside:
          "day-outside text-muted-foreground aria-selected:bg-[#1C1C29]/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-[#1C1C29] aria-selected:text-accent-foreground",
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" {...props} />
          ) : (
            <ChevronRight className="h-4 w-4" {...props} />
          ),
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
