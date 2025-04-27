"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DayPickerProps } from "react-day-picker";
import { es } from "date-fns/locale";

import { buttonVariants1 } from "./button";
import { cn } from "../../../lib/utils";

export type CalendarProps = DayPickerProps;

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
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-self-center",
        month: "space-y-3",
        month_caption: "relative flex justify-center items-center pt-1",
        caption_label: "text-[0.85rem] font-small",

        /* ---- NAVEGACIÓN REVISADA ---- */
        nav: "absolute top-4 left-0 right-0 flex justify-between items-center w-full px-2 z-10",

        button_previous: cn(
          buttonVariants1({ variant: "outline" }),
          "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-2 top-1/2 -translate-y-1/2"
        ),
        button_next: cn(
          buttonVariants1({ variant: "outline" }),
          "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-2 top-1/2 -translate-y-1/2"
        ),        

        /* ---- RESTO DE ESTILOS ---- */
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-[1.9rem] font-normal text-[0.8rem]",
        week: "flex w-full mt-0.5",
        day: "h-[1.73rem] w-[1.9rem] text-center text-xs p-0 relative [&:has([aria-selected].range_end)]:rounded-r-md [&:has([aria-selected].outside)]:bg-zinc-800/50 [&:has([aria-selected])]:bg-zinc-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-md",
        day_button: cn(
          buttonVariants1({ variant: "ghost" }),
          "h-[1.73rem] w-[1.9rem] p-0 font-normal aria-selected:opacity-100 rounded-md"
        ),
        range_end: "day-range-end",
        selected:
          "bg-[#6e4ba3] text-secundary-foreground hover:bg-[#6e4ba3] hover:text-secundary-foreground focus:bg-[#6e4ba3] focus:text-secundary-foreground focus:border-0 rounded-md",
        today: "bg-zinc-800 text-accent-foreground",
        outside:
          "text-muted-foreground aria-selected:bg-zinc-800/50 aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-zinc-800 aria-selected:text-accent-foreground",
        hidden: "invisible",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...p }) =>
          orientation === "left" ? (
            <ChevronLeft {...p} />
          ) : (
            <ChevronRight {...p} />
          ),
      }}
      {...props}
    />
  );
}

Calendar1.displayName = "Calendar1";

export { Calendar1 };
