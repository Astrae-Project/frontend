import { useState } from 'react';
import customAxios from '@/service/api.mjs';
import './stripe-form-style.css';
import '../../../perfil/boton/boton-style.css';

export default function FormularioInversion({ selectedStartup, onClose }) {
  const [step, setStep] = useState(1); // Paso 1 = inversión, Paso 2 = pago
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const [rawAmount, setRawAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [amountError, setAmountError] = useState('');

  // Campos simulados de pago
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const formatInversion = (monto) => {
    if (monto === null) return 'N/A';
    return monto.toLocaleString('de-DE') + ' €';
  };

  const closeBubble = () => {
    setFormSubmitted(false);
    setConfirmationMessage('');
    setMessageType('');
    setLoading(false);
    setRawAmount('');
    setSelectedAmount(0);
    setSelectedPercentage(0);
    setTermsAccepted(false);
    setStep(1);

    onClose?.();
  };

  const handleFirstStep = (e) => {
    e.preventDefault();
    if (!amountError && selectedAmount >= 500 && selectedAmount <= 1000000) {
      setStep(2);
    } else {
      setAmountError('Debes introducir un monto válido');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) return;

    setLoading(true);
    try {
      // Aquí simplemente guardamos en backend
      await customAxios.post(
        '/invest/oferta',
        {
          id_startup: selectedStartup.id,
          porcentaje_ofrecido: selectedPercentage,
          monto_ofrecido: selectedAmount,
          datos_pago: { cardName, cardNumber, expiry, cvc }, // <- datos ficticios
          termsAccepted,
        },
        { withCredentials: true }
      );

      setConfirmationMessage('Oferta registrada con éxito!');
      setMessageType('success');
    } catch (err) {
      console.error('Error en oferta:', err);
      setConfirmationMessage('Hubo un error procesando la oferta');
      setMessageType('error');
    } finally {
      setFormSubmitted(true);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={step === 1 ? handleFirstStep : handleSubmit}
      className="formulario-inversion"
    >
      <p className="titulo">
        Haciendo oferta a {selectedStartup?.usuario?.username || 'Startup Desconocida'}
      </p>

      {/* Paso 1: Monto y porcentaje */}
      {step === 1 && (
        <>
        <div className="campos-inversion">
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

          <div className="contenedor-botn-invertir">
            <button type="button" className="botn-invertir" onClick={closeBubble}>
              Cancelar
            </button>
            <button type="submit" className="botn-invertir enviar">
              Continuar
            </button>
          </div>
        </>
      )}

      {/* Paso 2: Información de pago */}
      {step === 2 && (
        <>
        <div className="campos-inversion">
          <div className="campo-inversion">
            <label className="form-label" htmlFor="cardName">Nombre en la tarjeta</label>
            <input
              id="cardName"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              required
            />
          </div>
          <div className="campo-inversion">
            <label className="form-label" htmlFor="cardNumber">Número de tarjeta</label>
            <input
              id="cardNumber"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              required
            />
          </div>
          <div className="campo-inversion">
            <label className="form-label" htmlFor="expiry">Fecha de expiración</label>
            <input
              id="expiry"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              placeholder="MM/AA"
              required
            />
          </div>
          <div className="campo-inversion">
            <label className="form-label" htmlFor="cvc">CVC</label>
            <input
              id="cvc"
              value={cvc}
              onChange={e => setCvc(e.target.value)}
              required
            />
          </div>

          <div className="campo-inversion terms">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={e => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms">
              Acepto los <a href="/terminos-condiciones" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>
            </label>
          </div>
          </div>

          <div className="contenedor-botn-invertir">
            <button type="button" className="botn-invertir" onClick={() => setStep(1)} disabled={loading}>
              Atrás
            </button>
            <button type="submit" className="botn-invertir enviar" disabled={!termsAccepted || loading}>
              {loading ? 'Procesando...' : 'Hacer Oferta'}
            </button>
          </div>
        </>
      )}

      {formSubmitted && (
        <div className={messageType === 'error' ? 'error-message' : 'success-message'}>
          {confirmationMessage}
        </div>
      )}
    </form>
  );
}
