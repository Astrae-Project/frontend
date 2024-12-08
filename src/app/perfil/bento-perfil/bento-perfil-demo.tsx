'use client';

import React, { useEffect, useRef, useState } from "react";
import './bento-perfil-style.css';
import Contacto from "@/app/ui/components/contacto/contacto";
import InversorInfo from "@/app/ui/components/info/info";
import MovimientosRecientes from "@/app/ui/components/movimientos-recientes/movimientos-recientes";
import TablaGrupos from "@/app/ui/components/tabla-grupos/tabla-grupos";
import TablaPortfolio from "@/app/ui/components/tabla-portfolio/tabla-portfolio";
import Seguidores from "@/app/ui/components/seguidores/seguidores";
import Suscriptores from "@/app/ui/components/suscriptores/suscriptores";
import InversionesRealizadas from "@/app/ui/components/inversiones-realizadas/inversiones-realizadas";
import EventosyCalendario1 from "@/app/ui/components/eventos-calendario1/eventos-calendario1";

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
        <InversorInfo />
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
