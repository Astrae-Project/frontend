import React, { useState, useEffect } from "react";
import customAxios from "@/service/api.mjs";
import LoadingScreen from "../loading-screen/loading-screen";
import Bubble from "../bubble/bubble";
import PerfilOtro from "@/app/perfil-otro/page";
import { IconStar, IconMoneybag, IconCalendarEvent} from "@tabler/icons-react";
import { ChevronUp , ChevronDown } from "lucide-react";
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

  const handleBubbleOpen = (type, data) => {
    setBubbleData(data);
    setActiveBubble(type);
  };

  const handleBubbleClose = () => {
    setActiveBubble(null);
    setBubbleData(null);
  };

  const siguienteNotificacion = () => {
    setActualIndex((prevIndex) => (prevIndex + 1) % notificaciones.length);
  };

  const anteriorNotificacion = () => {
    setActualIndex((prevIndex) => (prevIndex === 0 ? notificaciones.length - 1 : prevIndex - 1));
  };

  const irANotificacion = (index) => {
    setActualIndex(index);
  };

  if (loading) return <LoadingScreen />;
  if (notificaciones.length === 0) return <div className="notificaciones-container">No tienes notificaciones.</div>;

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
        <li className="movimiento-item-notificaciones">
          <div className="borde-icono3" id="borde-grande">
            <div className="movimiento-icono3">{iconoNotificacion}</div>
          </div>

          <div className="notificacion-detalles">
            <p>{notificacionActual.contenido}</p>
            <p className="movimiento-fecha2">{fechaFormateada}</p>
          </div>
        </li>
        <div className="navegacion-container">
          <div className="navegacion-botones">
            <button className="boton-navegar" onClick={anteriorNotificacion}><ChevronUp></ChevronUp></button>

            <div className="navegacion-puntos">
              {notificaciones.map((_, index) => (
                <div
                  key={index}
                  className={`punto ${index === actualIndex ? "activo" : ""}`}
                  onClick={() => irANotificacion(index)}
                ></div>
              ))}
            </div>

            <button className="boton-navegar" onClick={siguienteNotificacion}><ChevronDown></ChevronDown></button>
          </div>
        </div>

      <Bubble show={!!activeBubble} onClose={handleBubbleClose}>
        {activeBubble === "perfil" && bubbleData && (
          <PerfilOtro username={bubbleData.usuario?.username}></PerfilOtro>
        )}
      </Bubble>
    </div>
  </div>
  );
};

export default Notificaciones;
