import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import customAxios from "@/service/api.mjs";

const SuscriptoresOtro = ({ username }) => {
  const [suscriptores, setSuscriptores] = useState(0);
  const [inversores, setInversores] = useState(0);
  const [error, setError] = useState(null);

  const fetchEstadisticas = async () => {
    if (!username) return; // No intentar la solicitud si username no está definido

    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario/${username}`, {
        withCredentials: true,
      });

      // Extraer inversores si es una startup
      const inversoresData = response.data?.inversores || 0;
      setInversores(inversoresData);

      // Extraer suscriptores
      const suscriptoresData = response.data?.suscriptores || 0;
      setSuscriptores(suscriptoresData);

      setError(null); // Limpiar cualquier error previo
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      setError("Ocurrió un problema al cargar los datos.");
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, [username]);

  return (
    <div className="seccion" id="grid2">
      {error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <p className="numeros">{inversores > 0 ? inversores : suscriptores}</p>
          <section className="datos">
            <p>{inversores > 0 ? "Inversores" : "Suscriptores"}</p>
          </section>
        </>
      )}
    </div>
  );
};

export default SuscriptoresOtro;
