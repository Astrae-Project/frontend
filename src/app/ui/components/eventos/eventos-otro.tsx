import React, { useState, useEffect } from "react";
import "../../../perfil/bento-perfil/bento-perfil-style.css";
import customAxios from "@/service/api.mjs";

export default function EventosOtro({ fechaSeleccionada, username }) {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);

  const fetchEventos = async () => {
    try {
      const response = await customAxios.get(
        `http://localhost:5000/api/data/usuario/${username}`,
        { withCredentials: true }
      );
      setEventos(response.data.eventos || []); // Asegúrate de acceder a la propiedad correcta
    } catch (error) {
      console.error("Error fetching eventos:", error);
      setEventos([]); // Maneja el estado cuando hay un error
    }
  };

  useEffect(() => {
    if (username) {
      fetchEventos();
    }
  }, [username]);

  // Filtrar eventos según la fecha seleccionada
  useEffect(() => {
    if (!fechaSeleccionada) {
      setEventosFiltrados([]);
      return;
    }

    const eventosHoy = eventos.filter((evento) => {
      const fechaEvento = new Date(evento.fecha_evento).toDateString();
      const fechaSeleccionadaString = fechaSeleccionada.toDateString();
      return fechaEvento === fechaSeleccionadaString;
    });

    setEventosFiltrados(eventosHoy);
  }, [eventos, fechaSeleccionada]);

  const formatDateTime = (datetime) => {
    if (!datetime) return "Fecha no disponible";

    const date = new Date(datetime);
    const formattedDate = new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

    const formattedTime = date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <div className="contenido-scrollable" id="eventos">
      {eventosFiltrados.length > 0 ? (
        <ul>
          {eventosFiltrados.map((evento, index) => (
            <li key={index} className="movimiento-item">
              <div className="portfolio-icono">
                <img
                  src={evento.creador?.avatar || "/default-avatar.png"}
                  alt="Avatar del creador"
                  className="avatar-imagen"
                />
              </div>
              <div className="movimiento-detalles1">
                <p className="movimiento-nombre1">
                  {evento.creador?.username || "Usuario desconocido"}
                </p>
                <p className="movimiento-monto">{evento.titulo}</p>
                <p className="movimiento-fecha1">
                  {formatDateTime(evento.fecha_evento)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="texto-defecto">No hay eventos en esta fecha.</p>
      )}
    </div>
  );
}
