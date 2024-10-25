import React, { useState, useEffect } from 'react';

const InformacionContacto = ({ contacto }) => {
  return (
    <div className="seccion" id='contacto'>
      <div className='titulo-principal'>
        <p className='titulo-contacto'>Contacto</p>
      </div>
      {contacto ? (
        <ul className="contacto-lista">
          {contacto.correo && (
            <li className="contacto-item">
              <div className="movimiento-icono">
                <img src='/Imagenes/iconos/gmail.svg' className="contacto-icono" /> {/* Icono de correo */}
              </div>              
              <p>{contacto.correo}</p>
            </li>
          )}
          {contacto.twitter && (
            <li className="contacto-item">
              <div className="movimiento-icono">
                <img src='/Imagenes/iconos/x.svg' className="contacto-icono" /> {/* Icono de correo */}
              </div>             
              <p>@{contacto.twitter}</p>
            </li>
          )}
          {contacto.linkedin && (
            <li className="contacto-item">
              <div className="movimiento-icono">
                <img src='/Imagenes/iconos/linkedin.svg' className="contacto-icono" /> {/* Icono de correo */}
              </div>
              <p>@{contacto.linkedin}</p>
            </li>
          )}
          {contacto.facebook && (
            <li className="contacto-item">
              <div className="movimiento-icono">
                <img src='/Imagenes/iconos/facebook.svg' className="contacto-icono" /> {/* Icono de correo */}
              </div>              
              <p>@{contacto.facebook}</p>
            </li>
          )}
          {contacto.instagram && (
            <li className="contacto-item">
              <div className="movimiento-icono">
                <img src='/Imagenes/iconos/instagram.svg' className="contacto-icono" /> {/* Icono de correo */}
              </div>
               <p>@{contacto.instagram}</p>
            </li>
          )}
        </ul>
      ) : (
        <p>No hay información de contacto disponible.</p>
      )}
    </div>
  );
};

export default function Contacto() {
  const [contacto, setContacto] = useState(null);

  // Fetch para obtener los datos de contacto del usuario
  const fetchContacto = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/data/contacto', {
        credentials: 'include', // Incluye cookies para la sesión del usuario
      });
      if (!response.ok) throw new Error('Error al recuperar los datos de contacto');
      const data = await response.json();
      setContacto(data); // Guarda los datos de contacto en el estado
    } catch (error) {
      console.error('Error al obtener los datos de contacto:', error);
    }
  };

  // useEffect para llamar al fetch cuando el componente se monte
  useEffect(() => {
    fetchContacto();
  }, []);

  return (
    <div className="seccion">
      <InformacionContacto contacto={contacto} />
    </div>
  );
}
