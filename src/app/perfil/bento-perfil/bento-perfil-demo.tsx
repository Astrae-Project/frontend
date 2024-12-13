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


export function BentoGridPerfil() {
  const containerRef = useRef(null);
  const [isSmall, setIsSmall] = useState(false);

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
        <Info />
        <TablaPortfolio />
        <MovimientosRecientes />
        <Seguidores />
        <Suscriptores />
        <InversionesRealizadas />
        <EventosyCalendario1 />
        <TablaGrupos />
        <Contacto/>
      </div>
    </div>
  );
}
