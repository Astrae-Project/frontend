import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';

const InversionesRealizadas = () => {
  const [inversionesRealizadas, setInversionesRealizadas] = useState(0);

  const fetchEstadisticas = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/inversor", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setInversionesRealizadas(data.inversionesRealizadas);
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
        <p className="numeros">{inversionesRealizadas}</p>
        <section className="datos">
          <p>Inversiones</p>
        </section>
      </div>
    </div>
  );
};

export default InversionesRealizadas;