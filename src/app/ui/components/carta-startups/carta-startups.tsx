import React from 'react';
import './carta-startups-style.css';

export const Carta = ({ startup, onClick }) => {
  const formatInversion = (monto) => {
    if (monto === null) {
      return 'N/A';
    }
  
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

  return (
    <button className="carta1" onClick={onClick}>
      {/* HEADER */}
      <div className="carta-header1">
        <div className="carta-icono1">
          <img
            src={startup?.avatar || "/default-avatar.png"}
            alt="Avatar"
            className="carta-avatar1"
          />
        </div>
        <div className="carta-info1">
          <p className="carta-nombre1">{startup?.nombre || 'Nombre desconocido'}</p>
          <p className="carta-username1">@{startup.usuario.username}</p>
        </div>
      </div>

      {/* VALORACIÓN PRINCIPAL */}
      <div className="division-tarjeta valoracion-principal1">
        <p className="carta-titulo1">Valoración</p>
        <p className="carta-valoracion1">{formatInversion(startup?.valoracion)}</p>
      </div>

      {/* INFO SECUNDARIA */}
      <div className="division-tarjeta info-secundaria1">
        <div>
          <p className="carta-subtitulo1">Sector</p>
          <p className="carta-subdato1">{startup?.sector || '—'}</p>
        </div>
        <div>
          <p className="carta-subtitulo1">Etapa</p>
          <p className="carta-subdato1">{startup?.estado_financiacion || '—'}</p>
        </div>
        <div>
          <p className="carta-subtitulo1">Disponible %</p>
          <p className="carta-subdato1">{startup?.porcentaje_disponible || '—'}%</p>
        </div>
      </div>
    </button>
  );
};
