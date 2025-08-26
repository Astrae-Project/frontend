import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import customAxios from "@/service/api.mjs";

const SeguidoresOtro = ({username}) => {
  const [seguidores, setSeguidores] = useState(0);

  const fetchEstadisticas = async () => {
    if (!username) return;

    try {
      const response = await customAxios.get(`https://backend-l3s8.onrender.com/api/data/usuario/${username}`, {
        withCredentials: true,
      });
      setSeguidores(response.data.seguidores || 0);
    } catch (error) {
      console.error("Error fetching estadísticas:", error);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, [username]);

  return (
      <div className="seccion" id="grid1">
        <p className="numeros">{seguidores}</p>
        <section className="datos">
          <p>Seguidores</p>
        </section>
      </div>
  );
};

export default SeguidoresOtro;
