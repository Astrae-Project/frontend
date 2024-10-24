import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';

const Suscriptores = () => {
  const [suscriptores, setSuscriptores] = useState(0);

  const fetchEstadisticas = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/inversor", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setSuscriptores(data.suscriptores);
    } catch (error) {
      console.error("Error fetching estadísticas:", error);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, []);

  return (
      <div className="seccion" id="grid2">
        <p className="numeros">{suscriptores}</p>
        <section className="datos">
          <p>Suscriptores</p>
        </section>
      </div>
  );
};

export default Suscriptores;