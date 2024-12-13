import React, { useEffect, useState } from "react";
import "./bento-inicio-style.css"
import { Placeholder } from "../placeholder/placeholder-demo";
import { StartupsRecomendadas } from "../startups-recomendadas/startup-recomendadas-demo";
import TablaPortfolio from "../tabla-portfolio/tabla-portfolio";
import EventosyCalendario from "../eventos-calendario/eventos-calendario";
import MovimientosRecientes1 from "../movimientos-recientes/movimientos-recientes";
import customAxios from "@/service/api.mjs";


export function BentoGridInicio() {
    const [inversor, setInversor] = useState(null);
    const fetchDatosInversor = async () => {
        try {
          const response = await customAxios.get("http://localhost:5000/api/data/usuario", {
            withCredentials: true,
          });
          setInversor(response.data.inversor);

      
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
                <MovimientosRecientes1></MovimientosRecientes1>
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
