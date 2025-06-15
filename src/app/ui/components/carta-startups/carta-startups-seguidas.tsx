import React from 'react';
import './carta-startups-seguidas-style.css';
import GraficaStartupOtroSimple from '../grafica-startup/grafica-startup-otro-simple';

export const CartaSeguidas = ({ startup, onClick }) => {
  // Formateo de valoración
  const formatInversion = (monto) => {
    if (monto == null) return 'N/A';
    if (monto >= 1e6) {
      const millones = monto / 1e6;
      return `${(Math.round(millones * 10) / 10).toString().replace(/\.0$/, '')}M€`;
    }
    if (monto >= 1e3) {
      const miles = monto / 1e3;
      return `${(Math.round(miles * 10) / 10).toString().replace(/\.0$/, '')}K€`;
    }
    return `${monto.toLocaleString('es-ES')} €`;
  };

  const data = startup.startups?.[0] || {};

  return (
    <button className="carta" onClick={onClick}>
      {/* HEADER */}
      <div className="carta-header">
        <div className="carta-icono">
          <img
            src={startup.avatar || "/default-avatar.png"}
            alt="Avatar"
            className="carta-avatar"
          />
        </div>
        <div className="carta-info">
          <p className="carta-nombre">{data.nombre || 'Nombre desconocido'}</p>
          <p className="carta-username">@{startup.username}</p>
        </div>
      </div>

      {/* VALORACIÓN PRINCIPAL */}
      <div className="division-tarjeta valoracion-principal">
        <p className="carta-titulo">Valoración</p>
        <p className="carta-valoracion">{formatInversion(data.valoracion)}</p>
      </div>

      {/* INFO SECUNDARIA */}
      <div className="division-tarjeta info-secundaria">
        <div>
          <p className="carta-subtitulo">Sector</p>
          <p className="carta-subdato">{data.sector || '—'}</p>
        </div>
        <div>
          <p className="carta-subtitulo">Etapa</p>
          <p className="carta-subdato">{data.estado_financiacion || '—'}</p>
        </div>
        <div>
          <p className="carta-subtitulo">Disponible %</p>
          <p className="carta-subdato">{data.porcentaje_disponible || '—'}%</p>
        </div>
      </div>
    </button>
  );
};
