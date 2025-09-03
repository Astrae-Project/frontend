'use client';

import '../../../perfil/bento-perfil/bento-perfil-style.css';
import React, { useState, useEffect } from 'react';
import Bubble from '../bubble/bubble';
import customAxios from '../../../../service/api.mjs';
import PerfilOtro from '@/app/perfil-otro/page';
import dynamic from "next/dynamic";
import { FC } from "react";

// Tipado del componente dinámico
interface PerfilOtroProps {
  username: string;
}
const PerfilOtroComponent: FC<PerfilOtroProps> = dynamic(
  () => import('@/app/perfil-otro/PerfilOtroCliente'),
  { ssr: false }
) as unknown as FC<PerfilOtroProps>;

const TablaPortfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [selectedInversion, setSelectedInversion] = useState(null);
  const [startupDetails, setStartupDetails] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [activeBubble, setActiveBubble] = useState(null);
  const [bubbleData, setBubbleData] = useState(null);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data } = await customAxios.get('/data/portfolio', {
          withCredentials: true,
        });
        setPortfolio(data.inversiones);
      } catch (error) {
        console.error('Error fetching portfolio:', error);}
    };
    fetchPortfolio();
  }, []);

  // Format percentage change
  const formatCambioPorcentual = (cambio) => {
    const classes = cambio > 0 
      ? { text: `+${Math.floor(cambio)}`, className: 'variacion-positiva' }
      : cambio < 0 
      ? { text: `${Math.floor(cambio)}`, className: 'variacion-negativa' }
      : { text: '0', className: 'variacion-neutral' };
    return classes;
  };

  const formatInversion = (monto) => {
    if (monto === null) return 'N/A';

    if (monto >= 1e6) {
      const millones = monto / 1e6;
      return `${(Math.round(millones * 10) / 10).toString().replace(/\.0$/, '')}M€`;
    }

    if (monto >= 1e3) {
      const miles = monto / 1e3;
      return `${(Math.round(miles * 10) / 10).toString().replace(/\.0$/, '')}K€`;
    }

    return `${monto.toLocaleString("es-ES")} €`;
  };

  // Open bubble
  const handleBubbleOpen = (type, data) => {
    setBubbleData(data);
    setActiveBubble(type);
  };

  // Close bubble
  const handleBubbleClose = () => {
    setActiveBubble(null);
    setBubbleData(null);
  };

  // Fetch startup details
  const handleVerStartup = async () => {
    if (!selectedInversion) {
      return console.error('No se ha seleccionado ninguna inversión.');
    }

    try {
      const inversionData = portfolio.find((inversion) => inversion.id === selectedInversion);
      if (!inversionData) {
        return console.error('No se ha encontrado la inversión seleccionada.');
      }

      const { id_startup: startupId } = inversionData;
      const { data } = await customAxios.get(`/data/startup/${startupId}`, {
        withCredentials: true,
      });
      setStartupDetails(data);
    } catch (error) {
      console.error('Error al cargar los detalles de la startup.');
    }
  };

  return (
    <div className="seccion" id="portfolio-componente">
      <div className="titulo-principal">
        <p className="titulo-portfolio">Activos</p>
      </div>

      {portfolio.length > 0 ? (
        <div className="contenido-scrollable">
          <ul>
            {portfolio.map((inversion) => {
              const cambioPorcentualInfo = formatCambioPorcentual(inversion.cambio_porcentual);
              return (
                <li key={inversion.id} className='portfolio-item'>
                  <button
                    className="relleno-btn"
                    onClick={() => {
                      setSelectedInversion(inversion.id);
                      handleVerStartup();
                      handleBubbleOpen('perfil-startup', inversion.startup);
                    }}
                  >
                    <div className="portfolio-icono">
                      <img src={inversion.startup.usuario.avatar || "/default-avatar.png"} className="portfolio-imagen" alt="Avatar startup" />
                    </div>
                    <div className="portfolio-info">
                      <p className="startup-nombre">{inversion.startup.nombre}</p>
                      <p className="startup-username">@{inversion.startup.usuario.username}</p>
                      <p className="mini-titulo" id="titulo-porcentaje">Porcentaje</p>
                      <p className="porcentaje">{inversion.porcentaje_adquirido}%</p>
                      <p className="mini-titulo" id="titulo-variacion">Cambio</p>
                      <p className={`variacion ${cambioPorcentualInfo.className}`}>
                        {cambioPorcentualInfo.text}%
                      </p>
                      <p className="mini-titulo" id="titulo-valor">Valor</p>
                      <p className="valor">{formatInversion(inversion.valor)}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <p className="texto-vacio">No hay inversiones en el portfolio</p>
      )}

      <Bubble
        show={!!activeBubble}
        onClose={handleBubbleClose}
        message={confirmationMessage}
        type={messageType}
      >
        {activeBubble === 'perfil-startup' && bubbleData && (
          <PerfilOtroComponent username={bubbleData.usuario.username} />
        )}
      </Bubble>
    </div>
  );
};

export default TablaPortfolio;