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
  const [amountError, setAmountError] = useState("");

  const closeBubble = () => {
    setActiveBubble(null);
    setFormSubmitted(false);
    setConfirmationMessage("");
    setMessageType("");
    setStep(1);
  };

  const formatInversion = (monto) => {
  if (monto === null) return 'N/A';
  // Formato europeo: separador de miles es punto, decimal es coma
  return monto.toLocaleString('de-DE') + ' €';
  };

  // Función corregida para mostrar siempre el número entero con puntos
  const formatInversionRaw = (monto) => {
    if (monto == null) return 'N/A';
    const value = Number(monto);
    if (isNaN(value)) return 'N/A';
    return `${value.toLocaleString('es-ES', { maximumFractionDigits: 0 })}€`;
  };

  useEffect(() => {
  }, [oferta]);

  const handleAccept = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await customAxios.put(
        `https://backend-l3s8.onrender.com/api/invest/oferta/${oferta.id}/aceptar/${oferta.startup.usuario.id}`,
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
        `https://backend-l3s8.onrender.com/api/invest/contraoferta/${oferta.id}/${oferta.startup.usuario.id}`,
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
        `https://backend-l3s8.onrender.com/api/invest/oferta/${oferta.id}/rechazar/${oferta.startup.usuario.id}`,
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
              {formatInversionRaw(oferta?.monto_ofrecido)}
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
            <form onSubmit={handleInvestClick} className="formulario-inversion">
              <p className="titulo">
                Haciendo oferta a {oferta.inversor.usuario?.username || 'Startup Desconocida'}
              </p>
              <div className="campos-inversion" style={{ marginBottom: '15px' }}>
              {/* Monto */}
              <div className="campo-inversion">
                <label className="form-label" htmlFor="cantidad">Monto a invertir</label>
                <input
                  id="cantidad"
                  className={`select-inversion ${amountError ? 'input-error' : ''}`}
                  value={rawAmount}
                  onChange={e => {
                    const v = e.target.value.replace(/[^0-9]/g, '');
                    setRawAmount(v);
                    setSelectedAmount(Number(v));
                    if (v === '') {
                      setAmountError('');
                      return;
                    }
                    const num = Number(v);
                    if (num < 500) setAmountError('Monto mínimo 500 €');
                    else if (num > 1000000) setAmountError('Monto máximo 1.000.000 €');
                    else setAmountError('');
                  }}
                  onBlur={() => {
                    if (selectedAmount < 500) setAmountError('Monto mínimo 500 €');
                    else if (selectedAmount > 1000000) setAmountError('Monto máximo 1.000.000 €');
                    else setAmountError('');
                    setRawAmount(formatInversion(selectedAmount));
                  }}
                  onFocus={() => setRawAmount(selectedAmount === 0 ? '' : selectedAmount.toString())}
                />
                {amountError && <p className="error-text">{amountError}</p>}
              </div>
        
              {/* Porcentaje: mínimo 0, máximo 100 */}
              <div className="campo-inversion">
                <label className="form-label" htmlFor="porcentaje">Porcentaje</label>
                <div className="campo-porcentaje">
                  <div className="porcentaje-wrapper">
                    <button
                      type="button"
                      className="selector-btn izquierda"
                      onClick={() => setSelectedPercentage(p => Math.max(0, p - 1))}
                    >-</button>
                    
                    <input
                      id="porcentaje"
                      className="input-porcentaje"
                      value={selectedPercentage}
                      onChange={e => {
                        let val = Number(e.target.value);
                        if (val < 0) val = 0;
                        if (val > 100) val = 100;
                        setSelectedPercentage(val);
                      }}
                    />
        
                    <button
                      type="button"
                      className="selector-btn derecha"
                      onClick={() => setSelectedPercentage(p => Math.min(100, p + 1))}
                    >+</button>
                  </div>
                </div>
              </div>
            </div>
              
            {/* Botones */}
            <div className="contendor-botn-invertir">
              <button type="button" className="botn-invertir" onClick={closeBubble} disabled={loading}>
                Cancelar
              </button>
              <button type="submit" className="botn-invertir enviar" disabled={loading}>
                {loading ? 'Procesando...' : 'Hacer Oferta'}
              </button>
            </div>
            {/* Mensaje */}
            {formSubmitted && (
              <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
                {confirmationMessage}
              </div>
            )}
          </form>
        )}
      </Bubble>
    </>
  );
};
