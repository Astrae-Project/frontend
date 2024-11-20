import React from 'react';
import './carta-startups-style.css';

export const Carta = ({ startup }) => {
  // Modificación de la función `formatInversion` para mayor compatibilidad
  const formatInversion = (monto) => {
    if (monto === null) {
      return 'N/A'
    }

    if (monto >= 1e6) {
      return `${(monto / 1e6).toFixed(1)}M`; // Para millones
    } else if (monto >= 1e3) {
      return `${(monto / 1e3).toFixed(0)}K`; // Para miles
    } else {
      return monto // Para cantidades menores a mil, con formato de miles
    }
  };

  return (
    <button className="carta">
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
        <div className="carta-detalle">
          <p className="mini-titulo">Valoración</p>
          <p className="carta-valoracion">{formatInversion(startup?.valoracion)}€</p>
        </div>
      </div>
    </button>
  );
};
