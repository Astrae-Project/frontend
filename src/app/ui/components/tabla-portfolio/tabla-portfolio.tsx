'use client';

import '../../../perfil/bento-perfil/bento-perfil-style.css';
import React, { useState, useEffect } from "react";
import axios from 'axios';
import Bubble from '../bubble/bubble';

const TablaPortfolio = () => {
  const [portfolio, setPortfolio] = useState([]); // Estado para el portfolio
  const [selectedInversion, setSelectedInversion] = useState(null); // Inversión seleccionada
  const [startupDetails, setStartupDetails] = useState(null); // Detalles de la startup
  const [confirmationMessage, setConfirmationMessage] = useState(""); // Mensaje de confirmación
  const [messageType, setMessageType] = useState(""); // Tipo de mensaje ('success' o 'error')
  const [formSubmitted, setFormSubmitted] = useState(false); // Estado para manejar el formulario
  const [activeBubble, setActiveBubble] = useState(null); // Estado dinámico para la burbuja

  // Función para obtener el portfolio
  const fetchPortfolio = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/data/portfolio", {
        withCredentials: true, // Enviar cookies con la solicitud
      });

      // Verificamos la respuesta en consola
      console.log(response.data);
      setPortfolio(response.data.inversiones); // Actualizamos el estado con las inversiones
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      setConfirmationMessage("Error al cargar el portfolio.");
      setMessageType("error");
    }
  };

  useEffect(() => {
    fetchPortfolio(); // Llamada a la API cuando se monta el componente
  }, []);

  // Función para formatear el cambio porcentual
  const formatCambioPorcentual = (cambio) => {
    if (cambio > 0) {
      return {
        text: `+${Math.floor(cambio)}`,
        color: 'variacion-positiva',
        glowClass: 'variacion-positiva',
      };
    } else if (cambio < 0) {
      return {
        text: `${Math.floor(cambio)}`,
        color: 'variacion-negativa',
        glowClass: 'variacion-negativa',
      };
    }
    return {
      text: '0',
      color: 'variacion-neutral',
      glowClass: 'variacion-neutral',
    };
  };

  // Función para formatear la inversión
  const formatInversion = (monto) => {
    if (monto >= 1e6) {
      return `${(monto / 1e6).toFixed(1)}M`;
    } else if (monto >= 1e3) {
      return `${(monto / 1e3).toFixed(0)}K`;
    }
    return monto.toString();
  };

  // Función para cerrar la burbuja
  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage("");
    setFormSubmitted(false);
  };

  // Función para manejar la vista de la startup
  const handleVerStartup = async () => {
    if (!selectedInversion) {
      setConfirmationMessage("Por favor, selecciona una inversión para ver los detalles.");
      setMessageType("error");
      return;
    }

    try {
      // Buscar la inversión seleccionada
      const inversionData = portfolio.find((inversion) => inversion.id === selectedInversion);
      if (!inversionData) {
        setConfirmationMessage("No se encontró la inversión seleccionada.");
        setMessageType("error");
        return;
      }

      const { id_startup: startupId } = inversionData;
      // Realizar la solicitud para obtener los detalles de la startup
      const response = await axios.get(`http://localhost:5000/api/data/startup/${startupId}`, {
        withCredentials: true,
      });

      console.log("Detalles de la startup:", response.data); // Verificamos los datos recibidos
      setStartupDetails(response.data); // Actualizamos el estado con los detalles de la startup
    } catch (error) {
      console.error("Error al obtener los datos de la startup:", error);
      setConfirmationMessage("Hubo un error al obtener los datos de la startup.");
      setMessageType("error");
    }
  };

  return (
    <div className="seccion" id="portfolio-componente">
      <div className='titulo-principal'>
        <p className='titulo-portfolio'>Activos</p>
      </div>
      <div className="contenido-scrollable">
        {portfolio.length > 0 ? (
          <ul>
            {portfolio.map((inversion) => {
              const cambioPorcentualInfo = formatCambioPorcentual(inversion.cambio_porcentual);
              return (
                <li key={inversion.id}>
                  <button
                    className='relleno-btn'
                    onClick={() => {
                      setSelectedInversion(inversion.id); // Establecemos la inversión seleccionada
                      handleVerStartup(); // Cargamos los detalles de la startup
                      setActiveBubble("inversion-startup"); // Activamos la burbuja
                    }}
                  >
                    <div className="portfolio-icono">
                      <img src={inversion.startup.usuario.avatar} className="portfolio-imagen" alt="Startup avatar" />
                    </div>
                    <div className="portfolio-info">
                      <p className="startup-nombre">{inversion.startup.nombre}</p>
                      <p className="startup-username">@{inversion.startup.usuario.username}</p>
                      <p className='mini-titulo' id='titulo-porcentaje'>Porcentaje</p>
                      <p className="porcentaje">{inversion.porcentaje_adquirido}%</p>
                      <p className='mini-titulo' id='titulo-variacion'>Cambio</p>
                      <p className={`variacion ${cambioPorcentualInfo.glowClass}`}
                        style={{ color: cambioPorcentualInfo.color }}>
                        {cambioPorcentualInfo.text}%
                      </p>
                      <p className='mini-titulo' id='titulo-valor'>Valor</p>
                      <p className="valor">{formatInversion(inversion.valor)}€</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No hay inversiones en el portfolio.</p>
        )}
      </div>

      <Bubble
        show={!!activeBubble} // Solo se muestra si hay una burbuja activa
        onClose={closeBubble} // Cerrar burbuja
        message={confirmationMessage} // Mostrar mensaje de error o éxito
        type={messageType} // Tipo de mensaje ('success' o 'error')
      >
        {activeBubble === "inversion-startup" && !formSubmitted && (
          <div className="evento-detalle">
            <p><strong>Nombre:</strong> {startupDetails?.nombre || 'Cargando...'}</p>
            <p><strong>Sector:</strong> {startupDetails?.sector || 'Cargando...'}</p>
            <p><strong>Plantilla:</strong> {startupDetails?.plantilla || 'Cargando...'}</p>
            <p><strong>Financiación:</strong> {startupDetails?.estado_financiacion || 'Cargando...'}</p>
            <p><strong>Porcentaje Disponible:</strong> {startupDetails?.porcentaje_disponible || 'Cargando...'}%</p>
            <p><strong>Valoración:</strong> {startupDetails?.valoracion ? formatInversion(startupDetails.valoracion) : 'Cargando...'}€</p>
            <p><strong>Usuario:</strong> {startupDetails?.username || 'Cargando...'}</p>
            <p><strong>Seguidores:</strong> {startupDetails?.seguidores || 'Cargando...'}</p>
            <p><strong>Inversores:</strong> {startupDetails?.inversores || 'Cargando...'}</p>
          </div>
        )}
      </Bubble>
    </div>
  );
};

export default TablaPortfolio;
