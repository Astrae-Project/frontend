import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';


const InversionesPrevias = () => {
  const [inversionesPrevias, setInversionesPrevias] = useState([]);

  const fetchMovimientosRecientes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/movimientos-recientes", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setInversionesPrevias(data);
    } catch (error) {
      console.error("Error fetching inversiones previas:", error);
    }
  };

  useEffect(() => {
    fetchMovimientosRecientes();
  }, []);

  return (
    <div className="seccion" id="reciente">
      {inversionesPrevias.length > 0 ? (
        <ul className="contenedor-inversiones">
          {inversionesPrevias.map((inversion, index) => {
            const fechaFormateada = new Date(inversion.fecha || inversion.fecha_creacion).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            const startupAvatar = inversion.startup?.usuario?.avatar; 

            return (
              <li key={index} className="movimiento-item">
                <div className="movimiento-contenedor">
                  <div className="movimiento-icono">
                    <img src={startupAvatar} className="avatar-imagen" />
                  </div>
                  <div className="movimiento-detalles">
                    <p>{inversion.startup.nombre} - ${inversion.monto_invertido} - {fechaFormateada}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No hay movimientos recientes.</p>
      )}
    </div>
  );
};

export default InversionesPrevias;
