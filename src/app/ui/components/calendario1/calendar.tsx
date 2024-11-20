"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils"

import { buttonVariants1 } from "./button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar1({
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
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-self-center",
        month: "space-y-3",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "relative text-[0.8rem] font-small top-0.5",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants1({ variant: "outline" }),
          "h-[1.53rem] w-[1.53rem] bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-[1.9rem] font-normal text-[0.8rem]",
        row: "flex w-full mt-0.5",
        cell: "h-[1.73rem] w-[1.9rem] text-center text-xs p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-zinc-800/50 [&:has([aria-selected])]:bg-zinc-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-md",
        day: cn(
          buttonVariants1({ variant: "ghost" }),
          "h-[1.73rem] w-[1.9rem] p-0 font-normal aria-selected:opacity-100 rounded-md",
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-[#6e4ba3] text-secundary-foreground hover:bg-[#6e4ba3] hover:text-secundary-foreground focus:bg-[#6e4ba3] focus:text-secundary-foreground focus:border-0 rounded-md",
        day_today: "bg-zinc-800 text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-zinc-800/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-zinc-800 aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-[0.9rem] w-[0.9rem]" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-[0.9rem] w-[0.9rem]" />,
      }}
      {...props}
    />
  )
}
Calendar1.displayName = "Calendar1"

export { Calendar1 }
