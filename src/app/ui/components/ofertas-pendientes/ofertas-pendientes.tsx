"use client";

import React, { useState, useEffect } from "react";
import { ScrollShadow } from "@heroui/react";
import "./ofertas-pendientes-style.css";
import customAxios from "@/service/api.mjs";
import { CartaOferta } from "../carta-oferta/carta-oferta";

export function OfertasPendientes() {
  const [ofertas, setOfertas] = useState([]); // Reemplazado "startups" por "ofertas"
  const [displayedOfertas, setDisplayedOfertas] = useState([]);
  const [bubbleData, setBubbleData] = useState(null);
  const [activeBubble, setActiveBubble] = useState(false);

  // Función para obtener datos de ofertas desde la API
  const fetchOfertasData = async () => {
    try {
      const response = await customAxios.get(
        "https://api.astraesystem.com/api/data/ofertas",
        {
          withCredentials: true,
        }
      );

      if (response.data) {
        setOfertas(response.data); // Asignar correctamente las ofertas
      } else {
        console.error("La respuesta no contiene un arreglo válido en 'ofertas'.");
      }
    } catch (error) {
      console.error("Error fetching ofertas data:", error);
    }
  };

  useEffect(() => {
    fetchOfertasData();
  }, []);

  // Función para seleccionar ofertas aleatorias
  const getRandomOfertas = (count) => {
    if (!Array.isArray(ofertas) || ofertas.length === 0) return []; // Validar ofertas
    const shuffled = [...ofertas].sort(() => 0.5 - Math.random()); // Crear una copia antes de ordenar
    return shuffled.slice(0, count);
  };

  useEffect(() => {
    setDisplayedOfertas(getRandomOfertas(6)); // Mostrar 6 ofertas aleatorias
  }, [ofertas]);

  // Manejar la apertura de la burbuja
  const handleShowBubble = (oferta) => {
    setBubbleData(oferta);
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
        {displayedOfertas.length === 0 ? (
          <p className="texto-empty1">No hay ofertas pendientes</p>
        ) : (
        displayedOfertas.map((oferta) => (
          <CartaOferta
            key={oferta.id} // Usar "id" único de la oferta como key
            oferta={oferta}
            onClick={() => handleShowBubble(oferta)}
          />
        )))}
      </ScrollShadow>
    </div>
  );
}
