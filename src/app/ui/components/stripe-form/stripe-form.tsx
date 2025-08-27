import { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import customAxios from '@/service/api.mjs';
import './stripe-form-style.css';
import '../../../perfil/boton/boton-style.css';

export default function FormularioInversion({ selectedStartup, onClose }) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [loading, setLoading] = useState(false);

  const [rawAmount, setRawAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedPercentage, setSelectedPercentage] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [amountError, setAmountError] = useState('');


  const stripe = useStripe();
  const elements = useElements();

  const formatInversion = (monto) => {
  if (monto === null) return 'N/A';
  // Formato europeo: separador de miles es punto, decimal es coma
  return monto.toLocaleString('de-DE') + ' €';
  };

  const closeBubble = () => {
    // Reset local
    setFormSubmitted(false);
    setConfirmationMessage('');
    setMessageType('');
    setLoading(false);
    setRawAmount('');
    setSelectedAmount(0);
    setSelectedPercentage(0);
    setTermsAccepted(false);

    // Cerrar desde el padre
    onClose?.();
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '15px',
        '::placeholder': { color: '#fff' },
      },
      invalid: { color: '#fa755a', iconColor: '#fa755a' },
    },
  };

  const handleInvestClick = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      console.error('Stripe o Elements no están listos');
      return;
    }
    setLoading(true);

    try {
      // 1. Crear PaymentMethod sin guardar tarjeta en el sistema
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('CardElement no encontrado');
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      if (pmError) {
        setConfirmationMessage(pmError.message || 'Error al crear método de pago');
        setMessageType('error');
        setFormSubmitted(true);
        return;
      }
      const paymentMethodId = paymentMethod.id;

      // 2. Enviar paymentMethodId al backend antes de crear la oferta
      await customAxios.post(
        'https://api.astraesystem.com/api/stripe/metodo-pago',
        { paymentMethodId },
        { withCredentials: true }
      );

      // 3. Crear la oferta para obtener clientSecret
      const { data } = await customAxios.post(
        'https://api.astraesystem.com/api/invest/oferta',
        {
          id_startup: selectedStartup.id,
          porcentaje_ofrecido: selectedPercentage,
          monto_ofrecido: selectedAmount,
          termsAccepted,
        },
        { withCredentials: true }
      );
      const clientSecret = data.clientSecret;

      // 4. Confirmar el pago en frontend (3DS, Link, etc.)
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) {
        setConfirmationMessage(result.error.message || 'Error al confirmar pago');
        setMessageType('error');
      } else if (result.paymentIntent?.status === 'succeeded') {
        setConfirmationMessage('Oferta realizada con éxito!');
        setMessageType('success');
      } else {
        setConfirmationMessage('Error desconocido al confirmar pago');
        setMessageType('error');
      }
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
    <form onSubmit={handleInvestClick} className="formulario-inversion">
      <p className="titulo">
        Haciendo oferta a {selectedStartup?.usuario?.username || 'Startup Desconocida'}
      </p>
    <div className="campos-inversion">
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

      {/* CardElement */}
      <div className="campo-inversion">
        <label className="form-label" htmlFor="card-element">Información de pago</label>
        <CardElement id="card-element" options={cardElementOptions} />
      </div>
      {/* Términos */}
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
      {/* Botones */}
      <div className="contendor-botn-invertir">
        <button type="button" className="botn-invertir" onClick={closeBubble} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="botn-invertir enviar" disabled={!termsAccepted || loading}>
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
  );
}
