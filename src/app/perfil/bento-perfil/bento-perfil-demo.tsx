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
import DatosStartup from "@/app/ui/components/datos-startup/datos-startup";
import GraficaStartup from "@/app/ui/components/grafica-startup/grafica-startup";


export function BentoGridPerfil() {
  const containerRef = useRef(null);
  const [isSmall, setIsSmall] = useState(false);
  const [rol, setRol] = useState(null); // Estado para el rol

  const fetchRol = async () => {
    try {
      const response = await customAxios.get(`http://localhost:5000/api/data/usuario`, {
        withCredentials: true, // Enviar cookies con la solicitud
      });
  
      console.log(response.data); // Añadir para depuración
      
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
          <div>Loading...</div> // Puedes mostrar un mensaje de carga mientras esperas la respuesta
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
            <DatosStartup/>
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
