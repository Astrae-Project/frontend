import React, { useState, useEffect } from "react";
import Eventos from "../eventos/eventos";
import Calendario1 from "../calendario1/calendario1";
import "../../../perfil/bento-perfil/bento-perfil-style.css";

export default function EventosyCalendario1() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [eventos, setEventos] = useState([]);

  const fetchEventos = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/eventos", {
        credentials: "include",
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
    <div className="seccion" id="eventos-componente">
      <div className="contenido1">
        <Calendario1 eventos={eventos} onFechaSeleccionada={setFechaSeleccionada} />
        <Eventos fechaSeleccionada={fechaSeleccionada} />
      </div>
    </div>
  );
}


