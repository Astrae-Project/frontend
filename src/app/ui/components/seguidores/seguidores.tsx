import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';

const Seguidores = () => {
  const [seguidores, setSeguidores] = useState(0);

  const fetchEstadisticas = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/inversor", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setSeguidores(data.seguidores);
    } catch (error) {
      console.error("Error fetching estadísticas:", error);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  return (
    <div>
      <div className="seccion" id="grid1">
        <p className="numeros">{seguidores}</p>
        <section className="datos">
          <p>Seguidores</p>
        </section>
      </div>
    </div>
  );
};

export default Seguidores;
