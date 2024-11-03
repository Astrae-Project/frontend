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
      console.log("Datos recibidos:", data); // Asegúrate de que los datos lleguen bien
      setMovimientosRecientes(Array.isArray(data) ? data : []); // Asegúrate de que data sea un array
    } catch (error) {
      console.error("Error al obtener movimientos recientes:", error);
    }
  };

  useEffect(() => {
    fetchMovimientosRecientes();
  }, []);

  console.log("Movimientos Recientes en el estado:", movimientosRecientes); // Verifica el estado

  return (
    <div className="seccion" id="reciente-componente1">
      <div className="titulo-principal">
        <p className="titulo-movimientos">Últimos Movimientos</p>
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
                iconoMovimiento = <IconStar className="iconos1"></IconStar>; // Icono de inversión
              } else if (movimiento.tipo_movimiento === 'oferta') {
                iconoMovimiento = <IconMoneybag className="iconos1"></IconMoneybag>; // Icono de oferta
              } else if (movimiento.tipo_movimiento === 'evento') {
                iconoMovimiento = <IconCalendarEvent className="iconos1"></IconCalendarEvent>; // Icono de evento
              }

              return (
                <li key={index} className="movimiento-item">
                  <div className="borde-icono1">
                    <div className="movimiento-icono1" id="icono-morado">{iconoMovimiento}</div>
                  </div>
                    <div className="movimiento-detalles1">
                      {movimiento.tipo_movimiento === 'inversion' ? (
                        <>
                          <p className="movimiento-nombre1">{movimiento.startup?.nombre || 'Sin nombre'}</p>
                          <p className="movimiento-monto">Inversión de {movimiento.monto_invertido}€</p>
                          <p className="movimiento-porcentaje">por el {movimiento.porcentaje_adquirido}%</p>
                          <p className="movimiento-fecha1">{fechaFormateada}</p>
                        </>
                      ) : movimiento.tipo_movimiento === 'oferta' ? (
                        <>
                          <p className="movimiento-nombre1">
                            {movimiento.startup?.nombre || 'Sin nombre'}
                          </p>
                          <p className="movimiento-monto">Oferta de {movimiento.monto_ofrecido}€</p>
                          <p className="movimiento-porcentaje">por el {movimiento.porcentaje_ofrecido}%</p>
                          <p className="movimiento-fecha1">{fechaFormateada}</p>
                        </>
                      ) : movimiento.tipo_movimiento === 'evento' ? (
                        <>
                          <p className="movimiento-nombre1">{movimiento.titulo || 'Sin título'}</p>
                          <p className="movimiento-fecha1">{fechaFormateada}</p>
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
