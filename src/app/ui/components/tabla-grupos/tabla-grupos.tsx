import React, { useState, useEffect } from "react";
import '../../../perfil/bento-perfil/bento-perfil-style.css';
import { IconLockFilled } from "@tabler/icons-react";

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
    <div className="seccion" id="grupos-perfil">
      <div className="titulo-principal">
        <p className="titulo-contacto">Grupos</p>
      </div>
      {grupos.length > 0 ? (
        <div className="contenido-scrollable">
          <ul className="grupos-lista">
            {grupos.map((grupo, index) => (
            <li key={index} className="grupo-item">
              <div className="grupo-icono">
                <img src={grupo.grupo.foto_grupo} className="grupo-avatar"/>
              </div>
              <div className="grupo-info">
                <p id="nombre-grupo">{grupo.grupo.nombre}</p>
                {grupo.grupo.tipo === 'privado' && (
              <IconLockFilled className="icono-candado"></IconLockFilled>
              )}
              </div>
            </li>
          ))}
        </ul>
        </div>

      ) : (
        <p>No estás en ningún grupo.</p>
      )}
    </div>
  );
};


export default TablaGrupos;
