import React, { useState, useEffect } from "react";
import "../../../perfil/bento-perfil/bento-perfil-style.css";
import { IconMoneybag, IconStar } from "@tabler/icons-react";
import Bubble from "../bubble/bubble";
import customAxios from "@/service/api.mjs";
import PerfilOtro from "@/app/perfil-otro/page";

const MovimientosRecientesInversion = ({ username }) => {
  const [movimientosRecientes, setMovimientosRecientes] = useState([]);
  const [activeBubble, setActiveBubble] = useState(null); // Tipo de burbuja activa
  const [bubbleData, setBubbleData] = useState(null); // Datos de la burbuja

  const fetchMovimientosRecientes = async () => {
    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/movimientos-inversion`, {
        withCredentials: true,
      });
  
      if (!response || !response.data) {
        throw new Error("No data received or response format is incorrect");
      }
  
      const data = response.data;
  
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
  }, []);

  // Manejo de apertura y cierre de burbujas
  const handleBubbleOpen = (type, data) => {
    setBubbleData(data);
    setActiveBubble(type);
  };

  const handleBubbleClose = () => {
    setActiveBubble(null);
    setBubbleData(null);
  };

  const formatInversion = (monto) => {
    if (monto === null) {
      return 'N/A';
    }
  
    if (monto >= 1e6) {
      const millones = monto / 1e6;
      return `${millones % 1 === 0 ? millones.toFixed(0) : millones.toFixed(1)}M€`; // Para millones
    } else if (monto >= 1e3) {
      const miles = monto / 1e3;
      return `${miles % 1 === 0 ? miles.toFixed(0) : miles.toFixed(1)}K€`; // Para miles
    } else {
      return `${monto}€`; // Para cantidades menores a mil
    }
  };

  return (
    <div className="contenido-scrollable" id="movimientos-sin-eventos">
      {movimientosRecientes.length > 0 ? (
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
                iconoMovimiento = <IconStar className="iconos2" />;
              } else if (movimiento.tipo_movimiento === "oferta") {
                iconoMovimiento = <IconMoneybag className="iconos2" />;
              }

              return (
                <li key={index} className="movimiento-item-sin-eventos">
                    <div className='linea-morada' style={{ marginTop: "8px" }}></div>
                    <div className="movimiento-detalles3">
                      {movimiento.tipo_movimiento === "inversion" && (
                        <>
                          <p className="movimiento-monto">
                            Inversión de {formatInversion(movimiento.monto_invertido)}
                          </p>
                          <p className="movimiento-porcentaje">
                            por el {movimiento.porcentaje_adquirido}%
                          </p>
                          <span
                            className="movimiento-monto"
                            role="button"
                            onClick={() =>
                              movimiento.inversor?.usuario &&
                              handleBubbleOpen("perfil-inversor", movimiento.inversor)
                            }
                          >
                            <p>de {movimiento.inversor?.nombre || "Sin nombre"}</p>
                          </span>
                          <p className="movimiento-fecha2">{fechaFormateada}</p>
                        </>
                      )}
                      {movimiento.tipo_movimiento === "oferta" && (
                        <>
                          <p className="movimiento-monto">
                            Oferta de {formatInversion(movimiento.monto_ofrecido)}
                          </p>
                          <p className="movimiento-porcentaje">
                            por el {movimiento.porcentaje_ofrecido}%
                          </p>
                          <span
                            className="movimiento-monto"
                            role="button"
                            onClick={() =>
                              movimiento.inversor?.usuario &&
                              handleBubbleOpen("perfil-inversor", movimiento.inversor)
                            }
                          >
                            <p>de {movimiento.inversor?.nombre || "Sin nombre"}</p>
                          </span>
                          <p className="movimiento-fecha2">{fechaFormateada}</p>
                        </>
                      )}
                    </div>
                </li>
              );
            })}
          </ul>
      ) : (
        <p>No hay movimientos recientes.</p>
      )}
      <Bubble show={!!activeBubble} onClose={handleBubbleClose}>
        {activeBubble === "perfil" && bubbleData && (
          <PerfilOtro username={bubbleData.username}></PerfilOtro>
        )}
        {activeBubble === "perfil-inversor" && bubbleData && (
          <PerfilOtro username={bubbleData.usuario.username}></PerfilOtro>
        )}
        {activeBubble === "inversion" && bubbleData && (
          <div className="inversion-detalle">
            <p><strong>inversor:</strong> {bubbleData.inversor?.nombre || "Cargando..."}</p>
            <p><strong>Inversión:</strong> {formatInversion(bubbleData.monto_invertido)}</p>
            <p><strong>Porcentaje Adquirido:</strong> {bubbleData.porcentaje_adquirido}%</p>
            <p><strong>Fecha:</strong> {new Date(bubbleData.fecha).toLocaleDateString("es-ES")}</p>
          </div>
        )}
        {activeBubble === "oferta" && bubbleData && (
          <div className="oferta-detalle">
            <p><strong>inversor:</strong> {bubbleData.inversor?.nombre || "Cargando..."}</p>
            <p><strong>Oferta de:</strong> {formatInversion(bubbleData.monto_ofrecido)}</p>
            <p><strong>Porcentaje Ofrecido:</strong> {bubbleData.porcentaje_ofrecido}%</p>
            <p><strong>Fecha:</strong> {new Date(bubbleData.fecha_creacion).toLocaleDateString("es-ES")}</p>
          </div>
        )}
      </Bubble>
    </div>
  );
};

export default MovimientosRecientesInversion;