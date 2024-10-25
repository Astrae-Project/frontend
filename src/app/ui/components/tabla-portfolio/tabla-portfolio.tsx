'use client';

import { IconTrendingUp } from '@tabler/icons-react';
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import React, { useState, useEffect } from "react";

const TablaPortfolio = () => {
  const [portfolio, setPortfolio] = useState([]);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data/portfolio", {
        credentials: 'include',
      });
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setPortfolio(data.inversiones);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Función para formatear el cambio porcentual
  const formatCambioPorcentual = (cambio) => {
    if (cambio > 0) {
      return {
        text: `+${Math.floor(cambio)}`, // Formato entero y añade +
        color: 'variacion-positiva', // Color verde para positivo
        glowClass: 'variacion-positiva', // Clase CSS para el resplandor positivo
      };
    } else if (cambio < 0) {
      return {
        text: `${Math.floor(cambio)}`, // Solo muestra el número negativo
        color: 'variacion-negativa', // Color rojo para negativo
        glowClass: 'variacion-negativa', // Clase CSS para el resplandor negativo
      };
    }
    return {
      text: '0', // Sin signo para cero
      color: 'variacion-neutral', // Color gris para cero
      glowClass: 'variacion-neutral', // Clase CSS para variación neutra (sin resplandor)
    };
  };

  return (
    <div className="seccion" id="portfolio-componente">
      <div className='titulo-principal'>
        <IconTrendingUp className='svg'></IconTrendingUp>
        <p className='titulo-portfolio'>Activos</p>
      </div>
      <div className="contenido-scrollable">
        {portfolio.length > 0 ? (
          <ul>
            {portfolio.map((inversion, index) => {
              const cambioPorcentualInfo = formatCambioPorcentual(inversion.cambio_porcentual);
              return (
                <li key={index}>
                  <div className="movimiento-icono">
                    <img src={inversion.startup.usuario.avatar} className="avatar-imagen" />
                  </div>
                  <div className="portfolio-info">
                    <p className="startup-nombre">{inversion.startup.nombre}</p>
                    <p className="startup-username">{inversion.startup.username}</p>
                    <p className='mini-titulo' id='titulo-porcentaje'>Porcentaje</p>
                    <p className="porcentaje">{inversion.porcentaje_adquirido}%</p>
                    <p className='mini-titulo' id='titulo-variacion'>Variación</p>
                    <p className={`variacion ${cambioPorcentualInfo.glowClass}`} 
                      style={{ color: cambioPorcentualInfo.color }}>
                      {cambioPorcentualInfo.text}%
                    </p>
                    <p className='mini-titulo' id='titulo-valor'>Valor</p>
                    <p className="valor">{inversion.valor}€</p>
                  </div>            
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No hay inversiones en el portfolio.</p>
        )}
      </div>
    </div>
  );
};

export default TablaPortfolio;
