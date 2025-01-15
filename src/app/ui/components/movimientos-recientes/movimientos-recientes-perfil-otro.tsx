import React, { useState, useEffect } from "react";
import "../../../perfil/bento-perfil/bento-perfil-style.css";
import Bubble from "../bubble/bubble";
import Perfil from "../../../perfil/page";
import { IconStar, IconMoneybag, IconCalendarEvent } from "@tabler/icons-react";
import customAxios from "@/service/api.mjs";

const MovimientosRecientesOtro = ({ username }) => {
  const [movimientosRecientes, setMovimientosRecientes] = useState([]);
  const [activeBubble, setActiveBubble] = useState(null); // Tipo de burbuja activa
  const [bubbleData, setBubbleData] = useState(null); // Datos de la burbuja

  const fetchMovimientosRecientes = async () => {
    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario/${username}`, {
        withCredentials: true,
      });

      if (!response || !response.data) {
        throw new Error("No data received or response format is incorrect");
      }

      const data = response.data.ultimosMovimientos;

      // Verificar si el formato de los datos es el esperado
      if (!Array.isArray(data)) {
        throw new Error("Received data is not an array");
      }

      setMovimientosRecientes(data); // Solo actualiza el estado si los datos son válidos

    } catch (error) {
      console.error("Error al obtener movimientos recientes:", error);
    }
  };

  useEffect(() => {
    fetchMovimientosRecientes();
  }, [username]);

  // Manejo de apertura y cierre de burbujas
  const handleBubbleOpen = (type, data) => {
    setBubbleData(data);
    setActiveBubble(type);
  };

  const handleBubbleClose = () => {
    setActiveBubble(null);
    setBubbleData(null);
  };

  // Formateo de montos
  const formatInversion = (monto) => {
    if (monto >= 1e6) return `${(monto / 1e6).toFixed(1)}M`;
    if (monto >= 1e3) return `${(monto / 1e3).toFixed(0)}K`;
    return monto.toString();
  };

  return (
    <div className="seccion" id="reciente-componente">
      <div className="titulo-principal">
        <p className="titulo-movimientos">Movimientos</p>
      </div>
      {movimientosRecientes.length > 0 ? (
        <div className="contenido-scrollable">
          <ul className="movimientos-lista">
            {movimientosRecientes.map((movimiento, index) => {
              const fechaFormateada = new Date(movimiento.fecha || movimiento.fecha_creacion).toLocaleDateString(
                "es-ES",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }
              );

              let iconoMovimiento;
              if (movimiento.tipo_movimiento === "inversion") {
                iconoMovimiento = <IconStar className="iconos1" />;
              } else if (movimiento.tipo_movimiento === "oferta") {
                iconoMovimiento = <IconMoneybag className="iconos1" />;
              } else if (movimiento.tipo_movimiento === "evento") {
                iconoMovimiento = <IconCalendarEvent className="iconos1" />;
              }

              return (
                <li key={index} className="movimiento-item">
                  <button className="relleno-btn">
                    <div className="borde-icono1">
                      <div className="movimiento-icono1" id="icono-morado">
                        {iconoMovimiento}
                      </div>
                    </div>
                    <div className="movimiento-detalles">
                      {movimiento.tipo_movimiento === "inversion" && (
                        <>
                          <span
                            className="btn-nombre"
                            onClick={() =>
                              movimiento.startup?.usuario &&
                              handleBubbleOpen("perfil-startup", movimiento.startup)
                            }
                          >
                            <p>{movimiento.startup?.usuario?.username || "Sin nombre"}</p>
                          </span>
                          <p className="movimiento-monto">
                            Inversión de {formatInversion(movimiento.monto_invertido)}€
                          </p>
                          <p className="movimiento-porcentaje">
                            por el {movimiento.porcentaje_adquirido}%</p>
                          <p className="movimiento-fecha">{fechaFormateada}</p>
                        </>
                      )}
                      {movimiento.tipo_movimiento === "oferta" && (
                        <>
                          <span
                            className="btn-nombre"
                            onClick={() =>
                              movimiento.startup?.usuario &&
                              handleBubbleOpen("perfil-startup", movimiento.startup)
                            }
                          >
                            <p>{movimiento.startup?.usuario?.username || "Sin nombre"}</p>
                          </span>
                          <p className="movimiento-monto">
                            Oferta de {formatInversion(movimiento.monto_ofrecido)}€
                          </p>
                          <p className="movimiento-porcentaje">
                            por el {movimiento.porcentaje_ofrecido}%</p>
                          <p className="movimiento-fecha1">{fechaFormateada}</p>
                        </>
                      )}
                      {movimiento.tipo_movimiento === "evento" && (
                        <>
                          <span
                            className="btn-nombre"
                            onClick={() => handleBubbleOpen("perfil", movimiento.creador)}
                          >
                            <p>{movimiento.creador?.username || "Sin nombre"}</p>
                          </span>
                          <p className="movimiento-monto">{movimiento.titulo}</p>
                          <span
                            className="btn-fecha"
                            onClick={() => handleBubbleOpen("eventos", movimiento.fecha)}
                          >
                            <p>{fechaFormateada}</p>
                          </span>
                        </>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p>No hay movimientos recientes.</p>
      )}
      <Bubble show={!!activeBubble} onClose={handleBubbleClose}>
        {activeBubble === "perfil" && bubbleData && (
          <div className="perfil-detalle">
            <p><strong>Usuario:</strong> {bubbleData.username || "Cargando..."}</p>
          </div>
        )}
        {activeBubble === "perfil-startup" && bubbleData && (
          <Perfil />
        )}
        {activeBubble === "eventos" && bubbleData && (
          <div className="eventos-detalle">
            <p><strong>Eventos para la fecha:</strong> {new Date(bubbleData).toLocaleDateString("es-ES")}</p>
            <ul>
              {movimientosRecientes
                .filter(
                  (mov) =>
                    new Date(mov.fecha || mov.fecha_creacion).toDateString() ===
                    new Date(bubbleData).toDateString()
                )
                .map((evento, idx) => (
                  <li key={idx}>
                    <p>{evento.titulo || "Evento sin título"}</p>
                  </li>
                ))}
            </ul>
          </div>
        )}
        {activeBubble === "inversion" && bubbleData && (
          <div className="inversion-detalle">
            <p><strong>Startup:</strong> {bubbleData.startup?.usuario?.username || "Cargando..."}</p>
            <p><strong>Inversión:</strong> {formatInversion(bubbleData.monto_invertido)}€</p>
            <p><strong>Porcentaje Adquirido:</strong> {bubbleData.porcentaje_adquirido}%</p>
            <p><strong>Fecha:</strong> {new Date(bubbleData.fecha).toLocaleDateString("es-ES")}</p>
          </div>
        )}
        {activeBubble === "oferta" && bubbleData && (
          <div className="oferta-detalle">
            <p><strong>Startup:</strong> {bubbleData.startup?.usuario?.username || "Cargando..."}</p>
            <p><strong>Oferta de:</strong> {formatInversion(bubbleData.monto_ofrecido)}€</p>
            <p><strong>Porcentaje Ofrecido:</strong> {bubbleData.porcentaje_ofrecido}%</p>
            <p><strong>Fecha:</strong> {new Date(bubbleData.fecha_creacion).toLocaleDateString("es-ES")}</p>
          </div>
        )}
        {activeBubble === "evento" && bubbleData && (
          <div className="evento-detalle">
            <p><strong>Evento:</strong> {bubbleData.titulo || "Sin título"}</p>
            <p><strong>Fecha:</strong> {new Date(bubbleData.fecha || bubbleData.fecha_creacion).toLocaleDateString("es-ES")}</p>
            <p><strong>Descripción:</strong> {bubbleData.descripcion || "Sin descripción"}</p>
            <p><strong>Creador:</strong> {bubbleData.creador.username || "Sin descripción"}</p>
            <p><strong>Fecha Unión:</strong> {bubbleData.fecha_union || "Sin descripción"}</p>
            <p><strong>Participantes:</strong> {bubbleData.participantes?.length || "Sin descripción"}</p>
          </div>
        )}
      </Bubble>
    </div>
  );
};

export default MovimientosRecientesOtro;
