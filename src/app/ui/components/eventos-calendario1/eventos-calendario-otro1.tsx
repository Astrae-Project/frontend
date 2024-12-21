'use client';

import React, { useState, useEffect } from "react";
import Eventos from "../eventos/eventos";
import Calendario1 from "../calendario1/calendario1";
import "../../../perfil/bento-perfil/bento-perfil-style.css";

export default function EventosyCalendarioOtro1({ username }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [eventos, setEventos] = useState([]);
  const [error, setError] = useState(null);

  const fetchEventos = async () => {
    if (!username) return;

    try {
      const response = await fetch(`http://localhost:5000/api/data/usuario/${username}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al obtener eventos: " + response.statusText);
      }

      const data = await response.json();
      setEventos(data.usuario?.eventos || []); // Asegura que solo se carguen los eventos si están disponibles.
    } catch (error) {
      console.error("Error fetching eventos:", error);
      setError("No se pudieron cargar los eventos.");
    }
  };

  useEffect(() => {
    fetchEventos();
  }, [username]);

  if (error) {
    return <div className="seccion error">{error}</div>;
  }

  return (
    <div className="seccion" id="eventos-componente">
      <div className="contenido1">
        <Calendario1 eventos={eventos} onFechaSeleccionada={setFechaSeleccionada} />
        <Eventos fechaSeleccionada={fechaSeleccionada} username={username} />
      </div>
    </div>
  );
}
