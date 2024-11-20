import * as React from "react";
import "../calendario1/calendario-style.css";
import '../bento-inicio/bento-inicio-style.css'
import { Calendar } from "./calendar";
import { isPast, isToday } from "date-fns";
import { IconCalendar, IconPencil, IconPlus, IconSearch, IconShare3, IconTrash } from "@tabler/icons-react";

export default function Calendario({ eventos, onFechaSeleccionada }) {
  const [date, setDate] = React.useState(new Date()); // Fecha seleccionada
  const [month, setMonth] = React.useState(new Date()); // Mes mostrado en el calendario

  // Manejar la selección de fecha
  const handleDateChange = (selectedDate) => {
    setDate(selectedDate || new Date());
    onFechaSeleccionada(selectedDate || new Date());
  };

  // Volver al día actual
  const handleGoToToday = () => {
    const today = new Date();
    setDate(today); // Actualizar la fecha seleccionada
    setMonth(today); // Actualizar el mes mostrado
    onFechaSeleccionada(today);
  };

  const fechasEventos = eventos.map((evento) => new Date(evento.fecha_evento));

  return (
    <div className="contenedor-calendario">
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateChange}
        month={month} // Prop para controlar el mes mostrado
        onMonthChange={setMonth} // Actualizar el mes cuando cambie en el calendario
        className="calendario"
        modifiers={{
          hasEvent: (day) =>
            fechasEventos.some(
              (fecha) => fecha.toDateString() === day.toDateString()
            ),
          isPast: (day) => isPast(day) && !isToday(day), // Asegurar que el día actual no sea considerado pasado
        }}
        modifiersClassNames={{
          hasEvent: "day-has-event",
          isPast: "day-outside", // Usar la misma clase que day_outside
        }}
      />
      <div className="contenedor-botones">
        <button
          className="apartado botones"
          id="pequeño-arriba"
          onClick={handleGoToToday}
        >
          <p id="texto-hoy">Volver a Hoy</p>
        </button>
        <button className="apartado botones" id="pequeño3">
          <IconPlus className="iconos-calendar" />
        </button>
        <button className="apartado botones" id="pequeño4">
          <IconTrash className="iconos-calendar" />
        </button>
        <button className="apartado botones" id="pequeño5">
          <IconPencil className="iconos-calendar" />
        </button>
        <button className="apartado botones" id="pequeño6">
          <IconSearch className="iconos-calendar" />
        </button>
        <button className="apartado botones" id="pequeño7">
          <IconShare3 className="iconos-calendar" />
        </button>
      </div>
    </div>
  );
}
