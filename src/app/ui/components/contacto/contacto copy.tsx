import React, { useState, useEffect } from 'react';

const InformacionContacto = ({ contacto }) => {
  return (
    <div className="seccion" id="contacto">
      <div className="titulo-principal">
        <p className="titulo-contacto">Contacto</p>
      </div>
      {contacto ? (
        <div className="contenedor-social">
            {contacto.correo && (
                <div className="borde-icono icono-social">
                  <div className="icono-social2 movimiento-icono">
                    <img src="/Imagenes/iconos/gmail.svg" className="contacto-imagen imagen2" />
                  </div>
                </div>
            )}
            {contacto.twitter && (
                <div className="borde-icono icono-social">
                  <div className="icono-social2 movimiento-icono">
                    <img src="/Imagenes/iconos/x.svg" className="contacto-imagen imagen2" />
                  </div>
                </div>
            )}
            {contacto.linkedin && (
                <div className="borde-icono icono-social">
                  <div className="icono-social2 movimiento-icono">
                    <img src="/Imagenes/iconos/linkedin.svg" className="contacto-imagen imagen2" />
                  </div>
                </div>
            )}
            {contacto.facebook && (
                <div className="borde-icono icono-social">
                  <div className="icono-social2 movimiento-icono">
                    <img src="/Imagenes/iconos/facebook.svg" className="contacto-imagen imagen2" />
                  </div>
                </div>
            )}
            {contacto.instagram && (
                <div className="borde-icono icono-social">
                  <div className="icono-social2 movimiento-icono">
                    <img src="/Imagenes/iconos/instagram.svg" className="contacto-imagen imagen2" />
                  </div>
                </div>
            )}
        </div>
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
      const response = await fetch('http://localhost:5000/api/data/contacto', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Error al recuperar los datos de contacto');
      const data = await response.json();
      setContacto(data);
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
