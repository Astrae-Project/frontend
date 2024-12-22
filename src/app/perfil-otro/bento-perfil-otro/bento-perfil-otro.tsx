'use client';

import React, { useEffect, useRef, useState } from "react";
import './bento-perfil-style.css';
import TablaPortfolio from "../../ui/components/tabla-portfolio/tabla-portfolio";
import InfoOtro from "@/app/ui/components/info/info-otro";
import InversionesRealizadasOtro from "@/app/ui/components/inversiones-realizadas/inversiones-realizadas-otro";
import ContactoOtro from "@/app/ui/components/contacto/contacto-otro";
import TablaGruposOtro from "@/app/ui/components/tabla-grupos/tabla-grupos-otro";
import SuscriptoresOtro from "@/app/ui/components/suscriptores/suscriptores-otro";
import SeguidoresOtro from "@/app/ui/components/seguidores/seguidores-otro";
import EventosyCalendarioOtro1 from "@/app/ui/components/eventos-calendario1/eventos-calendario-otro1";
import MovimientosRecientesOtro from "@/app/ui/components/movimientos-recientes/movimientos-recientes-perfil-otro";


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
        <MovimientosRecientesOtro username={username} />
        <SeguidoresOtro username={username} />
        <SuscriptoresOtro username={username} />
        <InversionesRealizadasOtro username={username} />
        <EventosyCalendarioOtro1 username={username} />
        <TablaGruposOtro username={username} />
        <ContactoOtro username={username} />
      </div>
    </div>
  );
}