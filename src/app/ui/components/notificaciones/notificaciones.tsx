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
  // activeBubble contendrá el tipo de la notificación (por ejemplo, "oferta", "inversion", etc.)
  const [activeBubble, setActiveBubble] = useState(null);
  // bubbleData contendrá toda la notificación seleccionada
  const [bubbleData, setBubbleData] = useState(null);
  // Variables para manejar el formulario de oferta (si es necesario)
  const [step, setStep] = useState(1);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [selectedStartup, setSelectedStartup] = useState(null);

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
    // Asigna el tipo de la notificación para mostrar las acciones adecuadas
    setActiveBubble(data.tipo);
  };

  const handleBubbleClose = () => {
    setActiveBubble(null);
    setBubbleData(null);
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

  // 6. Ir a portfolio (redirección)
  const handleIrPortfolio = () => {
    window.location.href = "/portfolio";
  };

  // 7. Ver evento (redirección usando eventId en bubbleData)
  const handleVerEvento = () => {
    if (bubbleData && bubbleData.eventId) {
      window.location.href = `/evento/${bubbleData.eventId}`;
    } else {
      console.error("No se encontró eventId en la notificación.");
    }
  };

  // 8. Ver grupo (redirección usando groupId en bubbleData)
  const handleVerGrupo = () => {
    if (bubbleData) {
      window.location.href = `/grupos`;
    } else {
      console.error("No se encontró groupId en la notificación.");
    }
  };

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
              {activeBubble === "inversion" && (
                <div className="bubble-acciones">
                  <button onClick={handleIrPortfolio}>
                    📊 Ir a portfolio
                  </button>
                </div>
              )}
              {activeBubble === "evento" && (
                <div className="bubble-acciones">
                  <button onClick={handleVerEvento}>
                    📅 Ver evento
                  </button>
                </div>
              )}
              {activeBubble === "grupo" && (
                <div className="bubble-acciones">
                  <button onClick={handleVerGrupo}>
                    📅 Ver grupo
                  </button>
                </div>
              )}
            </>
          )}
        </Bubble>
      </div>
    </div>
  );
};

export default Notificaciones;
