import customAxios from '@/service/api.mjs';
import React, { useState, useEffect } from 'react';
import './contacto-style.css';
import { IconPlus } from '@tabler/icons-react';
import Bubble from '../bubble/bubble';

type ContactData = {
  correo: string;
  twitter: string;
  linkedin: string;
  facebook: string;
  instagram: string;
};

interface InformacionContactoProps {
  contacto: Partial<ContactData> | null;
  fetchContacto: () => void;
}

const InformacionContacto: React.FC<InformacionContactoProps> = ({ contacto, fetchContacto }) => {
  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedContact, setSelectedContact] = useState<keyof ContactData | null>(null);
  const [formData, setFormData] = useState<ContactData>({
    correo: contacto?.correo || '',
    twitter: contacto?.twitter || '',
    linkedin: contacto?.linkedin || '',
    facebook: contacto?.facebook || '',
    instagram: contacto?.instagram || '',
  });

  const closeBubble = () => {
    setActiveBubble(null);
    setConfirmationMessage('');
    setFormSubmitted(false);
    setStep(1); // Reset to first step
    setSelectedContact(null); // Reset the selected contact
  };

  const handleAñadirContacto = async () => {
    try {
      const response = await customAxios.put(
        'https://api.astraesystem.com/api/perfil/cambiar-datos',
        formData,
        { withCredentials: true }
      );
      setConfirmationMessage('¡Datos actualizados con éxito!');
      setMessageType('success');
      setFormSubmitted(true);
      fetchContacto(); // Refrescar datos después de actualizar
    } catch (error) {
      console.error('Error al actualizar los datos de contacto:', error);
      setConfirmationMessage('Hubo un error al actualizar los datos.');
      setMessageType('error');
      setFormSubmitted(true);
    }
  };

  const handleSelectContact = (contactType: keyof ContactData) => {
    setSelectedContact(contactType);
    // Merge with previous state so we keep all keys and avoid type mismatch
    setFormData(prev => ({ ...prev, [contactType]: contacto?.[contactType] || '' } as ContactData));
    setStep(2); // Avanzamos al paso 2 para mostrar el formulario
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as keyof ContactData]: value } as ContactData));
  };

  // Construimos un array con los elementos de contacto y aplicamos directamente slice(0, 4)
  const contactoItems = [
    contacto?.correo && (
      <li className="contacto-item" key="correo" onClick={() => {handleSelectContact('correo'); setActiveBubble('añadir-contacto');}}>
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/gmail.svg" className="contacto-imagen" />
          </div>
        </div>
        <p>{contacto.correo}</p>
      </li>
    ),
    contacto?.twitter && (
      <li className="contacto-item" key="twitter" onClick={() => {handleSelectContact('twitter'); setActiveBubble('añadir-contacto');}}>
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/x.svg" className="contacto-imagen" />
          </div>
        </div>
        <p>@{contacto.twitter}</p>
      </li>
    ),
    contacto?.linkedin && (
      <li className="contacto-item" key="linkedin" onClick={() => {handleSelectContact('linkedin'); setActiveBubble('añadir-contacto');}}>
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/linkedin.svg" className="contacto-imagen" />
          </div>
        </div>
        <p>@{contacto.linkedin}</p>
      </li>
    ),
    contacto?.facebook && (
      <li className="contacto-item" key="facebook" onClick={() => {handleSelectContact('facebook'); setActiveBubble('añadir-contacto');}}>
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/facebook.svg" className="contacto-imagen" />
          </div>
        </div>
        <p>@{contacto.facebook}</p>
      </li>
    ),
    contacto?.instagram && (
      <li className="contacto-item" key="instagram" onClick={() => {handleSelectContact('instagram'); setActiveBubble('añadir-contacto');}}>
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/instagram.svg" className="contacto-imagen" />
          </div>
        </div>
        <p>@{contacto.instagram}</p>
      </li>
    ),
  ].filter(Boolean);

  return (
    <>
      <div className="titulo-principal">
        <p className="titulo-contacto">Contacto</p>
      </div>
      <div className='contenido-scrollable'>
      {contacto ? (
        <ul className="contacto-lista">
          {contactoItems}
          {contactoItems.length < 5 && (
            <div className="contenido-vacio1">
              <li className="añadir" id="añadir-contacto" onClick={() => setActiveBubble('añadir-contacto')}>
                <IconPlus />
                <p>Añadir</p>
              </li>
            </div>
          )}
        </ul>
      ) : (
        <div className="contenido-vacio1">
          <li className="añadir boton-grupo">
            <p>Añadir</p>
          </li>
        </div>
      )}

      <Bubble show={!!activeBubble} onClose={closeBubble} message={confirmationMessage} type={messageType}>
        {activeBubble === 'añadir-contacto' && step === 1 && !formSubmitted && (
          <div>
            <p>Selecciona un contacto para actualizar</p>
            <div className="contenedor-contactos">
              <button onClick={() => handleSelectContact('correo')} className='boton-redes'><img src="/Imagenes/iconos/gmail.svg" className="contacto-imagen" /></button>
              <button onClick={() => handleSelectContact('instagram')} className='boton-redes'><img src="/Imagenes/iconos/instagram.svg" className="contacto-imagen" /></button>
              <button onClick={() => handleSelectContact('twitter')} className='boton-redes'><img src="/Imagenes/iconos/x.svg" className="contacto-imagen" /></button>
              <button onClick={() => handleSelectContact('facebook')} className='boton-redes'><img src="/Imagenes/iconos/facebook.svg" className="contacto-imagen" /></button>
              <button onClick={() => handleSelectContact('linkedin')} className='boton-redes'><img src="/Imagenes/iconos/linkedin.svg" className="contacto-imagen" /></button>
            </div>
          </div>
        )}

        {step === 2 && selectedContact && (
          <div className="edit-form-container">
            <p>Editando {selectedContact}</p>
            <input
              type="text"
              name={selectedContact}
              value={formData[selectedContact] || ''} // Siempre controlado
              onChange={handleChange}
              placeholder={`Escribe aqui...`}
              className='select-contacto'
            />
            <div className="contendor-botn-evento">
              <button
                className="botn-eventos"
                type="button"
                onClick={() => {
                  setStep(1); // Volver al paso 1 si se cancela
                  setSelectedContact(null); // Limpiar selección
                }}
              >
                <p>Atrás</p>
              </button>
              <button className="botn-eventos enviar" onClick={handleAñadirContacto}>
                <p>Confirmar</p>
              </button>
            </div>
          </div>
        )}
      </Bubble>
      </div>
    </>
  );
};

export default function Contacto() {
  const [contacto, setContacto] = useState<Partial<ContactData> | null>(null);

  const fetchContacto = async () => {
    try {
      const response = await customAxios.get('https://api.astraesystem.com/api/data/contacto', {
        withCredentials: true,
      });
      setContacto(response.data as Partial<ContactData>);
    } catch (error) {
      console.error('Error al obtener los datos de contacto:', error);
    }
  };

  useEffect(() => {
    fetchContacto();
  }, []);

  return (
    <div className="seccion" id='contacto'>
      <InformacionContacto contacto={contacto} fetchContacto={fetchContacto} />
    </div>
  );
}
