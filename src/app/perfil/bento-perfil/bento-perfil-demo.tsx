'use client';

import React, { useEffect, useRef, useState } from "react";
import './bento-perfil-style.css';
import Contacto from "../../ui/components/contacto/contacto";
import EventosyCalendario1 from "../../ui/components/eventos-calendario1/eventos-calendario1";
import InversionesRealizadas from "../../ui/components/inversiones-realizadas/inversiones-realizadas";
import Seguidores from "../../ui/components/seguidores/seguidores";
import Suscriptores from "../../ui/components/suscriptores/suscriptores";
import TablaGrupos from "../../ui/components/tabla-grupos/tabla-grupos";
import TablaPortfolio from "../../ui/components/tabla-portfolio/tabla-portfolio";
import Info from "../../ui/components/info/info";
import MovimientosRecientes from "../../ui/components/movimientos-recientes/movimientos-recientes-perfil";
import customAxios from "@/service/api.mjs";
import GraficaStartup from "@/app/ui/components/grafica-startup/grafica-startup";
import TimelineStartup from "@/app/ui/components/timeline-startup/timeline-startup";


export function BentoGridPerfil() {
  const containerRef = useRef(null);
  const [isSmall, setIsSmall] = useState(false);
  const [rol, setRol] = useState(null); // Estado para el rol

  const fetchRol = async () => {
    try {
      const response = await customAxios.get(`https://api.astraesystem.com/api/data/usuario`, {
        withCredentials: true, // Enviar cookies con la solicitud
      });
        
      // Verificamos si es un inversor o una startup
      if (response.data.inversor) {
        setRol("inversor");
      } else if (response.data.startup) {
        setRol("startup");
      } else {
        console.error("No se encontró un tipo de usuario válido");
      }
    } catch (error) {
      console.error("Error fetching rol:", error);
    }
  };
  
  useEffect(() => {
    fetchRol(); // Llamada a la API cuando se monta el componente
  }, []);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setIsSmall(entry.contentRect.width < 1300); // Cambia el tamaño según lo necesario
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  

  return (
    <div ref={containerRef}
    className={`contenedor4 ${isSmall ? "small" : ""}`}>
      <div className="grid">
      {rol === null ? (
        <div className="flex items-center justify-center h-screen">
          <img
            src="/Logo.svg"
            alt="Cargando..."
            className="heartbeat"
          />
        </div>
        ) : rol === "inversor" ? (
          <>
            <Info/>
            <TablaPortfolio/>
            <MovimientosRecientes/>
            <Seguidores/>
            <Suscriptores/>
            <InversionesRealizadas/>
            <EventosyCalendario1 />
            <TablaGrupos/>
            <Contacto/>
          </>
        ) : (
          <>
            <Info/>
            <GraficaStartup/>
            <TimelineStartup/>
            <Seguidores/>
            <Suscriptores/>
            <InversionesRealizadas/>
            <EventosyCalendario1 />
            <TablaGrupos/>
            <Contacto/>
          </>
        )}
      </div>
    </div>
  );
}
