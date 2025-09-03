"use client";

import { ScrollShadow } from "@heroui/react";
import { CartaSeguidas } from "../../ui/components/carta-startups/carta-startups-seguidas";
import "./startups-seguidas-style.css";
import customAxios from "@/service/api.mjs";
import { useState, useEffect } from "react";
import Bubble from "@/app/ui/components/bubble/bubble";
import dynamic from "next/dynamic";
import React, { FC } from "react";

// Tipado del componente dinámico
interface PerfilOtroProps {
  username: string;
}
const PerfilOtroComponent: FC<PerfilOtroProps> = dynamic(
  () => import('@/app/perfil-otro/PerfilOtroCliente'),
  { ssr: false }
) as unknown as FC<PerfilOtroProps>;

const StartupsSeguidas = () => {
  const [startups, setStartups] = useState([]); // Inicializar como array vacío
  const [displayedStartups, setDisplayedStartups] = useState([]);
  const [bubbleData, setBubbleData] = useState(null);
  const [activeBubble, setActiveBubble] = useState(false);

  // Función para obtener startups desde la API
  const fetchStartupsData = async () => {
    try {
      const response = await customAxios.get(
        "/data/startup/seguidas",
        { withCredentials: true }
      );

      if (response.data && Array.isArray(response.data.startups)) {
        setStartups(response.data.startups); // Aquí accedemos correctamente a startups
      } else {
        console.error("La respuesta no contiene un array válido en 'startups'.");
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
    if (!Array.isArray(startups) || startups.length === 0) return [];
    const shuffled = [...startups].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    setDisplayedStartups(getRandomStartups(6)); // Mostrar 6 startups aleatorias
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
    <ScrollShadow size={1000} orientation="horizontal" className="contiene">
      {displayedStartups.length === 0 ? (
          <p className="texto-empty">No hay startups seguidas</p>
        ) : (
          displayedStartups.map((startup) => (
        <CartaSeguidas
          key={startup.username} // Se usa username como clave (debe ser único)
          startup={startup}
          onClick={() => handleShowBubble(startup)}
        />
      )))}

      {activeBubble && bubbleData && (
        <Bubble show={activeBubble} onClose={closeBubble} message={undefined} type={undefined}>
          <PerfilOtroComponent username={bubbleData.username} />
        </Bubble>
      )}
    </ScrollShadow>
  );
}

export default StartupsSeguidas;
