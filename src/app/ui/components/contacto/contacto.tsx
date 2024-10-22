import React, { useState, useEffect } from 'react';

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

  // Renderiza la información de contacto si está disponible
  return (
    <div className="seccion">
      {contacto ? (
        <div>
          {contacto.correo && <p>Email: {contacto.correo}</p>}
          {contacto.twitter && <p>Twitter: {contacto.twitter}</p>}
          {contacto.linkedin && <p>LinkedIn: {contacto.linkedin}</p>}
          {contacto.facebook && <p>Facebook: {contacto.facebook}</p>}
          {contacto.instagram && <p>Instagram: {contacto.instagram}</p>}
        </div>
      ) : (
        <p>No hay información de contacto disponible.</p>
      )}
    </div>
  );
}
