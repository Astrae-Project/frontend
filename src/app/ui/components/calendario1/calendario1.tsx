import * as React from "react";
import "./calendario-style.css";
import { Calendar1 } from "./calendar";
import { isPast,isToday } from "date-fns";

export default function Calendario1({ eventos, onFechaSeleccionada }) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Manejar la selección de fecha
  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    onFechaSeleccionada(selectedDate);
  };

  const fechasEventos = eventos.map((evento) => new Date(evento.fecha_evento));

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
          isPast: (day) => isPast(day) && !isToday(day), // Asegurar que el día actual no sea considerado pasado
        }}
      modifiersClassNames={{
        hasEvent: "day-has-event1",
        isPast: "day-outside", // Usar la misma clase que day_outside
      }}
    />
  );
}
