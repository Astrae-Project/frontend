import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';

const InversionesRealizadas = () => {
  const [inversionesRealizadas, setInversionesRealizadas] = useState(0);
  const [valoracion, setValoracion] = useState(0);

  const fetchEstadisticas = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/usuario", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      // Si es una startup, muestra la valoración
      if (data.startup) {
        setValoracion(data.startup.valoracion);
      } else {
        setInversionesRealizadas(data.inversionesRealizadas);
      }
    } catch (error) {
      console.error("Error fetching estadísticas:", error);
    }
  };

  const formatInversion = (monto) => {
    if (monto === null) {
      return 'N/A'
    }

    if (monto >= 1e6) {
      return `${(monto / 1e6).toFixed(1)}M`; // Para millones
    } else if (monto >= 1e3) {
      return `${(monto / 1e3).toFixed(0)}K`; // Para miles
    } else {
      return monto // Para cantidades menores a mil, con formato de miles
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  return (
    <div className="seccion" id="grid3">
      {/* Mostrar valoracion si es una startup, si no mostrar inversiones realizadas */}
      <p className="numeros">{valoracion > 0 ? formatInversion(valoracion) : formatInversion(inversionesRealizadas)}</p>
      <section className="datos">
        <p>{valoracion > 0 ? "Valoración" : "Inversiones"}</p>
      </section>
    </div>
  );
};

export default InversionesRealizadas;
