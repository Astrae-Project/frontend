import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import { IconMoneybag, IconCalendarEvent, IconStar } from "@tabler/icons-react";

const MovimientosRecientes = () => {
  const [movimientosRecientes, setMovimientosRecientes] = useState([]);

  const fetchMovimientosRecientes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/movimientos-recientes", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Error en la respuesta de la red");

      const data = await response.json();
      console.log("Datos recibidos:", data);
      setMovimientosRecientes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al obtener movimientos recientes:", error);
    }
  };

  useEffect(() => {
    fetchMovimientosRecientes();
  }, []);

  console.log("Movimientos Recientes en el estado:", movimientosRecientes);

  return (
    <div className="seccion" id="reciente-componente">
      <div className="titulo-principal">
        <p className="titulo-movimientos">Movimientos</p>
      </div>
      {movimientosRecientes.length > 0 ? (
        <div className="contenido-scrollable">
          <ul className="movimientos-lista">
            {movimientosRecientes.map((movimiento, index) => {
              const fechaFormateada = new Date(movimiento.fecha || movimiento.fecha_creacion).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });

              // Determina el ícono según el tipo de movimiento
              let iconoMovimiento;
              if (movimiento.tipo_movimiento === 'inversion') {
                iconoMovimiento = <IconStar className="iconos"></IconStar>; // Icono de inversión
              } else if (movimiento.tipo_movimiento === 'oferta') {
                iconoMovimiento = <IconMoneybag className="iconos"></IconMoneybag>; // Icono de oferta
              } else if (movimiento.tipo_movimiento === 'evento') {
                iconoMovimiento = <IconCalendarEvent className="iconos"></IconCalendarEvent>; // Icono de evento
              }

              const formatInversion = (monto) => {
                if (monto >= 1e6) {
                    return `${(monto / 1e6).toFixed(1)}M`; // Para millones, 'M' es el sufijo
                } else if (monto >= 1e3) {
                    return `${(monto / 1e3).toFixed(0)}K`; // Para miles, 'k' es el sufijo
                } else {
                    return monto.toString(); // Para cantidades menores a mil, no se cambia
                }
            };            

              return (
                <li key={index} className="movimiento-item">
                  <div className="borde-icono">
                    <div className="movimiento-icono" id="icono-morado">{iconoMovimiento}</div>
                  </div>
                  <div className="movimiento-detalles">
                    {movimiento.tipo_movimiento === 'inversion' ? (
                      <>
                        <p className="movimiento-nombre">{movimiento.startup?.nombre || 'Sin nombre'}</p>
                        <p className="movimiento-monto">Inversión: {formatInversion(movimiento.monto_invertido)}€</p>
                        <p className="movimiento-porcentaje">por el {movimiento.porcentaje_adquirido}%</p>
                        <p className="movimiento-fecha">{fechaFormateada}</p>
                      </>
                    ) : movimiento.tipo_movimiento === 'oferta' ? (
                      <>
                        <p className="movimiento-nombre">{movimiento.startup?.nombre || 'Sin nombre'}</p>
                        <p className="movimiento-monto">Oferta: {formatInversion(movimiento.monto_ofrecido)}€</p>
                        <p className="movimiento-porcentaje">por el {movimiento.porcentaje_ofrecido}%</p>
                        <p className="movimiento-fecha">{fechaFormateada}</p>
                      </>
                    ) : movimiento.tipo_movimiento === 'evento' ? (
                      <>
                        <p className="movimiento-nombre">{movimiento.creador.username || 'Sin título'}</p>
                        <p className="movimiento-monto">{movimiento.titulo}</p>
                        <p className="movimiento-fecha">{fechaFormateada}</p>
                      </>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p>No hay movimientos recientes.</p>
      )}
    </div>
  );
};

export default MovimientosRecientes;
