import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';


const Eventos = () => {
  const [eventos, setEventos] = useState([]);

  const fetchEventos = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/eventos", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error("Error fetching eventos:", error);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  return (
    <div className="seccion">
    {eventos.length > 0 ? (
      <ul>
        {eventos.map((evento, index) => (
          <li key={index}>
            {evento.descripcion} - {evento.fecha_evento}
          </li>
        ))}
      </ul>
    ) : (
      <p>No hay eventos recientes.</p>
    )}
  </div>
  );
};

export default Eventos;
