import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import customAxios from "@/service/api.mjs";
import LoadingScreen from "../loading-screen/loading-screen";
import Bubble from "../bubble/bubble";
import { IconStar, IconMoneybag, IconCalendarEvent, IconMessage, IconUser, IconRefresh } from "@tabler/icons-react";
import { ChevronUp, ChevronDown } from "lucide-react";
import "./notificaciones-style.css";

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [actualIndex, setActualIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeBubble, setActiveBubble] = useState(null);
  const [bubbleData, setBubbleData] = useState(null);

  // Refs para el contenido y la fecha dentro de la Bubble
  const contenidoRef = useRef(null);
  const fechaRef = useRef(null);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        const { data } = await customAxios.get("https://api.astraesystem.com/api/data/notificaciones");
        setNotificaciones(data);
      } catch (error) {
        console.error("Error al obtener notificaciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotificaciones();
  }, []);

  // Se usa useLayoutEffect para medir la altura del contenido después de renderizar la Bubble
  useLayoutEffect(() => {
    if (bubbleData && contenidoRef.current && fechaRef.current) {
      const alturaContenido = contenidoRef.current.scrollHeight;
      // Si el contenido supera los 25px (más de una línea), se baja la fecha
      fechaRef.current.style.bottom = alturaContenido > 25 ? "0%" : "7%";
    }
  }, [bubbleData]);

  // Funciones para abrir y cerrar la Bubble y navegar entre notificaciones
  const handleBubbleOpen = (data) => {
    setBubbleData(data);
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
  if (notificaciones.length === 0) return <p>No tienes notificaciones</p>;

  const notificacionActual = notificaciones[actualIndex];
  const fechaFormateada = new Date(notificacionActual?.fecha_creacion).toLocaleDateString();

  let iconoNotificacion;
  if (notificacionActual.tipo === "inversion") {
    iconoNotificacion = <IconStar className="iconos1" />;
  } else if (notificacionActual.tipo === "oferta") {
    iconoNotificacion = <IconMoneybag className="iconos1" />;
  } else if (notificacionActual.tipo === "evento") {
    iconoNotificacion = <IconCalendarEvent className="iconos1" />;
  } else if (notificacionActual.tipo === "grupo") {
    iconoNotificacion = <IconMessage className="iconos1" />;
  } else if (notificacionActual.tipo === "seguimiento") {
    iconoNotificacion = <IconUser className="iconos1" />;
  } else if (notificacionActual.tipo === "contraoferta") {
    iconoNotificacion = <IconRefresh className="iconos1" />;
  }

  const handleIrPortfolio = () => {
    window.location.href = "/portfolio";
  };

  const handleVerGrupo = () => {
    window.location.href = `/grupos`;
  };

  const handleMarcarLeido = async () => {
    if (!notificacionActual) return;
    try {
      await customAxios.put('https://api.astraesystem.com/api/perfil/leido', { id: notificacionActual.id });
      handleBubbleClose();
    } catch (error) {
      console.error('Error al marcar como leído:', error);
    }
  };

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
                  className={`puntito ${index === actualIndex ? "activo" : ""}`}
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
              <div className="bubble-notificaciones">
                <div className="borde-icono3" id="borde-grande-bubble">
                  <div className="movimiento-icono3-bubble">{iconoNotificacion}</div>
                </div>
                <div className="notificacion-detalles-bubble">
                  <p className="contenido-notificacion-bubble" ref={contenidoRef}>
                    {notificacionActual.contenido}
                  </p>
                  <p className="movimiento-fecha3-bubble" ref={fechaRef}>
                    {fechaFormateada}
                  </p>
                </div>
              </div>

              {(activeBubble === "evento" ||
                activeBubble === "oferta" ||
                activeBubble === "seguimiento") && (
                <div className="contendor-botn-evento" style={{ marginBottom: 0, marginTop: 0 }}>
                  <button className="botn-eventos" onClick={handleMarcarLeido}>
                    Marcar Leido
                  </button>
                </div>
              )}

              {(activeBubble === "inversion" || activeBubble === "contraoferta") && (
                <div className="contendor-botn-evento" style={{ marginBottom: 0, marginTop: 0 }}>
                  <button className="botn-eventos" onClick={handleMarcarLeido}>
                    Marcar Leido
                  </button>
                  <button className="botn-eventos enviar" onClick={handleIrPortfolio}>
                    Ir a Portfolio
                  </button>
                </div>
              )}
              {activeBubble === "grupo" && (
                <div className="contendor-botn-evento" style={{ marginBottom: 0, marginTop: 0 }}>
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
