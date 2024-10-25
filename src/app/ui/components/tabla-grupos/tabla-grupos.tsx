import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';

const TablaGrupos = () => {
  const [grupos, setGrupos] = useState([]);

  // Función para hacer fetch de los grupos
  const fetchGrupos = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/data/grupos', {
        credentials: 'include', // Incluye cookies para la sesión del usuario
      });
      if (!response.ok) throw new Error('Error al recuperar los grupos');
      const data = await response.json();
      
      // Aseguramos que data sea un array
      setGrupos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener los grupos:', error);
    }
  };

  // Llama a fetchGrupos cuando el componente se monta
  useEffect(() => {
    fetchGrupos();
  }, []);

  return (
    <div className="seccion">
      {grupos.length > 0 ? (
        <ul>
          {grupos.map((grupo, index) => (
            <li key={index}>{grupo.grupo.nombre}</li>
          ))}
        </ul>
      ) : (
        <p>No estás en ningún grupo.</p>
      )}
    </div>
  );
};

export default TablaGrupos;
