"use client";

import React, { useState, useEffect } from "react";
import { ScrollShadow } from "@heroui/react";
import "./startups-recomendadas-style.css";
import { Carta } from "../carta-startups/carta-startups";
import Bubble from "../bubble/bubble"; // Asegúrate de tener el componente Bubble importado
import customAxios from "@/service/api.mjs";
import PerfilOtro from "@/app/perfil-otro/page";

const PerfilOtroComponent: any = PerfilOtro;

export function StartupsRecomendadas() {
  const [startups, setStartups] = useState([]); // Inicializar como un arreglo vacío
  const [displayedStartups, setDisplayedStartups] = useState([]);
  const [bubbleData, setBubbleData] = useState(null);
  const [activeBubble, setActiveBubble] = useState(false);

  // Función para obtener datos de startups desde la API
  const fetchStartupsData = async () => {
    try {
      const response = await customAxios.get(
        "https://api.astraesystem.com/api/data/startup/recomendadas",
        {
          withCredentials: true,
        }
      );

      if (response.data && Array.isArray(response.data.startups)) {
        setStartups(response.data.startups); // Asegúrate de acceder a la clave "startups"
      } else {
        console.error("La respuesta no contiene un arreglo válido en 'startups'.");
      }
    } catch (error) {
      console.error("Error fetching startups data:", error);
    }
  };

  useEffect(() => {
    fetchStartupsData();
  }, []);

  // Función para seleccionar startups aleatorias
  const getRandomStartups = (count) => {
    if (!Array.isArray(startups) || startups.length === 0) return []; // Validar startups
    const shuffled = [...startups].sort(() => 0.5 - Math.random()); // Crear una copia antes de ordenar
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    setDisplayedStartups(getRandomStartups(10)); // Mostrar 6 startups aleatorias
  }, [startups]);

  // Manejar la apertura de la burbuja
  const handleShowBubble = (startup) => {
    setBubbleData(startup);
    setActiveBubble(true);
  };

  // Manejar el cierre de la burbuja
  const closeBubble = () => {
    setActiveBubble(false);
    setBubbleData(null);
  };

  return (
    <div className="apartado-raro">
      <ScrollShadow size={1000} orientation="horizontal" className="contiene1">
        {displayedStartups.length === 0 ? (
          <p className="texto-empty">No hay startups recomendadas</p>
        ) : (
          displayedStartups.map((startup) => (
            <Carta
              key={startup.id}
              startup={startup}
              onClick={() => handleShowBubble(startup)}
            />
          ))
        )}
      </ScrollShadow>

      {activeBubble && bubbleData && (
        <Bubble show={activeBubble} onClose={closeBubble} message={undefined} type={undefined}>
          <PerfilOtroComponent username={bubbleData.usuario?.username || "Desconocido"} />
        </Bubble>
      )}
    </div>
  );
}
 