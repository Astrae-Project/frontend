'use client';

import React, { useEffect, useRef, useState } from "react";
import './bento-perfil-style.css';
import EventosyCalendario1 from "../../ui/components/eventos-calendario1/eventos-calendario1";
import Seguidores from "../../ui/components/seguidores/seguidores";
import Suscriptores from "../../ui/components/suscriptores/suscriptores";
import TablaGrupos from "../../ui/components/tabla-grupos/tabla-grupos";
import TablaPortfolio from "../../ui/components/tabla-portfolio/tabla-portfolio";
import MovimientosRecientes from "../../ui/components/movimientos-recientes/movimientos-recientes-perfil";
import InfoOtro from "@/app/ui/components/info/info-otro";
import InversionesRealizadasOtro from "@/app/ui/components/inversiones-realizadas/inversiones-realizadas-otro";
import ContactoOtro from "@/app/ui/components/contacto/contacto-otro";


export function BentoGridPerfilOtro({ username }) {
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
        <InfoOtro username={username} />
        <TablaPortfolio username={username} />
        <MovimientosRecientes username={username} />
        <Seguidores username={username} />
        <Suscriptores username={username} />
        <InversionesRealizadasOtro username={username} />
        <EventosyCalendario1 username={username} />
        <TablaGrupos username={username} />
        <ContactoOtro username={username} />
      </div>
    </div>
  );
}