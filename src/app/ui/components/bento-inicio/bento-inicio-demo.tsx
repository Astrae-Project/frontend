import React, { useEffect, useState } from "react";
import "./bento-inicio-style.css"
import { Placeholder } from "../placeholder/placeholder-demo";
import { StartupsRecomendadas } from "../startups-recomendadas/startup-recomendadas-demo";
import TablaPortfolio from "../tabla-portfolio/tabla-portfolio";
import MovimientosRecientesPerfil from "../movimientos-recientes/movimientos-recientes copy";
import EventosyCalendario from "../eventos-calendario/eventos-calendario";


export function BentoGridInicio() {
    const [inversor, setInversor] = useState(null);
    const fetchDatosInversor = async () => {
        try {
          const response = await fetch("http://localhost:5000/api/data/inversor", {
            credentials: 'include',
          });
          if (!response.ok) throw new Error("Network response was not ok");
          const data = await response.json();
          setInversor(data.inversor);

      
        } catch (error) {
          console.error("Error fetching inversor data:", error);
        }
      };
    
      useEffect(() => {
        fetchDatosInversor();
      }, []);

  return (
    <div className="contenedor">
        <h1 className="hero">Hola {inversor?.nombre}, bienvenido de nuevo</h1>
        <Placeholder></Placeholder>
        <button id="pequeño1" className="apartado"></button>
        <button id="pequeño2" className="apartado"></button>
        <div className="bento">
            <div className="apartado">
                <TablaPortfolio></TablaPortfolio>
            </div>
            <div className="apartado">
                <MovimientosRecientesPerfil></MovimientosRecientesPerfil>
            </div>
            <div className="apartado">
                <EventosyCalendario></EventosyCalendario>
            </div>
            <div className="apartado">
                <p>Notificaciones</p>
            </div>
            <div className="apartado">
                <p>Actividad Seguidos</p>
            </div>
            <StartupsRecomendadas></StartupsRecomendadas>
        </div>
  </div>
  )
};
