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
import TimelineStartupOtro from "@/app/ui/components/timeline-startup/timeline-startup-otro";
import customAxios from "@/service/api.mjs";

export function BentoGridPerfilOtro(props) {
  const containerRef = useRef(null);
  const [isSmall, setIsSmall] = useState(false);
  const [rol, setRol] = useState(null);

  // Normaliza/extrae username seguro (acepta string o objetos de rutas)
  const username = (() => {
    if (!props) return "";
    if (typeof props === "string") return props;
    if (typeof props.username === "string") return props.username;
    if (typeof props.params?.username === "string") return props.params.username;
    if (typeof props.route?.params?.username === "string") return props.route.params.username;
    if (typeof props.searchParams?.username === "string") return props.searchParams.username;
    // fallback a objeto entero (no válido) -> vacío
    return "";
  })();

  useEffect(() => {
    // no hacer peticiones si no hay username válido
    if (!username) {
      setRol(null);
      return;
    }

    const fetchRol = async () => {
      try {
        const safe = encodeURIComponent(username);
        const response = await customAxios.get(`/data/usuario/${safe}`, {
          withCredentials: true,
        });

        // Comprueba la estructura esperada antes de usarla
        const d = response?.data ?? {};
        if (d.inversor) {
          setRol("inversor");
        } else if (d.startup) {
          setRol("startup");
        } else {
          console.warn("Usuario encontrado pero sin tipo (inversor/startup).", d);
          setRol(null);
        }
      } catch (err) {
        console.error("Error fetching rol:", err);
        setRol(null);
      }
    };

    fetchRol();
  }, [username]);

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      setIsSmall(entry.contentRect.width < 1300);
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`contenedor4 ${isSmall ? "small" : ""}`}>
      <div className="grid">
        {rol === null ? (
          <div className="flex items-center justify-center h-screen">
            <img src="/Logo.svg" alt="Cargando..." className="heartbeat" />
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
            <TimelineStartupOtro username={username} />
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