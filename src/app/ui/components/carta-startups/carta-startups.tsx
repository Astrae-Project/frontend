import React from 'react';
import './carta-startups-style.css';

export const Carta = ({ startup, onClick }) => {
  const formatInversion = (monto) => {
    if (monto === null) {
      return 'N/A';
    }
  
    if (monto >= 1e6) {
      const millones = monto / 1e6;
      return `${millones % 1 === 0 ? millones.toFixed(0) : millones.toFixed(1)}M€`; // Para millones
    } else if (monto >= 1e3) {
      const miles = monto / 1e3;
      return `${miles % 1 === 0 ? miles.toFixed(0) : miles.toFixed(1)}K€`; // Para miles
    } else {
      return `${monto}€`; // Para cantidades menores a mil
    }
  };

  return (
    <button className="carta" onClick={onClick}>
      <div className="carta-header">
        <div className="carta-icono">
          <img src={startup?.usuario?.avatar} alt="Avatar de startup" className="carta-avatar" />
        </div>
        <div className="carta-info">
          <p className="carta-nombre">{startup?.nombre}</p>
          <p className="carta-username">@{startup?.usuario?.username}</p>
        </div>
      </div>
      <div className="carta-detalles">
        <p className="carta-titulo">Valoración</p>
        <p className="carta-valoracion">{formatInversion(startup?.valoracion)}</p>
        <p className="carta-titulo">Porcentaje</p>
        <p className="carta-valoracion">{startup?.porcentaje_disponible}</p>
      </div>
    </button>
  );
};
