'use client';

import * as React from "react";
import { Calendar1 } from "./calendar";
import { isPast, isToday } from "date-fns";

export default function CalendarioOtro1({ eventos, onFechaSeleccionada }) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Manejar la selección de fecha
  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    onFechaSeleccionada(selectedDate);
  };

  // Convertir fechas de los eventos en objetos Date
  const fechasEventos = eventos.map((eventos) => new Date(eventos.fecha_evento));

  return (
    <Calendar1
      mode="single"
      selected={date}
      onSelect={handleDateChange}
      className="calendario1"
      modifiers={{
        hasEvent: (day) =>
          fechasEventos.some(
            (fecha) => fecha.toDateString() === day.toDateString()
          ),
        isPast: (day) => isPast(day) && !isToday(day), // Asegurarse de que el día actual no sea considerado pasado
      }}
      modifiersClassNames={{
        hasEvent: "day-has-event1",
        isPast: "day-outside", // Usar la misma clase que day_outside
      }}
    />
  );
}
