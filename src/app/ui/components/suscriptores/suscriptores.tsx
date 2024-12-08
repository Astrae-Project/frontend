import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';

const Suscriptores = () => {
  const [suscriptores, setSuscriptores] = useState(0);
  const [inversores, setInversores] = useState(0);

  const fetchEstadisticas = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/usuario", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();

      // Si el usuario es una startup, obtiene los inversores
      if (data.startup) {
        setInversores(data.inversores);
      }

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
      <p className="numeros">{inversores > 0 ? inversores : suscriptores}</p>
      <section className="datos">
        <p>{inversores > 0 ? "Inversores" : "Suscriptores"}</p>
      </section>
    </div>
  );
};

export default Suscriptores;
