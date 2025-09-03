import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import customAxios from "@/service/api.mjs";

const InversionesRealizadasOtro = ({ username }) => { // Extraer el username de props
  const [inversionesRealizadas, setInversionesRealizadas] = useState(0);
  const [valoracion, setValoracion] = useState(0);

  const fetchEstadisticas = async () => {
    try {
      const response = await customAxios.get(`/data/usuario/${username}`, {
        withCredentials: true,
      });
      // Verifica la respuesta
      if (!response || !response.data) {
        throw new Error("No data received from the API");
      }

      const data = response.data;
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

  useEffect(() => {
    if (username) {
      fetchEstadisticas();
    }
  }, [username]);

  return (
    <div className="seccion" id="grid3">
      {/* Mostrar valoracion si es una startup, si no mostrar inversiones realizadas */}
      <p className="numeros">{valoracion > 0 ? formatInversion(valoracion) : (inversionesRealizadas)}</p>
      <section className="datos">
        <p>{valoracion > 0 ? "Valoración" : "Inversiones"}</p>
      </section>
    </div>
  );
};

export default InversionesRealizadasOtro;
