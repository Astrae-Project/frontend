'use client';

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

  return (
    <div className="seccion" id="portfolio-perfil">
      {portfolio.length > 0 ? (
        <ul>
          {portfolio.map((inversion, index) => (
            <li key={index}>
              <div className="movimiento-icono">
                <img src={inversion.startup.usuario.avatar} className="avatar-imagen" />
              </div>
              <div className="portfolio-info">
                <p className="startup-nombre">{inversion.startup.nombre}</p>
                <p className="startup-username">{inversion.startup.username}</p>
                <p className='mini-titulo'>Porcentaje</p>
                <p className="porcentaje">{inversion.porcentaje_adquirido}%</p>
                <p className='mini-titulo'>Variación</p>
                <p className="variacion">-24.39%</p>
                <p className='mini-titulo'>Valor</p>
                <p className="valor">{inversion.valor}€</p>
              </div>            
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay inversiones en el portfolio.</p>
      )}
    </div>
  );
};

export default TablaPortfolio;
