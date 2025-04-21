import React from 'react';
import './carta-startups-style.css';
import GraficaStartupOtroSimple from '../grafica-startup/grafica-startup-otro-simple';

export const CartaSeguidas = ({ startup, onClick }) => {
  // Función para formatear la inversión/valoración
  const formatInversion = (monto) => {
    if (monto === null || monto === undefined) return 'N/A';
    if (monto >= 1e6) {
      const millones = monto / 1e6;
      return `${millones % 1 === 0 ? millones.toFixed(0) : millones.toFixed(1)}M€`;
    } else if (monto >= 1e3) {
      const miles = monto / 1e3;
      return `${miles % 1 === 0 ? miles.toFixed(0) : miles.toFixed(1)}K€`;
    } else {
      return `${monto}€`;
    }
  };

  // Extraemos la información de la startup real desde el array 'startups'
  const startupData = (startup.startups && startup.startups.length > 0) ? startup.startups[0] : {};

  return (
    <button className="carta" onClick={onClick}>
      <div className="carta-header">
        <div className="carta-icono">
          <img 
            src={startup?.avatar || "/default-avatar.png"} 
            alt="Avatar de startup" 
            className="carta-avatar" 
          />
        </div>
        <div className="carta-info">
          <p className="carta-nombre">{startupData?.nombre || "Nombre desconocido"}</p>
          <p className="carta-username">@{startup?.username || "Desconocido"}</p>
        </div>
      </div>
      <div className="carta-detalles">
        <div className='division-tarjeta' style={{ display: 'none'}}>
          <GraficaStartupOtroSimple username={startup?.username} />
        </div>
        <div className='division-tarjeta'>
          <p className="carta-titulo">Valoración</p>
          <p className="carta-valoracion">{formatInversion(startupData?.valoracion)}</p>
        </div>
      </div>
    </button>
  );
};
