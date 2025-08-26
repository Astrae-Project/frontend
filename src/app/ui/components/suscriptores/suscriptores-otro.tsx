import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import customAxios from "@/service/api.mjs";

const SuscriptoresOtro = ({ username }) => {
  const [suscriptores, setSuscriptores] = useState(0);
  const [inversores, setInversores] = useState(0);
  const [esStartup, setEsStartup] = useState(false);

  const fetchEstadisticas = async () => {
    if (!username) return; // No intentar la solicitud si username no está definido

    try {
      const response = await customAxios.get(`https://backend-l3s8.onrender.com/api/data/usuario/${username}`, {
        withCredentials: true,
      });

       if (response.data.startup) {
        setEsStartup(true);
        setInversores(response.data.inversores);
      }

      setSuscriptores(response.data.suscriptores);
    } catch (error) {
      console.error("Error fetching estadísticas:", error);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, [username]);

  return (
    <div className="seccion" id="grid2">
      <p className="numeros">{esStartup ? inversores : suscriptores}</p>
      <section className="datos">
        <p>{esStartup ? "Inversores" : "Suscriptores"}</p>
      </section>
    </div>
  );
};

export default SuscriptoresOtro;
