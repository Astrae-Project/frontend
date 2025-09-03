import React, { useState, useEffect } from "react";
import Eventos from "../eventos/eventos";
import Calendario from "../calendario/calendario";
import "../../../perfil/bento-perfil/bento-perfil-style.css";
import customAxios from "@/service/api.mjs";

export default function EventosyCalendario() {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [eventos, setEventos] = useState([]);

  const fetchEventos = async () => {
    try {
      const response = await customAxios.get("/data/eventos", {
        withCredentials: true,
      });
      setEventos(response.data);
    } catch (error) {
      console.error("Error fetching eventos:", error);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  return (
    <div className="seccion" id="eventos-componente">
      <div className="contenido">
        <Calendario eventos={eventos} onFechaSeleccionada={setFechaSeleccionada} />
        <Eventos fechaSeleccionada={fechaSeleccionada} />
      </div>
    </div>
  );
}


