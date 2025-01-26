import React, { useState, useEffect } from "react";
import "../../../perfil/bento-perfil/bento-perfil-style.css";
import "./evento-style.css";
import customAxios from "@/service/api.mjs";
import Bubble from "../bubble/bubble";
import PerfilOtro from "@/app/perfil-otro/page";

export default function Eventos({ fechaSeleccionada }) {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [activeBubble, setActiveBubble] = useState(null);
  const [bubbleData, setBubbleData] = useState(null);

  // Fetch eventos desde la API
  const fetchEventos = async () => {
    try {
      const response = await customAxios.get(
        "http://localhost:5000/api/data/eventos",
        { withCredentials: true }
      );
      // Verificar si la respuesta es un array antes de actualizar el estado
      if (Array.isArray(response.data)) {
        setEventos(response.data);
      } else {
        setEventos([]); // En caso de que no sea un array, asignamos un array vacío
      }
    } catch (error) {
      console.error("Error fetching eventos:", error);
      setEventos([]); // Si ocurre un error, asignamos un array vacío
    }
  };

  // Ejecutar fetchEventos al montar el componente
  useEffect(() => {
    fetchEventos();
  }, []);

  // Filtrar eventos por la fecha seleccionada
  useEffect(() => {
    if (fechaSeleccionada) {
      const eventosArray = Array.isArray(eventos) ? eventos : []; // Asegurarse de que eventos es un array
      const eventosHoy = eventosArray.filter((evento) => {
        const fechaEvento = new Date(evento.fecha_evento).toDateString();
        return fechaEvento === fechaSeleccionada.toDateString();
      });
      setEventosFiltrados(eventosHoy);
    } else {
      setEventosFiltrados([]);
    }
  }, [eventos, fechaSeleccionada]);

  // Formatear fecha y hora
  const formatDateTime = (datetime) => {
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

  // Manejo de apertura y cierre de burbujas
  const handleBubbleOpen = (type, data) => {
    setBubbleData(data);
    setActiveBubble(type);
  };

  const handleBubbleClose = () => {
    setActiveBubble(null);
    setBubbleData(null);
  };

  return (
    <div className="contenido-scrollable" id="eventos">
      {eventosFiltrados.length > 0 ? (
        <ul>
          {eventosFiltrados.map((evento) => (
            <li key={evento.id} className="evento-item" onClick={() => handleBubbleOpen("perfil", evento)}>

                <div className="portfolio-icono">
                  <img
                    src={evento.creador?.avatar || "/default-avatar.png"}
                    alt={`${evento.creador?.username || "Usuario"} Avatar`}
                    className="avatar-imagen"
                  />
                </div>
                <div className="evento-detalles1">
                  <p className="evento-creador1">{evento.creador?.username || "Usuario desconocido"}</p>
                  <p className="evento-titulo1">{evento.titulo || "Sin título"}</p>
                  <p className="evento-fecha1">{formatDateTime(evento.fecha_evento)}</p>
                </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="texto-defecto">No hay eventos en esta fecha.</p>
      )}

      {/* Componente Bubble */}
      <Bubble show={!!activeBubble} onClose={handleBubbleClose}>
        {activeBubble === "perfil" && bubbleData && (
          <PerfilOtro username={bubbleData.creador?.username} />
        )}
      </Bubble>
    </div>
  );
}
