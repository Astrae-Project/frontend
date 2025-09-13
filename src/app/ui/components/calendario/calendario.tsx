import React, { useEffect, useState } from "react";
import Bubble from "../bubble/bubble"; // Componente reutilizable
import "../calendario1/calendario-style.css";
import "../bento-inicio/bento-inicio-style.css";
import "../eventos/evento-style.css";
import { Calendar } from "./calendar";
import { isPast, isToday } from "date-fns";
import {
  IconPlus,
  IconTrash,
  IconPencil,
  IconSearch,
  IconShare3,
} from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";

export default function Calendario({ eventos = [], onFechaSeleccionada }) {
  type Evento = {
    id: number;
    titulo: string;
    descripcion?: string;
    fecha_evento: string;
    creador?: { username: string; avatar?: string };
  };

  const [eventosUsuario, setEventosUsuario] = useState<Evento[]>([]);
  const [eventosState, setEventosState] = useState<Evento[]>([]);  const [date, setDate] = useState(new Date());
  const [month, setMonth] = useState(new Date());
  const [activeBubble, setActiveBubble] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    titulo: "",
    fecha_evento: "",
    tipo: "",
    descripcion: "",
  });
  const [step, setStep] = useState(1);

  const goToEditForm = () => setStep(2);

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate || new Date());
    onFechaSeleccionada(selectedDate || new Date());
  };

  const handleGoToToday = () => {
    const today = new Date();
    setDate(today);
    setMonth(today);
    onFechaSeleccionada(today);
  };

  const handleSelectEvent = (eventoId: number) => {
  const fuente = [...eventosUsuario, ...eventosState];
  const uniq = Object.values(
    fuente.reduce((acc: Record<number, Evento>, ev) => {
      acc[ev.id] = acc[ev.id] || ev;
      return acc;
    }, {})
  );
  const eventoSeleccionado = uniq.find((evento) => evento.id === eventoId);

    if (eventoSeleccionado) {
      setSelectedEvent((prev) =>
        prev?.id === eventoId ? null : eventoSeleccionado
      );
    }
  };


  // Para el calendario usamos los eventos del usuario
  const fechasEventos =
    eventosUsuario.length > 0
      ? eventosUsuario.map((evento) => new Date(evento.fecha_evento))
      : [];

  // trae todos los eventos (para el buscador)
  const fetchEventos = async () => {
    try {
      const response = await customAxios.get("/evento/todos", {
        withCredentials: true,
      });
      if (Array.isArray(response.data)) setEventosState(response.data);
      else setEventosState([]);
    } catch (error) {
      console.error("Error fetching eventos (todos):", error);
      setEventosState([]);
    }
  };

  // trae solo los eventos del usuario (endpoint separado)
  const fetchEventosUsuario = async () => {
    try {
      // Ajusta el endpoint si en tu backend tiene otro nombre (p.e. /evento/mis, /evento/propios, /evento/usuario)
      const response = await customAxios.get("/evento/mios", {
        withCredentials: true,
      });
      if (Array.isArray(response.data)) setEventosUsuario(response.data);
      else setEventosUsuario([]);
    } catch (error) {
      console.error("Error fetching eventos (usuario):", error);
      setEventosUsuario([]);
    }
  };

  useEffect(() => {
    fetchEventos();
    fetchEventosUsuario();
  }, []);

  // filtrado para buscador (usa todos los eventos)
  const filteredEvents =
    searchQuery.length > 0
      ? eventosState.filter((evento) => {
          const searchLower = searchQuery.toLowerCase();
          return (
            (evento.titulo || "").toLowerCase().includes(searchLower) ||
            (new Date(evento.fecha_evento).toLocaleDateString() || "")
              .toLowerCase()
              .includes(searchLower) ||
            (evento.creador?.username || "").toLowerCase().includes(searchLower)
          );
        })
      : eventosState;

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

  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage("");
    setFormSubmitted(false);
    // limpiar selección opcional
    // setSelectedEvent(null);
  };

  const handleCrearEvento = async (eventData) => {
    try {
      await customAxios.post("/evento/crear", eventData);
      setConfirmationMessage("¡Evento creado con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
      await fetchEventos();
      await fetchEventosUsuario();
    } catch (error) {
      console.error("Error al crear evento:", error);
      setConfirmationMessage("Hubo un error al crear el evento.");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };

  const handleEliminarEvento = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      setConfirmationMessage("Por favor, selecciona un evento para eliminar.");
      setMessageType("error");
      setFormSubmitted(true);
      return;
    }

    try {
      const eventoId = selectedEvent.id;
      await customAxios.delete(`/evento/eliminar/${eventoId}`);
      setConfirmationMessage("Evento eliminado con éxito");
      setMessageType("success");
      setFormSubmitted(true);
      setSelectedEvent(null);
      await fetchEventos();
      await fetchEventosUsuario();
    } catch (error) {
      console.error("Error eliminar evento:", error);
      setConfirmationMessage("Hubo un error al eliminar el evento.");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };

  const handleDesinscribirseEvento = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      setConfirmationMessage("Por favor, selecciona un evento para desinscribirte.");
      setMessageType("error");
      setFormSubmitted(true);
      return;
    }

    try {
      const eventoId = selectedEvent.id;
      await customAxios.delete(`/evento/salir/${eventoId}`);
      setConfirmationMessage("Te has desinscrito del evento con éxito");
      setMessageType("success");
      setFormSubmitted(true);
      setSelectedEvent(null);
      await fetchEventosUsuario();
      await fetchEventos();
    } catch (error) {
      console.error("Error desinscribirse:", error);
      setConfirmationMessage("Hubo un error al desinscribirte del evento.");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };

  useEffect(() => {
    if (selectedEvent) {
      setEditFormData({
        titulo: selectedEvent.titulo || "",
        descripcion: selectedEvent.descripcion || "",
        tipo: selectedEvent.tipo || "publico",
        fecha_evento: selectedEvent.fecha_evento || "",
      });
    }
  }, [selectedEvent]);

  const handleEditarEvento = async (eventData) => {
    if (!selectedEvent || !selectedEvent.id) {
      setConfirmationMessage("Por favor, selecciona un evento para editar.");
      setMessageType("error");
      setFormSubmitted(true);
      return;
    }

    try {
      const eventoId = selectedEvent.id;
      await customAxios.put(`/evento/datos/${eventoId}`, eventData);
      setConfirmationMessage("¡Evento editado con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
      setSelectedEvent(null);
      setStep(1);
      await fetchEventos();
      await fetchEventosUsuario();
    } catch (error) {
      console.error("Error editar evento:", error);
      setConfirmationMessage("Hubo un error al editar el evento.");
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
      console.error("Error obtener datos evento:", error);
      setConfirmationMessage("Hubo un error al recuperar el evento.");
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
      await fetchEventosUsuario();
      await fetchEventos();
    } catch (error) {
      console.error("Error unirse evento:", error);
      setConfirmationMessage("Hubo un error al unirte al evento.");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };

  return (
    <div className="contenedor-calendario">
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateChange}
        month={month}
        onMonthChange={setMonth}
        className="calendario"
        modifiers={{
          hasEvent: (day) =>
            fechasEventos.some(
              (fecha) => fecha.toDateString() === day.toDateString()
            ),
          isPast: (day) => isPast(day) && !isToday(day),
        }}
        modifiersClassNames={{
          hasEvent: "day-has-event",
          isPast: "day-outside",
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
        <button
          className="apartado botones"
          id="pequeño3"
          onClick={() => setActiveBubble("crear-evento")}
        >
          <IconPlus className="iconos-calendar" />
        </button>
        <button
          className="apartado botones"
          id="pequeño4"
          onClick={() => setActiveBubble("eliminar-evento")}
        >
          <IconTrash className="iconos-calendar" />
        </button>
        <button
          className="apartado botones"
          id="pequeño5"
          onClick={() => setActiveBubble("editar-evento")}
        >
          <IconPencil className="iconos-calendar" />
        </button>
        <button
          className="apartado botones"
          id="pequeño6"
          onClick={() => setActiveBubble("buscar-evento")}
        >
          <IconSearch className="iconos-calendar" />
        </button>
        <button
          className="apartado botones"
          id="pequeño7"
          onClick={() => setActiveBubble("compartir-evento")}
        >
          <IconShare3 className="iconos-calendar" />
        </button>
      </div>

      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage}
        type={messageType}
      >
        {activeBubble === "crear-evento" && !formSubmitted && (
          <div>
            <p>Crear un nuevo evento</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fecha = e.target["fecha_evento"].value;
                const hora = e.target["hora_evento"].value;
                const fechaCompleta = `${fecha}T${hora}`;
                const eventData = {
                  titulo: e.target["titulo"].value,
                  tipo: e.target["tipo"].value,
                  fecha_evento: fechaCompleta,
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
                  name="titulo"
                  className="form-control"
                  placeholder="Introduce el nombre del evento"
                />
              </div>
              <div className="form-group">
                <textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Detalles del evento"
                  rows={4}
                  className="form-control"
                ></textarea>
              </div>
              <div className="form-group datetime-group">
                <input
                  type="date"
                  id="fecha_evento"
                  name="fecha_evento"
                  className="form-control date-input"
                  required
                />
                <input
                  type="time"
                  id="hora_evento"
                  name="hora_evento"
                  className="form-control time-input"
                  required
                />
              </div>
              <div className="tipo-opciones">
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="publico"
                    checked={editFormData.tipo === "publico"}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, tipo: e.target.value })
                    }
                  />
                  <p className="text-label">Público</p>
                </label>
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="privado"
                    checked={editFormData.tipo === "privado"}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, tipo: e.target.value })
                    }
                  />
                  <p className="text-label">Privado</p>
                </label>
              </div>
              <div className="contenedor-botn-evento">
                <button className="botn-eventos" onClick={closeBubble}>
                  Cerrar
                </button>
                <button className="botn-eventos enviar" type="submit">
                  Crear
                </button>
              </div>
            </form>
          </div>
        )}

        {activeBubble === "eliminar-evento" && !formSubmitted && (
          <div>
            <p>Selecciona un evento</p>
            <div className="contenedor-eventos">
              {eventosUsuario.length === 0 ? (
                <p>No hay eventos disponibles</p>
              ) : (
                <ul>
                  {eventosUsuario.map((evento) => (
                    <li
                      key={evento.id}
                      className={
                        selectedEvent?.id === evento.id
                          ? "evento-item selected"
                          : "evento-item"
                      }
                      onClick={() => handleSelectEvent(evento.id)}
                    >
                      <div className="portfolio-icono">
                        <img
                          src={evento.creador?.avatar || "/default-avatar.png"}
                          className="avatar-imagen"
                          alt="avatar"
                        />
                      </div>
                      <div className="evento-detalles1">
                        <p className="evento-creador">
                          {evento.creador?.username}
                        </p>
                        <p className="evento-titulo">{evento.titulo}</p>
                        <p className="evento-fecha">
                          {formatDateTime(evento.fecha_evento)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="contenedor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>
                Cerrar
              </button>
              <button
                className="botn-eventos enviar"
                onClick={
                  selectedEvent?.esCreador ? handleEliminarEvento : handleDesinscribirseEvento
                }
                disabled={!selectedEvent}
              >
                {selectedEvent?.esCreador ? "Eliminar" : "Desinscribirse"}
              </button>
            </div>
          </div>
        )}

        {activeBubble === "editar-evento" && step === 1 && !formSubmitted && (
          <div>
            <p>Selecciona un evento para modificar</p>
            <div className="contenedor-eventos">
              {eventosUsuario.length === 0 ? (
                <p>No hay eventos disponibles</p>
              ) : (
                <ul>
                  {eventosUsuario
                    .filter((evento) => evento.esCreador)
                    .map((evento) => (
                      <li
                        key={evento.id}
                        className={
                          selectedEvent?.id === evento.id
                            ? "evento-item selected"
                            : "evento-item"
                        }
                        onClick={() => handleSelectEvent(evento.id)}
                      >
                        <div className="portfolio-icono">
                          <img
                            src={evento.creador?.avatar || "/default-avatar.png"}
                            className="avatar-imagen"
                            alt="avatar"
                          />
                        </div>
                        <div className="evento-detalles1">
                          <p className="evento-creador">
                            {evento.creador?.username}
                          </p>
                          <p className="evento-titulo">{evento.titulo}</p>
                          <p className="evento-fecha">
                            {formatDateTime(evento.fecha_evento)}
                          </p>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div className="contenedor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>
                Cerrar
              </button>
              <button
                className="botn-eventos enviar"
                onClick={goToEditForm}
                disabled={!selectedEvent}
              >
                Seleccionar
              </button>
            </div>
          </div>
        )}

        {activeBubble == "editar-evento" && step === 2 && selectedEvent && (
          <div className="edit-form-container">
            <p>Editando evento seleccionado</p>
            <form
              className="edit-event-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleEditarEvento(editFormData);
                setFormSubmitted(true);
                setStep(1);
              }}
            >
              <div className="form-group">
                <input
                  type="text"
                  id="titulo"
                  className="form-control"
                  value={editFormData.titulo}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, titulo: e.target.value })
                  }
                  placeholder="Introduce el nombre del evento"
                />
              </div>
              <div className="form-group">
                <textarea
                  id="descripcion"
                  className="form-control"
                  value={editFormData.descripcion}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, descripcion: e.target.value })
                  }
                  placeholder="Introduce la descripción del evento"
                />
              </div>
              <div className="datetime-group">
                <input
                  type="date"
                  className="form-control date-input"
                  value={
                    editFormData.fecha_evento ? editFormData.fecha_evento.split("T")[0] : ""
                  }
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      fecha_evento: `${e.target.value}T${prev.fecha_evento?.split("T")[1] || "12:00"}`,
                    }))
                  }
                />
                <input
                  type="time"
                  className="form-control time-input"
                  value={editFormData.fecha_evento ? editFormData.fecha_evento.split("T")[1] : ""}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      fecha_evento: `${prev.fecha_evento?.split("T")[0] || "2025-06-13"}T${e.target.value}`,
                    }))
                  }
                />
              </div>
              <div className="tipo-opciones">
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="publico"
                    checked={editFormData.tipo === "publico"}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, tipo: e.target.value })
                    }
                  />
                  <p className="text-label">Público</p>
                </label>
                <label>
                  <input
                    type="radio"
                    name="tipo"
                    value="privado"
                    checked={editFormData.tipo === "privado"}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, tipo: e.target.value })
                    }
                  />
                  <p className="text-label">Privado</p>
                </label>
              </div>
              <div className="contenedor-botn-evento">
                <button
                  className="botn-eventos"
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setSelectedEvent(null);
                  }}
                >
                  Atrás
                </button>
                <button type="submit" className="botn-eventos enviar">
                  Editar
                </button>
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
                      className={
                        selectedEvent?.id === evento.id ? "evento-item selected" : "evento-item"
                      }
                      onClick={() => handleSelectEvent(evento.id)}
                    >
                      <div className="portfolio-icono">
                        <img
                          src={evento.creador?.avatar || "/default-avatar.png"}
                          className="avatar-imagen"
                          alt="Avatar"
                        />
                      </div>
                      <div className="evento-detalles1">
                        <p className="evento-creador">{evento.creador?.username}</p>
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
              <button className="botn-eventos" onClick={closeBubble}>
                Cerrar
              </button>
              <button
                className="botn-eventos enviar"
                onClick={handleDatosEvento}
                disabled={!selectedEvent}
              >
                Seleccionar
              </button>
            </div>
          </div>
        )}

        {formSubmitted && selectedEvent && (
          <div className="evento-card">
            <div className="evento-header">
              <h3>Evento</h3>
              <span className="evento-fecha2">
                {new Date(selectedEvent.fecha_evento).toLocaleDateString()}
              </span>
            </div>

            <div className="evento-body">
              <div className="evento-dato">
                <span className="dato-label">Título</span>
                <span className="dato-valor">{selectedEvent.titulo}</span>
              </div>

              <div className="evento-dato">
                <span className="dato-label">Descripción</span>
                <span className="dato-valor">{selectedEvent.descripcion || "Sin descripción"}</span>
              </div>

              <div className="evento-dato">
                <span className="dato-label">Tipo</span>
                <span className="dato-valor">{selectedEvent.tipo || "Desconocido"}</span>
              </div>

              <div className="evento-dato">
                <span className="dato-label">Creado por</span>
                <span className="dato-valor">{selectedEvent.creador?.username || "Desconocido"}</span>
              </div>

              <div className="evento-dato">
                <span className="dato-label">Participantes</span>
                <span className="dato-valor">
                  {Array.isArray(selectedEvent.participantes)
                    ? selectedEvent.participantes.length
                    : selectedEvent.participantes || "Ninguno"}
                </span>
              </div>
            </div>

            <div className="evento-footer">
              <button className="botn-eventos" onClick={() => setFormSubmitted(false)}>
                Volver
              </button>
              {selectedEvent.esCreador !== true && (
                <button
                  className="botn-eventos enviar"
                  onClick={handleUnirseEvento}
                  disabled={!selectedEvent}
                >
                  Unirse
                </button>
              )}
            </div>
          </div>
        )}

        {activeBubble === "compartir-evento" && (
          <div>
            <p>Selecciona un evento para compartir</p>
            <div className="contenedor-eventos">
              {eventosUsuario.length === 0 ? (
                <p>No hay eventos disponibles</p>
              ) : (
                <ul>
                  {eventosUsuario.map((evento) => (
                    <li
                      key={evento.id}
                      className={`evento-item ${selectedEvent?.id === evento.id ? "selected" : ""}`}
                      onClick={() => handleSelectEvent(evento.id)}
                    >
                      <div className="portfolio-icono">
                        <img
                          src={evento.creador?.avatar || "/default-avatar.png"}
                          className="avatar-imagen"
                          alt="avatar"
                        />
                      </div>
                      <div className="evento-detalles1">
                        <p className="evento-creador">{evento.creador?.username}</p>
                        <p className="evento-titulo">{evento.titulo}</p>
                        <p className="evento-fecha">{formatDateTime(evento.fecha_evento)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="contenedor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
              <button className="botn-eventos enviar" onClick={closeBubble} disabled={!selectedEvent}>Enviar</button>
            </div>
          </div>
        )}
      </Bubble>
    </div>
  );
}