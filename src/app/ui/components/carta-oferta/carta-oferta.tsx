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
    if (monto == null) return 'N/A';
    const value = Number(monto);
    if (isNaN(value)) return 'N/A';
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M€`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K€`;
    return `${value.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€`;
  };

  // Función corregida para mostrar siempre el número entero con puntos
  const formatInversionRaw = (monto) => {
    if (monto == null) return 'N/A';
    const value = Number(monto);
    if (isNaN(value)) return 'N/A';
    return `${value.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€`;
  };

  useEffect(() => {
    console.log("Datos de la oferta recibida:", oferta);
  }, [oferta]);

  const handleAccept = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await customAxios.put(
        `http://localhost:5000/api/invest/oferta/${oferta.id}/aceptar/${oferta.startup.usuario.id}`,
        {},
        { withCredentials: true }
      );
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
    try {
      await customAxios.post(
        `http://localhost:5000/api/invest/contraoferta/${oferta.id}/${oferta.startup.usuario.id}`,
        {
          id_inversor: oferta.id_inversor,
          contraoferta_porcentaje: selectedPercentage,
          contraoferta_monto: selectedAmount,
        },
        { withCredentials: true }
      );
      setConfirmationMessage("Contraoferta realizada con éxito!");
      setMessageType("success");
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error al realizar la contraoferta:", error);
      setConfirmationMessage("Hubo un error al realizar la contraoferta.");
      setMessageType("error");
      setFormSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      await customAxios.put(
        `http://localhost:5000/api/invest/oferta/${oferta.id}/rechazar/${oferta.startup.usuario.id}`,
        {},
        { withCredentials: true }
      );
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
  };

  return (
    <>
      <button className="carta-oferta" onClick={() => setActiveBubble("oferta")}> 
        <div className="carta-header-oferta">
          <div className="carta-icono-oferta">
            <img
              src={oferta?.startup?.usuario?.avatar || "/default-avatar.png"}
              alt="Avatar de la startup"
              className="carta-avatar-oferta"
            />
          </div>
          <div className="carta-info-oferta">
            <p className="carta-nombre">{oferta?.inversor?.nombre}</p>
            <p className="carta-username-oferta">
              @{oferta?.inversor?.usuario?.username}
            </p>
          </div>
        </div>
        <div className="carta-detalles">
          <div className="carta-apartados-oferta">
            <p className="carta-titulo-oferta">Monto Ofrecido</p>
            <p className="carta-valoracion">
              {formatInversion(oferta?.monto_ofrecido)}
            </p>
          </div>
          <div className="carta-apartados-oferta">
            <p className="carta-titulo-oferta">Porcentaje Ofrecido</p>
            <p className="carta-valoracion">
              {oferta?.porcentaje_ofrecido}%
            </p>
          </div>
          <p className="carta-fecha">
            {oferta?.fecha_creacion
              ? new Date(oferta.fecha_creacion).toLocaleDateString()
              : "Fecha no disponible"}
          </p>
        </div>
      </button>

      <Bubble
        show={!!activeBubble}
        onClose={closeBubble}
        type={messageType}
        message={confirmationMessage}
      >
        {activeBubble === "oferta" && step === 1 && (
          <div className="oferta-card">
            <div className="oferta-header">
              <h3>Oferta Recibida</h3>
              <span className="oferta-fecha">
                {oferta?.fecha_creacion
                  ? new Date(oferta.fecha_creacion).toLocaleDateString()
                  : "Fecha no disponible"}
              </span>
            </div>

            <div className="oferta-body">
              <div className="oferta-dato">
                <span className="dato-label">Inversor</span>
                <span className="dato-valor">
                  {oferta?.inversor?.nombre}
                </span>
              </div>

              <div className="oferta-dato">
                <span className="dato-label">Username</span>
                <span className="dato-valor">
                  @{oferta?.inversor?.usuario?.username}
                </span>
              </div>

              <div className="oferta-dato">
                <span className="dato-label">Monto Ofrecido</span>
                <span className="dato-valor">
                  {formatInversionRaw(oferta?.monto_ofrecido)}
                </span>
              </div>

              <div className="oferta-dato">
                <span className="dato-label">Porcentaje Ofrecido</span>
                <span className="dato-valor">
                  {oferta?.porcentaje_ofrecido}%
                </span>
              </div>
            </div>

            <div className="oferta-footer">
              <button className="btn btn-rechazar" onClick={handleReject}>
                Rechazar
              </button>
              <button className="btn btn-contraoferta" onClick={handleNextStep}>
                Contraoferta
              </button>
              <button className="btn btn-aceptar" onClick={handleAccept}>
                Aceptar
              </button>
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
