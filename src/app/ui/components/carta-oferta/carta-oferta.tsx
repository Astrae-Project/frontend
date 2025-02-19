import React, { useEffect, useState } from 'react';
import './carta-oferta-style.css';
import Bubble from '../bubble/bubble';
import customAxios from '@/service/api.mjs';

export const CartaOferta = ({ oferta }) => {
  const [activeBubble, setActiveBubble] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [rawAmount, setRawAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedPercentage, setSelectedPercentage] = useState(0);

  const closeBubble = () => {
    setActiveBubble(null);
    setFormSubmitted(false);
    setConfirmationMessage("");
    setMessageType("");
    setStep(1);
  };

  const formatInversion = (monto) => {
    if (monto === null) return 'N/A';
    if (monto >= 1e6) return `${(monto / 1e6).toFixed(1)}M€`;
    if (monto >= 1e3) return `${(monto / 1e3).toFixed(1)}K€`;
    return `${monto}€`;
  };

  useEffect(() => {
    console.log("Datos de la oferta recibida:", oferta);
  }, [oferta]);  

  const handleAccept = async () => {
    if (loading) return;
    setLoading(true);
    console.log("Iniciando aceptación de oferta:", oferta);
  
    try {
      const response = await customAxios.put(
        `http://localhost:5000/api/invest/oferta/${oferta.id}/aceptar/${oferta.startup.usuario.id}`,
        {},
        { withCredentials: true }
      );
  
      console.log("Respuesta del servidor (aceptar):", response);
      setConfirmationMessage("Oferta aceptada con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error al aceptar la oferta:", error);
      setConfirmationMessage("Hubo un error al aceptar la oferta.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };  

  const handleInvestClick = async () => {
    if (loading) return;
    setLoading(true);
    console.log("Iniciando aceptación de oferta:", oferta);
    console.log("Iniciando contraoferta con:", {
      id_inversor: oferta.id_inversor,
      contraoferta_porcentaje: selectedPercentage,
      contraoferta_monto: selectedAmount,
    });
  
    try {
      const response = await customAxios.post(
        `http://localhost:5000/api/invest/contraoferta/${oferta.id}/${oferta.startup.usuario.id}`,
        {
          id_inversor: oferta.id_inversor,
          contraoferta_porcentaje: selectedPercentage,
          contraoferta_monto: selectedAmount, // <- Corregido
        },
        { withCredentials: true }
      );
  
      console.log("Respuesta del servidor (contraoferta):", response);
      setConfirmationMessage("Oferta realizada con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error al realizar la oferta:", error);
      setConfirmationMessage("Hubo un error al realizar la oferta.");
      setMessageType("error");
      setFormSubmitted(true);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (loading) return;
    setLoading(true);
    console.log("Iniciando rechazo de oferta:", oferta);
  
    try {
      const response = await customAxios.put(
        `http://localhost:5000/api/invest/oferta/${oferta.id}/rechazar/${oferta.startup.usuario.id}`,
        {},
        { withCredentials: true }
      );
  
      console.log("Respuesta del servidor (rechazar):", response);
      setConfirmationMessage("Oferta rechazada con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error al rechazar la oferta:", error);
      setConfirmationMessage("Hubo un error al rechazar la oferta.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };
  

  const handleNextStep = () => {
    setStep(2);
  }

  return (
    <>
      <button className="carta" onClick={() => setActiveBubble("oferta")}>
        <div className="carta-header">
          <div className="carta-icono">
            <img src={oferta?.startup?.usuario?.avatar} alt="Avatar de la startup" className="carta-avatar" />
          </div>
          <div className="carta-info">
            <p className="carta-nombre">{oferta?.inversor?.nombre}</p>
            <p className="carta-username">@{oferta?.inversor?.usuario?.username}</p>
          </div>
        </div>
        <div className="carta-detalles">
          <p className="carta-titulo">Monto Ofrecido</p>
          <p className="carta-valoracion">{formatInversion(oferta?.monto_ofrecido)}</p>
          <p className="carta-titulo">Porcentaje Ofrecido</p>
          <p className="carta-valoracion">{oferta?.porcentaje_ofrecido}%</p>
          <p className="carta-fecha">
            {oferta?.fecha_creacion ? new Date(oferta.fecha_creacion).toLocaleDateString() : "Fecha no disponible"}
          </p>
        </div>
      </button>

      <Bubble show={!!activeBubble} onClose={closeBubble} type={messageType} message={confirmationMessage}>
        {activeBubble === "oferta" && step === 1 && (
          <div className="bubble-content">
            <h3>Detalles de la Oferta</h3>
            <p><strong>Inversor:</strong> {oferta?.inversor?.nombre}</p>
            <p><strong>Username:</strong> @{oferta?.inversor?.usuario?.username}</p>
            <p><strong>Monto Ofrecido:</strong> {formatInversion(oferta?.monto_ofrecido)}</p>
            <p><strong>Porcentaje Ofrecido:</strong> {oferta?.porcentaje_ofrecido}%</p>
            <p><strong>Fecha:</strong> {oferta?.fecha_creacion ? new Date(oferta.fecha_creacion).toLocaleDateString() : "Fecha no disponible"}</p>
            <div className="bubble-buttons">
              <button onClick={handleAccept} disabled={loading}>Aceptar Oferta</button>
              <button onClick={handleNextStep}>Hacer Contraoferta</button>
              <button onClick={handleReject} disabled={loading}>Rechazar Oferta</button>
            </div>
          </div>
        )}
        {activeBubble === "oferta" && step === 2 && (
          <div>
            <p>Haciendo oferta a {oferta.inversor.usuario?.username || "Startup Desconocida"}</p>
            <div className="formulario-inversion">
              <div className="campo-inversion">
                <label className="form-label" htmlFor="cantidad">Selecciona la cantidad de dinero:</label>
                <input
                  id="cantidad"
                  className="select-inversion"
                  value={rawAmount}
                  onChange={(e) => {
                    const inputValue = e.target.value.replace(/[^0-9]/g, "");
                    setRawAmount(inputValue);
                    setSelectedAmount(Number(inputValue));
                  }}
                  onBlur={() => setRawAmount(formatInversion(selectedAmount))}
                  onFocus={() => setRawAmount(selectedAmount.toString())}
                />
              </div>
              <div className="campo-inversion">
                <label className="form-label" htmlFor="porcentaje">Selecciona el porcentaje:</label>
                <div className="campo-porcentaje">
                  <button className="selector-btn" onClick={() => setSelectedPercentage(selectedPercentage - 1)}>-</button>
                  <input
                    id="porcentaje"
                    className="input-inversion"
                    value={selectedPercentage}
                    onChange={(e) => setSelectedPercentage(Number(e.target.value))}
                  />
                  <button className="selector-btn" onClick={() => setSelectedPercentage(selectedPercentage + 1)}>+</button>
                </div>
              </div>
            </div>
            <div className="contendor-botn-invertir">
              <button className="botn-invertir" onClick={closeBubble}>
                Cancelar
              </button>
              <button className="botn-invertir enviar" type="submit" onClick={handleInvestClick}>
                Hacer Oferta
              </button>
            </div>
          </div>
        )}
      </Bubble>
    </>
  );
};
