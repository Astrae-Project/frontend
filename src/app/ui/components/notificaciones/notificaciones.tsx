import React, { useState, useEffect } from "react";
import customAxios from "@/service/api.mjs";
import LoadingScreen from "../loading-screen/loading-screen";
import Bubble from "../bubble/bubble";
import { IconStar, IconMoneybag, IconCalendarEvent } from "@tabler/icons-react";
import { ChevronUp, ChevronDown } from "lucide-react";
import "./notificaciones-style.css";

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [actualIndex, setActualIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeBubble, setActiveBubble] = useState(null);
  const [bubbleData, setBubbleData] = useState(null);
  const [step, setStep] = useState(1); // Paso actual (1 = seleccionar evento, 2 = editar evento)
  const [selectedAmount, setSelectedAmount] = useState(0); // Cantidad formateada
  const [selectedPercentage, setSelectedPercentage] = useState(0); // Porcentaje seleccionado
  const [formSubmitted, setFormSubmitted] = useState(false); // Estado del formulario
  const [confirmationMessage, setConfirmationMessage] = useState(""); // Mensaje de confirmación
  const [messageType, setMessageType] = useState("success"); // Tipo de mensaje de confirmación
  const [selectedStartup, setSelectedStartup] = useState(null); // Startup seleccionada

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const { data } = await customAxios.get("http://localhost:5000/api/data/notificaciones");
        setNotificaciones(data);
      } catch (error) {
        console.error("Error al obtener notificaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificaciones();
  }, []);

  // Al hacer clic en una notificación, se abre la Bubble
  const handleBubbleOpen = (data) => {
    setBubbleData(data);
    // Se asigna el tipo de la notificación para controlar las acciones
    setActiveBubble(data.tipo);
  };

  const handleBubbleClose = () => {
    setActiveBubble(null);
    setBubbleData(null);
  };

  const handleAceptarOferta = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await customAxios.put(
        `http://localhost:5000/api/invest/oferta/algo/aceptar/algo`,
        {
          id_startup: selectedStartup.id,
          porcentaje_ofrecido: selectedPercentage,
          monto_ofrecido: selectedAmount,
        },
        { withCredentials: true }
      );
      setConfirmationMessage("Oferta realizada con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error al realizar la oferta:", error);
      setConfirmationMessage("Hubo un error al realizar la oferta.");
      setMessageType("error");
      setFormSubmitted(true);
    } finally {
      setLoading(false);
    }
  };


  const siguienteNotificacion = () => {
    setActualIndex((prevIndex) => (prevIndex + 1) % notificaciones.length);
  };

  const anteriorNotificacion = () => {
    setActualIndex((prevIndex) =>
      prevIndex === 0 ? notificaciones.length - 1 : prevIndex - 1
    );
  };

  const irANotificacion = (index) => {
    setActualIndex(index);
  };

  // Función para manejar la acción seleccionada desde la Bubble
  const handleAction = (action) => {
    console.log("Acción seleccionada:", action, bubbleData);
    // Aquí puedes implementar la lógica para cada acción, por ejemplo, llamar a un endpoint.
  };

  if (loading) return <LoadingScreen />;
  if (notificaciones.length === 0)
    return <div className="notificaciones-container">No tienes notificaciones.</div>;

  const notificacionActual = notificaciones[actualIndex];

  let iconoNotificacion;
  if (notificacionActual.tipo === "inversion") {
    iconoNotificacion = <IconStar className="iconos1" />;
  } else if (notificacionActual.tipo === "oferta") {
    iconoNotificacion = <IconMoneybag className="iconos1" />;
  } else if (notificacionActual.tipo === "evento") {
    iconoNotificacion = <IconCalendarEvent className="iconos1" />;
  }

  const fechaFormateada = new Date(notificacionActual?.fecha_creacion).toLocaleDateString();

  return (
    <div className="seccion" id="notificaciones">
      <div className="notificaciones-container">
        <li
          className="movimiento-item-notificaciones"
          onClick={() => handleBubbleOpen(notificacionActual)}
        >
          <div className="borde-icono3" id="borde-grande">
            <div className="movimiento-icono3">{iconoNotificacion}</div>
          </div>
          <div className="notificacion-detalles">
            <p className="contenido-notificacion">{notificacionActual.contenido}</p>
            <p className="movimiento-fecha3">{fechaFormateada}</p>
          </div>
        </li>
        <div className="navegacion-container">
          <div className="navegacion-botones">
            <button className="boton-navegar" onClick={anteriorNotificacion}>
              <ChevronUp />
            </button>
            <div className="navegacion-puntos">
              {notificaciones.map((_, index) => (
                <div
                  key={index}
                  className={`punto ${index === actualIndex ? "activo" : ""}`}
                  onClick={() => irANotificacion(index)}
                ></div>
              ))}
            </div>
            <button className="boton-navegar" onClick={siguienteNotificacion}>
              <ChevronDown />
            </button>
          </div>
        </div>

        <Bubble show={bubbleData !== null} onClose={handleBubbleClose}>
          {bubbleData && (
            <>
              <p className="bubble-contenido">{bubbleData.contenido}</p>
              {activeBubble === "oferta" && step === 1 &&(
                <div className="bubble-acciones">
                  <button onClick={() => handleAceptarOferta}>
                    ✅ Aceptar oferta
                  </button>
                  <button onClick={() => handleRechazarOferta}>
                    🔄 Hacer contraoferta
                  </button>
                  <button onClick={() => handleContraoferta}>
                    🔄 Hacer contraoferta
                  </button>
                </div>
              )}
              {activeBubble === "inversion" &&(
                <div className="bubble-acciones">
                  <button onClick={() => handleIrPortfolio}>
                    📊 Ver detalles de inversión
                  </button>
                </div>
              )}
              {activeBubble === "evento" && (
                <div className="bubble-acciones">
                  <button onClick={() => handleVerEvento}>
                    📅 Ver evento
                  </button>
                </div>
              )}
              {activeBubble === "grupo" && (
                <div className="bubble-acciones">
                  <button onClick={() => handleVerGrupo}>
                    📅 Ver evento
                  </button>
                </div>
              )}
              {activeBubble === "contraoferta" && step === 1 &&(
                <div className="bubble-acciones">
                  <button onClick={() => handleAceptarContraoferta}>
                    📅 Ver evento
                  </button>
                  <button onClick={() => handleRechazarContraoferta}>
                    📅 Ver evento
                  </button>
                </div>
              )}
              {/* Si el tipo no coincide con ninguno de los anteriores */}
              {!["oferta", "inversion", "evento"].includes(activeBubble) && (
                <p>No hay acciones disponibles para este tipo de notificación.</p>
              )}
            </>
          )}
        </Bubble>
      </div>
    </div>
  );
};

export default Notificaciones;
