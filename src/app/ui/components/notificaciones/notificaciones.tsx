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
    return <p>No tienes notificaciones</p>;

  const notificacionActual = notificaciones[actualIndex];

  let iconoNotificacion;
  if (notificacionActual.tipo === "inversion") {
    iconoNotificacion = <IconStar className="iconos1" />;
  } else if (notificacionActual.tipo === "oferta") {
    iconoNotificacion = <IconMoneybag className="iconos1" />;
  } else if (notificacionActual.tipo === "evento") {
    iconoNotificacion = <IconCalendarEvent className="iconos1" />;
  }

  const handleIrPortfolio = () => {
    window.location.href = "/portfolio";
  };

  const handleVerGrupo = () => {
      window.location.href = `/grupos`;
  };

  const handleMarcarLeido = async () => {
    if (!notificacionActual) return
    try {
      // Suponiendo que notificacionActual es la notificación seleccionada
      await customAxios.put('http://localhost:5000/api/perfil/leido', { id: notificacionActual.id });
      handleBubbleClose();      
    } catch (error) {
      console.error('Error al marcar como leído:', error);
    }
  }
  
  const fechaFormateada = new Date(notificacionActual?.fecha_creacion).toLocaleDateString();

  return (
    <div className="seccion" id="notificaciones">
      <div className="notificaciones-container">
      <li
        className={`movimiento-item-notificaciones ${
          ["inversion", "grupo"].includes(notificacionActual.tipo) ? "" : "sin-bubble"
        }`}
        onClick={() => {
          if (["inversion", "grupo"].includes(notificacionActual.tipo)) {
            handleBubbleOpen(notificacionActual);
          }
        }}
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
                <div className="contendor-botn-evento" style={{marginBottom: 0, marginTop: 0}}>
                  <button className="botn-eventos" onClick={handleMarcarLeido}>
                    Marcar Leido
                  </button>
                  <button className="botn-eventos enviar" onClick={handleIrPortfolio}>
                    Ir a Portfolio
                  </button>
                </div>
              )}
              {activeBubble === "grupo" && (
                <div className="contendor-botn-evento" style={{marginBottom: 0, marginTop: 0}}>
                  <button className="botn-eventos" onClick={handleMarcarLeido}>
                    Marcar Leido
                  </button>
                  <button className="botn-eventos enviar" onClick={handleVerGrupo}>
                    Ir a Grupos
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
