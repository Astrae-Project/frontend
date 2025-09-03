'use client';

import React, { useState, useEffect } from "react";
import "../../../perfil/bento-perfil/bento-perfil-style.css";
import EventosOtro from "../eventos/eventos-otro";
import CalendarioOtro1 from "../calendario1/calendario-otro1";

export default function EventosyCalendarioOtro1({ username }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [eventos, setEventos] = useState([]);

  const fetchEventos = async () => {
    if (!username) return;

    try {
      const response = await fetch(`/data/usuario/${username}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error al obtener eventos: ${response.statusText}`);
          }
          const data = await response.json();
          setEventos(data.usuario?.eventos || []); // Asegura que solo se carguen eventos válidos.
    } catch (error) {
      console.error("Error fetching eventos:", error);
    }
  }

  useEffect(() => {
    if (username) {
      fetchEventos();
    }
  }, [username]);


  return (
    <div className="seccion" id="eventos-componente">
      <div className="contenido1">
        <CalendarioOtro1 eventos={eventos} onFechaSeleccionada={setFechaSeleccionada} />
        <EventosOtro fechaSeleccionada={fechaSeleccionada} username={username} />
      </div>
    </div>
  );
}
