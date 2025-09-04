import React, { useState, useEffect } from "react";
import "../../../perfil/bento-perfil/bento-perfil-style.css";
import "./evento-style.css";
import "../calendario1/calendario-style.css";
import "../bento-inicio/bento-inicio-style.css";
import customAxios from "@/service/api.mjs";
import Bubble from "../bubble/bubble";
import PerfilOtro from "@/app/perfil-otro/page";
import dynamic from "next/dynamic";
import { FC } from "react";

// Tipado del componente dinámico
interface PerfilOtroProps {
  username: string;
}
const PerfilOtroComponent: FC<PerfilOtroProps> = dynamic(
  () => import('@/app/perfil-otro/PerfilOtroCliente'),
  { ssr: false }
) as unknown as FC<PerfilOtroProps>;

export default function Eventos({ fechaSeleccionada }) {
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [activeBubble, setActiveBubble] = useState(null);
  const [bubbleData, setBubbleData] = useState(null);
  const [editFormData, setEditFormData] = useState({
    titulo: '',
    fecha_evento: '',
    tipo: '',
    descripcion: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEventos = async () => {
    try {
      const response = await customAxios.get(
        "/evento/todos",
        { withCredentials: true }
      );
      if (Array.isArray(response.data)) {
        setEventos(response.data);
      } else {
        setEventos([]); // Si no es un array, asigna un array vacío
      }
    } catch (error) {
      console.error("Error fetching eventos:", error);
      setEventos([]); // En caso de error, asigna un array vacío
    }
  };

  // Ejecutar fetchEventos al montar el componente
  useEffect(() => {
    fetchEventos();
  }, []);

  // Filtrar eventos por búsqueda (si hay consulta) o mostrar todos
  const filteredEvents = searchQuery.length > 0 
    ? eventos.filter((evento) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          evento.titulo.toLowerCase().includes(searchLower) ||
          new Date(evento.fecha_evento).toLocaleDateString().includes(searchLower) ||
          evento.creador.username.toLowerCase().includes(searchLower)
        );
      })
    : eventos;

  // Filtrar eventos por la fecha seleccionada
  useEffect(() => {
    if (fechaSeleccionada) {
      const eventosHoy = eventos.filter((evento) => {
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

  const handleSelectEvent = (eventoId) => {
    const eventoSeleccionado = filteredEvents.find((evento) => evento.id === eventoId);
    if (eventoSeleccionado) {
      // Si el evento ya está seleccionado, deseleccionarlo; si no, seleccionarlo.
      setSelectedEvent((prevSelected) =>
        prevSelected?.id === eventoId ? null : eventoSeleccionado
      );
    }
  };

  // Crear evento
  const handleCrearEvento = async (eventData) => {
    try {
      await customAxios.post("/evento/crear", eventData);
      setConfirmationMessage("¡Evento creado con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
      fetchEventos(); // Actualizar la lista de eventos
    } catch (error) {
      console.error("Error al crear evento:", error);
      setConfirmationMessage("Hubo un error al crear el evento.");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };

  const handleUnirseEvento = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      setConfirmationMessage("Por favor, selecciona un evento para unirte.");
      setMessageType("error");
      setFormSubmitted(true);
      return;
    }

    try {
      const eventoId = selectedEvent.id;
      await customAxios.post(`/evento/entrar/${eventoId}`);
      setConfirmationMessage("Inscrito en el evento con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
      fetchEventos(); // Actualizar la lista de eventos
    } catch (error) {
      setConfirmationMessage("Hubo un error al recuperar el evento.");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };

  const handleDatosEvento = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      setConfirmationMessage("Por favor, selecciona un evento para ver sus datos.");
      setMessageType("error");
      setFormSubmitted(true);
      return;
    }

    try {
      const eventoId = selectedEvent.id;
      await customAxios.get(`/evento/data/${eventoId}`);
      setFormSubmitted(true);
    } catch (error) {
      setConfirmationMessage("Hubo un error al recuperar el evento.");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };

  // Manejo de apertura y cierre de burbujas (popups)
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
            <li
              key={evento.id}
              className="evento-item"
              onClick={() => handleBubbleOpen("perfil", evento)}
            >
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
        <p>No hay eventos en esta fecha</p>
      )}

      {/* Componente Bubble */}
      <Bubble 
        show={!!activeBubble}
        onClose={handleBubbleClose}
        message={confirmationMessage} // Pasar el mensaje de confirmación
        type={messageType} // Pasar el tipo de mensaje (success o error)
      >
        {activeBubble === "perfil" && bubbleData && (
          <PerfilOtroComponent username={bubbleData.creador?.username} />
        )}
        {activeBubble === "crear-evento" && !formSubmitted && (
          <div>
            <p>Crear un nuevo evento</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const eventData = {
                  titulo: e.target["titulo"].value,
                  tipo: e.target["tipo"].value,
                  fecha_evento: e.target["fecha_evento"].value,
                  descripcion: e.target["descripcion"].value,
                };
                handleCrearEvento(eventData);
              }}
              className="crear-evento-form"
            >
              <div className="form-group">
                <input
                  type="text"
                  id="titulo"
                  name="titulo" // Añadir el name
                  className="form-control"
                  placeholder="Introduce el nombre del evento"
                />
              </div>
              <div className="form-group">
                <textarea
                  id="descripcion"
                  name="descripcion" // Añadir el name
                  placeholder="Detalles del evento"
                  rows={4}
                  className="form-control"
                ></textarea>
              </div>
              <div className="form-group">
                <input
                  type="datetime-local"
                  id="fecha_evento"
                  name="fecha_evento"
                  className="form-control"
                />
              </div>
              <div className="tipo-opciones">
                  <label>
                    <input
                      type="radio"
                      name="tipo"
                      value="publico"
                      checked={editFormData.tipo === "publico"}
                      onChange={(e) => setEditFormData({ ...editFormData, tipo: e.target.value })}
                    />
                    <p className="text-label">Público</p>
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="tipo"
                      value="privado"
                      checked={editFormData.tipo === "privado"}
                      onChange={(e) => setEditFormData({ ...editFormData, tipo: e.target.value })}
                    />
                    <p className="text-label">Privado</p>
                  </label>
                </div>
              <div className="contenedor-botn-evento">
                <button className="botn-eventos" onClick={handleBubbleClose}>Cerrar</button>
                <button className="botn-eventos enviar" type="submit">Crear</button>
              </div>          
            </form>
          </div>
        )}

        {activeBubble === "buscar-evento" && !formSubmitted && (
          <div className="contenedor-buscar">
            <p>Buscar evento</p>
            <input
              className="buscador"
              type="text"
              placeholder="Introduce el nombre o fecha del evento"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              
            />
            <div className="contenedor-eventos">
              <ul>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((evento) => (
                    <li
                      key={evento.id}
                      className={selectedEvent?.id === evento.id ? 'selected' : ''}
                      onClick={() => handleSelectEvent(evento.id)} // Cambiar estado al hacer clic
                    >
                      <div className="portfolio-icono">
                        <img src={evento.creador.avatar || "/default-avatar.png"} className="avatar-imagen" alt="Avatar" />
                      </div>
                      <div className="evento-detalles">
                        <p className="evento-creador">{evento.creador.username}</p>
                        <p className="evento-titulo">{evento.titulo}</p>
                        <p className="evento-fecha">{formatDateTime(evento.fecha_evento)}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p>No se encontraron eventos</p>
                )}
              </ul>
            </div>
            <div className="contenedor-botn-evento">
              <button className="botn-eventos" onClick={handleBubbleClose}>Cerrar</button>
              <button
                className="botn-eventos enviar"
                onClick={handleDatosEvento}
                disabled={!selectedEvent} // Deshabilitar si no hay evento seleccionado
              >
                Seleccionar
              </button>
            </div>
          </div>
        )}

        {formSubmitted && selectedEvent && (
          <div className="evento-detalle">
            <p>Título: {selectedEvent.titulo}</p>
            <p><strong>Fecha:</strong> {new Date(selectedEvent.fecha_evento).toLocaleDateString()}</p>
            <p><strong>Creado por:</strong> {selectedEvent.creador?.username || "Desconocido"}</p>
            <p><strong>Tipo:</strong> {selectedEvent.tipo || "Desconocido"}</p>
            <p><strong>Descripción:</strong> {selectedEvent.descripcion || "Desconocido"}</p>
            <p><strong>Participantes:</strong> {selectedEvent.participantes || "Ninguno"}</p>

            <div className="contenedor-botn-evento">
              <button className="botn-eventos" onClick={() => setFormSubmitted(false)}>
                Volver
              </button>
              {selectedEvent.esCreador !== true && (
                <button className="botn-eventos enviar" onClick={handleUnirseEvento} disabled={!selectedEvent}>
                  Unirse
                </button>
              )}
            </div>
          </div>
        )}
      </Bubble>
    </div>
  );
}
