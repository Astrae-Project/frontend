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
  const eventosArray = Array.isArray(eventos) ? eventos : [];

  const [eventosState, setEventosState] = useState([]); // Estado para almacenar los eventos
  const [date, setDate] = useState(new Date()); // Fecha seleccionada
  const [month, setMonth] = useState(new Date()); // Mes mostrado en el calendario
  const [activeBubble, setActiveBubble] = useState(null); // Estado dinámico para burbujas
  const [formSubmitted, setFormSubmitted] = useState(false); // Estado para manejar si el formulario ha sido enviado
  const [confirmationMessage, setConfirmationMessage] = useState(""); // Mensaje de confirmación
  const [messageType, setMessageType] = useState(""); // Tipo de mensaje ("success" o "error")
  const [searchQuery, setSearchQuery] = useState(""); // Estado para la búsqueda
  const [selectedEvent, setSelectedEvent] = useState(null); // Para controlar el evento seleccionado
  const [editFormData, setEditFormData] = useState({
    titulo: '',
    fecha_evento: '',
    tipo: '',
    descripcion: ''
  });
  const [step, setStep] = useState(1); // Paso actual (1 = seleccionar evento, 2 = editar evento)

  const goToEditForm = () => {
    setStep(2); // Pasar al paso 2 (Formulario de edición)
  };

  // Manejar la selección de fecha
  const handleDateChange = (selectedDate) => {
    setDate(selectedDate || new Date());
    onFechaSeleccionada(selectedDate || new Date());
  };

  // Función para volver al día actual
  const handleGoToToday = () => {
    const today = new Date();
    setDate(today);
    setMonth(today);
    onFechaSeleccionada(today);
  };

  const handleSelectEvent = (eventoId) => {
    // Buscar el evento seleccionado en la lista de eventos filtrados
    const eventoSeleccionado = filteredEvents.find((evento) => evento.id === eventoId);
  
    if (eventoSeleccionado) {
      // Si el evento ya está seleccionado, deseleccionarlo. Si no, seleccionarlo.
      setSelectedEvent((prevSelected) => (prevSelected?.id === eventoId ? null : eventoSeleccionado));
    }
  };
  
  
  const fechasEventos = eventosArray.length > 0 
    ? eventosArray.map((evento) => new Date(evento.fecha_evento)) 
    : [];

  const fetchEventos = async () => {
    try {
      const response = await customAxios.get(
        "https://api.astraesystem.com/api/evento/todos",
        { withCredentials: true }
      );
      if (Array.isArray(response.data)) {
        setEventosState(response.data);
      } else {
        setEventosState([]); // Si no es un array, asignamos un array vacío
      }
    } catch (error) {
      console.error("Error fetching eventos:", error);
      setEventosState([]); // En caso de error, asignamos un array vacío
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const filteredEvents = searchQuery.length > 0 
    ? eventosState.filter((evento) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          evento.titulo.toLowerCase().includes(searchLower) ||
          new Date(evento.fecha_evento).toLocaleDateString().includes(searchLower) ||
          evento.creador.username.toLowerCase().includes(searchLower)
        );
      })
    : eventosState; // Si no hay búsqueda, devuelve todos los eventos

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

  // Función para cerrar la burbuja
  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage(""); // Limpiar el mensaje de confirmación
    setFormSubmitted(null); // Reiniciar el estado del formulario
  };

  // Crear evento
  const handleCrearEvento = async (eventData) => {
    try {
      await customAxios.post("https://api.astraesystem.com/api/evento/crear", eventData);
      setConfirmationMessage("¡Evento creado con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error al crear evento:", error);
      setConfirmationMessage("Hubo un error al crear el evento.");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };

  
  // Función para eliminar el evento
  const handleEliminarEvento = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      setConfirmationMessage("Por favor, selecciona un evento para eliminar.");
      setMessageType("error");
      setFormSubmitted(true);
      return; // Verificar si hay un evento seleccionado
    }
  
    try {
      const eventoId = selectedEvent.id;
      const response = await customAxios.delete(`https://api.astraesystem.com/api/evento/eliminar/${eventoId}`);
  
      // Actualizar el estado para eliminar el evento del listado
      setConfirmationMessage("Evento eliminado con éxito");
      setMessageType("success");
      setFormSubmitted(true);
      setSelectedEvent(null); // Limpiar selección después de eliminar
    } catch (error) {
      setConfirmationMessage("Hubo un error al eliminar el evento.");
      setMessageType("error");
      setFormSubmitted(true);
    }
  };

  // Función para desinscribirse de un evento (solo para participantes)
  const handleDesinscribirseEvento = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      setConfirmationMessage("Por favor, selecciona un evento para desinscribirte.");
      setMessageType("error");
      setFormSubmitted(true);
      return; // Verificar si hay un evento seleccionado
    }
  
    try {
      const eventoId = selectedEvent.id;
      const response = await customAxios.delete(`https://api.astraesystem.com/api/evento/salir/${eventoId}`);
  
      setConfirmationMessage("Te has desinscrito del evento con éxito");
      setMessageType("success");
      setFormSubmitted(true);
      setSelectedEvent(null); // Limpiar selección después de desinscribirse
    } catch (error) {
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
      fecha_evento: selectedEvent.fecha_evento || "", // Debe ser un string tipo "2025-06-13T14:30"
    });
  }
}, [selectedEvent]);

  const handleEditarEvento = async (eventData) => {
    if (!selectedEvent || !selectedEvent.id) {
      setConfirmationMessage("Por favor, selecciona un evento para editar.");
      setMessageType("error");
      setFormSubmitted(true);
      return; // Verificar si hay un evento seleccionado
    }

    try {
      const eventoId = selectedEvent.id;
      const response = await customAxios.put(`https://api.astraesystem.com/api/evento/datos/${eventoId}`, eventData);

      setConfirmationMessage("¡Evento editado con éxito!"); // Mensaje de éxito
      setMessageType("success"); // Tipo de mensaje de éxito
      setFormSubmitted(true); // Cambiar el estado para ocultar el formulario
    } catch (error) {
      setConfirmationMessage("Hubo un error al editar el evento."); // Mensaje de error
      setMessageType("error"); // Tipo de mensaje de error
      setFormSubmitted(true); // Cambiar el estado para ocultar el formulario
    }
  };

  const handleDatosEvento = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      setConfirmationMessage("Por favor, selecciona un evento para ver sus datos.");
      setMessageType("error");
      setFormSubmitted(true);
      return; // Verificar si hay un evento seleccionado
    }

    try {
      const eventoId = selectedEvent.id;
      const response = await customAxios.get(`https://api.astraesystem.com/api/evento/data/${eventoId}`);
      setFormSubmitted(true); // Cambiar el estado para ocultar el formulario
    } catch (error) {
      setConfirmationMessage("Hubo un error al recuperar el evento."); // Mensaje de error
      setMessageType("error"); // Tipo de mensaje de error
      setFormSubmitted(true); // Cambiar el estado para ocultar el formulario
    }
  };

  const handleUnirseEvento = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      setConfirmationMessage("Por favor, selecciona un evento para unirte.");
      setMessageType("error");
      setFormSubmitted(true);
      return; // Verificar si hay un evento seleccionado
    }

    try {
      const eventoId = selectedEvent.id;
      const response = await customAxios.post(`https://api.astraesystem.com/api/evento/entrar/${eventoId}`);
      setConfirmationMessage("Inscrito en el evento con éxito!"); // Mensaje de éxito
      setMessageType("success"); // Tipo de mensaje de éxito
      setFormSubmitted(true); // Cambiar el estado para ocultar el formulario
    } catch (error) {
      setConfirmationMessage("Hubo un error al recuperar el evento."); // Mensaje de error
      setMessageType("error"); // Tipo de mensaje de error
      setFormSubmitted(true); // Cambiar el estado para ocultar el formulario
    }
  };

  return (
    <div className="contenedor-calendario">
      {/* Calendario */}
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

      {/* Botones */}
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

      {/* Componente Bubble */}
      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        message={confirmationMessage} // Pasar el mensaje de confirmación
        type={messageType} // Pasar el tipo de mensaje (success o error)
      >
        {activeBubble === "crear-evento" && !formSubmitted && (
          <div>
            <p>Crear un nuevo evento</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();

                const fecha = e.target["fecha_evento"].value;
                const hora = e.target["hora_evento"].value;
                const fechaCompleta = `${fecha}T${hora}`; // Combina fecha y hora

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
              <div className="contendor-botn-evento">
                <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
                <button className="botn-eventos enviar" type="submit">Crear</button>
              </div>          
            </form>
          </div>
        )}

        {activeBubble === "eliminar-evento" && !formSubmitted && (
            <div>
              <p>Selecciona un evento</p>
              <div className="contenedor-eventos">
              {eventosArray.length === 0 ? (
                <p>No hay eventos disponibles</p> // Mensaje cuando no hay eventos
              ) : (
                <ul>
                  {eventosArray.map((evento) => (
                    <li
                      key={evento.id}
                      className={selectedEvent?.id === evento.id ? 'evento-item selected' : 'evento-item'}
                      onClick={() => handleSelectEvent(evento.id)} // Cambiar estado al hacer clic
                    >
                      <div className="portfolio-icono">
                        <img src={evento.creador.avatar || "/default-avatar.png"} className="avatar-imagen" />
                      </div>
                      <div className="evento-detalles1">
                        <p className="evento-creador">{evento.creador.username}</p>
                        <p className="evento-titulo">{evento.titulo}</p>
                        <p className="evento-fecha">{formatDateTime(evento.fecha_evento)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              </div>
              <div className="contendor-botn-evento">
                <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
                <button
                  className="botn-eventos enviar"
                  onClick={selectedEvent?.esCreador ? handleEliminarEvento : handleDesinscribirseEvento}
                  disabled={!selectedEvent}
                >
                  {selectedEvent?.esCreador ? "Eliminar" :"Desinscribirse"}
                </button>
              </div>          
            </div>
          )}

          {activeBubble === 'editar-evento' && step === 1 && !formSubmitted && (
            <div>
              <p>Selecciona un evento para modificar</p>
              <div className="contenedor-eventos">
                {eventosArray.length === 0 ? (
                  <p>No hay eventos disponibles</p> // Mensaje cuando no hay eventos
                ) : (
                  <ul>
                    {eventosArray
                      .filter((evento) => evento.esCreador) // Filtrar solo los eventos donde el usuario es el creador
                      .map((evento) => (
                        <li
                          key={evento.id}
                          className={selectedEvent?.id === evento.id ? 'evento-item selected' : 'evento-item'}
                          onClick={() => handleSelectEvent(evento.id)} // Cambiar estado al hacer clic
                        >
                          <div className="portfolio-icono">
                            <img src={evento.creador.avatar || "/default-avatar.png"} className="avatar-imagen" />
                          </div>
                          <div className="evento-detalles1">
                            <p className="evento-creador">{evento.creador.username}</p>
                            <p className="evento-titulo">{evento.titulo}</p>
                            <p className="evento-fecha">{formatDateTime(evento.fecha_evento)}</p>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
              <div className="contendor-botn-evento">
                <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
                <button 
                  className="botn-eventos enviar"
                  onClick={goToEditForm} 
                  disabled={!selectedEvent} // Deshabilitar si no hay evento seleccionado
                >
                  Seleccionar
                </button>
              </div>
            </div>
          )}

        {activeBubble == 'editar-evento' && step === 2 && selectedEvent && (
          <div className="edit-form-container">
            <p>Editando evento seleccionado</p>
            <form
              className="edit-event-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleEditarEvento(editFormData);
                setFormSubmitted(true); // Marca como enviado el formulario
                setStep(1); // Volver al paso 1
              }}
            >
              <div className="form-group">
                <input
                  type="text"
                  id="titulo"
                  className="form-control"
                  value={editFormData.titulo}
                  onChange={(e) => setEditFormData({ ...editFormData, titulo: e.target.value })}
                  placeholder="Introduce el nombre del evento"
                />
              </div>
              <div className="form-group">
                <textarea
                  id="descripcion"
                  className="form-control"
                  value={editFormData.descripcion}
                  onChange={(e) => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                  placeholder="Introduce la descripción del evento"
                />
              </div>
              <div className="datetime-group">
                <input
                  type="date"
                  className="form-control date-input"
                  value={editFormData.fecha_evento ? editFormData.fecha_evento.split("T")[0] : ""}
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
              <div className="contendor-botn-evento">
                <button
                  className="botn-eventos"
                  type="button"
                  onClick={() => {
                    setStep(1); // Volver al paso 1 si se cancela
                    setSelectedEvent(null); // Limpiar selección
                  }}
                >
                  Atrás
                </button>
                <button type="submit" className="botn-eventos enviar">Editar</button>
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
                      className={selectedEvent?.id === evento.id ? 'evento-item selected' : 'evento-item'}
                      onClick={() => handleSelectEvent(evento.id)} // Cambiar estado al hacer clic
                    >
                      <div className="portfolio-icono">
                        <img src={evento.creador.avatar || "/default-avatar.png"} className="avatar-imagen" alt="Avatar" />
                      </div>
                      <div className="evento-detalles1">
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
            <div className="contendor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
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
                <span className="dato-valor">{selectedEvent.participantes || "Ninguno"}</span>
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
            {eventosArray.length === 0 ? (
              <p>No hay eventos disponibles</p> // Mensaje cuando no hay eventos
            ) : (
              <ul>
                {eventosArray.map((evento) => (
                    <li
                    key={evento.id}
                    className={`evento-item ${selectedEvent?.id === evento.id ? 'selected' : ''}`}
                    onClick={() => handleSelectEvent(evento.id)} // Cambiar estado al hacer clic
                    >
                    <div className="portfolio-icono">
                      <img src={evento.creador.avatar || "/default-avatar.png"} className="avatar-imagen" />
                    </div>
                    <div className="evento-detalles1">
                      <p className="evento-creador">{evento.creador.username}</p>
                      <p className="evento-titulo">{evento.titulo}</p>
                      <p className="evento-fecha">{formatDateTime(evento.fecha_evento)}</p>
                    </div>
                    </li>
                ))}
              </ul>
            )}
            </div>
            <div className="contendor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
              <button className="botn-eventos enviar" onClick={closeBubble} disabled={!selectedEvent}>Enviar</button>
            </div>
          </div>
        )}
      </Bubble>
    </div>
  );
}
