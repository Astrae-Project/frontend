'use client';

import React, { useEffect, useRef, useState } from "react";
import './bento-perfil-style.css';
import InfoOtro from "@/app/ui/components/info/info-otro";
import InversionesRealizadasOtro from "@/app/ui/components/inversiones-realizadas/inversiones-realizadas-otro";
import ContactoOtro from "@/app/ui/components/contacto/contacto-otro";
import TablaGruposOtro from "@/app/ui/components/tabla-grupos/tabla-grupos-otro";
import SuscriptoresOtro from "@/app/ui/components/suscriptores/suscriptores-otro";
import SeguidoresOtro from "@/app/ui/components/seguidores/seguidores-otro";
import EventosyCalendarioOtro1 from "@/app/ui/components/eventos-calendario1/eventos-calendario-otro1";
import MovimientosRecientesOtro from "@/app/ui/components/movimientos-recientes/movimientos-recientes-perfil-otro";
import TablaPortfolioOtro from "@/app/ui/components/tabla-portfolio/tabla-portfolio-otro";
import GraficaStartupOtro from "@/app/ui/components/grafica-startup/grafica-startup-otro";
import DatosStartupOtro from "@/app/ui/components/timeline-startup/timeline-startup-otro";
import customAxios from "@/service/api.mjs";
import TimelineStartupOtro from "@/app/ui/components/timeline-startup/timeline-startup-otro";


export function BentoGridPerfilOtro({ username }) {
  const containerRef = useRef(null);
  const [isSmall, setIsSmall] = useState(false);
  const [rol, setRol] = useState(null); // Estado para el rol

  const fetchRol = async () => {
    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario/${username}`, {
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
    <div ref={containerRef} className={`contenedor4 ${isSmall ? "small" : ""}`}>
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
            <InfoOtro username={username} />
            <TablaPortfolioOtro username={username} />
            <MovimientosRecientesOtro username={username} />
            <SeguidoresOtro username={username} />
            <SuscriptoresOtro username={username} />
            <InversionesRealizadasOtro username={username} />
            <EventosyCalendarioOtro1 username={username} />
            <TablaGruposOtro username={username} />
            <ContactoOtro username={username} />
          </>
        ) : (
          <>
            <InfoOtro username={username} />
            <GraficaStartupOtro username={username} />
            <TimelineStartupOtro username={username}/>
            <SeguidoresOtro username={username} />
            <SuscriptoresOtro username={username} />
            <InversionesRealizadasOtro username={username} />
            <EventosyCalendarioOtro1 username={username} />
            <TablaGruposOtro username={username} />
            <ContactoOtro username={username} />
          </>
        )}
      </div>
    </div>
  );
}  