import React from "react";
import "./bento-inicio-style.css"
import { Placeholder } from "../placeholder/placeholder-demo";
import { StartupsRecomendadas } from "../startups-recomendadas/startup-recomendadas-demo";
import TablaPortfolio from "../tabla-portfolio/tabla-portfolio";
import InversionesPrevias from "../movimientos-recientes/movimientos-recientes";

export function BentoGridInicio() {
  return (
    <div className="contenedor">
        <h1 className="hero">Hola nombre, bienvenido de nuevo</h1>
        <Placeholder></Placeholder>
        <button id="pequeño1" className="apartado"></button>
        <button id="pequeño2" className="apartado"></button>
        <div className="bento">
            <div className="apartado">
                <TablaPortfolio></TablaPortfolio>
            </div>
            <div className="apartado">
                <InversionesPrevias></InversionesPrevias>
            </div>
            <div className="apartado">
                <p>Calendario</p>
            </div>
            <div className="apartado">
                <p>Noticias</p>
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
