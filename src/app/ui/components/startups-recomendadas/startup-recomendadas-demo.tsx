"use client";

import React, { useState, useEffect } from "react";
import { ScrollShadow } from "@nextui-org/react";
import "./startups-recomendadas-style.css";
import { Carta } from "../carta-startups/carta-startups";

export function StartupsRecomendadas() {
  const [startups, setStartups] = useState([]);
  const [displayedStartups, setDisplayedStartups] = useState([]);

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

  useEffect(() => {
    setDisplayedStartups(getRandomStartups(6)); // Muestra 6 startups aleatorias
  }, [startups]);

  return (
    <ScrollShadow size={1000} orientation="horizontal" className="contiene1">
      {displayedStartups.map((startup, index) => (
        <Carta key={index} startup={startup} />
      ))}
    </ScrollShadow>
  );
}
