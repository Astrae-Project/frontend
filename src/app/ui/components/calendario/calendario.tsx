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

  const [eventosState, setEventos] = useState([]); // Estado para almacenar los eventos
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
    setSelectedEvent((prevSelected) => (prevSelected === eventoId ? null : eventoId));
  };

  const fechasEventos = eventosArray.length > 0 
    ? eventosArray.map((evento) => new Date(evento.fecha_evento)) 
    : [];


  const fetchEventos = async () => {
    try {
      const response = await customAxios.get(
        "http://localhost:5000/api/evento/todos", // Aquí debes asegurarte de que esta ruta devuelva todos los eventos
        { withCredentials: true }
      );
      // Verificamos si la respuesta es un array antes de actualizar el estado
      if (Array.isArray(response.data)) {
        setEventos(response.data);
      } else {
        setEventos([]); // Si no es un array, asignamos un array vacío
      }
    } catch (error) {
      console.error("Error fetching eventos:", error);
      setEventos([]); // En caso de error, asignamos un array vacío
    }
  };
    
  useEffect(() => {
    fetchEventos();
  }, []);  

  // Filtrar los eventos por búsqueda (nombre o fecha)
  const filteredEvents = eventosState.length > 0 
  ? eventosState.filter((evento) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      evento.titulo.toLowerCase().includes(searchLower) ||
      new Date(evento.fecha_evento).toLocaleDateString().includes(searchLower)
    );
  })
  : [];

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
    setFormSubmitted(false); // Reiniciar el estado del formulario
  };

  // Crear evento
  const handleCrearEvento = async (eventData) => {
    console.log(eventData); // Verifica los datos que se están enviando
    try {
      const response = await customAxios.post("http://localhost:5000/api/evento/crear", eventData);
      console.log(response.data);
      setConfirmationMessage("¡Evento creado con éxito!"); // Mensaje de éxito
      setMessageType("success"); // Tipo de mensaje de éxito
      setFormSubmitted(true); // Cambiar el estado para ocultar el formulario
    } catch (error) {
      console.error("Error al crear evento:", error);
      setConfirmationMessage("Hubo un error al crear el evento."); // Mensaje de error
      setMessageType("error"); // Tipo de mensaje de error
      setFormSubmitted(true); // Cambiar el estado para ocultar el formulario
    }
  };
  
  
  // Función para eliminar el evento
  const handleEliminarEvento = async () => {
    if (!selectedEvent) {
      setConfirmationMessage("Por favor, selecciona un evento para eliminar.");
      setMessageType("error");
      setFormSubmitted(true);
      return; // Verificar si hay un evento seleccionado
    }
  
    try {
      // Extraer el id del evento seleccionado
      const eventoId = eventos.find((evento) => evento.id === selectedEvent)?.id;
  
      if (!eventoId) {
        setConfirmationMessage("No se encontró el evento seleccionado.");
        setMessageType("error");
        setFormSubmitted(true);
        return;
      }
  
      const response = await customAxios.delete(`http://localhost:5000/api/evento/eliminar/${eventoId}`);
      console.log(response.data);
  
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
    if (!selectedEvent) {
      setConfirmationMessage("Por favor, selecciona un evento para desinscribirte.");
      setMessageType("error");
      setFormSubmitted(true);
      return; // Verificar si hay un evento seleccionado
    }
  
    try {
      // Extraer el id del evento seleccionado
      const eventoId = eventos.find((evento) => evento.id === selectedEvent)?.id;
  
      if (!eventoId) {
        setConfirmationMessage("No se encontró el evento seleccionado.");
        setMessageType("error");
        setFormSubmitted(true);
        return;
      }
  
      const response = await customAxios.delete(`http://localhost:5000/api/evento/salir/${eventoId}`);
      console.log(response.data);
  
      // Actualizar el estado para eliminar el evento del listado
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
  

  const handleEditarEvento = async (eventData) => {
    if (!selectedEvent) {
      setConfirmationMessage("Por favor, selecciona un evento para eliminar.");
      setMessageType("error");
      setFormSubmitted(true);
      return; // Verificar si hay un evento seleccionado
    }

    try {
      // Extraer el id del evento seleccionado
      const eventoId = eventos.find((evento) => evento.id === selectedEvent)?.id;
  
      if (!eventoId) {
        setConfirmationMessage("No se encontró el evento seleccionado.");
        setMessageType("error");
        setFormSubmitted(true);
        return;
      }

      const response = await customAxios.put(`http://localhost:5000/api/evento/datos/${eventoId}`, eventData);
      console.log(response.data);

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
    if (!selectedEvent) {
      setConfirmationMessage("Por favor, selecciona un evento para eliminar.");
      setMessageType("error");
      setFormSubmitted(true);
      return; // Verificar si hay un evento seleccionado
    }

    try {
      // Extraer el id del evento seleccionado
      const eventoId = selectedEvent.id;
  
      if (!eventoId) {
        setConfirmationMessage("No se encontró el evento seleccionado.");
        setMessageType("error");
        setFormSubmitted(true);
        return;
      }

      const response = await customAxios.get(`http://localhost:5000/api/evento/data/${eventoId}`);
      console.log(response.data);
      setFormSubmitted(true); // Cambiar el estado para ocultar el formulario
    } catch (error) {
      setConfirmationMessage("Hubo un error al recuperar el evento."); // Mensaje de error
      setMessageType("error"); // Tipo de mensaje de error
      setFormSubmitted(true); // Cambiar el estado para ocultar el formulario
    }
  };

  const handleUnirseEvento = async () => {
    if (!selectedEvent) {
      setConfirmationMessage("Por favor, selecciona un evento para eliminar.");
      setMessageType("error");
      setFormSubmitted(true);
      return; // Verificar si hay un evento seleccionado
    }

    try {
      // Extraer el id del evento seleccionado
      const eventoId = selectedEvent.id;
  
      if (!eventoId) {
        setConfirmationMessage("No se encontró el evento seleccionado.");
        setMessageType("error");
        setFormSubmitted(true);
        return;
      }

      const response = await customAxios.post(`http://localhost:5000/api/evento/entrar/${eventoId}`);
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
                const eventData = {
                  titulo: e.target["titulo"].value,
                  tipo: e.target["tipo"].value,
                  fecha_evento: e.target["fecha_evento"].value,
                  descripcion: e.target["descripcion"].value,
                };
                handleCrearEvento(eventData);
              }}
            >
              <div className="form-group">
                <label htmlFor="titulo">Nombre del evento</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo" // Añadir el name
                  placeholder="Introduce el nombre del evento"
                />
              </div>
              <div className="form-group">
                <label htmlFor="tipo">Tipo</label>
                <input
                  type="text"
                  id="tipo"
                  name="tipo" // Añadir el name
                  placeholder="Introduce el tipo del evento"
                />
              </div>
              <div className="form-group">
                <label htmlFor="fecha_evento">Fecha del evento</label>
                <input
                  type="date"
                  id="fecha_evento"
                  name="fecha_evento" // Añadir el name
                />
              </div>
              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion" // Añadir el name
                  placeholder="Detalles del evento"
                  rows="4"
                ></textarea>
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
              <p>Selecciona el evento que deseas {selectedEvent?.esCreador ? "eliminar" : "desinscribirte"}</p>
              <div className="contenedor-eventos">
                <ul>
                  {eventosArray.map((evento) => (
                    <li
                      key={evento.id}
                      className={selectedEvent === evento.id ? 'selected' : ''}
                      onClick={() => handleSelectEvent(evento.id)} // Cambiar estado al hacer clic
                    >
                      <div className="portfolio-icono">
                        <img src={evento.creador.avatar} className="avatar-imagen" />
                      </div>
                      <div className="evento-detalles">
                        <p className="evento-creador">{evento.creador.username}</p>
                        <p className="evento-titulo">{evento.titulo}</p>
                        <p className="evento-fecha">{formatDateTime(evento.fecha_evento)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="contendor-botn-evento">
                <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
                <button
                  className="botn-eventos enviar"
                  onClick={selectedEvent?.esCreador ? handleEliminarEvento : handleDesinscribirseEvento}
                >
                  {selectedEvent?.esCreador ? "Eliminar" : "Desinscribirse"}
                </button>
              </div>          
            </div>
          )}

        {activeBubble === 'editar-evento' && step === 1 && !formSubmitted && (
          <div>
            <p>Selecciona un evento para modificar</p>
            <div className="contenedor-eventos">
              <ul>
                {eventosArray.map((evento) => (
                  <li
                    key={evento.id}
                    className={selectedEvent === evento.id ? 'selected' : ''}
                    onClick={() => handleSelectEvent(evento.id)} // Cambiar estado al hacer clic
                  >
                    <div className="portfolio-icono">
                      <img src={evento.creador.avatar} className="avatar-imagen" />
                    </div>
                    <div className="evento-detalles">
                        <p className="evento-creador">{evento.creador.username}</p>
                        <p className="evento-titulo">{evento.titulo}</p>
                        <p className="evento-fecha">{formatDateTime(evento.fecha_evento)}</p>
                    </div>
                  </li>
                ))}
              </ul>
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
                <label htmlFor="titulo">Título:</label>
                <input
                  type="text"
                  id="titulo"
                  className="form-control"
                  value={editFormData.titulo}
                  onChange={(e) => setEditFormData({ ...editFormData, titulo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="titulo">Descripción:</label>
                <input
                  type="text"
                  id="descripcion"
                  className="form-control"
                  value={editFormData.descripcion}
                  onChange={(e) => setEditFormData({ ...editFormData, descripcion: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="titulo">Tipo:</label>
                <input
                  type="text"
                  id="tipo"
                  className="form-control"
                  value={editFormData.tipo}
                  onChange={(e) => setEditFormData({ ...editFormData, tipo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="fecha_evento">Fecha:</label>
                <input
                  type="date"
                  id="fecha_evento"
                  className="form-control"
                  value={editFormData.fecha_evento}
                  onChange={(e) => setEditFormData({ ...editFormData, fecha_evento: e.target.value })}
                />
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
          <div>
            <p>Buscar evento</p>
            <input
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
                      onClick={() => handleSelectEvent(evento)} // Cambiar estado al hacer clic
                    >
                      <div className="portfolio-icono">
                        <img src={evento.creador.avatar} className="avatar-imagen" alt="Avatar" />
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
          <div className="evento-detalle">
            <p>Título:{selectedEvent.titulo}</p>
            <p><strong>Fecha:</strong> {new Date(selectedEvent.fecha_evento).toLocaleDateString()}</p>
            <p><strong>Creado por:</strong> {selectedEvent.creador?.username || "Desconocido"}</p>
            <p><strong>Tipo:</strong> {selectedEvent.tipo || "Desconocido"}</p>
            <p><strong>Descripción:</strong> {selectedEvent.descripcion || "Desconocido"}</p>
            <p><strong>Participantes:</strong> {selectedEvent.participantes || "Ninguno"}</p>

            <div className="contendor-botn-evento">
              <button className="botn-eventos" onClick={() => setFormSubmitted(false)}>
                Volver
              </button>
              <button className="botn-eventos enviar" onClick={handleUnirseEvento}>Unirse</button>
            </div>
          </div>
        )}

        {activeBubble === "compartir-evento" && (
          <div>
            <p>Selecciona un evento para compartir</p>
            <div className="contenedor-eventos">
              <ul>
                {eventosArray.map((evento) => (
                  <li
                    key={evento.id}
                    className={selectedEvent === evento.id ? 'selected' : ''}
                    onClick={() => handleSelectEvent(evento.id)} // Cambiar estado al hacer clic
                  >
                    <div className="portfolio-icono">
                      <img src={evento.creador.avatar} className="avatar-imagen" />
                    </div>
                    <div className="evento-detalles">
                        <p className="evento-creador">{evento.creador.username}</p>
                        <p className="evento-titulo">{evento.titulo}</p>
                        <p className="evento-fecha">{formatDateTime(evento.fecha_evento)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="contendor-botn-evento">
              <button className="botn-eventos" onClick={closeBubble}>Cerrar</button>
              <button className="botn-eventos enviar" onClick={closeBubble}>Enviar</button>
            </div>
          </div>
        )}
      </Bubble>
    </div>
  );
}
