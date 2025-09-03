import React, { useState, useEffect } from "react";
import "../../../perfil/bento-perfil/bento-perfil-style.css";
import "./evento-style.css";
import customAxios from "@/service/api.mjs";
import Bubble from "../bubble/bubble";
import PerfilOtro from "@/app/perfil-otro/page";

const PerfilOtroComponent: any = PerfilOtro;

export default function EventosOtro({ fechaSeleccionada, username }) {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [activeBubble, setActiveBubble] = useState(null);
  const [bubbleData, setBubbleData] = useState(null);

  const fetchEventos = async () => {
    try {
      const response = await customAxios.get(
        `/data/usuario/${username}`,
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
                  <p className="evento-creador">{evento.creador?.username || "Usuario desconocido"}</p>
                  <p className="evento-titulo">{evento.titulo || "Sin título"}</p>
                  <p className="evento-fecha">{formatDateTime(evento.fecha_evento)}</p>
                </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="texto-defecto">No hay eventos en esta fecha.</p>
      )}

      {/* Componente Bubble */}
      <Bubble show={!!activeBubble} onClose={handleBubbleClose} message={undefined} type={undefined}>
        {activeBubble === "perfil" && bubbleData && (
          <PerfilOtroComponent username={bubbleData.creador?.username} />
        )}
      </Bubble>
    </div>
  );
}
