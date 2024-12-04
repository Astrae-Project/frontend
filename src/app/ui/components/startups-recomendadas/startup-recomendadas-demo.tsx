"use client";

import React, { useState, useEffect } from "react";
import { ScrollShadow } from "@nextui-org/react";
import "./startups-recomendadas-style.css";
import { Carta } from "../carta-startups/carta-startups";
import Bubble from "../bubble/bubble"; // Asegúrate de tener el componente Bubble importado

export function StartupsRecomendadas() {
  const [startups, setStartups] = useState([]);
  const [displayedStartups, setDisplayedStartups] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null); // Estado para la startup seleccionada
  const [activeBubble, setActiveBubble] = useState(false); // Estado para controlar la burbuja

  const fetchStartupsData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/startup/recomendadas", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setStartups(data.startups);
    } catch (error) {
      console.error("Error fetching startups data:", error);
    }
  };

  useEffect(() => {
    fetchStartupsData();
  }, []);

  // Función para seleccionar startups aleatorias sin repetición
  const getRandomStartups = (count) => {
    if (startups.length === 0) return [];
    const shuffled = startups.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const formatInversion = (monto) => {
    if (monto >= 1e6) {
      return `${(monto / 1e6).toFixed(1)}M`;
    } else if (monto >= 1e3) {
      return `${(monto / 1e3).toFixed(0)}K`;
    }
    return monto.toString();
  };

  useEffect(() => {
    setDisplayedStartups(getRandomStartups(6)); // Muestra 6 startups aleatorias
  }, [startups]);

  const handleShowBubble = (startup) => {
    setSelectedStartup(startup); // Guardamos la startup seleccionada
    setActiveBubble(true); // Mostramos la burbuja
  };

  const closeBubble = () => {
    setActiveBubble(false); // Cerramos la burbuja
    setSelectedStartup(null); // Limpiamos la startup seleccionada
  };

  return (
    <div className="apartado-raro">
      <ScrollShadow size={1000} orientation="horizontal" className="contiene1">
        {displayedStartups.map((startup, index) => (
          <Carta key={index} startup={startup} onClick={() => handleShowBubble(startup)} />
        ))}
      </ScrollShadow>

      {/* Mostrar burbuja si hay una startup seleccionada */}
      {activeBubble && selectedStartup && (
        <Bubble show={activeBubble} onClose={closeBubble}>
          <div className="evento-detalle">
            <p><strong>Nombre:</strong> {selectedStartup?.nombre || 'Cargando...'}</p>
            <p><strong>Sector:</strong> {selectedStartup?.sector || 'Cargando...'}</p>
            <p><strong>Plantilla:</strong> {selectedStartup?.plantilla || 'Cargando...'}</p>
            <p><strong>Financiación:</strong> {selectedStartup?.estado_financiacion || 'Cargando...'}</p>
            <p><strong>Porcentaje Disponible:</strong> {selectedStartup?.porcentaje_disponible || 'Cargando...'}%</p>
            <p><strong>Valoración:</strong> {selectedStartup?.valoracion ? formatInversion(selectedStartup.valoracion) : 'Cargando...'}€</p>
            <p><strong>Usuario:</strong> {selectedStartup?.usuario?.username || 'Cargando...'}</p>
            <p><strong>Seguidores:</strong> {selectedStartup?.usuario?.seguidores?.lenght || 'Cargando...'}</p> {/* Aquí debería estar el número de seguidores */}
            <p><strong>Inversores:</strong> {selectedStartup?.inversiones?.length || 'Cargando...'}</p> {/* Cambiado .lenght a .length */}
          </div>
        </Bubble>
      )}
    </div>
)}
