import customAxios from '@/service/api.mjs';
import React, { useState, useEffect } from 'react';

const InformacionContacto = ({ contacto }) => {
  // Construimos un array con los elementos de contacto y aplicamos directamente slice(0, 4)
  const contactoItems = [
    contacto?.correo && (
      <li className="contacto-item" key="correo">
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/gmail.svg" className="contacto-imagen" />
          </div>
        </div>
        <p>{contacto.correo}</p>
      </li>
    ),
    contacto?.twitter && (
      <li className="contacto-item" key="twitter">
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/x.svg" className="contacto-imagen" />
          </div>
        </div>
        <p>@{contacto.twitter}</p>
      </li>
    ),
    contacto?.linkedin && (
      <li className="contacto-item" key="linkedin">
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/linkedin.svg" className="contacto-imagen" />
          </div>
        </div>
        <p>@{contacto.linkedin}</p>
      </li>
    ),
    contacto?.facebook && (
      <li className="contacto-item" key="facebook">
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/facebook.svg" className="contacto-imagen" />
          </div>
        </div>
        <p>@{contacto.facebook}</p>
      </li>
    ),
    contacto?.instagram && (
      <li className="contacto-item" key="instagram">
        <div className="borde-icono">
          <div className="movimiento-icono">
            <img src="/Imagenes/iconos/instagram.svg" className="contacto-imagen" />
          </div>
        </div>
        <p>@{contacto.instagram}</p>
      </li>
    ),
  ].filter(Boolean).slice(0, 4); // Filtramos elementos nulos y limitamos a 4

  return (
    <div className="seccion" id="contacto">
      <div className="titulo-principal">
        <p className="titulo-contacto">Contacto</p>
      </div>
      {contacto ? (
          <ul className="contacto-lista">
            {contactoItems}
          </ul>
      ) : (
        <p>No hay información de contacto disponible.</p>
      )}
    </div>
  );
};

export default function Contacto2() {
  const [contacto, setContacto] = useState(null);

  const fetchContacto = async () => {
    try {
      const response = await customAxios.get('http://localhost:5000/api/data/contacto', {
        withCredentials: true,
      });
      setContacto(response.data);
    } catch (error) {
      console.error('Error al obtener los datos de contacto:', error);
    }
  };

  useEffect(() => {
    fetchContacto();
  }, []);

  return (
    <div className="seccion">
      <InformacionContacto contacto={contacto} />
    </div>
  );
}
