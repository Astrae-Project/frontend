import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';

const MovimientosRecientes = () => {
  const [movimientosRecientes, setMovimientosRecientes] = useState([]);

  // Función para obtener los datos de movimientos recientes
  const fetchMovimientosRecientes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/movimientos-recientes", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Error en la respuesta de la red");

      const data = await response.json();
      console.log("Datos recibidos:", data); // Para depurar, puedes ver si los datos llegan bien
      setMovimientosRecientes(data); // Asumiendo que la respuesta es un array de movimientos
    } catch (error) {
      console.error("Error al obtener movimientos recientes:", error);
    }
  };

  useEffect(() => {
    fetchMovimientosRecientes();
  }, []);

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
              const startupAvatar = movimiento.startup?.usuario?.avatar;

              return (
                <li key={index} className="movimiento-item">
                  <div className="movimiento-contenedor">
                    <div className="movimiento-icono">
                      {startupAvatar ? (
                        <img src={startupAvatar} className="avatar-imagen" alt="Avatar" />
                      ) : (
                        <div className="avatar-placeholder">Sin Avatar</div>
                      )}
                    </div>
                    <div className="movimiento-detalles">
                      {movimiento.tipo_movimiento === 'inversion' ? (
                        <>
                          <p className="movimiento-nombre">{movimiento.startup?.nombre || 'Sin nombre'}</p>
                          <p className="movimiento-monto">{movimiento.monto_invertido}€</p>
                          <p className="movimiento-porcentaje">{movimiento.porcentaje_adquirido}%</p>
                          <p className="movimiento-fecha">{fechaFormateada}</p>
                        </>
                      ) : movimiento.tipo_movimiento === 'oferta' ? (
                        <>
                          <p className="movimiento-nombre">
                            Oferta a {movimiento.startup?.nombre || 'Sin nombre'}
                          </p>
                          <p className="movimiento-monto">{movimiento.monto_ofrecido}€</p>
                          <p className="movimiento-porcentaje">{movimiento.porcentaje_ofrecido}%</p>
                          <p className="movimiento-fecha">{fechaFormateada}</p>
                        </>
                      ) : movimiento.tipo_movimiento === 'evento' ? (
                        <>
                          <p className="movimiento-nombre">Evento: {movimiento.titulo || 'Sin título'}</p>
                          <p className="movimiento-fecha">{fechaFormateada}</p>
                        </>
                      ) : null}
                    </div>
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
